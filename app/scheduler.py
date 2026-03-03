from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger
from sqlalchemy.orm import Session

from app.database import session_scope
from app.execution.http_runner import execute_suite_run
from app.models import Schedule


class ScheduleManager:
    def __init__(self) -> None:
        self.scheduler = AsyncIOScheduler()

    def start(self) -> None:
        if not self.scheduler.running:
            self.scheduler.start()

    def shutdown(self) -> None:
        if self.scheduler.running:
            self.scheduler.shutdown(wait=False)

    def sync_all(self, session: Session) -> None:
        schedules = session.query(Schedule).all()
        existing_ids = {job.id for job in self.scheduler.get_jobs()}
        expected_ids = set()

        for schedule in schedules:
            job_id = self._job_id(schedule.id)
            expected_ids.add(job_id)
            self._sync_schedule(schedule)

        for job_id in existing_ids - expected_ids:
            self.scheduler.remove_job(job_id)

    def sync_one(self, schedule: Schedule) -> None:
        self._sync_schedule(schedule)

    def _sync_schedule(self, schedule: Schedule) -> None:
        job_id = self._job_id(schedule.id)
        if not schedule.enabled:
            if self.scheduler.get_job(job_id):
                self.scheduler.remove_job(job_id)
            return

        trigger = self._build_trigger(schedule)
        self.scheduler.add_job(
            self._run_scheduled_suite,
            trigger=trigger,
            id=job_id,
            replace_existing=True,
            kwargs={"schedule_id": schedule.id, "suite_id": schedule.suite_id},
        )

    @staticmethod
    def _job_id(schedule_id: int) -> str:
        return f"schedule-{schedule_id}"

    @staticmethod
    def _build_trigger(schedule: Schedule):
        if schedule.trigger_type == "interval":
            minutes = schedule.interval_minutes or 1
            return IntervalTrigger(minutes=minutes)
        if schedule.trigger_type == "cron":
            if not schedule.cron_expression:
                raise ValueError("cron_expression is required for cron trigger")
            fields = schedule.cron_expression.split()
            if len(fields) != 5:
                raise ValueError("cron_expression must contain 5 fields")
            minute, hour, day, month, day_of_week = fields
            return CronTrigger(
                minute=minute,
                hour=hour,
                day=day,
                month=month,
                day_of_week=day_of_week,
            )
        raise ValueError(f"Unsupported trigger_type: {schedule.trigger_type}")

    @staticmethod
    async def _run_scheduled_suite(schedule_id: int, suite_id: int) -> None:
        with session_scope() as session:
            await execute_suite_run(
                session=session,
                suite_id=suite_id,
                triggered_by=f"scheduler:{schedule_id}",
                schedule_id=schedule_id,
            )


schedule_manager = ScheduleManager()
