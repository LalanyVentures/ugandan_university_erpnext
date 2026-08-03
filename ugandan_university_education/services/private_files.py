"""Private, document-bound file APIs for the University portal.

Files are always created as Frappe ``File`` records with ``is_private=1``.
The storage implementation may later be changed to an S3-compatible adapter
without changing this API or exposing storage credentials to browsers.
"""

from __future__ import annotations

import os
from urllib.parse import quote

import frappe
from frappe.utils.file_manager import get_file, save_file


MAX_PHOTO_BYTES = 5 * 1024 * 1024
MAX_DOCUMENT_BYTES = 20 * 1024 * 1024
PHOTO_FIELDS = {
	"Student": {"student_photo"},
	"University Member": {"profile_photo"},
}
DOCUMENT_TARGETS = {"Student", "University Application", "University Member", "Student Clearance"}
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
DOCUMENT_EXTENSIONS = IMAGE_EXTENSIONS | {".pdf"}


def _roles() -> set[str]:
	return set(frappe.get_roles(frappe.session.user))


def _require_authenticated_user():
	if frappe.session.user == "Guest":
		frappe.throw("Sign in before managing private files.", frappe.PermissionError)


def _is_own_student(doc) -> bool:
	return "Student" in _roles() and doc.doctype == "Student" and doc.get("student_email_id") == frappe.session.user


def _target(doctype: str, name: str, fieldname: str | None, write: bool = False):
	_require_authenticated_user()
	if doctype not in DOCUMENT_TARGETS:
		frappe.throw("This record type does not accept portal attachments.", frappe.PermissionError)
	doc = frappe.get_doc(doctype, name)
	if write and _is_own_student(doc) and fieldname == "student_photo":
		return doc
	doc.check_permission("write" if write else "read")
	return doc


def _validate_upload(file_storage, doctype: str, fieldname: str | None):
	if not file_storage or not file_storage.filename:
		frappe.throw("Choose a file to upload.")
	filename = os.path.basename(file_storage.filename)
	extension = os.path.splitext(filename.lower())[1]
	is_photo = fieldname in PHOTO_FIELDS.get(doctype, set())
	if extension not in (IMAGE_EXTENSIONS if is_photo else DOCUMENT_EXTENSIONS):
		frappe.throw("Photos must be JPG, PNG, or WebP. Documents may also be PDF.")
	content = file_storage.stream.read((MAX_PHOTO_BYTES if is_photo else MAX_DOCUMENT_BYTES) + 1)
	if not content:
		frappe.throw("The uploaded file is empty.")
	if len(content) > (MAX_PHOTO_BYTES if is_photo else MAX_DOCUMENT_BYTES):
		frappe.throw("The uploaded file exceeds the allowed size.")
	if extension in {".jpg", ".jpeg"} and not content.startswith(b"\xff\xd8\xff"):
		frappe.throw("The file content is not a valid JPEG image.")
	if extension == ".png" and not content.startswith(b"\x89PNG\r\n\x1a\n"):
		frappe.throw("The file content is not a valid PNG image.")
	if extension == ".webp" and not (content.startswith(b"RIFF") and content[8:12] == b"WEBP"):
		frappe.throw("The file content is not a valid WebP image.")
	if extension == ".pdf" and not content.startswith(b"%PDF-"):
		frappe.throw("The file content is not a valid PDF document.")
	return filename, content


def _file_payload(file_doc):
	return {
		"name": file_doc.name,
		"file_name": file_doc.file_name,
		"file_size": file_doc.file_size,
		"attached_to_doctype": file_doc.attached_to_doctype,
		"attached_to_name": file_doc.attached_to_name,
		"attached_to_field": file_doc.attached_to_field,
		"download_endpoint": "/api/method/ugandan_university_education.services.private_files.download_private_attachment?file_name=" + quote(file_doc.name, safe=""),
	}


@frappe.whitelist()
def upload_private_attachment(doctype: str, name: str, fieldname: str | None = None):
	"""Upload a private attachment for an authorised University record."""
	fieldname = (fieldname or "").strip() or None
	doc = _target(doctype, name, fieldname, write=True)
	if fieldname and not doc.meta.has_field(fieldname):
		frappe.throw("This attachment field is not available on the selected record.")
	file_storage = frappe.request.files.get("file")
	filename, content = _validate_upload(file_storage, doctype, fieldname)
	file_doc = save_file(filename, content, doctype, name, is_private=1, df=fieldname)
	if fieldname:
		doc.db_set(fieldname, file_doc.file_url, update_modified=False)
	return _file_payload(file_doc)


@frappe.whitelist()
def list_private_attachments(doctype: str, name: str, fieldname: str | None = None):
	_target(doctype, name, fieldname)
	filters = {"attached_to_doctype": doctype, "attached_to_name": name, "is_private": 1}
	if fieldname:
		filters["attached_to_field"] = fieldname
	rows = frappe.get_all("File", filters=filters, fields=["name", "file_name", "file_size", "attached_to_doctype", "attached_to_name", "attached_to_field"], order_by="creation desc", limit_page_length=100)
	return [_file_payload(frappe._dict(row)) for row in rows]


@frappe.whitelist()
def delete_private_attachment(file_name: str):
	file_doc = frappe.get_doc("File", file_name)
	if not file_doc.is_private or not file_doc.attached_to_doctype or not file_doc.attached_to_name:
		frappe.throw("This private attachment cannot be managed through the portal.", frappe.PermissionError)
	_target(file_doc.attached_to_doctype, file_doc.attached_to_name, file_doc.attached_to_field, write=True)
	frappe.delete_doc("File", file_name, ignore_permissions=True)
	return {"ok": True}


@frappe.whitelist()
def download_private_attachment(file_name: str):
	"""Stream a private file only after checking its parent-document permission."""
	file_doc = frappe.get_doc("File", file_name)
	if not file_doc.is_private or not file_doc.attached_to_doctype or not file_doc.attached_to_name:
		frappe.throw("This file is not available through the private download endpoint.", frappe.PermissionError)
	_target(file_doc.attached_to_doctype, file_doc.attached_to_name, file_doc.attached_to_field)
	filename, content = get_file(file_name)
	frappe.local.response.filename = filename
	frappe.local.response.filecontent = content
	frappe.local.response.type = "download"
