from __future__ import annotations

import asyncio

from fastapi import APIRouter, HTTPException, Request
from sqlalchemy.orm import selectinload

from app.database import session_scope
from app.execution.web_runner import (
    LocalCommandRunner,
    ensure_web_project_scaffold,
    execute_web_test_run,
    project_scaffold_dir,
)
from app.models import WebTestProject, WebTestRun
from app.schemas import (
    ToolCatalogEntry,
    WebScaffoldRead,
    WebTestProjectCreate,
    WebTestProjectDetail,
    WebTestProjectRead,
    WebTestRunRead,
    WebTestRunRequest,
    WebTestRunSummary,
)
from app.tool_catalog import ALL_WEB_TEST_KINDS, list_tool_catalog


router = APIRouter(prefix="/api")


@router.get("/tool-catalog", response_model=list[ToolCatalogEntry])
def get_tool_catalog() -> list[ToolCatalogEntry]:
    return [ToolCatalogEntry.model_validate(item) for item in list_tool_catalog()]


@router.get("/web-projects", response_model=list[WebTestProjectRead])
def list_web_projects() -> list[WebTestProjectRead]:
    with session_scope() as session:
        projects = session.query(WebTestProject).order_by(WebTestProject.created_at.asc()).all()
        return [_project_read(project) for project in projects]


@router.post("/web-projects", response_model=WebTestProjectRead, status_code=201)
def create_web_project(payload: WebTestProjectCreate) -> WebTestProjectRead:
    with session_scope() as session:
        existing = session.query(WebTestProject).filter(WebTestProject.name == payload.name).first()
        if existing:
            raise HTTPException(status_code=409, detail="Web project name already exists")
        project = WebTestProject(**payload.model_dump())
        session.add(project)
        session.flush()
        session.refresh(project)
        ensure_web_project_scaffold(project)
        return _project_read(project)


@router.get("/web-projects/{project_id}", response_model=WebTestProjectDetail)
def get_web_project(project_id: int) -> WebTestProjectDetail:
    with session_scope() as session:
        project = (
            session.query(WebTestProject)
            .options(selectinload(WebTestProject.runs))
            .filter(WebTestProject.id == project_id)
            .first()
        )
        if project is None:
            raise HTTPException(status_code=404, detail="Web project not found")
        return WebTestProjectDetail(
            **_project_read(project).model_dump(),
            recent_runs=[
                WebTestRunSummary.model_validate(run)
                for run in sorted(project.runs, key=lambda item: item.started_at, reverse=True)[:10]
            ],
        )


@router.post("/web-projects/{project_id}/scaffold", response_model=WebScaffoldRead)
def scaffold_web_project(project_id: int) -> WebScaffoldRead:
    with session_scope() as session:
        project = session.query(WebTestProject).filter(WebTestProject.id == project_id).first()
        if project is None:
            raise HTTPException(status_code=404, detail="Web project not found")
        paths = ensure_web_project_scaffold(project)
        scaffold_root = project_scaffold_dir(project)
        return WebScaffoldRead(
            project_id=project.id,
            scaffold_path=paths["root"],
            files=[str(path) for path in sorted(scaffold_root.rglob("*")) if path.is_file()],
        )


@router.post("/web-runs/project/{project_id}", response_model=WebTestRunSummary, status_code=202)
async def trigger_web_run(
    project_id: int,
    payload: WebTestRunRequest,
    request: Request,
) -> WebTestRunSummary:
    with session_scope() as session:
        project = session.query(WebTestProject).filter(WebTestProject.id == project_id).first()
        if project is None:
            raise HTTPException(status_code=404, detail="Web project not found")

        selected_categories = payload.categories or project.enabled_categories or list(ALL_WEB_TEST_KINDS)
        run = WebTestRun(
            project_id=project_id,
            status="queued",
            triggered_by="manual",
            total_categories=len(selected_categories),
            passed_categories=0,
            failed_categories=0,
        )
        session.add(run)
        session.flush()
        run_id = run.id
        summary = WebTestRunSummary.model_validate(run)

    async def background_job() -> None:
        with session_scope() as inner_session:
            try:
                runner = getattr(request.app.state, "web_command_runner", None) or LocalCommandRunner()
                await execute_web_test_run(
                    inner_session,
                    project_id=project_id,
                    categories=selected_categories,
                    triggered_by="manual",
                    run_id=run_id,
                    runner=runner,
                )
            except Exception as exc:
                failed_run = inner_session.query(WebTestRun).filter(WebTestRun.id == run_id).first()
                if failed_run is not None:
                    failed_run.status = "failed"
                    failed_run.summary = str(exc)
                    inner_session.add(failed_run)
                    inner_session.commit()

    asyncio.create_task(background_job())
    return summary


@router.get("/web-runs", response_model=list[WebTestRunSummary])
def list_web_runs() -> list[WebTestRunSummary]:
    with session_scope() as session:
        runs = session.query(WebTestRun).order_by(WebTestRun.started_at.desc()).limit(50).all()
        return [WebTestRunSummary.model_validate(run) for run in runs]


@router.get("/web-runs/{run_id}", response_model=WebTestRunRead)
def get_web_run(run_id: int) -> WebTestRunRead:
    with session_scope() as session:
        run = (
            session.query(WebTestRun)
            .options(selectinload(WebTestRun.category_runs))
            .filter(WebTestRun.id == run_id)
            .first()
        )
        if run is None:
            raise HTTPException(status_code=404, detail="Web run not found")
        return WebTestRunRead.model_validate(run)


def _project_read(project: WebTestProject) -> WebTestProjectRead:
    return WebTestProjectRead(
        id=project.id,
        name=project.name,
        description=project.description,
        target_url=project.target_url,
        workspace_path=project.workspace_path,
        finance_paths=project.finance_paths,
        selector_assertions=project.selector_assertions,
        enabled_categories=project.enabled_categories,
        unit_command=project.unit_command,
        integration_command=project.integration_command,
        functional_command=project.functional_command,
        stability_command=project.stability_command,
        security_command=project.security_command,
        virtual_users=project.virtual_users,
        spawn_rate=project.spawn_rate,
        duration=project.duration,
        created_at=project.created_at,
        updated_at=project.updated_at,
        scaffold_path=str(project_scaffold_dir(project)),
    )
