import frappe
from frappe.model.document import Document


class StudentClearance(Document):
    def validate(self):
        if self.status == "Cleared" and (self.financial_status != "Cleared" or self.academic_status != "Cleared"):
            frappe.throw("Financial and academic clearance must both be cleared first")
