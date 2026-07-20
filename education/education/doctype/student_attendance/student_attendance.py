import frappe
from frappe.model.document import Document
from frappe.utils import getdate


class StudentAttendance(Document):
    def validate(self):
        if self.attendance_date and getdate(self.attendance_date) > getdate():
            frappe.throw("Attendance cannot be marked for a future date.")
        self.validate_registration()

    def validate_registration(self):
        if not self.course_registration:
            frappe.throw("Course Registration is required.")
        registered_student = frappe.db.get_value(
            "Course Registration", self.course_registration, "student"
        )
        if registered_student != self.student:
            frappe.throw("The attendance student must match the Course Registration student.")
