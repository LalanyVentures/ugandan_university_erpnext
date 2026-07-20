import frappe
from frappe.model.document import Document


class UniversityApplication(Document):
    def validate(self):
        if self.status == "Accepted" and not self.student:
            self.application_date = self.application_date or frappe.utils.today()
