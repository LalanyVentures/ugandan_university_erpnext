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
    return user == "Administrator" or bool(
        {"Academics User", "Registrar", "Faculty Head", "Instructor", "Accounts User", "Accounts Manager", "Student"}
        .intersection(frappe.get_roles(user))
    )


@frappe.whitelist()
def get_user_info():
    return {"user": frappe.session.user, "roles": frappe.get_roles(frappe.session.user)}


ADMIN_QUERY_ENTITIES = {
	"Academic Programme", "Course", "Academic Unit", "Programme Curriculum",
	"Student Cohort", "Course Offering",
}
AUDITED_ENTITIES = {
	"Student", "University Application", "Academic Programme", "Course", "Academic Unit",
	"Programme Curriculum", "Student Cohort", "Course Offering", "Result Approval Batch",
	"Academic Transcript", "Student Clearance", "Sales Invoice", "Payment Entry", "Sponsorship Award",
	"Student Programme Enrolment", "Semester Registration", "Course Registration", "Teaching Timetable Entry",
	"Student Attendance", "University Fee Structure", "Student Course Result", "Course Assessment",
	"Result Review Request", "Grading Scheme", "Academic Year", "Academic Semester",
	"University Education Settings",
}


def _assert_academic_administrator():
	roles = set(frappe.get_roles())
	if frappe.session.user != "Administrator" and not roles.intersection({"System Manager", "Academics User", "Registrar"}):
		frappe.throw("Only authorised academic administrators may use this operation.", frappe.PermissionError)


def _json_value(value, fallback):
	if not value:
		return fallback
	return json.loads(value) if isinstance(value, str) else value


def _merge_in_filter(filters, fieldname, values):
	values = list(dict.fromkeys(value for value in values if value))
	filters.append([fieldname, "in", values or ["__no_matching_record__"]])


@frappe.whitelist()
def query_admin_academic_records(entity, fields=None, filters=None, search=None, search_fields=None,
	page=1, page_size=50, sort_field="modified", sort_order="desc"):
	"""Permission-safe academic list query with allowlisted relationship filters."""
	_assert_academic_administrator()
	if entity not in ADMIN_QUERY_ENTITIES:
		frappe.throw("This entity is not available to the academic query service.", frappe.PermissionError)
	if not frappe.has_permission(entity, "read"):
		frappe.throw("You do not have permission to read this entity.", frappe.PermissionError)

	meta = frappe.get_meta(entity)
	valid_fields = {"name", "owner", "creation", "modified", "modified_by", "docstatus"}
	valid_fields.update(field.fieldname for field in meta.fields if field.fieldname)
	requested_fields = [field for field in _json_value(fields, ["name"]) if field in valid_fields]
	requested_fields = requested_fields or ["name"]
	requested_search_fields = [field for field in _json_value(search_fields, []) if field in valid_fields]
	direct_filters = []

	for item in _json_value(filters, []):
		fieldname = item.get("field") if isinstance(item, dict) else item[0]
		operator = item.get("operator", "=") if isinstance(item, dict) else item[1]
		value = item.get("value", "") if isinstance(item, dict) else item[2]
		if operator not in {"=", "!=", "like", "in", ">", ">=", "<", "<="}:
			frappe.throw("Unsupported filter operator.")
		if fieldname in valid_fields:
			direct_filters.append([fieldname, operator, value.split(",") if operator == "in" and isinstance(value, str) else value])
		elif fieldname in {"faculty_unit", "academic_unit"}:
			if entity in {"Academic Programme", "Course"}:
				direct_filters.append(["academic_unit", operator, value])
			elif entity in {"Programme Curriculum", "Student Cohort"}:
				programmes = frappe.get_list("Academic Programme", filters={"academic_unit": value}, pluck="name")
				_merge_in_filter(direct_filters, "academic_programme", programmes)
			elif entity == "Course Offering":
				courses = frappe.get_list("Course", filters={"academic_unit": value}, pluck="name")
				_merge_in_filter(direct_filters, "course", courses)
		elif fieldname == "academic_programme" and entity == "Course Offering":
			curricula = frappe.get_list("Programme Curriculum", filters={"academic_programme": value}, pluck="name")
			_merge_in_filter(direct_filters, "programme_curriculum", curricula)
		elif fieldname == "academic_year" and entity == "Course Offering":
			semesters = frappe.get_list("Academic Semester", filters={"academic_year": value}, pluck="name")
			_merge_in_filter(direct_filters, "academic_semester", semesters)
		elif fieldname == "semester" and entity == "Course Offering":
			direct_filters.append(["academic_semester", operator, value])
		elif fieldname == "cohort" and entity == "Course Offering":
			direct_filters.append(["student_cohort", operator, value])
		elif fieldname == "lecturer" and entity == "Course Offering":
			parents = frappe.get_all("Course Offering Lecturer", filters={"lecturer": value}, pluck="parent")
			_merge_in_filter(direct_filters, "name", parents)
		else:
			frappe.throw(f"Filter {fieldname} is not supported for {entity}.")

	page = max(1, int(page or 1))
	page_size = int(page_size or 50)
	if page_size not in {25, 50, 100, 2000}:
		page_size = 50
	sort_field = sort_field if sort_field in valid_fields else "modified"
	sort_order = "asc" if str(sort_order).lower() == "asc" else "desc"
	or_filters = [[field, "like", f"%{search}%"] for field in requested_search_fields] if search else None
	rows = frappe.get_list(entity, fields=requested_fields, filters=direct_filters, or_filters=or_filters,
		start=(page - 1) * page_size, page_length=page_size + 1, order_by=f"{sort_field} {sort_order}")
	return {"rows": rows[:page_size], "page": page, "page_size": page_size, "has_next": len(rows) > page_size}


@frappe.whitelist()
def log_university_audit_event(entity_type, entity_name, action, reason=None, metadata=None):
	"""Persist a redacted lifecycle event after validating entity and record access."""
	if entity_type not in AUDITED_ENTITIES:
		frappe.throw("The audited record is not available.")
	if entity_name == "__aggregate__":
		_assert_academic_administrator()
	else:
		if not frappe.db.exists(entity_type, entity_name):
			frappe.throw("The audited record is not available.")
		if not frappe.has_permission(entity_type, "read", doc=entity_name):
			frappe.throw("You do not have permission to access this record.", frappe.PermissionError)
	allowed_actions = {"created", "updated", "viewed", "imported", "exported", "Guardian/contact added",
		"Move to review", "Admit & create student", "Reject", "Publish approved batch",
		"Issue transcript", "Revoke transcript", "Review clearance", "Submit invoice", "Approve award"}
	if action not in allowed_actions:
		frappe.throw("Unsupported audit action.")
	payload = _json_value(metadata, {})
	redacted = {key: payload[key] for key in ("source", "selection_count", "channel") if key in payload}
	doc = frappe.get_doc({"doctype": "University Audit Event", "entity_type": entity_type,
		"entity_name": entity_name, "action": action, "reason": reason, "actor": frappe.session.user,
		"event_time": frappe.utils.now(), "metadata_json": json.dumps(redacted, sort_keys=True)})
	doc.insert(ignore_permissions=True)
	return doc.name


