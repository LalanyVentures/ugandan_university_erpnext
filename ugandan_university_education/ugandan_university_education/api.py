import frappe
import hashlib
import json

from ugandan_university_education.services.transcript import build_transcript_data, can_view_transcript
from ugandan_university_education.services.workflows import (
	build_invoice_items,
	calculate_gpa,
	calculate_result,
	determine_clearance,
	split_name,
	validate_application_for_admission,
	validate_cohort_assignment,
	validate_registration,
)


def has_app_permission(user=None):
    user = user or frappe.session.user
    return user == "Administrator" or "Academics User" in frappe.get_roles(user)


@frappe.whitelist()
def get_user_info():
    return {"user": frappe.session.user, "roles": frappe.get_roles(frappe.session.user)}


@frappe.whitelist()
def update_student_profile(student, values):
	"""Update the administrator-editable identity fields on a student record."""
	roles = set(frappe.get_roles())
	if frappe.session.user != "Administrator" and not roles.intersection({"System Manager", "Academics User", "Registrar"}):
		frappe.throw("Only authorised academic administrators may edit student profiles.", frappe.PermissionError)

	if isinstance(values, str):
		values = json.loads(values)
	values = values or {}
	allowed_fields = {
		"first_name", "middle_name", "last_name", "gender", "date_of_birth",
		"nationality", "student_email_id", "status",
	}
	doc = frappe.get_doc("Student", student)
	doc.check_permission("write")
	for fieldname in allowed_fields:
		if fieldname in values:
			doc.set(fieldname, values[fieldname] or None)
	doc.save()
	return doc.as_dict()


@frappe.whitelist()
def get_payment_receipt_data(payment_entries):
	"""Return permission-checked payment and invoice allocations for AWU receipts."""
	roles = set(frappe.get_roles())
	allowed_roles = {"System Manager", "Accounts User", "Accounts Manager", "Academics User", "Registrar"}
	if frappe.session.user != "Administrator" and not roles.intersection(allowed_roles):
		frappe.throw("Only authorised finance and academic staff may print payment receipts.", frappe.PermissionError)

	if isinstance(payment_entries, str):
		payment_entries = json.loads(payment_entries)
	if not isinstance(payment_entries, list) or not payment_entries:
		frappe.throw("Select at least one payment transaction.")
	if len(payment_entries) > 2000:
		frappe.throw("A consolidated receipt can contain at most 2,000 payment transactions.")

	invoice_meta = frappe.get_meta("Sales Invoice")
	invoice_fields = ["name", "customer", "posting_date", "grand_total", "outstanding_amount"]
	for custom_field in ("student", "academic_semester"):
		if invoice_meta.has_field(custom_field):
			invoice_fields.append(custom_field)

	payments = []
	for payment_name in dict.fromkeys(payment_entries):
		doc = frappe.get_doc("Payment Entry", payment_name)
		doc.check_permission("read")
		student = None
		if doc.party_type == "Customer" and doc.party:
			student = frappe.db.get_value(
				"Student", {"customer": doc.party},
				["name", "student_name", "student_number"], as_dict=True,
			)

		allocations = []
		for reference in doc.get("references") or []:
			invoice = None
			if reference.reference_doctype == "Sales Invoice" and reference.reference_name:
				invoice = frappe.db.get_value("Sales Invoice", reference.reference_name, invoice_fields, as_dict=True)
			allocations.append({
				"reference_doctype": reference.reference_doctype,
				"reference_name": reference.reference_name,
				"total_amount": reference.total_amount,
				"outstanding_amount": reference.outstanding_amount,
				"allocated_amount": reference.allocated_amount,
				"student": invoice.get("student") if invoice else None,
				"academic_semester": invoice.get("academic_semester") if invoice else None,
				"invoice_total": invoice.get("grand_total") if invoice else reference.total_amount,
				"current_outstanding": invoice.get("outstanding_amount") if invoice else None,
			})

		payments.append({
			"name": doc.name,
			"posting_date": doc.posting_date,
			"payment_type": doc.payment_type,
			"party_type": doc.party_type,
			"party": doc.party,
			"party_name": doc.party_name,
			"student": student,
			"mode_of_payment": doc.mode_of_payment,
			"reference_no": doc.reference_no,
			"reference_date": doc.reference_date,
			"paid_amount": doc.paid_amount,
			"received_amount": doc.received_amount,
			"source_exchange_rate": doc.source_exchange_rate,
			"target_exchange_rate": doc.target_exchange_rate,
			"paid_from_account_currency": doc.paid_from_account_currency,
			"paid_to_account_currency": doc.paid_to_account_currency,
			"remarks": doc.remarks,
			"docstatus": doc.docstatus,
			"allocations": allocations,
		})

	settings = frappe.get_single("University Education Settings")
	return {
		"university": {
			"name": settings.get("university_name") or "Ankole Western University",
			"country": settings.get("country"),
			"currency": settings.get("default_currency") or "UGX",
			"footer": settings.get("transcript_footer"),
		},
		"generated_on": frappe.utils.now_datetime(),
		"generated_by": frappe.session.user,
		"payments": payments,
	}


