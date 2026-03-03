from datetime import datetime, timezone

from sqlalchemy import JSON, Boolean, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class Suite(Base):
    __tablename__ = "suites"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    base_url: Mapped[str] = mapped_column(String(500), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    cases: Mapped[list["TestCase"]] = relationship(
        back_populates="suite",
        cascade="all, delete-orphan",
        order_by="TestCase.sort_order",
    )
    runs: Mapped[list["Run"]] = relationship(back_populates="suite", cascade="all, delete-orphan")
    schedules: Mapped[list["Schedule"]] = relationship(back_populates="suite", cascade="all, delete-orphan")


class TestCase(Base):
    __tablename__ = "test_cases"
    __test__ = False

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    suite_id: Mapped[int] = mapped_column(ForeignKey("suites.id"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    method: Mapped[str] = mapped_column(String(10), nullable=False, default="GET")
    path: Mapped[str] = mapped_column(String(500), nullable=False, default="/")
    headers: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
    query_params: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
    body: Mapped[dict | list | str | None] = mapped_column(JSON, nullable=True)
    expected_status: Mapped[int] = mapped_column(Integer, nullable=False, default=200)
    expected_body_contains: Mapped[str | None] = mapped_column(Text, nullable=True)
    expected_json_assertions: Mapped[list] = mapped_column(JSON, default=list, nullable=False)
    max_response_time_ms: Mapped[int | None] = mapped_column(Integer, nullable=True)
    enabled: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    suite: Mapped["Suite"] = relationship(back_populates="cases")
    case_runs: Mapped[list["CaseRun"]] = relationship(back_populates="case")


class Run(Base):
    __tablename__ = "runs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    suite_id: Mapped[int] = mapped_column(ForeignKey("suites.id"), nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="queued")
    triggered_by: Mapped[str] = mapped_column(String(120), nullable=False, default="manual")
    total_cases: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    passed_cases: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    failed_cases: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    finished_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    suite: Mapped["Suite"] = relationship(back_populates="runs")
    case_runs: Mapped[list["CaseRun"]] = relationship(
        back_populates="run",
        cascade="all, delete-orphan",
        order_by="CaseRun.id",
    )


class CaseRun(Base):
    __tablename__ = "case_runs"
    __test__ = False

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    run_id: Mapped[int] = mapped_column(ForeignKey("runs.id"), nullable=False, index=True)
    case_id: Mapped[int] = mapped_column(ForeignKey("test_cases.id"), nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False)
    response_status: Mapped[int | None] = mapped_column(Integer, nullable=True)
    duration_ms: Mapped[int | None] = mapped_column(Integer, nullable=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    request_snapshot: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
    response_snapshot: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
    assertion_report: Mapped[list] = mapped_column(JSON, default=list, nullable=False)
    executed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)

    run: Mapped["Run"] = relationship(back_populates="case_runs")
    case: Mapped["TestCase"] = relationship(back_populates="case_runs")


class Schedule(Base):
    __tablename__ = "schedules"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    suite_id: Mapped[int] = mapped_column(ForeignKey("suites.id"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    trigger_type: Mapped[str] = mapped_column(String(20), nullable=False)
    interval_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    cron_expression: Mapped[str | None] = mapped_column(String(120), nullable=True)
    enabled: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    last_run_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    suite: Mapped["Suite"] = relationship(back_populates="schedules")


class WebTestProject(Base):
    __tablename__ = "web_test_projects"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    target_url: Mapped[str] = mapped_column(String(500), nullable=False)
    workspace_path: Mapped[str | None] = mapped_column(String(500), nullable=True)
    finance_paths: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
    selector_assertions: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
    enabled_categories: Mapped[list] = mapped_column(JSON, default=list, nullable=False)
    unit_command: Mapped[str | None] = mapped_column(Text, nullable=True)
    integration_command: Mapped[str | None] = mapped_column(Text, nullable=True)
    functional_command: Mapped[str | None] = mapped_column(Text, nullable=True)
    stability_command: Mapped[str | None] = mapped_column(Text, nullable=True)
    security_command: Mapped[str | None] = mapped_column(Text, nullable=True)
    virtual_users: Mapped[int] = mapped_column(Integer, default=20, nullable=False)
    spawn_rate: Mapped[int] = mapped_column(Integer, default=4, nullable=False)
    duration: Mapped[str] = mapped_column(String(40), default="2m", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    runs: Mapped[list["WebTestRun"]] = relationship(
        back_populates="project",
        cascade="all, delete-orphan",
        order_by="WebTestRun.started_at.desc()",
    )


class WebTestRun(Base):
    __tablename__ = "web_test_runs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("web_test_projects.id"), nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="queued")
    triggered_by: Mapped[str] = mapped_column(String(120), nullable=False, default="manual")
    total_categories: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    passed_categories: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    failed_categories: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    finished_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    project: Mapped["WebTestProject"] = relationship(back_populates="runs")
    category_runs: Mapped[list["WebTestCategoryRun"]] = relationship(
        back_populates="run",
        cascade="all, delete-orphan",
        order_by="WebTestCategoryRun.id",
    )


class WebTestCategoryRun(Base):
    __tablename__ = "web_test_category_runs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    run_id: Mapped[int] = mapped_column(ForeignKey("web_test_runs.id"), nullable=False, index=True)
    category: Mapped[str] = mapped_column(String(30), nullable=False)
    tool_name: Mapped[str] = mapped_column(String(80), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False)
    command: Mapped[str] = mapped_column(Text, nullable=False)
    exit_code: Mapped[int | None] = mapped_column(Integer, nullable=True)
    duration_ms: Mapped[int | None] = mapped_column(Integer, nullable=True)
    output_excerpt: Mapped[str | None] = mapped_column(Text, nullable=True)
    report: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
    executed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)

    run: Mapped["WebTestRun"] = relationship(back_populates="category_runs")
