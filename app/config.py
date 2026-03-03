from functools import lru_cache
from pathlib import Path
import os

from pydantic import BaseModel


class Settings(BaseModel):
    app_name: str = "自动化测试平台"
    database_url: str = "sqlite:///./autotest.db"
    auto_seed_demo: bool = True
    request_timeout_seconds: int = 15
    static_dir: Path = Path(__file__).parent / "static"
    cors_origins: list[str] = [
        "http://127.0.0.1:8000",
        "http://localhost:8000",
        "https://xuzhidong-netizen.github.io",
    ]


@lru_cache
def get_settings() -> Settings:
    return Settings(
        database_url=os.getenv("DATABASE_URL", "sqlite:///./autotest.db"),
        auto_seed_demo=os.getenv("AUTO_SEED_DEMO", "true").lower() == "true",
        request_timeout_seconds=int(os.getenv("REQUEST_TIMEOUT_SECONDS", "15")),
        cors_origins=[
            item.strip()
            for item in os.getenv(
                "CORS_ORIGINS",
                "http://127.0.0.1:8000,http://localhost:8000,https://xuzhidong-netizen.github.io",
            ).split(",")
            if item.strip()
        ],
    )