@frappe.whitelist()
def get_university_audit_timeline(entity_type, entity_name, limit=50):
	if entity_type not in AUDITED_ENTITIES or not frappe.db.exists(entity_type, entity_name):
		frappe.throw("The audited record is not available.")
	if not frappe.has_permission(entity_type, "read", doc=entity_name):
		frappe.throw("You do not have permission to access this record.", frappe.PermissionError)
	return frappe.get_all("University Audit Event", filters={"entity_type": entity_type, "entity_name": entity_name},
		fields=["name", "action", "reason", "actor", "event_time"], order_by="event_time desc",
		limit_page_length=min(max(int(limit or 50), 1), 100))


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
	allowed_roles = {"System Manager", "Accounts User", "Accounts Manager", "Academics User", "Registrar", "Student"}
	if frappe.session.user != "Administrator" and not roles.intersection(allowed_roles):
		frappe.throw("Only authorised finance and academic staff may print payment receipts.", frappe.PermissionError)
	student_customer = None
	if "Student" in roles and frappe.session.user != "Administrator":
		student_customer = frappe.db.get_value("Student", {"student_email_id": frappe.session.user}, "customer")
		if not student_customer:
			frappe.throw("This user account is not linked to a student account.", frappe.PermissionError)

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
		if student_customer:
			if doc.party_type != "Customer" or doc.party != student_customer:
				frappe.throw("Students may only print receipts from their own account.", frappe.PermissionError)
		else:
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
def get_payment_register_data():
	"""Return submitted receipts with invoice semester links for the finance register."""
	roles = set(frappe.get_roles())
	allowed_roles = {"System Manager", "Accounts User", "Accounts Manager", "Academics User", "Registrar"}
	if frappe.session.user != "Administrator" and not roles.intersection(allowed_roles):
		frappe.throw("Only authorised finance and academic staff may view payment analysis.", frappe.PermissionError)

	rows = frappe.get_all(
		"Payment Entry",
		filters={"docstatus": 1, "payment_type": "Receive"},
		fields=["name", "posting_date", "payment_type", "party_type", "party", "party_name",
			"mode_of_payment", "reference_no", "reference_date", "paid_amount", "received_amount",
			"paid_to_account_currency", "remarks", "docstatus"],
		order_by="posting_date desc, creation desc",
		limit_page_length=2000,
	)

	result = []
	for row in rows:
		doc = frappe.get_doc("Payment Entry", row.name)
		doc.check_permission("read")
		student = None
		if row.party_type == "Customer" and row.party:
			student = frappe.db.get_value("Student", {"customer": row.party},
				["name", "student_name", "student_number"], as_dict=True)
		allocations = []
		for reference in doc.get("references") or []:
			if reference.reference_doctype != "Sales Invoice" or not reference.reference_name:
				continue
			invoice = frappe.db.get_value(
				"Sales Invoice", reference.reference_name,
				["name", "student", "academic_semester", "university_fee_structure", "grand_total", "outstanding_amount"],
				as_dict=True,
			) or {}
			allocations.append({
				"reference_name": reference.reference_name,
				"academic_semester": invoice.get("academic_semester"),
				"university_fee_structure": invoice.get("university_fee_structure"),
				"allocated_amount": reference.allocated_amount,
				"invoice_total": invoice.get("grand_total"),
				"current_outstanding": invoice.get("outstanding_amount"),
			})
		row["student"] = student.get("name") if student else None
		row["student_name"] = student.get("student_name") if student else None
		row["student_number"] = student.get("student_number") if student else None
		row["allocations"] = allocations
		row["semesters"] = sorted({a.get("academic_semester") for a in allocations if a.get("academic_semester")})
		result.append(row)
	return result


@frappe.whitelist()
def get_student_info():
    return frappe.db.get_value(
        "Student", {"student_email_id": frappe.session.user},
        ["name", "student_name", "student_email_id", "customer"], as_dict=True,
    )


@frappe.whitelist()
def get_student_portal_data():
	"""Return only the academic and finance records owned by the signed-in student."""
	if frappe.session.user == "Guest":
		frappe.throw("Please sign in to access the student portal.", frappe.PermissionError)
	student = frappe.db.get_value(
		"Student", {"student_email_id": frappe.session.user},
		["name", "student_name", "student_number", "first_name", "middle_name", "last_name",
			"gender", "date_of_birth", "nationality", "student_email_id", "customer", "status"],
		as_dict=True,
	)
	if not student:
		frappe.throw("This user account is not linked to a Student record.", frappe.DoesNotExistError)

	enrolments = frappe.get_all("Student Programme Enrolment", filters={"student": student.name},
		fields=["name", "academic_programme", "programme_curriculum", "academic_year", "student_cohort",
			"admission_date", "expected_completion_date", "status", "docstatus"], order_by="admission_date desc")
	semester_registrations = frappe.get_all("Semester Registration", filters={"student": student.name},
		fields=["name", "student_programme_enrolment", "academic_semester", "registration_date", "status", "docstatus"],
		order_by="registration_date desc")
	course_registrations = frappe.get_all("Course Registration", filters={"student": student.name},
		fields=["name", "student_cohort", "student_programme_enrolment", "semester_registration", "course_offering",
			"attempt_number", "registration_type", "status", "docstatus"], order_by="modified desc")

	offering_names = [row.course_offering for row in course_registrations if row.course_offering]
	offerings = frappe.get_all("Course Offering", filters={"name": ["in", offering_names]},
		fields=["name", "course", "academic_semester", "student_cohort", "offering_type", "status"]) if offering_names else []
	offering_map = {row.name: row for row in offerings}
	course_names = list({row.course for row in offerings if row.course})
	courses = frappe.get_all("Course", filters={"name": ["in", course_names]},
		fields=["name", "course_code", "course_name", "academic_unit", "credit_units", "study_level", "status"]) if course_names else []
	course_map = {row.name: row for row in courses}
	for registration in course_registrations:
		offering = offering_map.get(registration.course_offering) or {}
		course = course_map.get(offering.get("course")) or {}
		registration.update({
			"course": offering.get("course"), "academic_semester": offering.get("academic_semester"),
			"course_code": course.get("course_code"), "course_name": course.get("course_name"),
			"credit_units": course.get("credit_units"), "academic_unit": course.get("academic_unit"),
		})

	timetable = frappe.get_all("Teaching Timetable Entry", filters={"course_offering": ["in", offering_names], "status": "Published"},
		fields=["name", "course_offering", "academic_semester", "weekday", "start_time", "end_time", "venue", "session_type", "status"],
		order_by="weekday asc, start_time asc") if offering_names else []
	for entry in timetable:
		offering = offering_map.get(entry.course_offering) or {}
		course = course_map.get(offering.get("course")) or {}
		entry["course_code"] = course.get("course_code")
		entry["course_name"] = course.get("course_name")

	attendance = frappe.get_all("Student Attendance", filters={"student": student.name, "docstatus": ["<", 2]},
		fields=["name", "course_registration", "timetable_entry", "attendance_date", "status", "remarks"],
		order_by="attendance_date desc", limit_page_length=1000)
	results = frappe.get_all("Student Course Result", filters={"student": student.name, "is_published": 1},
		fields=["name", "course_registration", "academic_semester", "course", "credit_units", "coursework_mark",
			"examination_mark", "final_mark", "grade", "grade_point", "include_in_gpa", "result_status", "remarks"],
		order_by="academic_semester desc")
	for result in results:
		course = course_map.get(result.course) or frappe.db.get_value("Course", result.course,
			["course_code", "course_name"], as_dict=True) or {}
		result["course_code"] = course.get("course_code")
		result["course_name"] = course.get("course_name")

	invoices = frappe.get_all("Sales Invoice", filters={"student": student.name, "docstatus": 1},
		fields=["name", "posting_date", "due_date", "academic_semester", "university_fee_structure", "grand_total",
			"outstanding_amount", "status", "currency"], order_by="posting_date desc")
	payment_rows = frappe.get_all("Payment Entry", filters={"party_type": "Customer", "party": student.customer,
		"payment_type": "Receive", "docstatus": 1}, fields=["name", "posting_date", "mode_of_payment", "reference_no",
			"reference_date", "paid_amount", "received_amount", "paid_to_account_currency", "remarks"], order_by="posting_date desc") if student.customer else []
	for payment in payment_rows:
		doc = frappe.get_doc("Payment Entry", payment.name)
		payment["allocations"] = [{"reference_name": ref.reference_name, "allocated_amount": ref.allocated_amount,
			"academic_semester": frappe.db.get_value("Sales Invoice", ref.reference_name, "academic_semester")
			if ref.reference_doctype == "Sales Invoice" and ref.reference_name else None}
			for ref in (doc.get("references") or [])]

	clearance = frappe.get_all("Student Clearance", filters={"student": student.name},
		fields=["name", "clearance_type", "academic_semester", "status", "financial_status", "academic_status", "cleared_on"],
		order_by="modified desc")
	transcript_rows = frappe.get_all("Academic Transcript", filters={"student": student.name},
		fields=["name", "academic_programme", "transcript_type", "status", "verification_number", "registrar_issued_on", "generated_pdf"],
		order_by="modified desc")
	transcripts = [row for row in transcript_rows if can_view_transcript(row.status, row.transcript_type)]

	return {"student": student, "enrolments": enrolments, "semester_registrations": semester_registrations,
		"course_registrations": course_registrations, "timetable": timetable, "attendance": attendance,
		"results": results, "invoices": invoices, "payments": payment_rows, "clearance": clearance,
		"transcripts": transcripts}


