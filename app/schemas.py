from datetime import datetime
from pathlib import Path
from typing import Any

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.execution.web_runner import DEFAULT_FINANCE_PATHS
from app.tool_catalog import ALL_WEB_TEST_KINDS


class JsonAssertion(BaseModel):
    path: str
    operator: str
    expected: Any

    @field_validator("operator")
    @classmethod
    def validate_operator(cls, value: str) -> str:
        supported = {"eq", "ne", "contains", "gt", "gte", "lt", "lte"}
        normalized = value.lower()
        if normalized not in supported:
            raise ValueError(f"Unsupported operator: {value}")
        return normalized


class SuiteCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    description: str | None = None
    base_url: str = Field(min_length=4, max_length=500)


class SuiteRead(SuiteCreate):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CaseCreate(BaseModel):
    suite_id: int
    name: str = Field(min_length=2, max_length=120)
    description: str | None = None
    method: str = Field(default="GET", max_length=10)
    path: str = Field(default="/", max_length=500)
    headers: dict[str, Any] = Field(default_factory=dict)
    query_params: dict[str, Any] = Field(default_factory=dict)
    body: Any = None
    expected_status: int = 200
    expected_body_contains: str | None = None
    expected_json_assertions: list[JsonAssertion] = Field(default_factory=list)
    max_response_time_ms: int | None = None
    enabled: bool = True
    sort_order: int = 0

    @field_validator("method")
    @classmethod
    def validate_method(cls, value: str) -> str:
        return value.upper()


class CaseUpdate(CaseCreate):
    pass


class CaseRead(CaseCreate):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SuiteDetail(SuiteRead):
    cases: list[CaseRead] = Field(default_factory=list)


class ScheduleCreate(BaseModel):
    suite_id: int
    name: str = Field(min_length=2, max_length=120)
    trigger_type: str
    interval_minutes: int | None = None
    cron_expression: str | None = None
    enabled: bool = True

    @field_validator("trigger_type")
    @classmethod
    def validate_trigger_type(cls, value: str) -> str:
        normalized = value.lower()
        if normalized not in {"interval", "cron"}:
            raise ValueError("trigger_type must be interval or cron")
        return normalized

    @field_validator("interval_minutes")
    @classmethod
    def validate_interval(cls, value: int | None) -> int | None:
        if value is not None and value < 1:
            raise ValueError("interval_minutes must be positive")
        return value


class ScheduleRead(ScheduleCreate):
    id: int
    last_run_at: datetime | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CaseRunRead(BaseModel):
    id: int
    run_id: int
    case_id: int
    status: str
    response_status: int | None = None
    duration_ms: int | None = None
    error_message: str | None = None
    request_snapshot: dict[str, Any] = Field(default_factory=dict)
    response_snapshot: dict[str, Any] = Field(default_factory=dict)
    assertion_report: list[dict[str, Any]] = Field(default_factory=list)
    executed_at: datetime

    model_config = ConfigDict(from_attributes=True)


class RunRead(BaseModel):
    id: int
    suite_id: int
    status: str
    triggered_by: str
    total_cases: int
    passed_cases: int
    failed_cases: int
    summary: str | None = None
    started_at: datetime
    finished_at: datetime | None = None
    case_runs: list[CaseRunRead] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


class RunSummary(BaseModel):
    id: int
    suite_id: int
    status: str
    triggered_by: str
    total_cases: int
    passed_cases: int
    failed_cases: int
    summary: str | None = None
    started_at: datetime
    finished_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


class DashboardSummary(BaseModel):
    suites: int
    cases: int
    runs: int
    schedules: int
    web_projects: int = 0
    web_runs: int = 0
    pass_rate: float
    recent_runs: list[RunSummary]


class ToolCatalogEntry(BaseModel):
    key: str
    category_label: str
    tool_name: str
    summary: str
    docs_url: str
    install_hint: str
    installed: bool


class WebTestProjectCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    description: str | None = None
    target_url: str = Field(min_length=4, max_length=500)
    workspace_path: str | None = Field(default=None, max_length=500)
    finance_paths: dict[str, str] = Field(default_factory=lambda: DEFAULT_FINANCE_PATHS.copy())
    selector_assertions: dict[str, list[str]] = Field(default_factory=dict)
    enabled_categories: list[str] = Field(default_factory=lambda: list(ALL_WEB_TEST_KINDS))
    unit_command: str | None = None
    integration_command: str | None = None
    functional_command: str | None = None
    stability_command: str | None = None
    security_command: str | None = None
    virtual_users: int = 20
    spawn_rate: int = 4
    duration: str = "2m"

    @field_validator("finance_paths")
    @classmethod
    def validate_finance_paths(cls, value: dict[str, str]) -> dict[str, str]:
        for path in value.values():
            if not path.startswith("/"):
                raise ValueError("finance_paths values must start with /")
        return value

    @field_validator("enabled_categories")
    @classmethod
    def validate_categories(cls, value: list[str]) -> list[str]:
        invalid = [item for item in value if item not in ALL_WEB_TEST_KINDS]
        if invalid:
            raise ValueError(f"Unsupported categories: {', '.join(invalid)}")
        return value

    @field_validator("virtual_users", "spawn_rate")
    @classmethod
    def validate_positive_numbers(cls, value: int) -> int:
        if value < 1:
            raise ValueError("value must be positive")
        return value


class WebTestProjectRead(WebTestProjectCreate):
    id: int
    created_at: datetime
    updated_at: datetime
    scaffold_path: str

    model_config = ConfigDict(from_attributes=True)


class WebTestRunRequest(BaseModel):
    categories: list[str] = Field(default_factory=list)

    @field_validator("categories")
    @classmethod
    def validate_categories(cls, value: list[str]) -> list[str]:
        invalid = [item for item in value if item not in ALL_WEB_TEST_KINDS]
        if invalid:
            raise ValueError(f"Unsupported categories: {', '.join(invalid)}")
        return value


class WebTestCategoryRunRead(BaseModel):
    id: int
    run_id: int
    category: str
    tool_name: str
    status: str
    command: str
    exit_code: int | None = None
    duration_ms: int | None = None
    output_excerpt: str | None = None
    report: dict[str, Any] = Field(default_factory=dict)
    executed_at: datetime

    model_config = ConfigDict(from_attributes=True)


class WebTestRunSummary(BaseModel):
    id: int
    project_id: int
    status: str
    triggered_by: str
    total_categories: int
    passed_categories: int
    failed_categories: int
    summary: str | None = None
    started_at: datetime
    finished_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


class WebTestRunRead(WebTestRunSummary):
    category_runs: list[WebTestCategoryRunRead] = Field(default_factory=list)


class WebTestProjectDetail(WebTestProjectRead):
    recent_runs: list[WebTestRunSummary] = Field(default_factory=list)


class WebScaffoldRead(BaseModel):
    project_id: int
    scaffold_path: str
    files: list[str]
