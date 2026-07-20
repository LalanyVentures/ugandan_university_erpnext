import frappe
from frappe.model.document import Document


class CourseRegistration(Document):
    def validate(self):
        if not self.attempt_number or self.attempt_number < 1:
            frappe.throw("Attempt Number must be at least 1")