def _get_lecturer_member():
	if frappe.session.user == "Guest":
		frappe.throw("Please sign in to access the lecturer portal.", frappe.PermissionError)
	roles = set(frappe.get_roles())
	if frappe.session.user != "Administrator" and "Instructor" not in roles:
		frappe.throw("Only lecturers may access this teaching workspace.", frappe.PermissionError)
	member = frappe.db.get_value(
		"University Member", {"user": frappe.session.user, "member_type": "Lecturer"},
		["name", "member_number", "full_name", "member_type", "user", "employee", "status"], as_dict=True,
	)
	if not member:
		frappe.throw("This user account is not linked to an active University Member lecturer record.", frappe.DoesNotExistError)
	if member.status != "Active":
		frappe.throw("This lecturer record is not active.", frappe.PermissionError)
	return member


def _lecturer_offering_names(member_name):
	assignments = frappe.get_all(
		"Course Offering Lecturer",
		filters={"lecturer": member_name, "parenttype": "Course Offering"},
		fields=["parent", "is_primary", "teaching_role"],
	)
	return assignments, list(dict.fromkeys(row.parent for row in assignments if row.parent))


def _assert_lecturer_offering(offering_name):
	member = _get_lecturer_member()
	if not frappe.db.exists("Course Offering Lecturer", {
		"parent": offering_name, "parenttype": "Course Offering", "lecturer": member.name,
	}):
		frappe.throw("You may only work with course offerings assigned to you.", frappe.PermissionError)
	return member


@frappe.whitelist()
def get_lecturer_portal_data():
	"""Return teaching records constrained to the signed-in lecturer's assigned offerings."""
	member = _get_lecturer_member()
	assignments, offering_names = _lecturer_offering_names(member.name)
	assignment_map = {row.parent: row for row in assignments}
	offerings = frappe.get_all(
		"Course Offering", filters={"name": ["in", offering_names]},
		fields=["name", "course", "programme_curriculum", "grading_scheme", "academic_semester",
			"student_cohort", "offering_type", "capacity", "status"], order_by="academic_semester desc",
	) if offering_names else []
	course_names = list({row.course for row in offerings if row.course})
	courses = frappe.get_all(
		"Course", filters={"name": ["in", course_names]},
		fields=["name", "course_code", "course_name", "academic_unit", "credit_units", "study_level", "status"],
	) if course_names else []
	course_map = {row.name: row for row in courses}
	for offering in offerings:
		course = course_map.get(offering.course) or {}
		assignment = assignment_map.get(offering.name) or {}
		offering.update({
			"course_code": course.get("course_code"), "course_name": course.get("course_name"),
			"credit_units": course.get("credit_units"), "academic_unit": course.get("academic_unit"),
			"is_primary_lecturer": assignment.get("is_primary"), "teaching_role": assignment.get("teaching_role"),
		})

	registrations = frappe.get_all(
		"Course Registration", filters={"course_offering": ["in", offering_names], "status": ["not in", ["Cancelled", "Dropped"]]},
		fields=["name", "student", "student_cohort", "semester_registration", "course_offering",
			"attempt_number", "registration_type", "status", "docstatus"], order_by="course_offering asc, student asc",
	) if offering_names else []
	student_names = list({row.student for row in registrations if row.student})
	students = frappe.get_all(
		"Student", filters={"name": ["in", student_names]},
		fields=["name", "student_name", "student_number", "first_name", "last_name", "gender",
			"student_email_id", "status"], order_by="student_name asc",
	) if student_names else []
	student_map = {row.name: row for row in students}
	for registration in registrations:
		student = student_map.get(registration.student) or {}
		offering = next((row for row in offerings if row.name == registration.course_offering), {})
		registration.update({
			"student_name": student.get("student_name"), "student_number": student.get("student_number"),
			"student_email_id": student.get("student_email_id"), "academic_semester": offering.get("academic_semester"),
			"course": offering.get("course"), "course_code": offering.get("course_code"),
			"course_name": offering.get("course_name"), "credit_units": offering.get("credit_units"),
		})

	timetable = frappe.get_all(
		"Teaching Timetable Entry", filters={"course_offering": ["in", offering_names], "status": ["!=", "Cancelled"]},
		fields=["name", "course_offering", "academic_semester", "weekday", "start_time", "end_time", "venue",
			"session_type", "status"], order_by="weekday asc, start_time asc",
	) if offering_names else []
	assessments = frappe.get_all(
		"Course Assessment", filters={"course_offering": ["in", offering_names]},
		fields=["name", "course_offering", "assessment_name", "assessment_type", "maximum_mark", "weight",
			"assessment_date", "status"], order_by="assessment_date desc",
	) if offering_names else []
	registration_names = [row.name for row in registrations]
	attendance = frappe.get_all(
		"Student Attendance", filters={"course_registration": ["in", registration_names], "docstatus": ["<", 2]},
		fields=["name", "student", "course_registration", "timetable_entry", "attendance_date", "status", "remarks", "docstatus"],
		order_by="attendance_date desc", limit_page_length=5000,
	) if registration_names else []
	results = frappe.get_all(
		"Student Course Result", filters={"course_registration": ["in", registration_names], "docstatus": ["<", 2]},
		fields=["name", "student", "course_registration", "academic_semester", "course", "credit_units",
			"coursework_mark", "examination_mark", "final_mark", "grade", "grade_point", "result_status",
			"is_approved", "is_published", "remarks", "docstatus"], order_by="academic_semester desc",
	) if registration_names else []
	for result in results:
		doc = frappe.get_doc("Student Course Result", result.name)
		result["assessment_marks"] = [row.as_dict() for row in (doc.get("assessment_marks") or [])]
		student = student_map.get(result.student) or {}
		result["student_name"] = student.get("student_name")
		result["student_number"] = student.get("student_number")
	result_names = [row.name for row in results]
	review_requests = frappe.get_all(
		"Result Review Request", filters={"student_course_result": ["in", result_names]},
		fields=["name", "student", "student_course_result", "request_type", "reason", "status", "decision", "reviewed_by"],
		order_by="modified desc",
	) if result_names else []
	approval_batches = frappe.get_all(
		"Result Approval Batch", filters={"course_offering": ["in", offering_names]},
		fields=["name", "course_offering", "academic_semester", "approval_stage", "status", "submitted_by", "approved_by", "docstatus"],
		order_by="modified desc",
	) if offering_names else []
	return {
		"lecturer": member, "offerings": offerings, "registrations": registrations, "students": students,
		"timetable": timetable, "assessments": assessments, "attendance": attendance, "results": results,
		"review_requests": review_requests, "approval_batches": approval_batches,
	}


