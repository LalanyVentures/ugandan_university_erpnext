from .workflows import (
    build_invoice_items,
    calculate_gpa,
    calculate_result,
    determine_clearance,
    split_name,
    validate_transition,
)


def test_result_and_gpa():
    result = calculate_result(
        [{"mark": 80, "maximum_mark": 100, "weight": 40}, {"mark": 70, "maximum_mark": 100, "weight": 60}],
        [{"minimum_mark": 70, "grade": "B+", "grade_point": 4, "counts_as_pass": 1}],
        4,
    )
    assert result["final_mark"] == 74.0
    assert result["grade"] == "B+"
    result.update({"is_approved": 1, "is_published": 1})
    assert calculate_gpa([result])["gpa"] == 4.0


def test_workflow_helpers():
    assert split_name("Edith Naigaga") == ("Edith", "Naigaga")
    assert determine_clearance("Cleared", "Cleared") == "Cleared"
    assert build_invoice_items({"fee_lines": [{"item": "TUITION", "quantity": 1, "rate": 1200000}]})[0]["amount"] == 1200000
    validate_transition("Draft", "Submitted", {"Draft": {"Submitted"}})
