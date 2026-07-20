"""Transcript data preparation and visibility rules.

This module deliberately has no database or HTTP dependency. Frappe DocType
controllers, whitelisted APIs and Print Formats should all call the same
functions so that the portal, Desk viewer and generated PDF use identical
approved-result data and GPA/CGPA calculations.
"""

from __future__ import annotations

from collections import OrderedDict
from collections.abc import Iterable, Mapping
from decimal import Decimal, InvalidOperation
from typing import Any


VIEWABLE_TRANSCRIPT_STATUSES = frozenset({"Faculty Head Approved", "Registrar Issued"})


def can_view_transcript(status: str | None, transcript_type: str | None = None) -> bool:
	"""Return whether a transcript has passed its approval/view gate."""

	if transcript_type == "Official":
		return status == "Registrar Issued"
	return status in VIEWABLE_TRANSCRIPT_STATUSES


def _decimal(value: Any, default: Decimal = Decimal("0")) -> Decimal:
	"""Convert numeric input safely for exact GPA calculations."""

	if value in (None, ""):
		return default
	try:
		return Decimal(str(value))
	except (InvalidOperation, TypeError, ValueError):
		return default


def _is_approved_result(row: Mapping[str, Any]) -> bool:
	"""Require both publication and approval before a row enters a transcript."""

	return bool(row.get("is_published")) and bool(row.get("is_approved"))


def _display_decimal(value: Decimal, places: int = 2) -> int | float | str:
	"""Return JSON/template-safe numeric output without losing GPA precision."""

	quantized = value.quantize(Decimal("1") if places == 0 else Decimal("1." + ("0" * places)))
	if quantized == quantized.to_integral_value():
		return int(quantized)
	return float(quantized)


def build_transcript_data(
	student: Mapping[str, Any],
	result_rows: Iterable[Mapping[str, Any]],
) -> dict[str, Any]:
	"""Build the canonical semester-grouped transcript payload.

	``result_rows`` must already be selected for one student. Each row must
	contain course and semester data plus ``is_published`` and ``is_approved``.
	Rows that have not passed both gates are excluded deliberately. GPA policy
	decisions such as whether a retake replaces an earlier attempt must be
	resolved before calling this function by setting ``include_in_gpa``.
	"""

	semesters: OrderedDict[str, dict[str, Any]] = OrderedDict()
	approved_rows = [row for row in result_rows if _is_approved_result(row)]
	approved_rows.sort(
		key=lambda row: (
			str(row.get("semester_start_date") or ""),
			str(row.get("semester_name") or ""),
			str(row.get("course_code") or ""),
		)
	)

	total_quality_points = Decimal("0")
	total_gpa_credits = Decimal("0")
	total_earned_credits = Decimal("0")

	for row in approved_rows:
		semester_key = str(row.get("semester_name") or row.get("semester") or "Unknown Semester")
		semester = semesters.setdefault(
			semester_key,
			{
				"semester_name": semester_key,
				"courses": [],
				"quality_points": Decimal("0"),
				"gpa_credits": Decimal("0"),
				"earned_credits": Decimal("0"),
			},
		)

		credits = _decimal(row.get("credit_units", row.get("credits")))
		grade_point = _decimal(row.get("grade_point"))
		include_in_gpa = row.get("include_in_gpa", True) is not False
		result_status = str(row.get("result_status") or "Passed")

		semester["courses"].append(
			{
				"course_code": row.get("course_code"),
				"course_name": row.get("course_name", row.get("module_name")),
				"mark_percent": row.get("mark_percent", row.get("final_mark")),
				"credit_units": _display_decimal(credits, 0),
				"grade": row.get("grade"),
				"grade_point": _display_decimal(grade_point),
				"include_in_gpa": include_in_gpa,
				"attempt_type": row.get("attempt_type", "Normal"),
				"result_status": result_status,
			}
		)

		if result_status not in {"Withdrawn", "Incomplete"}:
			semester["earned_credits"] += credits
		if include_in_gpa:
			quality_points = grade_point * credits
			semester["quality_points"] += quality_points
			semester["gpa_credits"] += credits
			total_quality_points += quality_points
			total_gpa_credits += credits
		total_earned_credits += credits if result_status not in {"Withdrawn", "Incomplete"} else Decimal("0")

	for semester in semesters.values():
		gpa_credits = semester.pop("gpa_credits")
		quality_points = semester.pop("quality_points")
		semester["semester_gpa"] = _display_decimal(quality_points / gpa_credits) if gpa_credits else None

	cumulative_quality_points = Decimal("0")
	cumulative_credits = Decimal("0")
	for semester in semesters.values():
		for course in semester["courses"]:
			if (
				course["include_in_gpa"]
				and course["result_status"] not in {"Withdrawn", "Incomplete"}
				and course["credit_units"]
			):
				cumulative_quality_points += _decimal(course["grade_point"]) * _decimal(course["credit_units"])
				cumulative_credits += _decimal(course["credit_units"])
		semester["cumulative_gpa"] = _display_decimal(cumulative_quality_points / cumulative_credits) if cumulative_credits else None

	return {
		"student": dict(student),
		"semesters": list(semesters.values()),
		"final_cgpa": _display_decimal(total_quality_points / total_gpa_credits) if total_gpa_credits else None,
		"total_credits_earned": _display_decimal(total_earned_credits, 0),
		"total_gpa_credits": _display_decimal(total_gpa_credits, 0),
	}