@frappe.whitelist()
def save_lecturer_attendance(entries):
	"""Create or update draft attendance for students in the lecturer's assigned offerings."""
	if isinstance(entries, str):
		entries = json.loads(entries)
	entries = entries or []
	saved = []
	for entry in entries:
		registration = frappe.get_doc("Course Registration", entry.get("course_registration"))
		_assert_lecturer_offering(registration.course_offering)
		timetable = frappe.get_doc("Teaching Timetable Entry", entry.get("timetable_entry"))
		if timetable.course_offering != registration.course_offering:
			frappe.throw("The timetable session and course registration must belong to the same offering.")
		status = entry.get("status")
		if status not in {"Present", "Absent", "Late", "Excused"}:
			frappe.throw("Select a valid attendance status.")
		filters = {
			"course_registration": registration.name, "timetable_entry": timetable.name,
			"attendance_date": entry.get("attendance_date"), "docstatus": ["<", 2],
		}
		existing = frappe.db.get_value("Student Attendance", filters, "name")
		doc = frappe.get_doc("Student Attendance", existing) if existing else frappe.new_doc("Student Attendance")
		if doc.docstatus == 1:
			frappe.throw(f"Attendance {doc.name} is submitted and cannot be changed.")
		doc.update({
			"student": registration.student, "course_registration": registration.name,
			"timetable_entry": timetable.name, "attendance_date": entry.get("attendance_date"),
			"status": status, "remarks": entry.get("remarks"),
		})
		doc.save(ignore_permissions=True)
		saved.append(doc.name)
	return saved


@frappe.whitelist()
def save_lecturer_marks(course_assessment, marks):
	"""Save assessment marks for a lecturer's class without approving or publishing results."""
	if isinstance(marks, str):
		marks = json.loads(marks)
	assessment = frappe.get_doc("Course Assessment", course_assessment)
	_assert_lecturer_offering(assessment.course_offering)
	offering = frappe.get_doc("Course Offering", assessment.course_offering)
	assessment_defs = frappe.get_all(
		"Course Assessment", filters={"course_offering": offering.name},
		fields=["name", "assessment_type", "maximum_mark", "weight"],
	)
	definition_map = {row.name: row for row in assessment_defs}
	grade_bands = []
	if offering.grading_scheme:
		grade_bands = [row.as_dict() for row in frappe.get_doc("Grading Scheme", offering.grading_scheme).get("grade_bands")]
	saved = []
	for mark_entry in (marks or []):
		registration = frappe.get_doc("Course Registration", mark_entry.get("course_registration"))
		if registration.course_offering != offering.name:
			frappe.throw("Every mark must belong to the selected assessment's course offering.")
		mark = float(mark_entry.get("mark") or 0)
		if mark < 0 or mark > float(assessment.maximum_mark or 100):
			frappe.throw(f"Marks for {assessment.assessment_name} must be between 0 and {assessment.maximum_mark}.")
		result_name = frappe.db.get_value("Student Course Result", {"course_registration": registration.name, "docstatus": ["<", 2]}, "name")
		if result_name:
			result = frappe.get_doc("Student Course Result", result_name)
		else:
			course = frappe.get_doc("Course", offering.course)
			result = frappe.get_doc({
				"doctype": "Student Course Result", "student": registration.student,
				"course_registration": registration.name, "academic_semester": offering.academic_semester,
				"course": offering.course, "credit_units": course.credit_units or 0, "result_status": "Provisional",
			})
		if result.docstatus == 1:
			frappe.throw(f"Result {result.name} is submitted and cannot be changed.")
		row_map = {row.course_assessment: row.as_dict() for row in (result.get("assessment_marks") or [])}
		row_map[assessment.name] = {
			"course_assessment": assessment.name, "mark": mark, "weight": assessment.weight,
			"is_published": 0, "lecturer_comment": mark_entry.get("lecturer_comment"),
		}
		calculation_rows = []
		coursework_mark = examination_mark = 0.0
		for assessment_name, row in row_map.items():
			definition = definition_map.get(assessment_name)
			if not definition:
				continue
			calculation_row = dict(row)
			calculation_row["maximum_mark"] = definition.maximum_mark
			calculation_rows.append(calculation_row)
			weighted = (float(row.get("mark") or 0) / float(definition.maximum_mark or 100)) * float(definition.weight or 0)
			if "Examination" in (definition.assessment_type or ""):
				examination_mark += weighted
			else:
				coursework_mark += weighted
		calculated = calculate_result(calculation_rows, grade_bands, result.credit_units)
		result.set("assessment_marks", list(row_map.values()))
		result.coursework_mark = coursework_mark
		result.examination_mark = examination_mark
		result.final_mark = calculated.get("final_mark")
		result.grade = calculated.get("grade")
		result.grade_point = calculated.get("grade_point")
		result.result_status = "Provisional"
		result.is_approved = 0
		result.is_published = 0
		result.save(ignore_permissions=True)
		saved.append(result.name)
	return saved


@frappe.whitelist()
def submit_lecturer_results(course_offering):
	"""Submit the lecturer's recorded results as a controlled approval batch."""
	_assert_lecturer_offering(course_offering)
	offering = frappe.get_doc("Course Offering", course_offering)
	registration_names = frappe.get_all(
		"Course Registration", filters={"course_offering": course_offering, "status": ["not in", ["Cancelled", "Dropped"]]},
		pluck="name",
	)
	results = frappe.get_all(
		"Student Course Result", filters={"course_registration": ["in", registration_names], "docstatus": ["<", 2]},
		fields=["name", "final_mark"],
	) if registration_names else []
	if not results:
		frappe.throw("Record student marks before submitting this course offering for approval.")
	existing = frappe.db.get_value("Result Approval Batch", {
		"course_offering": course_offering, "status": ["in", ["Submitted", "Approved"]], "docstatus": ["<", 2],
	}, "name")
	if existing:
		return existing
	batch = frappe.get_doc({
		"doctype": "Result Approval Batch", "course_offering": course_offering,
		"academic_semester": offering.academic_semester, "approval_stage": "Lecturer",
		"status": "Submitted", "submitted_by": frappe.session.user,
		"items": [{"student_course_result": row.name, "review_status": "Pending"} for row in results],
	}).insert(ignore_permissions=True)
	return batch.name


def _get_faculty_head_scope():
	if frappe.session.user == "Guest":
		frappe.throw("Please sign in to access the faculty workspace.", frappe.PermissionError)
	roles = set(frappe.get_roles())
	if frappe.session.user != "Administrator" and "Faculty Head" not in roles:
		frappe.throw("Only authorised Faculty Heads may access this workspace.", frappe.PermissionError)
	member = frappe.db.get_value(
		"University Member", {"user": frappe.session.user},
		["name", "member_number", "full_name", "member_type", "user", "employee", "status"], as_dict=True,
	)
	if not member:
		frappe.throw("This user account is not linked to a University Member record.", frappe.DoesNotExistError)
	if member.status != "Active":
		frappe.throw("This faculty leadership record is not active.", frappe.PermissionError)
	all_units = frappe.get_all(
		"Academic Unit", fields=["name", "unit_name", "unit_code", "unit_type", "parent_academic_unit", "head_member", "status"],
		order_by="unit_name asc",
	)
	head_units = [row for row in all_units if row.head_member == member.name]
	if not head_units:
		frappe.throw("No Academic Unit is assigned to this Faculty Head.", frappe.DoesNotExistError)
	scope_names = {row.name for row in head_units}
	changed = True
	while changed:
		changed = False
		for unit in all_units:
			if unit.parent_academic_unit in scope_names and unit.name not in scope_names:
				scope_names.add(unit.name)
				changed = True
	units = [row for row in all_units if row.name in scope_names]
	return member, head_units, units, list(scope_names)


