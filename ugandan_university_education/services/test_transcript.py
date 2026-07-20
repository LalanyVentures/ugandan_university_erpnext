"""Tests for the framework-independent transcript service."""

from ugandan_university_education.services.transcript import build_transcript_data, can_view_transcript


def test_transcript_excludes_unapproved_results_and_calculates_gpa() -> None:
	rows = [
		{
			"semester_name": "Semester 1, 2026/2027",
			"semester_start_date": "2026-08-01",
			"course_code": "CSC1101",
			"course_name": "Introduction to Programming",
			"credit_units": 4,
			"mark_percent": 78,
			"grade": "B+",
			"grade_point": 4,
			"is_published": True,
			"is_approved": True,
		},
		{
			"semester_name": "Semester 1, 2026/2027",
			"semester_start_date": "2026-08-01",
			"course_code": "CSC1102",
			"course_name": "Draft Result",
			"credit_units": 3,
			"mark_percent": 75,
			"grade": "B",
			"grade_point": 3,
			"is_published": False,
			"is_approved": False,
		},
	]

	transcript = build_transcript_data({"student_number": "2026/BSCS/001"}, rows)

	assert len(transcript["semesters"]) == 1
	assert len(transcript["semesters"][0]["courses"]) == 1
	assert transcript["final_cgpa"] == 4
	assert transcript["total_credits_earned"] == 4


def test_transcript_view_requires_faculty_head_approval() -> None:
	assert can_view_transcript("Draft") is False
	assert can_view_transcript("Faculty Head Review") is False
	assert can_view_transcript("Faculty Head Approved") is True
	assert can_view_transcript("Registrar Issued") is True
