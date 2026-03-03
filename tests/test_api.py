import asyncio

import httpx

from app.database import SessionLocal
from app.execution.http_runner import execute_suite_run
from app.main import app
from app.models import Run, Suite, TestCase as TestCaseModel


def test_create_suite_case_and_schedule(client):
    suite_response = client.post(
        "/api/suites",
        json={
            "name": "Demo Suite",
            "description": "desc",
            "base_url": "https://example.com",
        },
    )
    assert suite_response.status_code == 201
    suite_id = suite_response.json()["id"]

    case_response = client.post(
        "/api/cases",
        json={
            "suite_id": suite_id,
            "name": "Health Check",
            "description": "health",
            "method": "GET",
            "path": "/health",
            "headers": {},
            "query_params": {},
            "body": None,
            "expected_status": 200,
            "expected_body_contains": None,
            "expected_json_assertions": [],
            "max_response_time_ms": 1000,
            "enabled": True,
            "sort_order": 0,
        },
    )
    assert case_response.status_code == 201

    suite_detail = client.get(f"/api/suites/{suite_id}")
    assert suite_detail.status_code == 200
    assert len(suite_detail.json()["cases"]) == 1

    schedule_response = client.post(
        "/api/schedules",
        json={
            "suite_id": suite_id,
            "name": "Every 5 Min",
            "trigger_type": "interval",
            "interval_minutes": 5,
            "cron_expression": None,
            "enabled": True,
        },
    )
    assert schedule_response.status_code == 201


def test_dashboard_counts(client):
    dashboard = client.get("/api/dashboard")
    assert dashboard.status_code == 200
    data = dashboard.json()
    assert data["suites"] == 0
    assert data["cases"] == 0
    assert data["runs"] == 0


def test_execute_suite_run_updates_existing_run():
    with SessionLocal() as session:
        suite = Suite(name="Local Suite", description="desc", base_url="http://testserver")
        session.add(suite)
        session.flush()
        session.add(
            TestCaseModel(
                suite_id=suite.id,
                name="Health",
                description="health",
                method="GET",
                path="/health",
                expected_status=200,
                expected_json_assertions=[{"path": "status", "operator": "eq", "expected": "ok"}],
            )
        )
        queued_run = Run(
            suite_id=suite.id,
            status="queued",
            triggered_by="manual",
            total_cases=0,
            passed_cases=0,
            failed_cases=0,
        )
        session.add(queued_run)
        session.commit()

        transport = httpx.ASGITransport(app=app)
        result = asyncio.run(
            execute_suite_run(
                session=session,
                suite_id=suite.id,
                triggered_by="manual",
                transport=transport,
                run_id=queued_run.id,
            )
        )

        session.refresh(result)
        assert result.id == queued_run.id
        assert result.status == "passed"
        assert result.passed_cases == 1
        assert result.failed_cases == 0