def _faculty_scope_records():
	member, head_units, units, unit_names = _get_faculty_head_scope()
	programmes = frappe.get_all(
		"Academic Programme", filters={"academic_unit": ["in", unit_names]},
		fields=["name", "programme_code", "programme_name", "award_type", "academic_unit", "duration_years", "status"],
		order_by="programme_name asc",
	)
	programme_names = [row.name for row in programmes]
	courses = frappe.get_all(
		"Course", filters={"academic_unit": ["in", unit_names]},
		fields=["name", "course_code", "course_name", "academic_unit", "credit_units", "study_level", "status"],
		order_by="course_code asc",
	)
	course_names = [row.name for row in courses]
	offerings = frappe.get_all(
		"Course Offering", filters={"course": ["in", course_names]},
		fields=["name", "course", "programme_curriculum", "grading_scheme", "academic_semester", "student_cohort",
			"offering_type", "capacity", "status"], order_by="academic_semester desc",
	) if course_names else []
	return member, head_units, units, unit_names, programmes, programme_names, courses, course_names, offerings


def _assert_faculty_offering(offering_name):
	*_, offerings = _faculty_scope_records()
	if offering_name not in {row.name for row in offerings}:
		frappe.throw("This course offering is outside your faculty scope.", frappe.PermissionError)
	return next(row for row in offerings if row.name == offering_name)


def _assert_faculty_programme(programme_name):
	*_, programmes, programme_names, courses, course_names, offerings = _faculty_scope_records()
	if programme_name not in programme_names:
		frappe.throw("This academic programme is outside your faculty scope.", frappe.PermissionError)
	return next(row for row in programmes if row.name == programme_name)


@frappe.whitelist()
def get_faculty_head_portal_data():
	"""Return records belonging to academic units led by the signed-in Faculty Head."""
	member, head_units, units, unit_names, programmes, programme_names, courses, course_names, offerings = _faculty_scope_records()
	course_map = {row.name: row for row in courses}
	for offering in offerings:
		course = course_map.get(offering.course) or {}
		offering.update({"course_code": course.get("course_code"), "course_name": course.get("course_name"),
			"credit_units": course.get("credit_units"), "academic_unit": course.get("academic_unit")})
	offering_names = [row.name for row in offerings]
	curricula = frappe.get_all(
		"Programme Curriculum", filters={"academic_programme": ["in", programme_names]},
		fields=["name", "curriculum_name", "academic_programme", "academic_year", "effective_from", "status", "docstatus"],
		order_by="effective_from desc",
	) if programme_names else []
	cohorts = frappe.get_all(
		"Student Cohort", filters={"academic_programme": ["in", programme_names]},
		fields=["name", "cohort_code", "cohort_name", "academic_programme", "programme_curriculum", "academic_year",
			"campus", "intake_month", "status"], order_by="academic_year desc",
	) if programme_names else []
	enrolments = frappe.get_all(
		"Student Programme Enrolment", filters={"academic_programme": ["in", programme_names], "docstatus": ["<", 2]},
		fields=["name", "student", "academic_programme", "programme_curriculum", "academic_year", "student_cohort",
			"admission_date", "expected_completion_date", "status", "docstatus"], order_by="admission_date desc",
	) if programme_names else []
	student_names = list({row.student for row in enrolments if row.student})
	students = frappe.get_all(
		"Student", filters={"name": ["in", student_names]}, fields=["name", "student_name", "student_number",
			"first_name", "last_name", "gender", "student_email_id", "status"], order_by="student_name asc",
	) if student_names else []
	student_map = {row.name: row for row in students}
	for enrolment in enrolments:
		student = student_map.get(enrolment.student) or {}
		enrolment["student_name"] = student.get("student_name")
		enrolment["student_number"] = student.get("student_number")
	registrations = frappe.get_all(
		"Course Registration", filters={"course_offering": ["in", offering_names], "docstatus": ["<", 2]},
		fields=["name", "student", "student_cohort", "semester_registration", "course_offering", "status"],
	) if offering_names else []
	registration_names = [row.name for row in registrations]
	results = frappe.get_all(
		"Student Course Result", filters={"course_registration": ["in", registration_names], "docstatus": ["<", 2]},
		fields=["name", "student", "course_registration", "academic_semester", "course", "credit_units",
			"coursework_mark", "examination_mark", "final_mark", "grade", "grade_point", "result_status",
			"is_approved", "is_published", "approved_by", "approved_on", "docstatus"], order_by="academic_semester desc",
	) if registration_names else []
	for result in results:
		student = student_map.get(result.student) or {}
		course = course_map.get(result.course) or {}
		result.update({"student_name": student.get("student_name"), "student_number": student.get("student_number"),
			"course_code": course.get("course_code"), "course_name": course.get("course_name")})
	assessments = frappe.get_all(
		"Course Assessment", filters={"course_offering": ["in", offering_names]},
		fields=["name", "course_offering", "assessment_name", "assessment_type", "maximum_mark", "weight",
			"assessment_date", "status"], order_by="assessment_date desc",
	) if offering_names else []
	batches = frappe.get_all(
		"Result Approval Batch", filters={"course_offering": ["in", offering_names], "docstatus": ["<", 2]},
		fields=["name", "course_offering", "academic_semester", "approval_stage", "status", "submitted_by", "approved_by", "docstatus"],
		order_by="modified desc",
	) if offering_names else []
	for batch in batches:
		doc = frappe.get_doc("Result Approval Batch", batch.name)
		batch["items"] = [row.as_dict() for row in (doc.get("items") or [])]
	result_names = [row.name for row in results]
	reviews = frappe.get_all(
		"Result Review Request", filters={"student_course_result": ["in", result_names]},
		fields=["name", "student", "student_course_result", "request_type", "reason", "status", "decision", "reviewed_by"],
		order_by="modified desc",
	) if result_names else []
	transcripts = frappe.get_all(
		"Academic Transcript", filters={"academic_programme": ["in", programme_names], "docstatus": ["<", 2]},
		fields=["name", "student", "academic_programme", "transcript_type", "status", "source_result_version",
			"faculty_head_user", "faculty_head_approved_on", "registrar_user", "registrar_issued_on",
			"verification_number", "generated_pdf", "docstatus"], order_by="modified desc",
	) if programme_names else []
	for transcript in transcripts:
		student = student_map.get(transcript.student) or frappe.db.get_value("Student", transcript.student,
			["student_name", "student_number"], as_dict=True) or {}
		transcript["student_name"] = student.get("student_name")
		transcript["student_number"] = student.get("student_number")
	clearance = frappe.get_all(
		"Student Clearance", filters={"student": ["in", student_names], "docstatus": ["<", 2]},
		fields=["name", "student", "clearance_type", "academic_semester", "status", "financial_status",
			"academic_status", "cleared_by", "cleared_on", "docstatus"], order_by="modified desc",
	) if student_names else []
	lecturer_assignments = frappe.get_all(
		"Course Offering Lecturer", filters={"parent": ["in", offering_names], "parenttype": "Course Offering"},
		fields=["parent", "lecturer", "is_primary", "teaching_role"],
	) if offering_names else []
	lecturer_names = list({row.lecturer for row in lecturer_assignments if row.lecturer})
	lecturers = frappe.get_all(
		"University Member", filters={"name": ["in", lecturer_names]},
		fields=["name", "member_number", "full_name", "member_type", "user", "employee", "status"],
	) if lecturer_names else []
	for lecturer in lecturers:
		lecturer["assignments"] = [row for row in lecturer_assignments if row.lecturer == lecturer.name]
	return {"faculty_head": member, "head_units": head_units, "units": units, "programmes": programmes,
		"courses": courses, "curricula": curricula, "cohorts": cohorts, "students": students,
		"enrolments": enrolments, "offerings": offerings, "lecturers": lecturers, "assessments": assessments,
		"results": results, "approval_batches": batches, "review_requests": reviews,
		"transcripts": transcripts, "clearance": clearance}


