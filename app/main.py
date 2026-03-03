from contextlib import asynccontextmanager
import asyncio

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy import func
from sqlalchemy.orm import selectinload

from app.config import get_settings
from app.database import init_db, session_scope
from app.execution.http_runner import execute_suite_run
from app.models import CaseRun, Run, Schedule, Suite, TestCase
from app.schemas import (
    CaseCreate,
    CaseRead,
    CaseUpdate,
    DashboardSummary,
    RunRead,
    RunSummary,
    ScheduleCreate,
    ScheduleRead,
    SuiteCreate,
    SuiteDetail,
    SuiteRead,
)
from app.scheduler import schedule_manager


def seed_demo_data() -> None:
    settings = get_settings()
    if not settings.auto_seed_demo:
        return

    with session_scope() as session:
        exists = session.query(Suite.id).first()
        if exists:
            return

        suite = Suite(
            name="平台自检",
            description="默认演示套件，验证平台自身健康检查接口。",
            base_url="http://127.0.0.1:8000",
        )
        session.add(suite)
        session.flush()

        session.add(
            TestCase(
                suite_id=suite.id,
                name="健康检查接口",
                description="验证平台运行状态。",
                method="GET",
                path="/health",
                expected_status=200,
                max_response_time_ms=3000,
                expected_json_assertions=[
                    {"path": "status", "operator": "eq", "expected": "ok"},
                ],
            )
        )


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    seed_demo_data()
    with session_scope() as session:
        schedule_manager.start()
        schedule_manager.sync_all(session)
    yield
    schedule_manager.shutdown()


app = FastAPI(title="自动化测试平台", version="0.1.0", lifespan=lifespan)
app.mount("/assets", StaticFiles(directory=str(get_settings().static_dir)), name="assets")


@app.get("/", include_in_schema=False)
def index() -> FileResponse:
    return FileResponse(get_settings().static_dir / "index.html")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/dashboard", response_model=DashboardSummary)
def dashboard() -> DashboardSummary:
    with session_scope() as session:
        suite_count = session.query(func.count(Suite.id)).scalar() or 0
        case_count = session.query(func.count(TestCase.id)).scalar() or 0
        run_count = session.query(func.count(Run.id)).scalar() or 0
        schedule_count = session.query(func.count(Schedule.id)).scalar() or 0
        passed_total = session.query(func.coalesce(func.sum(Run.passed_cases), 0)).scalar() or 0
        total_cases = session.query(func.coalesce(func.sum(Run.total_cases), 0)).scalar() or 0
        recent_runs = (
            session.query(Run)
            .order_by(Run.started_at.desc())
            .limit(8)
            .all()
        )
        return DashboardSummary(
            suites=suite_count,
            cases=case_count,
            runs=run_count,
            schedules=schedule_count,
            pass_rate=round((passed_total / total_cases) * 100, 2) if total_cases else 0.0,
            recent_runs=[RunSummary.model_validate(run) for run in recent_runs],
        )


@app.get("/api/suites", response_model=list[SuiteRead])
def list_suites() -> list[SuiteRead]:
    with session_scope() as session:
        suites = session.query(Suite).order_by(Suite.created_at.asc()).all()
        return [SuiteRead.model_validate(suite) for suite in suites]


@app.post("/api/suites", response_model=SuiteRead, status_code=201)
def create_suite(payload: SuiteCreate) -> SuiteRead:
    with session_scope() as session:
        existing = session.query(Suite).filter(Suite.name == payload.name).first()
        if existing:
            raise HTTPException(status_code=409, detail="Suite name already exists")
        suite = Suite(**payload.model_dump())
        session.add(suite)
        session.flush()
        session.refresh(suite)
        return SuiteRead.model_validate(suite)


@app.get("/api/suites/{suite_id}", response_model=SuiteDetail)
def get_suite(suite_id: int) -> SuiteDetail:
    with session_scope() as session:
        suite = (
            session.query(Suite)
            .options(selectinload(Suite.cases))
            .filter(Suite.id == suite_id)
            .first()
        )
        if suite is None:
            raise HTTPException(status_code=404, detail="Suite not found")
        return SuiteDetail.model_validate(suite)


@app.post("/api/cases", response_model=CaseRead, status_code=201)
def create_case(payload: CaseCreate) -> CaseRead:
    with session_scope() as session:
        suite = session.query(Suite).filter(Suite.id == payload.suite_id).first()
        if suite is None:
            raise HTTPException(status_code=404, detail="Suite not found")
        case = TestCase(**payload.model_dump())
        session.add(case)
        session.flush()
        session.refresh(case)
        return CaseRead.model_validate(case)


