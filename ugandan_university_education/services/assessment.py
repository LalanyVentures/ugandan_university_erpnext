from decimal import Decimal, ROUND_HALF_UP


def calculate_weighted_mark(mark_rows):
    """Return the weighted total for published assessment marks."""
    total = Decimal("0")
    for row in mark_rows or []:
        if row.get("is_published", True) is False:
            continue
        mark = Decimal(str(row.get("mark") or 0))
        weight = Decimal(str(row.get("weight") or 0))
        total += mark * weight / Decimal("100")
    return total.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def find_grade(mark, grade_bands):
    mark = Decimal(str(mark or 0))
    for band in sorted(grade_bands or [], key=lambda item: Decimal(str(item.get("minimum_mark") or 0)), reverse=True):
        if mark >= Decimal(str(band.get("minimum_mark") or 0)):
            return band.get("grade"), band.get("grade_point")
    return None, None