@frappe.whitelist()
def review_faculty_result_batch(batch_name, decision, comment=None):
	"""Approve or reject a submitted result batch without publishing student results."""
	batch = frappe.get_doc("Result Approval Batch", batch_name)
	_assert_faculty_offering(batch.course_offering)
	if decision not in {"Approved", "Rejected"}:
		frappe.throw("Decision must be Approved or Rejected.")
	if batch.status not in {"Submitted", "Rejected"}:
		frappe.throw("Only submitted result batches may be reviewed by the Faculty Head.")
	for item in batch.items:
		item.review_status = decision
		item.comment = comment
		if decision == "Approved":
			result = frappe.get_doc("Student Course Result", item.student_course_result)
			result.is_approved = 1
			result.is_published = 0
			result.approved_by = frappe.session.user
			result.approved_on = frappe.utils.now()
			result.save(ignore_permissions=True)
	batch.approval_stage = "Faculty Head"
	batch.status = decision
	batch.approved_by = frappe.session.user if decision == "Approved" else None
	batch.save(ignore_permissions=True)
	frappe.get_doc({"doctype": "University Audit Event", "entity_type": "Result Approval Batch",
		"entity_name": batch.name, "action": "Approve results" if decision == "Approved" else "Return results",
		"reason": comment, "actor": frappe.session.user, "event_time": frappe.utils.now(),
		"metadata_json": json.dumps({"source": "faculty-result-drawer"}, sort_keys=True)}).insert(ignore_permissions=True)
	return batch.name


@frappe.whitelist()
def review_faculty_transcript(transcript_name, decision):
	"""Approve a faculty transcript for registrar processing or return it to draft."""
	transcript = frappe.get_doc("Academic Transcript", transcript_name)
	_assert_faculty_programme(transcript.academic_programme)
	if decision not in {"Approved", "Returned"}:
		frappe.throw("Decision must be Approved or Returned.")
	if decision == "Returned":
		transcript.status = "Draft"
		transcript.faculty_head_user = None
		transcript.faculty_head_approved_on = None
		transcript.save(ignore_permissions=True)
		return transcript.name
	results = frappe.get_all(
		"Student Course Result", filters={"student": transcript.student, "is_approved": 1, "docstatus": ["<", 2]},
		fields="*",
	)
	if not results:
		frappe.throw("This student has no faculty-approved results to certify.")
	data = build_transcript_data({"name": transcript.student}, results, require_approved=False)
	transcript.source_result_version = frappe.utils.now()
	transcript.source_result_checksum = hashlib.sha256(json.dumps(data, sort_keys=True, default=str).encode()).hexdigest()
	transcript.faculty_head_user = frappe.session.user
	transcript.faculty_head_approved_on = frappe.utils.now()
	transcript.status = "Faculty Head Approved"
	transcript.save(ignore_permissions=True)
	return transcript.name


@frappe.whitelist()
def resolve_faculty_result_review(request_name, decision, status="Resolved"):
	request = frappe.get_doc("Result Review Request", request_name)
	result = frappe.get_doc("Student Course Result", request.student_course_result)
	registration = frappe.get_doc("Course Registration", result.course_registration)
	_assert_faculty_offering(registration.course_offering)
	if status not in {"Under Review", "Approved", "Rejected", "Resolved"}:
		frappe.throw("Select a valid review status.")
	request.status = status
	request.decision = decision
	request.reviewed_by = frappe.session.user
	request.save(ignore_permissions=True)
	return request.name


def _assert_registrar():
	if frappe.session.user == "Guest":
		frappe.throw("Please sign in to access the registrar portal.", frappe.PermissionError)
	roles = set(frappe.get_roles())
	if frappe.session.user != "Administrator" and not roles.intersection({"Registrar", "Academics User"}):
		frappe.throw("Only authorised registrar staff may access this workspace.", frappe.PermissionError)
	return frappe.db.get_value("User", frappe.session.user, ["name", "full_name", "email", "enabled"], as_dict=True) or {
		"name": frappe.session.user, "full_name": frappe.session.user,
	}


@frappe.whitelist()
def get_registrar_portal_data():
	"""Return the institution-wide academic control records required by the registrar."""
	registrar = _assert_registrar()
	applications = frappe.get_all("University Application", fields=["name", "application_number", "applicant_name",
		"applicant_email", "academic_programme", "programme_curriculum", "academic_year", "application_date",
		"status", "student", "reviewed_by", "review_comments"], order_by="application_date desc")
	students = frappe.get_all("Student", fields=["name", "student_name", "student_number", "first_name", "last_name",
		"gender", "nationality", "student_email_id", "status", "customer"], order_by="student_name asc")
	student_map = {row.name: row for row in students}
	units = frappe.get_all("Academic Unit", fields=["name", "unit_name", "unit_code", "unit_type", "parent_academic_unit",
		"head_member", "status"], order_by="unit_name asc")
	programmes = frappe.get_all("Academic Programme", fields=["name", "programme_code", "programme_name", "award_type",
		"academic_unit", "duration_years", "status"], order_by="programme_name asc")
	courses = frappe.get_all("Course", fields=["name", "course_code", "course_name", "academic_unit", "credit_units",
		"study_level", "status"], order_by="course_code asc")
	curricula = frappe.get_all("Programme Curriculum", fields=["name", "curriculum_name", "academic_programme",
		"academic_year", "effective_from", "status", "docstatus"], order_by="effective_from desc")
	years = frappe.get_all("Academic Year", fields=["name", "year_name", "year_start_date", "year_end_date", "status"],
		order_by="year_start_date desc")
	semesters = frappe.get_all("Academic Semester", fields=["name", "semester_name", "academic_year", "semester_number",
		"start_date", "end_date", "registration_open", "status"], order_by="start_date desc")
	cohorts = frappe.get_all("Student Cohort", fields=["name", "cohort_code", "cohort_name", "academic_programme",
		"programme_curriculum", "academic_year", "campus", "intake_month", "status"], order_by="academic_year desc")
	enrolments = frappe.get_all("Student Programme Enrolment", filters={"docstatus": ["<", 2]}, fields=["name", "student",
		"academic_programme", "programme_curriculum", "academic_year", "student_cohort", "admission_date",
		"expected_completion_date", "status", "docstatus"], order_by="admission_date desc")
	for row in enrolments:
		student = student_map.get(row.student) or {}
		row["student_name"] = student.get("student_name")
		row["student_number"] = student.get("student_number")
	semester_registrations = frappe.get_all("Semester Registration", filters={"docstatus": ["<", 2]}, fields=["name",
		"student", "student_programme_enrolment", "academic_semester", "registration_date", "status", "docstatus"],
		order_by="registration_date desc")
	for row in semester_registrations:
		student = student_map.get(row.student) or {}
		row["student_name"] = student.get("student_name")
		row["student_number"] = student.get("student_number")
	offerings = frappe.get_all("Course Offering", fields=["name", "course", "programme_curriculum", "grading_scheme",
		"academic_semester", "student_cohort", "offering_type", "capacity", "status"], order_by="academic_semester desc")
	course_map = {row.name: row for row in courses}
	for row in offerings:
		course = course_map.get(row.course) or {}
		row["course_code"] = course.get("course_code")
		row["course_name"] = course.get("course_name")
	course_registrations = frappe.get_all("Course Registration", filters={"docstatus": ["<", 2]}, fields=["name",
		"student", "student_cohort", "student_programme_enrolment", "semester_registration", "course_offering",
		"attempt_number", "registration_type", "status", "docstatus"], order_by="modified desc")
	results = frappe.get_all("Student Course Result", filters={"docstatus": ["<", 2]}, fields=["name", "student",
		"course_registration", "academic_semester", "course", "credit_units", "coursework_mark", "examination_mark",
		"final_mark", "grade", "grade_point", "result_status", "is_approved", "is_published", "approved_by",
		"approved_on", "docstatus"], order_by="academic_semester desc")
	for row in results:
		student, course = student_map.get(row.student) or {}, course_map.get(row.course) or {}
		row.update({"student_name": student.get("student_name"), "student_number": student.get("student_number"),
			"course_code": course.get("course_code"), "course_name": course.get("course_name")})
	batches = frappe.get_all("Result Approval Batch", filters={"docstatus": ["<", 2]}, fields=["name", "course_offering",
		"academic_semester", "approval_stage", "status", "submitted_by", "approved_by", "docstatus"], order_by="modified desc")
	for batch in batches:
		doc = frappe.get_doc("Result Approval Batch", batch.name)
		batch["items"] = [row.as_dict() for row in (doc.get("items") or [])]
	reviews = frappe.get_all("Result Review Request", fields=["name", "student", "student_course_result", "request_type",
		"reason", "status", "decision", "reviewed_by"], order_by="modified desc")
	transcripts = frappe.get_all("Academic Transcript", filters={"docstatus": ["<", 2]}, fields=["name", "student",
		"academic_programme", "transcript_type", "status", "source_result_version", "source_result_checksum",
		"faculty_head_user", "faculty_head_approved_on", "registrar_user", "registrar_issued_on", "verification_number",
		"generated_pdf", "revocation_reason", "docstatus"], order_by="modified desc")
	for row in transcripts:
		student = student_map.get(row.student) or {}
		row["student_name"] = student.get("student_name")
		row["student_number"] = student.get("student_number")
	clearance = frappe.get_all("Student Clearance", filters={"docstatus": ["<", 2]}, fields=["name", "student",
		"clearance_type", "academic_semester", "status", "financial_status", "academic_status", "cleared_by",
		"cleared_on", "docstatus"], order_by="modified desc")
	for row in clearance:
		student = student_map.get(row.student) or {}
		row["student_name"] = student.get("student_name")
		row["student_number"] = student.get("student_number")
	return {"registrar": registrar, "applications": applications, "students": students, "units": units,
		"programmes": programmes, "courses": courses, "curricula": curricula, "academic_years": years,
		"semesters": semesters, "cohorts": cohorts, "enrolments": enrolments,
		"semester_registrations": semester_registrations, "course_offerings": offerings,
		"course_registrations": course_registrations, "results": results, "approval_batches": batches,
		"review_requests": reviews, "transcripts": transcripts, "clearance": clearance}


