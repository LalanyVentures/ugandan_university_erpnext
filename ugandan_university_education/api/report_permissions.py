"""Server-side visibility rules for University marks and transcripts."""

import frappe


DIRECT_RESULT_ROLES = {"System Manager", "Education Manager", "Academics User", "Faculty Head", "Registrar"}


def _student_name(user):
	return frappe.db.get_value("Student", {"student_email_id": user}, "name")


def _lecturer_offering_sql(user):
	member = frappe.db.get_value("University Member", {"user": user, "member_type": "Lecturer", "status": "Active"}, "name")
	if not member:
		return None
	return "SELECT parent FROM `tabCourse Offering Lecturer` WHERE lecturer = {0} AND parenttype = 'Course Offering'".format(frappe.db.escape(member))


def student_course_result_query(user=None):
	user = user or frappe.session.user
	roles = set(frappe.get_roles(user))
	if user == "Administrator" or roles.intersection(DIRECT_RESULT_ROLES):
		return ""
	if "Instructor" in roles:
		offerings = _lecturer_offering_sql(user)
		return "`tabStudent Course Result`.`course_registration` IN (SELECT name FROM `tabCourse Registration` WHERE course_offering IN ({0}))".format(offerings) if offerings else "1=0"
	if "Student" in roles:
		student = _student_name(user)
		if student:
			return "`tabStudent Course Result`.`student` = {0} AND `tabStudent Course Result`.`is_approved` = 1 AND `tabStudent Course Result`.`is_published` = 1".format(frappe.db.escape(student))
	return "1=0"


def academic_transcript_query(user=None):
	user = user or frappe.session.user
	roles = set(frappe.get_roles(user))
	if user == "Administrator" or roles.intersection(DIRECT_RESULT_ROLES):
		return ""
	if "Student" not in roles or not (student := _student_name(user)):
		return "1=0"
	return "`tabAcademic Transcript`.`student` = {0} AND ((`tabAcademic Transcript`.`transcript_type` = 'Official' AND `tabAcademic Transcript`.`status` = 'Registrar Issued') OR (`tabAcademic Transcript`.`transcript_type` != 'Official' AND `tabAcademic Transcript`.`status` IN ('Faculty Head Approved', 'Registrar Issued')))".format(frappe.db.escape(student))


def can_access_student_course_result(doc, user=None, permission_type=None):
	user = user or frappe.session.user
	roles = set(frappe.get_roles(user))
	if user == "Administrator" or roles.intersection(DIRECT_RESULT_ROLES):
		return None
	if "Instructor" in roles:
		offerings = _lecturer_offering_sql(user)
		return bool(offerings and frappe.db.sql("SELECT 1 FROM `tabCourse Registration` WHERE name = %s AND course_offering IN ({0}) LIMIT 1".format(offerings), (doc.course_registration,)))
	if "Student" in roles:
		return permission_type in {None, "read", "print"} and doc.student == _student_name(user) and bool(doc.is_approved) and bool(doc.is_published)
	return False


def can_access_academic_transcript(doc, user=None, permission_type=None):
	user = user or frappe.session.user
	roles = set(frappe.get_roles(user))
	if user == "Administrator" or roles.intersection(DIRECT_RESULT_ROLES):
		return None
	if "Student" not in roles or permission_type not in {None, "read", "print"} or doc.student != _student_name(user):
		return False
	return doc.status == "Registrar Issued" if doc.transcript_type == "Official" else doc.status in {"Faculty Head Approved", "Registrar Issued"}
