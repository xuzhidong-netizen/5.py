from app.execution.assertions import evaluate_json_assertions, resolve_json_path


def test_resolve_json_path_supports_nested_dict_and_list():
    payload = {"data": {"items": [{"id": 1}, {"id": 2}]}}
    assert resolve_json_path(payload, "data.items.1.id") == 2


def test_evaluate_json_assertions_returns_pass_fail_report():
    payload = {"success": True, "count": 3, "tags": ["smoke", "regression"]}
    report = evaluate_json_assertions(
        payload,
        [
            {"path": "success", "operator": "eq", "expected": True},
            {"path": "count", "operator": "gte", "expected": 2},
            {"path": "tags", "operator": "contains", "expected": "smoke"},
        ],
    )
    assert [item["passed"] for item in report] == [True, True, True]