@frappe.whitelist()
def review_registrar_application(application_name, decision, comments=None):
	_assert_registrar()
	application = frappe.get_doc("University Application", application_name)
	if decision not in {"Under Review", "Accepted", "Rejected"}:
		frappe.throw("Select Under Review, Accepted or Rejected.")
	if application.status in {"Withdrawn", "Accepted"} and decision != application.status:
		frappe.throw("This application can no longer move to the selected status.")
	application.status = decision
	application.reviewed_by = frappe.session.user
	application.review_comments = comments
	application.save(ignore_permissions=True)
	if decision == "Accepted" and not application.student:
		return admit_application(application.name)
	return {"application": application.name, "student": application.student}


@frappe.whitelist()
def review_semester_registration(registration_name, decision):
	_assert_registrar()
	if decision not in {"Registered", "Cancelled"}:
		frappe.throw("Decision must be Registered or Cancelled.")
	doc = frappe.get_doc("Semester Registration", registration_name)
	if doc.status not in {"Draft", "Pending Approval", "Registered"}:
		frappe.throw("This semester registration can no longer be reviewed.")
	doc.status = decision
	doc.registration_date = doc.registration_date or frappe.utils.today()
	doc.save(ignore_permissions=True)
	return doc.name


@frappe.whitelist()
def publish_registrar_result_batch(batch_name):
	_assert_registrar()
	batch = frappe.get_doc("Result Approval Batch", batch_name)
	if batch.status != "Approved" or batch.approval_stage != "Faculty Head":
		frappe.throw("Only Faculty Head approved result batches may be published.")
	for item in batch.items:
		result = frappe.get_doc("Student Course Result", item.student_course_result)
		if not result.is_approved:
			frappe.throw(f"Result {result.name} has not been approved by the Faculty Head.")
		frappe.db.set_value("Student Course Result", result.name, {
			"is_published": 1, "approved_by": frappe.session.user, "approved_on": frappe.utils.now(),
		})
	batch.approval_stage = "Registrar"
	batch.approved_by = frappe.session.user
	batch.save(ignore_permissions=True)
	return batch.name


@frappe.whitelist()
def issue_registrar_transcript(transcript_name):
	_assert_registrar()
	transcript = frappe.get_doc("Academic Transcript", transcript_name)
	if transcript.status != "Faculty Head Approved":
		frappe.throw("Only Faculty Head approved transcripts may be issued.")
	if not transcript.source_result_checksum:
		frappe.throw("The transcript has no certified result checksum.")
	verification = "AWU-" + hashlib.sha256(
		f"{transcript.name}:{transcript.source_result_checksum}".encode()
	).hexdigest()[:16].upper()
	if not transcript.generated_pdf:
		from frappe.utils.file_manager import save_file
		pdf = frappe.get_print("Academic Transcript", transcript.name, as_pdf=True)
		file_doc = save_file(f"{transcript.name}.pdf", pdf, "Academic Transcript", transcript.name, is_private=1)
		transcript.generated_pdf = file_doc.file_url
	transcript.verification_number = verification
	transcript.registrar_user = frappe.session.user
	transcript.registrar_issued_on = frappe.utils.now()
	transcript.status = "Registrar Issued"
	transcript.save(ignore_permissions=True)
	return {"name": transcript.name, "verification_number": verification, "generated_pdf": transcript.generated_pdf}


@frappe.whitelist()
def revoke_registrar_transcript(transcript_name, reason):
	_assert_registrar()
	if not (reason or "").strip():
		frappe.throw("A revocation reason is required.")
	transcript = frappe.get_doc("Academic Transcript", transcript_name)
	if transcript.status != "Registrar Issued":
		frappe.throw("Only an issued transcript may be revoked.")
	transcript.status = "Revoked"
	transcript.revocation_reason = reason
	transcript.save(ignore_permissions=True)
	return transcript.name


@frappe.whitelist()
def review_registrar_clearance(clearance_name):
	_assert_registrar()
	status = refresh_student_clearance(clearance_name)
	clearance = frappe.get_doc("Student Clearance", clearance_name)
	if clearance.financial_status == "Cleared" and clearance.academic_status == "Cleared":
		clearance.status = "Cleared"
		clearance.cleared_by = frappe.session.user
		clearance.cleared_on = frappe.utils.now()
		clearance.save(ignore_permissions=True)
	return {"name": clearance.name, "status": clearance.status, "outstanding_amount": status.get("outstanding_amount")}


def _assert_finance_officer():
	if frappe.session.user == "Guest":
		frappe.throw("Please sign in to access the finance portal.", frappe.PermissionError)
	roles = set(frappe.get_roles())
	if frappe.session.user != "Administrator" and not roles.intersection({"Accounts User", "Accounts Manager"}):
		frappe.throw("Only authorised finance staff may access this workspace.", frappe.PermissionError)
	return frappe.db.get_value(
		"User", frappe.session.user, ["name", "full_name", "email", "enabled"], as_dict=True,
	) or {"name": frappe.session.user, "full_name": frappe.session.user}


