from decimal import Decimal, ROUND_HALF_UP


APPLICATION_TRANSITIONS = {
    "Draft": {"Submitted"},
    "Submitted": {"Under Review", "Withdrawn"},
    "Under Review": {"Accepted", "Rejected", "Withdrawn"},
    "Accepted": set(),
    "Rejected": set(),
    "Withdrawn": set(),
}

REGISTRATION_TRANSITIONS = {
    "Draft": {"Pending Approval", "Registered", "Cancelled"},
    "Pending Approval": {"Registered", "Cancelled"},
    "Registered": {"Cancelled", "Completed"},
    "Completed": set(),
    "Cancelled": set(),
}

RESULT_TRANSITIONS = {
    "Provisional": {"Complete", "Incomplete", "Deferred", "Exempted", "Withdrawn", "Retake Required"},
    "Incomplete": {"Complete", "Deferred", "Withdrawn"},
    "Deferred": {"Complete", "Incomplete", "Withdrawn"},
    "Complete": {"Retake Required"},
    "Exempted": set(),
    "Withdrawn": set(),
    "Retake Required": set(),
}


def validate_transition(current, requested, transitions):
    if current == requested:
        return
    if requested not in transitions.get(current, set()):
        raise ValueError(f"Invalid status transition: {current} -> {requested}")


def validate_application_for_admission(application):
    if application.get("status") != "Accepted":
        raise ValueError("Only an accepted University Application can be admitted")
    for field in ("applicant_name", "academic_programme", "academic_year"):
        if not application.get(field):
            raise ValueError(f"{field} is required before admission")


def split_name(full_name):
    parts = [part for part in (full_name or "").split() if part]
    if not parts:
        return "", ""
    return parts[0], " ".join(parts[1:]) or parts[0]


def validate_cohort_assignment(student, cohort):
    if not student or not cohort:
        raise ValueError("Student and Student Cohort are required")
    if cohort.get("status") not in ("Planned", "Active"):
        raise ValueError("Students can only be assigned to a planned or active cohort")
    if not cohort.get("academic_programme") or not cohort.get("programme_curriculum"):
        raise ValueError("The cohort must have an academic programme and curriculum")


def validate_registration(registration):
    for field in ("student", "student_programme_enrolment", "semester_registration", "course_offering"):
        if not registration.get(field):
            raise ValueError(f"{field} is required for Course Registration")
    if int(registration.get("attempt_number") or 0) < 1:
        raise ValueError("Attempt Number must be at least 1")


def calculate_result(mark_rows, grade_bands, credit_units, include_in_gpa=True):
    total = Decimal("0")
    for row in mark_rows or []:
        if row.get("is_published", True) is False:
            continue
        mark = Decimal(str(row.get("mark") or 0))
        maximum = Decimal(str(row.get("maximum_mark") or 100))
        weight = Decimal(str(row.get("weight") or 0))
        if maximum <= 0 or mark < 0 or mark > maximum:
            raise ValueError("Assessment marks must be between zero and the maximum mark")
        total += (mark / maximum) * weight
    final_mark = total.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    grade, grade_point, passed = None, None, False
    for band in sorted(grade_bands or [], key=lambda item: Decimal(str(item.get("minimum_mark") or 0)), reverse=True):
        if final_mark >= Decimal(str(band.get("minimum_mark") or 0)):
            grade = band.get("grade")
            grade_point = band.get("grade_point")
            passed = bool(band.get("counts_as_pass", True))
            break
    return {
        "final_mark": float(final_mark),
        "grade": grade,
        "grade_point": float(grade_point) if grade_point is not None else None,
        "credit_units": float(credit_units or 0),
        "include_in_gpa": bool(include_in_gpa),
        "result_status": "Complete" if grade else "Incomplete",
        "passed": passed,
    }


def calculate_gpa(result_rows):
    points = Decimal("0")
    credits = Decimal("0")
    for result in result_rows or []:
        if not result.get("is_approved") or not result.get("is_published"):
            continue
        if result.get("result_status") in {"Withdrawn", "Incomplete", "Deferred"}:
            continue
        if result.get("include_in_gpa", True) is False:
            continue
        credit = Decimal(str(result.get("credit_units") or 0))
        points += Decimal(str(result.get("grade_point") or 0)) * credit
        credits += credit
    return {
        "gpa": float((points / credits).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)) if credits else 0.0,
        "gpa_credits": float(credits),
        "quality_points": float(points),
    }


def build_invoice_items(fee_structure):
    items = []
    for line in fee_structure.get("fee_lines") or []:
        quantity = Decimal(str(line.get("quantity") or 1))
        rate = Decimal(str(line.get("rate") or 0))
        items.append({
            "item_code": line.get("item"),
            "description": line.get("description"),
            "qty": float(quantity),
            "rate": float(rate),
            "amount": float(quantity * rate),
            "income_account": line.get("income_account"),
            "cost_center": line.get("cost_center"),
        })
    if not items:
        raise ValueError("A University Fee Structure must contain at least one fee line")
    return items


def determine_clearance(financial_status, academic_status):
    if financial_status == "Cleared" and academic_status == "Cleared":
        return "Cleared"
    if financial_status == "Outstanding":
        return "Pending Finance"
    if academic_status == "Holds Found":
        return "Pending Academic"
    return "Draft"
