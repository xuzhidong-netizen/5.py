from datetime import datetime, timezone
import json
from time import perf_counter
from typing import Any
from urllib.parse import urljoin

import httpx
from sqlalchemy.orm import Session, selectinload

from app.config import get_settings
from app.execution.assertions import evaluate_json_assertions
from app.models import CaseRun, Run, Schedule, Suite, TestCase


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


def _to_json_like(value: Any) -> Any:
    try:
        json.dumps(value)
        return value
    except TypeError:
        return str(value)


async def execute_suite_run(
    session: Session,
    suite_id: int,
    triggered_by: str = "manual",
    transport: httpx.AsyncBaseTransport | None = None,
    schedule_id: int | None = None,
    run_id: int | None = None,
) -> Run:
    suite = (
        session.query(Suite)
        .options(selectinload(Suite.cases))
        .filter(Suite.id == suite_id)
        .first()
    )
    if suite is None:
        raise ValueError(f"Suite {suite_id} not found")

    cases = [case for case in suite.cases if case.enabled]
    if run_id is not None:
        run = session.query(Run).filter(Run.id == run_id).first()
        if run is None:
            raise ValueError(f"Run {run_id} not found")
        run.status = "running"
        run.triggered_by = triggered_by
        run.total_cases = len(cases)
        run.started_at = _utc_now()
        run.finished_at = None
        run.summary = None
        run.passed_cases = 0
        run.failed_cases = 0
        session.add(run)
        session.commit()
        session.refresh(run)
    else:
        run = Run(
            suite_id=suite.id,
            status="running",
            triggered_by=triggered_by,
            total_cases=len(cases),
            started_at=_utc_now(),
        )
        session.add(run)
        session.commit()
        session.refresh(run)

    settings = get_settings()
    passed_cases = 0
    failed_cases = 0
    client_kwargs: dict[str, Any] = {"timeout": settings.request_timeout_seconds}
    if transport is not None:
        client_kwargs["transport"] = transport

    async with httpx.AsyncClient(**client_kwargs) as client:
        for case in cases:
            case_run = await _execute_case(client, suite, case, run.id)
            if case_run.status == "passed":
                passed_cases += 1
            else:
                failed_cases += 1
            session.add(case_run)
            session.commit()

    run.status = "passed" if failed_cases == 0 else "failed"
    run.passed_cases = passed_cases
    run.failed_cases = failed_cases
    run.finished_at = _utc_now()
    run.summary = f"{passed_cases} passed, {failed_cases} failed"
    session.add(run)

    if schedule_id is not None:
        schedule = session.query(Schedule).filter(Schedule.id == schedule_id).first()
        if schedule is not None:
            schedule.last_run_at = _utc_now()
            session.add(schedule)

    session.commit()
    session.refresh(run)
    return run


async def _execute_case(client: httpx.AsyncClient, suite: Suite, case: TestCase, run_id: int) -> CaseRun:
    url = urljoin(suite.base_url.rstrip("/") + "/", case.path.lstrip("/"))
    request_snapshot = {
        "method": case.method,
        "url": url,
        "headers": case.headers,
        "query_params": case.query_params,
        "body": case.body,
    }

    start = perf_counter()
    try:
        response = await client.request(
            case.method,
            url,
            headers=case.headers,
            params=case.query_params,
            json=case.body if isinstance(case.body, (dict, list)) else None,
            content=case.body if isinstance(case.body, str) else None,
        )
        duration_ms = int((perf_counter() - start) * 1000)
        response_json = None
        try:
            response_json = response.json()
        except ValueError:
            response_json = None

        assertion_report: list[dict[str, Any]] = []
        assertion_report.append(
            {
                "type": "status",
                "expected": case.expected_status,
                "actual": response.status_code,
                "passed": response.status_code == case.expected_status,
            }
        )

        body_contains_passed = True
        if case.expected_body_contains:
            body_contains_passed = case.expected_body_contains in response.text
            assertion_report.append(
                {
                    "type": "body_contains",
                    "expected": case.expected_body_contains,
                    "actual": response.text[:500],
                    "passed": body_contains_passed,
                }
            )

        time_passed = True
        if case.max_response_time_ms is not None:
            time_passed = duration_ms <= case.max_response_time_ms
            assertion_report.append(
                {
                    "type": "response_time",
                    "expected": case.max_response_time_ms,
                    "actual": duration_ms,
                    "passed": time_passed,
                }
            )

        if case.expected_json_assertions and response_json is not None:
            assertion_report.extend(evaluate_json_assertions(response_json, case.expected_json_assertions))
        elif case.expected_json_assertions and response_json is None:
            assertion_report.append(
                {
                    "type": "json_payload",
                    "passed": False,
                    "error": "Response is not valid JSON",
                }
            )

        passed = all(item.get("passed", False) for item in assertion_report)
        return CaseRun(
            run_id=run_id,
            case_id=case.id,
            status="passed" if passed else "failed",
            response_status=response.status_code,
            duration_ms=duration_ms,
            request_snapshot=request_snapshot,
            response_snapshot={
                "headers": dict(response.headers),
                "text": response.text[:2000],
                "json": _to_json_like(response_json),
            },
            assertion_report=assertion_report,
        )
    except Exception as exc:
        duration_ms = int((perf_counter() - start) * 1000)
        error_message = str(exc) or exc.__class__.__name__
        return CaseRun(
            run_id=run_id,
            case_id=case.id,
            status="failed",
            duration_ms=duration_ms,
            error_message=error_message,
            request_snapshot=request_snapshot,
            response_snapshot={},
            assertion_report=[{"type": "request_error", "passed": False, "error": error_message}],
        )