@frappe.whitelist()
def get_finance_portal_data():
	"""Return finance-owned billing, collection, sponsorship and clearance records."""
	officer = _assert_finance_officer()
	students = frappe.get_all(
		"Student",
		fields=["name", "student_name", "student_number", "student_email_id", "customer", "status"],
		order_by="student_name asc",
	)
	student_map = {row.name: row for row in students}
	enrolments = frappe.get_all(
		"Student Programme Enrolment", filters={"docstatus": ["<", 2]},
		fields=["name", "student", "academic_programme", "academic_year", "student_cohort", "status", "docstatus"],
		order_by="modified desc",
	)
	programme_by_student = {}
	for row in enrolments:
		programme_by_student.setdefault(row.student, row.academic_programme)
	for row in students:
		row["academic_programme"] = programme_by_student.get(row.name)

	structures = frappe.get_all(
		"University Fee Structure", filters={"docstatus": ["<", 2]},
		fields=["name", "structure_name", "academic_programme", "academic_year", "academic_semester",
			"currency", "effective_from", "effective_to", "status", "docstatus"],
		order_by="effective_from desc",
	)
	for row in structures:
		doc = frappe.get_doc("University Fee Structure", row.name)
		row["fee_lines"] = [line.as_dict() for line in (doc.get("fee_lines") or [])]
		row["total_amount"] = sum((line.quantity or 0) * (line.rate or 0) for line in (doc.get("fee_lines") or []))

	invoice_fields = ["name", "customer", "posting_date", "due_date", "grand_total", "outstanding_amount",
		"status", "docstatus", "currency"]
	invoice_meta = frappe.get_meta("Sales Invoice")
	for fieldname in ("student", "academic_semester", "university_fee_structure"):
		if invoice_meta.has_field(fieldname):
			invoice_fields.append(fieldname)
	invoices = frappe.get_all(
		"Sales Invoice", filters={"docstatus": ["<", 2]}, fields=invoice_fields,
		order_by="posting_date desc, creation desc", limit_page_length=5000,
	)
	for row in invoices:
		student = student_map.get(row.get("student"))
		if not student and row.customer:
			student = next((item for item in students if item.customer == row.customer), None)
		row["student"] = student.get("name") if student else row.get("student")
		row["student_name"] = student.get("student_name") if student else row.customer
		row["student_number"] = student.get("student_number") if student else None

	payments = get_payment_register_data()
	sponsorships = frappe.get_all(
		"Sponsorship Award", filters={"docstatus": ["<", 2]},
		fields=["name", "student", "sponsor", "academic_programme", "academic_year", "coverage_type",
			"coverage_percentage", "coverage_amount", "status", "approval_reference", "docstatus"],
		order_by="modified desc",
	)
	for row in sponsorships:
		student = student_map.get(row.student) or {}
		row["student_name"] = student.get("student_name")
		row["student_number"] = student.get("student_number")
	clearance = frappe.get_all(
		"Student Clearance", filters={"docstatus": ["<", 2]},
		fields=["name", "student", "clearance_type", "academic_semester", "status", "financial_status",
			"academic_status", "cleared_by", "cleared_on", "docstatus"], order_by="modified desc",
	)
	for row in clearance:
		student = student_map.get(row.student) or {}
		row["student_name"] = student.get("student_name")
		row["student_number"] = student.get("student_number")
	semesters = frappe.get_all(
		"Academic Semester", fields=["name", "semester_name", "academic_year", "start_date", "end_date", "status"],
		order_by="start_date desc",
	)
	settings = frappe.get_single("University Education Settings")
	return {
		"officer": officer, "students": students, "enrolments": enrolments, "fee_structures": structures,
		"invoices": invoices, "payments": payments, "sponsorships": sponsorships, "clearance": clearance,
		"semesters": semesters,
		"university": {"name": settings.get("university_name") or "Ankole Western University",
			"currency": settings.get("default_currency") or "UGX"},
	}


@frappe.whitelist()
def create_finance_invoice(student, university_fee_structure):
	"""Create one reviewable draft invoice from an active submitted fee structure."""
	_assert_finance_officer()
	student_doc = frappe.get_doc("Student", student)
	if not student_doc.customer:
		frappe.throw("The student is not linked to a billing customer account.")
	fee_structure = frappe.get_doc("University Fee Structure", university_fee_structure)
	if fee_structure.docstatus != 1 or fee_structure.status != "Active":
		frappe.throw("Only an active submitted fee structure can be used for billing.")
	if fee_structure.academic_programme:
		programme = frappe.db.get_value(
			"Student Programme Enrolment", {"student": student, "status": "Active"}, "academic_programme",
		)
		if programme and programme != fee_structure.academic_programme:
			frappe.throw("The selected fee structure does not match the student's active programme.")
	duplicate_filters = {"student": student, "university_fee_structure": university_fee_structure, "docstatus": ["<", 2]}
	if frappe.db.exists("Sales Invoice", duplicate_filters):
		frappe.throw("This student already has an invoice for the selected fee structure.")
	values = {
		"doctype": "Sales Invoice", "customer": student_doc.customer, "student": student,
		"university_fee_structure": university_fee_structure, "posting_date": frappe.utils.today(),
		"due_date": fee_structure.effective_to or frappe.utils.add_days(frappe.utils.today(), 30),
		"items": build_invoice_items(fee_structure.as_dict()),
	}
	if frappe.get_meta("Sales Invoice").has_field("academic_semester"):
		values["academic_semester"] = fee_structure.academic_semester
	invoice = frappe.get_doc(values)
	invoice.flags.ignore_permissions = True
	invoice.insert()
	return invoice.name


@frappe.whitelist()
def submit_finance_invoice(invoice_name):
	_assert_finance_officer()
	invoice = frappe.get_doc("Sales Invoice", invoice_name)
	if invoice.docstatus != 0 or not invoice.get("student"):
		frappe.throw("Only a draft student fee invoice may be submitted here.")
	invoice.flags.ignore_permissions = True
	invoice.submit()
	return invoice.name


@frappe.whitelist()
def review_financial_clearance(clearance_name):
	_assert_finance_officer()
	clearance = frappe.get_doc("Student Clearance", clearance_name)
	student = frappe.get_doc("Student", clearance.student)
	outstanding = frappe.db.sql(
		"""select coalesce(sum(outstanding_amount), 0) from `tabSales Invoice`
		where customer=%s and docstatus=1""", student.customer,
	)[0][0] or 0
	clearance.financial_status = "Outstanding" if outstanding else "Cleared"
	clearance.status = determine_clearance(clearance.financial_status, clearance.academic_status)
	if clearance.status == "Cleared":
		clearance.cleared_by = frappe.session.user
		clearance.cleared_on = frappe.utils.now()
	clearance.save(ignore_permissions=True)
	return {"name": clearance.name, "financial_status": clearance.financial_status,
		"status": clearance.status, "outstanding_amount": outstanding}


@frappe.whitelist()
def review_sponsorship_award(award_name, decision, approval_reference=None):
	_assert_finance_officer()
	if decision not in {"Approved", "Active", "Cancelled"}:
		frappe.throw("Decision must be Approved, Active or Cancelled.")
	award = frappe.get_doc("Sponsorship Award", award_name)
	if award.status in {"Exhausted", "Cancelled"} and decision != award.status:
		frappe.throw("This sponsorship award can no longer move to the selected status.")
	if decision in {"Approved", "Active"} and not (approval_reference or award.approval_reference):
		frappe.throw("An approval reference is required.")
	award.status = decision
	award.approval_reference = approval_reference or award.approval_reference
	award.save(ignore_permissions=True)
	return award.name


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
