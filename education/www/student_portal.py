import frappe


def get_context(context):
    context.no_cache = 1
    context.student = frappe.db.get_value(
        "Student", {"student_email_id": frappe.session.user},
        ["name", "student_name"], as_dict=True,
    )
    return context
