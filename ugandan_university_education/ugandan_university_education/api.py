import frappe
import hashlib
import json

from ugandan_university_education.services.transcript import build_transcript_data
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
