import frappe


@frappe.whitelist()
def get_student_invoices(student=None):
    student = student or frappe.db.get_value("Student", {"student_email_id": frappe.session.user})
    if not student:
        return []
    return frappe.get_all(
        "Sales Invoice",
        filters={"student": student, "docstatus": ["<", 2]},
        fields=["name", "posting_date", "grand_total", "outstanding_amount", "status"],
    )
