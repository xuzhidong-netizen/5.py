import asyncio
from pathlib import Path

from app.database import SessionLocal
from app.execution.web_runner import (
    CommandExecutionResult,
    default_command_for,
    execute_web_test_run,
    project_scaffold_dir,
)
from app.main import DEMO_WEB_PROJECT_NAME, seed_demo_web_project
from app.models import WebTestProject, WebTestRun


class FakeRunner:
    async def run(self, command: str, cwd: str | None = None) -> CommandExecutionResult:
        if "zap-baseline.py" in command:
            return CommandExecutionResult(
                exit_code=1,
                stdout="security warning",
                stderr="",
                duration_ms=12,
            )
        return CommandExecutionResult(
            exit_code=0,
            stdout=f"ok: {command}",
            stderr="",
            duration_ms=8,
        )


def test_tool_catalog_lists_expected_web_finance_tools(client):
    response = client.get("/api/tool-catalog")
    assert response.status_code == 200
    payload = response.json()
    assert [item["key"] for item in payload] == [
        "unit",
        "integration",
        "functional",
        "stability",
        "security",
    ]


def test_create_web_project_and_scaffold(client):
    response = client.post(
        "/api/web-projects",
        json={
            "name": "Finance Portal",
            "description": "finance",
            "target_url": "https://bank.example.com",
            "workspace_path": None,
            "finance_paths": {
                "login": "/login",
                "quotes": "/quotes",
                "portfolio": "/portfolio",
            },
            "selector_assertions": {
                "login": ["form"],
                "portfolio": ["table.positions"],
            },
            "enabled_categories": ["unit", "integration", "functional", "stability", "security"],
            "virtual_users": 15,
            "spawn_rate": 3,
            "duration": "90s",
        },
    )
    assert response.status_code == 201
    project = response.json()
    assert project["name"] == "Finance Portal"

    scaffold_response = client.post(f"/api/web-projects/{project['id']}/scaffold")
    assert scaffold_response.status_code == 200
    scaffold = scaffold_response.json()
    assert Path(scaffold["scaffold_path"]).exists()
    assert any(path.endswith("locustfile.py") for path in scaffold["files"])


def test_execute_web_test_run_records_all_categories(monkeypatch):
    monkeypatch.setattr("app.execution.web_runner.is_tool_available", lambda definition: True)

    with SessionLocal() as session:
        project = WebTestProject(
            name="Bank QA",
            description="bank flows",
            target_url="https://bank.example.com",
            workspace_path=None,
            finance_paths={
                "login": "/login",
                "quotes": "/quotes",
                "portfolio": "/portfolio",
                "trade": "/trade",
                "transfer": "/transfer",
            },
            selector_assertions={"login": ["form"]},
            enabled_categories=["unit", "integration", "functional", "stability", "security"],
            virtual_users=10,
            spawn_rate=2,
            duration="60s",
        )
        session.add(project)
        session.commit()
        session.refresh(project)

        run = asyncio.run(
            execute_web_test_run(
                session=session,
                project_id=project.id,
                categories=project.enabled_categories,
                runner=FakeRunner(),
            )
        )

        session.refresh(run)
        stored_run = session.query(WebTestRun).filter(WebTestRun.id == run.id).first()
        assert stored_run is not None
        assert stored_run.total_categories == 5
        assert stored_run.passed_categories == 4
        assert stored_run.failed_categories == 1
        assert stored_run.status == "failed"

        scaffold_root = project_scaffold_dir(project)
        assert (scaffold_root / "tests" / "functional" / "test_finance_flows.py").exists()


def test_default_unit_and_integration_commands_target_scaffold_directories():
    project = WebTestProject(
        name="Command Scope",
        description="scope",
        target_url="https://bank.example.com",
        workspace_path=None,
        finance_paths={"login": "/login"},
        selector_assertions={},
        enabled_categories=["unit", "integration"],
        virtual_users=1,
        spawn_rate=1,
        duration="10s",
    )
    unit_command = default_command_for(project, "unit")
    integration_command = default_command_for(project, "integration")
    assert "/tests/unit" in unit_command
    assert "/tests/integration" in integration_command


def test_seed_demo_web_project_creates_preconfigured_finance_project():
    with SessionLocal() as session:
        seed_demo_web_project(session)
        session.commit()

        project = session.query(WebTestProject).filter(WebTestProject.name == DEMO_WEB_PROJECT_NAME).first()
        assert project is not None
        assert project.finance_paths == {
            "login": "/login",
            "quotes": "/quotes",
            "portfolio": "/portfolio",
            "trade": "/trade",
            "transfer": "/transfer",
            "statements": "/statements",
        }
        assert set(project.selector_assertions) == set(project.finance_paths)
        assert (project_scaffold_dir(project) / "tests" / "functional" / "test_finance_flows.py").exists()
