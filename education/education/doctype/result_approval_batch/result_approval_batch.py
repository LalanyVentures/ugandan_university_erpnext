import frappe
from frappe.model.document import Document


class ResultApprovalBatch(Document):
    def validate(self):
        if not self.items:
            frappe.throw("Result Approval Batch must contain at least one result")
