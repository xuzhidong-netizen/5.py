from typing import Any


def resolve_json_path(payload: Any, path: str) -> Any:
    current = payload
    for raw_part in path.split("."):
        part = raw_part.strip()
        if part == "":
            continue
        if isinstance(current, list):
            index = int(part)
            current = current[index]
            continue
        if isinstance(current, dict):
            current = current[part]
            continue
        raise KeyError(path)
    return current


def compare(actual: Any, operator: str, expected: Any) -> bool:
    if operator == "eq":
        return actual == expected
    if operator == "ne":
        return actual != expected
    if operator == "contains":
        return expected in actual
    if operator == "gt":
        return actual > expected
    if operator == "gte":
        return actual >= expected
    if operator == "lt":
        return actual < expected
    if operator == "lte":
        return actual <= expected
    raise ValueError(f"Unsupported operator: {operator}")


def evaluate_json_assertions(payload: Any, assertions: list[dict[str, Any]]) -> list[dict[str, Any]]:
    report: list[dict[str, Any]] = []
    for assertion in assertions:
        path = assertion["path"]
        operator = assertion["operator"]
        expected = assertion["expected"]
        try:
            actual = resolve_json_path(payload, path)
            passed = compare(actual, operator, expected)
            report.append(
                {
                    "path": path,
                    "operator": operator,
                    "expected": expected,
                    "actual": actual,
                    "passed": passed,
                }
            )
        except Exception as exc:  # pragma: no cover - defensive
            report.append(
                {
                    "path": path,
                    "operator": operator,
                    "expected": expected,
                    "actual": None,
                    "passed": False,
                    "error": str(exc),
                }
            )
    return report
