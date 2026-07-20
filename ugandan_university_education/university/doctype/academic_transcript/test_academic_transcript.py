from unittest.mock import patch

import pytest

from ugandan_university_education.university.doctype.academic_transcript.academic_transcript import AcademicTranscript


def test_transcript_requires_faculty_head_approval_before_submit():
	doc = AcademicTranscript({"student": "STU-0001", "transcript_type": "Provisional", "status": "Draft"})
	with patch("frappe.throw", side_effect=ValueError):
		with pytest.raises(ValueError, match="Faculty Head Approved"):
			doc.before_submit()


def test_official_transcript_requires_registrar_issuance():
	doc = AcademicTranscript({"student": "STU-0001", "transcript_type": "Official", "status": "Draft"})
	doc.validate()
