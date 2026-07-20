import frappe
from frappe.model.document import Document


class Student(Document):
    def validate(self):
        self.student_name = " ".join(
            filter(None, [self.first_name, self.middle_name, self.last_name])
        )

    def on_update(self):
        if not self.customer and self.student_name:
            customer = frappe.get_doc({
                "doctype": "Customer",
                "customer_name": self.student_name,
                "customer_type": "Individual",
            }).insert(ignore_permissions=True)
            self.db_set("customer", customer.name)

    def get_programme_enrolments(self):
        return frappe.get_all(
            "Student Programme Enrolment",
            filters={"student": self.name},
            fields=["name", "academic_programme", "programme_curriculum", "status"],
        )

    def get_course_registrations(self, semester_registration=None):
        filters = {"student": self.name}
        if semester_registration:
            filters["semester_registration"] = semester_registration
        return frappe.get_all("Course Registration", filters=filters)


def get_timeline_data(doctype, name):
    return dict(
        frappe.db.sql(
            """select unix_timestamp(`date`), count(*)
            from `tabStudent Attendance`
            where student=%s and docstatus=1 and status='Present'
            group by date""",
            name,
        )
    )
