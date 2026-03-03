from __future__ import annotations

import asyncio
from dataclasses import dataclass
from datetime import datetime, timezone
import json
from pathlib import Path
from time import perf_counter
import re
import shlex
import sys
from textwrap import dedent
from typing import Protocol

from sqlalchemy.orm import Session

from app.config import get_settings
from app.models import WebTestCategoryRun, WebTestProject, WebTestRun
from app.tool_catalog import ALL_WEB_TEST_KINDS, TOOL_DEFINITIONS, is_tool_available


DEFAULT_FINANCE_PATHS = {
    "login": "/login",
    "quotes": "/quotes",
    "portfolio": "/portfolio",
    "trade": "/trade",
    "transfer": "/transfer",
    "statements": "/statements",
}


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


@dataclass
class CommandExecutionResult:
    exit_code: int
    stdout: str
    stderr: str
    duration_ms: int


class AsyncCommandRunner(Protocol):
    async def run(self, command: str, cwd: str | None = None) -> CommandExecutionResult:
        ...


class LocalCommandRunner:
    async def run(self, command: str, cwd: str | None = None) -> CommandExecutionResult:
        start = perf_counter()
        process = await asyncio.create_subprocess_shell(
            command,
            cwd=cwd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        stdout, stderr = await process.communicate()
        return CommandExecutionResult(
            exit_code=process.returncode,
            stdout=stdout.decode("utf-8", errors="replace"),
            stderr=stderr.decode("utf-8", errors="replace"),
            duration_ms=int((perf_counter() - start) * 1000),
        )


def slugify(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-") or "project"


def project_scaffold_dir(project: WebTestProject) -> Path:
    settings = get_settings()
    return settings.generated_root / "web_finance" / f"{project.id}-{slugify(project.name)}"


def scaffold_paths(project: WebTestProject) -> dict[str, Path]:
    root = project_scaffold_dir(project)
    return {
        "root": root,
        "tests_root": root / "tests",
        "unit_dir": root / "tests" / "unit",
        "integration_dir": root / "tests" / "integration",
        "functional_dir": root / "tests" / "functional",
        "load_dir": root / "load",
        "security_dir": root / "security",
    }


def ensure_web_project_scaffold(project: WebTestProject) -> dict[str, str]:
    paths = scaffold_paths(project)
    for path in paths.values():
        path.mkdir(parents=True, exist_ok=True)

    finance_paths = project.finance_paths or DEFAULT_FINANCE_PATHS
    selector_assertions = project.selector_assertions or {}
    finance_paths_json = json.dumps(finance_paths, ensure_ascii=False, indent=2)
    selector_assertions_json = json.dumps(selector_assertions, ensure_ascii=False, indent=2)

    _write_text(
        paths["root"] / "README.md",
        dedent(
            f"""\
            # {project.name} Web 金融测试脚手架

            该脚手架由自动化测试平台生成，用于金融 Web 页面测试：

            - `tests/unit/`: 配置与规则单元校验
            - `tests/integration/`: HTTP 集成验证
            - `tests/functional/`: Playwright 浏览器功能测试
            - `load/`: Locust 稳定性压测
            - `security/`: ZAP 基线扫描输出目录

            当前目标地址：`{project.target_url}`
            工作目录：`{project.workspace_path or "未配置，默认运行平台生成脚手架"}`
            """
        ),
    )

    _write_text(
        paths["root"] / "pytest.ini",
        dedent(
            """\
            [pytest]
            addopts = -q --strict-markers
            markers =
                unit: finance unit validation
                integration: finance integration validation
                functional: finance browser automation
            """
        ),
    )

    _write_text(
        paths["unit_dir"] / "test_finance_config.py",
        f"""import pytest

TARGET_URL = {project.target_url!r}
FINANCE_PATHS = {finance_paths_json}
SELECTOR_ASSERTIONS = {selector_assertions_json}
USERS = {project.virtual_users}
SPAWN_RATE = {project.spawn_rate}
DURATION = {project.duration!r}


@pytest.mark.unit
def test_target_url_uses_http_or_https():
    assert TARGET_URL.startswith(("http://", "https://"))


@pytest.mark.unit
def test_finance_paths_are_absolute():
    assert FINANCE_PATHS
    for name, path in FINANCE_PATHS.items():
        assert name
        assert path.startswith("/")


@pytest.mark.unit
def test_selector_assertions_have_expected_shape():
    for flow_name, selectors in SELECTOR_ASSERTIONS.items():
        assert flow_name in FINANCE_PATHS
        assert isinstance(selectors, list)
        for selector in selectors:
            assert isinstance(selector, str)
            assert selector.strip()


@pytest.mark.unit
def test_load_profile_is_positive():
    assert USERS > 0
    assert SPAWN_RATE > 0
    assert DURATION
""",
    )

    _write_text(
        paths["integration_dir"] / "test_finance_http.py",
        f"""import httpx
import pytest

TARGET_URL = {project.target_url!r}
FINANCE_PATHS = {finance_paths_json}


@pytest.mark.integration
@pytest.mark.parametrize("flow_name,path", list(FINANCE_PATHS.items()))
def test_finance_page_is_not_server_error(flow_name, path):
    response = httpx.get(
        f"{{TARGET_URL}}{{path}}",
        follow_redirects=True,
        timeout=15,
    )
    assert response.status_code < 500
""",
    )

    _write_text(
        paths["functional_dir"] / "test_finance_flows.py",
        f"""import pytest
from playwright.sync_api import sync_playwright

TARGET_URL = {project.target_url!r}
FINANCE_PATHS = {finance_paths_json}
SELECTOR_ASSERTIONS = {selector_assertions_json}


@pytest.mark.functional
@pytest.mark.parametrize("flow_name,path", list(FINANCE_PATHS.items()))
def test_finance_flow_page_loads(flow_name, path):
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        page = browser.new_page()
        response = page.goto(f"{{TARGET_URL}}{{path}}", wait_until="domcontentloaded")
        assert response is None or response.status < 500
        selectors = SELECTOR_ASSERTIONS.get(flow_name, [])
        if selectors:
            for selector in selectors:
                page.locator(selector).first.wait_for(timeout=5000)
        else:
            assert page.title() is not None
        browser.close()
""",
    )

    _write_text(
        paths["load_dir"] / "locustfile.py",
        f"""from locust import HttpUser, between, task

FINANCE_PATHS = {finance_paths_json}


class FinanceWebUser(HttpUser):
    wait_time = between(1, 3)

    @task
    def browse_finance_pages(self):
        for path in FINANCE_PATHS.values():
            self.client.get(path, name=path)
""",
    )

    _write_text(
        paths["security_dir"] / "README.md",
        dedent(
            """\
            该目录用于存放 OWASP ZAP Baseline 扫描输出。

            默认命令会在这里生成：

            - `zap-report.html`
            - `zap-report.json`
            """
        ),
    )

    return {name: str(path) for name, path in paths.items()}


def default_command_for(project: WebTestProject, category: str) -> str:
    paths = scaffold_paths(project)
    python_cmd = shlex.quote(sys.executable)
    workspace_path = Path(project.workspace_path).expanduser() if project.workspace_path else None
    unit_target = (
        workspace_path / "tests" / "unit"
        if workspace_path and (workspace_path / "tests" / "unit").exists()
        else workspace_path or paths["unit_dir"]
    )
    integration_target = (
        workspace_path / "tests" / "integration"
        if workspace_path and (workspace_path / "tests" / "integration").exists()
        else workspace_path or paths["integration_dir"]
    )

    defaults = {
        "unit": f"{python_cmd} -m pytest -m unit -q {shlex.quote(str(unit_target))}",
        "integration": f"{python_cmd} -m pytest -m integration -q {shlex.quote(str(integration_target))}",
        "functional": (
            f"{python_cmd} -m pytest -m functional -q "
            f"{shlex.quote(str(paths['functional_dir']))}"
        ),
        "stability": (
            f"locust -f {shlex.quote(str(paths['load_dir'] / 'locustfile.py'))} "
            f"--headless --host {shlex.quote(project.target_url)} "
            f"-u {project.virtual_users} -r {project.spawn_rate} -t {shlex.quote(project.duration)}"
        ),
        "security": (
            f"docker run --rm -v {shlex.quote(str(paths['security_dir']))}:/zap/wrk/:rw "
            f"-t ghcr.io/zaproxy/zaproxy:stable zap-baseline.py "
            f"-t {shlex.quote(project.target_url)} "
            f"-J zap-report.json -r zap-report.html -m 3"
        ),
    }
    return defaults[category]


def command_for(project: WebTestProject, category: str) -> str:
    project_command = getattr(project, f"{category}_command")
    if project_command:
        return render_command_template(project_command, project)
    return default_command_for(project, category)


def render_command_template(template: str, project: WebTestProject) -> str:
    paths = scaffold_paths(project)
    context = {
        "python": shlex.quote(sys.executable),
        "target_url": shlex.quote(project.target_url),
        "workspace_path": shlex.quote(project.workspace_path or ""),
        "tests_root": shlex.quote(str(paths["tests_root"])),
        "unit_dir": shlex.quote(str(paths["unit_dir"])),
        "integration_dir": shlex.quote(str(paths["integration_dir"])),
        "functional_dir": shlex.quote(str(paths["functional_dir"])),
        "load_dir": shlex.quote(str(paths["load_dir"])),
        "security_dir": shlex.quote(str(paths["security_dir"])),
        "virtual_users": project.virtual_users,
        "spawn_rate": project.spawn_rate,
        "duration": shlex.quote(project.duration),
    }
    return template.format_map(context)


async def execute_web_test_run(
    session: Session,
    project_id: int,
    categories: list[str] | None = None,
    triggered_by: str = "manual",
    run_id: int | None = None,
    runner: AsyncCommandRunner | None = None,
) -> WebTestRun:
    project = session.query(WebTestProject).filter(WebTestProject.id == project_id).first()
    if project is None:
        raise ValueError(f"Web project {project_id} not found")

    ensure_web_project_scaffold(project)
    selected_categories = categories or project.enabled_categories or list(ALL_WEB_TEST_KINDS)
    runner = runner or LocalCommandRunner()

    if run_id is not None:
        run = session.query(WebTestRun).filter(WebTestRun.id == run_id).first()
        if run is None:
            raise ValueError(f"Web run {run_id} not found")
        run.status = "running"
        run.triggered_by = triggered_by
        run.total_categories = len(selected_categories)
        run.passed_categories = 0
        run.failed_categories = 0
        run.summary = None
        run.started_at = utc_now()
        run.finished_at = None
    else:
        run = WebTestRun(
            project_id=project.id,
            status="running",
            triggered_by=triggered_by,
            total_categories=len(selected_categories),
        )
        session.add(run)
    session.commit()
    session.refresh(run)

    passed_categories = 0
    failed_categories = 0
    for category in selected_categories:
        category_run = await _execute_category_run(project, run.id, category, runner)
        if category_run.status == "passed":
            passed_categories += 1
        else:
            failed_categories += 1
        session.add(category_run)
        session.commit()

    run.status = "passed" if failed_categories == 0 else "failed"
    run.passed_categories = passed_categories
    run.failed_categories = failed_categories
    run.summary = f"{passed_categories} passed, {failed_categories} failed"
    run.finished_at = utc_now()
    session.add(run)
    session.commit()
    session.refresh(run)
    return run


async def _execute_category_run(
    project: WebTestProject,
    run_id: int,
    category: str,
    runner: AsyncCommandRunner,
) -> WebTestCategoryRun:
    tool_definition = TOOL_DEFINITIONS[category]
    command = command_for(project, category)
    cwd = project.workspace_path or str(project_scaffold_dir(project))

    if not is_tool_available(tool_definition):
        message = (
            f"Required tool {tool_definition.tool_name} is not installed. "
            f"Install hint: {tool_definition.install_hint}"
        )
        return WebTestCategoryRun(
            run_id=run_id,
            category=category,
            tool_name=tool_definition.tool_name,
            status="failed",
            command=command,
            exit_code=None,
            duration_ms=0,
            output_excerpt=message,
            report={
                "docs_url": tool_definition.docs_url,
                "install_hint": tool_definition.install_hint,
            },
        )

    try:
        result = await runner.run(command, cwd=cwd)
        combined_output = "\n".join(part for part in [result.stdout.strip(), result.stderr.strip()] if part)
        passed = result.exit_code == 0
        return WebTestCategoryRun(
            run_id=run_id,
            category=category,
            tool_name=tool_definition.tool_name,
            status="passed" if passed else "failed",
            command=command,
            exit_code=result.exit_code,
            duration_ms=result.duration_ms,
            output_excerpt=combined_output[-4000:] if combined_output else "",
            report={
                "stdout_tail": result.stdout[-2000:],
                "stderr_tail": result.stderr[-2000:],
                "docs_url": tool_definition.docs_url,
            },
        )
    except Exception as exc:
        return WebTestCategoryRun(
            run_id=run_id,
            category=category,
            tool_name=tool_definition.tool_name,
            status="failed",
            command=command,
            exit_code=None,
            duration_ms=0,
            output_excerpt=str(exc),
            report={"docs_url": tool_definition.docs_url},
        )


def _write_text(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")
