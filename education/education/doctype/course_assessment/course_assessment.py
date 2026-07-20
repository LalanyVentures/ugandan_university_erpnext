import frappe
from frappe.model.document import Document


class CourseAssessment(Document):
    def validate(self):
        if self.weight is not None and (self.weight < 0 or self.weight > 100):
            frappe.throw("Assessment weight must be between 0 and 100 percent")