@frappe.whitelist()
def get_student_info():
    return frappe.db.get_value(
        "Student", {"student_email_id": frappe.session.user},
        ["name", "student_name", "student_email_id", "customer"], as_dict=True,
    )


@frappe.whitelist()
def get_student_registrations(student=None):
    student = student or frappe.db.get_value("Student", {"student_email_id": frappe.session.user})
    if not student:
        return []
    return frappe.get_all("Course Registration", filters={"student": student})


@frappe.whitelist()
def get_student_results(student=None):
	student = student or frappe.db.get_value("Student", {"student_email_id": frappe.session.user})
	return frappe.get_all("Student Course Result", filters={"student": student, "is_published": 1}) if student else []


@frappe.whitelist()
def submit_application(application_name):
	doc = frappe.get_doc("University Application", application_name)
	doc.status = "Submitted"
	doc.save()
	return doc.name


@frappe.whitelist()
def admit_application(application_name):
	application = frappe.get_doc("University Application", application_name)
	validate_application_for_admission(application.as_dict())
	first_name, last_name = split_name(application.applicant_name)
	student = frappe.get_doc({
		"doctype": "Student",
		"student_number": f"STU-{application.name}",
		"first_name": first_name,
		"last_name": last_name,
		"student_email_id": application.applicant_email,
		"status": "Active",
	}).insert()
	enrolment = frappe.get_doc({
		"doctype": "Student Programme Enrolment",
		"student": student.name,
		"academic_programme": application.academic_programme,
		"programme_curriculum": application.programme_curriculum or frappe.db.get_value(
			"Programme Curriculum",
			{"academic_programme": application.academic_programme, "status": "Active"},
		),
		"academic_year": application.academic_year,
		"admission_date": frappe.utils.today(),
		"status": "Active",
	}).insert()
	application.student = student.name
	application.status = "Accepted"
	application.save()
	return {"student": student.name, "student_programme_enrolment": enrolment.name}


@frappe.whitelist()
def assign_student_to_cohort(student, student_cohort):
	cohort = frappe.get_doc("Student Cohort", student_cohort)
	validate_cohort_assignment(student, cohort.as_dict())
	enrolment = frappe.get_all(
		"Student Programme Enrolment",
		filters={"student": student, "status": ["!=", "Withdrawn"]},
		fields=["name"], limit=1,
	)
	if enrolment:
		doc = frappe.get_doc("Student Programme Enrolment", enrolment[0].name)
	else:
		doc = frappe.new_doc("Student Programme Enrolment")
		doc.student = student
		doc.academic_programme = cohort.academic_programme
		doc.programme_curriculum = cohort.programme_curriculum
		doc.academic_year = cohort.academic_year
		doc.admission_date = frappe.utils.today()
	doc.status = "Active"
	doc.student_cohort = student_cohort
	doc.save()
	return doc.name


@frappe.whitelist()
def register_student_course(student, student_programme_enrolment, academic_semester, course_offering):
	semester_registration = frappe.get_all(
		"Semester Registration",
		filters={"student": student, "academic_semester": academic_semester, "status": ["!=", "Cancelled"]},
		fields=["name"], limit=1,
	)
	if semester_registration:
		semester_registration_name = semester_registration[0].name
	else:
		semester = frappe.get_doc({
			"doctype": "Semester Registration",
			"student": student,
			"student_programme_enrolment": student_programme_enrolment,
			"academic_semester": academic_semester,
			"registration_date": frappe.utils.today(),
			"status": "Registered",
		}).insert()
		semester_registration_name = semester.name
	registration = frappe.get_doc({
		"doctype": "Course Registration",
		"student": student,
		"student_programme_enrolment": student_programme_enrolment,
		"semester_registration": semester_registration_name,
		"course_offering": course_offering,
		"attempt_number": 1,
		"registration_type": "Normal",
		"status": "Registered",
	}).insert()
	return registration.name


