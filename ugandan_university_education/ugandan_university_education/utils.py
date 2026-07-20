def get_university_settings():
    """Return the singleton settings used by university services."""
    import frappe
    return frappe.get_single("University Education Settings")
