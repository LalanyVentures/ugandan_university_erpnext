"""Controlled academic transcript record."""

from __future__ import annotations

import frappe
from frappe.model.document import Document

from education.education.services.transcript import VIEWABLE_TRANSCRIPT_STATUSES


class AcademicTranscript(Document):
	"""Stores transcript approval/issuance metadata, not duplicated course rows."""

	def validate(self):
		self._validate_status_requirements()

	def before_submit(self):
		if self.status not in VIEWABLE_TRANSCRIPT_STATUSES:
			frappe.throw("A transcript must be Faculty Head Approved before it can be submitted.")

	def _validate_status_requirements(self):
		if self.status in VIEWABLE_TRANSCRIPT_STATUSES:
			if not self.faculty_head_user or not self.faculty_head_approved_on:
				frappe.throw("Faculty Head approval details are required before a transcript can be viewed.")
			if not self.source_result_version or not self.source_result_checksum:
				frappe.throw("The approved result version and checksum are required.")

		if self.status == "Registrar Issued":
			if not self.registrar_user or not self.registrar_issued_on:
				frappe.throw("Registrar issuance details are required for an official transcript.")
			if not self.generated_pdf or not self.verification_number:
				frappe.throw("A generated PDF and verification number are required before issuance.")

		if self.status == "Revoked" and not self.revocation_reason:
			frappe.throw("A revocation reason is required.")

	@staticmethod
	def can_view(status: str | None, transcript_type: str | None = None) -> bool:
		"""Keep API/portal checks aligned with the shared transcript rule."""

		if transcript_type == "Official":
			return status == "Registrar Issued"
		return status in VIEWABLE_TRANSCRIPT_STATUSES
