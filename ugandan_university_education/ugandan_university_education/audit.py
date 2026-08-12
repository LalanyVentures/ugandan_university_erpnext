"""Semantic audit envelope helpers consumed by the trusted JDD proxy."""

import frappe


AUDIT_CATEGORIES = {
	"admission", "registration", "attendance", "academic-result", "report", "transcript",
	"finance", "clearance", "workflow", "data", "attachment", "search", "record", "security",
}


def record_jdd_audit_event(event_type, category, action, resource_type="", resource_id="", resource_label="", metadata=None):
	"""Attach redacted business semantics; JDD supplies tenant, actor, session and network context."""
	category = category if category in AUDIT_CATEGORIES else "record"
	event = {
		"eventType": str(event_type)[:120], "category": category, "action": str(action)[:80],
		"resourceType": str(resource_type or "")[:180], "resourceId": str(resource_id or "")[:240],
		"resourceLabel": str(resource_label or "")[:240], "metadata": metadata or {},
	}
	response = getattr(frappe.local, "response", None)
	if response is not None:
		response.setdefault("_jdd_audit_events", []).append(event)
	return event
