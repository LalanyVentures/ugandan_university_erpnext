import frappe


def execute():
	"""Restore the University fee-line child table after the Education schema move."""
	frappe.reload_doc("university", "doctype", "fee_structure_line")

	if not frappe.db.exists("DocType", "Fee Structure Line"):
		return

	doc = frappe.get_doc("DocType", "Fee Structure Line")
	changed = False

	if doc.module != "University":
		doc.module = "University"
		changed = True
	if not doc.istable:
		doc.istable = 1
		changed = True

	if changed:
		doc.save(ignore_permissions=True)

	frappe.clear_cache(doctype="Fee Structure Line")