@frappe.whitelist()
def register_cohort_courses(student_cohort, academic_semester, course_offering):
	cohort_students = frappe.get_all(
		"Student Programme Enrolment",
		filters={"student_cohort": student_cohort, "status": "Active"},
		fields=["student", "name"],
	)
	return [
		register_student_course(row.student, row.name, academic_semester, course_offering)
		for row in cohort_students
	]


@frappe.whitelist()
def save_student_course_result(result_name, mark_rows):
	result = frappe.get_doc("Student Course Result", result_name)
	if isinstance(mark_rows, str):
		mark_rows = json.loads(mark_rows)
	registration = frappe.get_doc("Course Registration", result.course_registration)
	offering = frappe.get_doc("Course Offering", registration.course_offering)
	grading_scheme_name = getattr(offering, "grading_scheme", None) if offering else None
	grade_bands = []
	if grading_scheme_name:
		grade_bands = frappe.get_doc("Grading Scheme", grading_scheme_name).get("grade_bands")
	calculated = calculate_result(mark_rows, [row.as_dict() for row in grade_bands], result.credit_units)
	result.set("assessment_marks", mark_rows)
	for field, value in calculated.items():
		if field in result.meta.get_valid_columns():
			setattr(result, field, value)
	result.save()
	return result.name


@frappe.whitelist()
def approve_result_batch(batch_name, approval_stage=None):
	batch = frappe.get_doc("Result Approval Batch", batch_name)
	if not batch.items:
		frappe.throw("Result Approval Batch must contain at least one result")
	for item in batch.items:
		result = frappe.get_doc("Student Course Result", item.student_course_result)
		result.is_approved = 1
		result.is_published = 1
		result.approved_by = frappe.session.user
		result.approved_on = frappe.utils.now()
		result.save()
	batch.approval_stage = approval_stage or batch.approval_stage
	batch.status = "Approved"
	batch.approved_by = frappe.session.user
	batch.save()
	return batch.name


@frappe.whitelist()
def get_student_gpa(student, academic_semester=None):
	filters = {"student": student, "is_approved": 1, "is_published": 1}
	if academic_semester:
		filters["academic_semester"] = academic_semester
	results = frappe.get_all("Student Course Result", filters=filters, fields=[
			"grade_point", "credit_units", "include_in_gpa", "result_status", "is_approved", "is_published"
		])
	return calculate_gpa(results)


@frappe.whitelist()
def prepare_transcript(transcript_name):
	transcript = frappe.get_doc("Academic Transcript", transcript_name)
	results = frappe.get_all(
		"Student Course Result",
		filters={"student": transcript.student, "is_approved": 1, "is_published": 1},
		fields="*",
	)
	data = build_transcript_data({"name": transcript.student}, results)
	checksum = hashlib.sha256(json.dumps(data, sort_keys=True, default=str).encode()).hexdigest()
	transcript.source_result_version = frappe.utils.now()
	transcript.source_result_checksum = checksum
	transcript.save()
	return data


