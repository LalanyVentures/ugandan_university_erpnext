import frappe
from frappe.model.document import Document


class StudentCourseResult(Document):
    def validate(self):
        if self.final_mark is not None and (self.final_mark < 0 or self.final_mark > 100):
            frappe.throw("Final mark must be between 0 and 100")
        if self.is_published and not self.is_approved:
            frappe.throw("A result must be approved before it can be published")
