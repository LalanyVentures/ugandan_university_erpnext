import frappe
from frappe.model.document import Document


class StudentProgrammeEnrolment(Document):
    def validate(self):
        if not self.programme_curriculum:
            frappe.throw("Programme Curriculum is required for programme enrolment")
