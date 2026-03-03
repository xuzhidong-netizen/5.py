from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field, field_validator


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
    pass_rate: float
    recent_runs: list[RunSummary]