@frappe.whitelist()
def get_transcript_view(transcript_name=None, student=None):
	"""Return a live administrative transcript preview from all recorded marks."""
	roles = set(frappe.get_roles())
	if frappe.session.user != "Administrator" and not roles.intersection(
		{"System Manager", "Academics User", "Faculty Head", "Registrar"}
	):
		frappe.throw("Only authorised academic administrators may use the transcript viewer.", frappe.PermissionError)

	transcript = None
	if transcript_name:
		transcript = frappe.get_doc("Academic Transcript", transcript_name)
		transcript.check_permission("read")
	elif student:
		latest = frappe.get_all(
			"Academic Transcript",
			filters={"student": student},
			fields=["name"],
			order_by="modified desc",
			limit_page_length=1,
		)
		if latest:
			transcript = frappe.get_doc("Academic Transcript", latest[0].name)

	student_name = transcript.student if transcript else student
	if not student_name:
		frappe.throw("Select a student or transcript to preview.")

	student_record = frappe.db.get_value(
		"Student",
		student_name,
		["name", "student_name", "student_number", "gender", "nationality", "student_email_id"],
		as_dict=True,
	) or {}
	programme_name = transcript.academic_programme if transcript else None
	if not programme_name:
		enrolments = frappe.get_all(
			"Student Programme Enrolment",
			filters={"student": student_name},
			fields=["academic_programme"],
			order_by="modified desc",
			limit_page_length=1,
		)
		programme_name = enrolments[0].academic_programme if enrolments else None
	programme = frappe.db.get_value(
		"Academic Programme",
		programme_name,
		["name", "programme_name", "programme_code", "award_type", "academic_unit"],
		as_dict=True,
	) if programme_name else {}
	programme = programme or {}
	faculty = None
	if programme.get("academic_unit"):
		faculty = frappe.db.get_value("Academic Unit", programme.academic_unit, "unit_name")

	document_is_approved = bool(
		transcript and can_view_transcript(transcript.status, transcript.transcript_type)
	)
	metadata = {
		"name": transcript.name if transcript else f"PREVIEW-{student_name}",
		"transcript_type": transcript.transcript_type if transcript else "Administrative Preview",
		"status": transcript.status if transcript else "Administrative Preview",
		"verification_number": transcript.verification_number if transcript else None,
		"faculty_head_user": transcript.faculty_head_user if transcript else None,
		"faculty_head_approved_on": transcript.faculty_head_approved_on if transcript else None,
		"registrar_user": transcript.registrar_user if transcript else None,
		"registrar_issued_on": transcript.registrar_issued_on if transcript else None,
		"generated_pdf": transcript.generated_pdf if transcript else None,
		"can_view": True,
		"is_approved_document": document_is_approved,
	}
	base = {"transcript": metadata, "student": student_record, "programme": programme, "faculty": faculty}

	results = frappe.get_all(
		"Student Course Result",
		filters={"student": student_name},
		fields=[
			"name", "course_registration", "academic_semester", "course", "credit_units",
			"final_mark", "grade", "grade_point", "include_in_gpa", "result_status",
			"is_approved", "is_published",
		],
	)
	semester_cache = {}
	course_cache = {}
	registration_type_cache = {}
	for row in results:
		if row.academic_semester not in semester_cache:
			semester_cache[row.academic_semester] = frappe.db.get_value(
				"Academic Semester", row.academic_semester,
				["semester_name", "semester_number", "start_date"], as_dict=True,
			) or {}
		if row.course not in course_cache:
			course_cache[row.course] = frappe.db.get_value(
				"Course", row.course, ["course_code", "course_name"], as_dict=True,
			) or {}
		semester = semester_cache[row.academic_semester]
		course = course_cache[row.course]
		row["semester_name"] = semester.get("semester_name") or row.academic_semester
		row["semester_number"] = semester.get("semester_number")
		row["semester_start_date"] = semester.get("start_date")
		row["course_code"] = course.get("course_code") or row.course
		row["course_name"] = course.get("course_name") or row.course
		row["mark_percent"] = row.final_mark
		if row.course_registration and row.course_registration not in registration_type_cache:
			registration_type_cache[row.course_registration] = (
				frappe.db.get_value("Course Registration", row.course_registration, "registration_type") or "Normal"
			)
		row["attempt_type"] = registration_type_cache.get(row.course_registration, "Normal")

	data = build_transcript_data(student_record, results, require_approved=False)
	base.update(data)
	base["result_count"] = len(results)
	return base


@frappe.whitelist()
def create_invoice_from_fee_structure(student, university_fee_structure):
	student_doc = frappe.get_doc("Student", student)
	fee_structure = frappe.get_doc("University Fee Structure", university_fee_structure)
	items = build_invoice_items(fee_structure.as_dict())
	invoice = frappe.get_doc({
		"doctype": "Sales Invoice",
		"customer": student_doc.customer,
		"student": student,
		"university_fee_structure": university_fee_structure,
		"items": items,
	}).insert()
	return invoice.name


@frappe.whitelist()
def refresh_student_clearance(clearance_name):
	clearance = frappe.get_doc("Student Clearance", clearance_name)
	student = frappe.get_doc("Student", clearance.student)
	outstanding = frappe.db.sql(
		"""select coalesce(sum(outstanding_amount), 0) from `tabSales Invoice`
		where customer=%s and docstatus=1""", student.customer,
	)[0][0] or 0
	clearance.financial_status = "Outstanding" if outstanding else "Cleared"
	academic_hold = frappe.db.exists(
		"Student Course Result",
		{"student": clearance.student, "result_status": ["in", ["Incomplete", "Deferred", "Retake Required"]]},
	)
	clearance.academic_status = "Holds Found" if academic_hold else "Cleared"
	clearance.status = determine_clearance(clearance.financial_status, clearance.academic_status)
	clearance.save()
	return {"status": clearance.status, "outstanding_amount": outstanding}