@app.put("/api/cases/{case_id}", response_model=CaseRead)
def update_case(case_id: int, payload: CaseUpdate) -> CaseRead:
    with session_scope() as session:
        case = session.query(TestCase).filter(TestCase.id == case_id).first()
        if case is None:
            raise HTTPException(status_code=404, detail="Case not found")
        suite = session.query(Suite).filter(Suite.id == payload.suite_id).first()
        if suite is None:
            raise HTTPException(status_code=404, detail="Suite not found")
        for key, value in payload.model_dump().items():
            setattr(case, key, value)
        session.add(case)
        session.flush()
        session.refresh(case)
        return CaseRead.model_validate(case)


@app.post("/api/runs/suite/{suite_id}", response_model=RunSummary, status_code=202)
async def trigger_suite_run(suite_id: int) -> RunSummary:
    with session_scope() as session:
        suite = session.query(Suite).filter(Suite.id == suite_id).first()
        if suite is None:
            raise HTTPException(status_code=404, detail="Suite not found")

        run = Run(
            suite_id=suite_id,
            status="queued",
            triggered_by="manual",
            total_cases=0,
            passed_cases=0,
            failed_cases=0,
        )
        session.add(run)
        session.flush()
        run_id = run.id
        summary = RunSummary.model_validate(run)

    async def background_job() -> None:
        with session_scope() as inner_session:
            try:
                await execute_suite_run(
                    inner_session,
                    suite_id=suite_id,
                    triggered_by="manual",
                    run_id=run_id,
                )
            except Exception as exc:
                failed_run = inner_session.query(Run).filter(Run.id == run_id).first()
                if failed_run is not None:
                    failed_run.status = "failed"
                    failed_run.summary = str(exc)
                    inner_session.add(failed_run)
                    inner_session.commit()

    asyncio.create_task(background_job())
    return summary


@app.get("/api/runs", response_model=list[RunSummary])
def list_runs() -> list[RunSummary]:
    with session_scope() as session:
        runs = session.query(Run).order_by(Run.started_at.desc()).limit(50).all()
        return [RunSummary.model_validate(run) for run in runs]


@app.get("/api/runs/{run_id}", response_model=RunRead)
def get_run(run_id: int) -> RunRead:
    with session_scope() as session:
        run = (
            session.query(Run)
            .options(selectinload(Run.case_runs))
            .filter(Run.id == run_id)
            .first()
        )
        if run is None:
            raise HTTPException(status_code=404, detail="Run not found")
        return RunRead.model_validate(run)


@app.get("/api/schedules", response_model=list[ScheduleRead])
def list_schedules() -> list[ScheduleRead]:
    with session_scope() as session:
        schedules = session.query(Schedule).order_by(Schedule.created_at.desc()).all()
        return [ScheduleRead.model_validate(item) for item in schedules]


@app.post("/api/schedules", response_model=ScheduleRead, status_code=201)
def create_schedule(payload: ScheduleCreate) -> ScheduleRead:
    with session_scope() as session:
        suite = session.query(Suite).filter(Suite.id == payload.suite_id).first()
        if suite is None:
            raise HTTPException(status_code=404, detail="Suite not found")
        if payload.trigger_type == "interval" and payload.interval_minutes is None:
            raise HTTPException(status_code=422, detail="interval_minutes is required")
        if payload.trigger_type == "cron" and not payload.cron_expression:
            raise HTTPException(status_code=422, detail="cron_expression is required")

        schedule = Schedule(**payload.model_dump())
        session.add(schedule)
        session.flush()
        session.refresh(schedule)
        schedule_manager.sync_one(schedule)
        return ScheduleRead.model_validate(schedule)


@app.put("/api/schedules/{schedule_id}", response_model=ScheduleRead)
def update_schedule(schedule_id: int, payload: ScheduleCreate) -> ScheduleRead:
    with session_scope() as session:
        schedule = session.query(Schedule).filter(Schedule.id == schedule_id).first()
        if schedule is None:
            raise HTTPException(status_code=404, detail="Schedule not found")
        for key, value in payload.model_dump().items():
            setattr(schedule, key, value)
        session.add(schedule)
        session.flush()
        session.refresh(schedule)
        schedule_manager.sync_one(schedule)
        return ScheduleRead.model_validate(schedule)
