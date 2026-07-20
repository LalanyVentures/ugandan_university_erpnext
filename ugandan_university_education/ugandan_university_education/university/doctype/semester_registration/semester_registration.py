import frappe
from frappe.model.document import Document


class SemesterRegistration(Document):
    def validate(self):
        if self.status in ("Registered", "Pending Approval") and not self.registration_date:
            self.registration_date = frappe.utils.today()
