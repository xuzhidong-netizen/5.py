import os
from pathlib import Path
import shutil

import pytest


os.environ["DATABASE_URL"] = f"sqlite:///{Path(__file__).parent / 'test.db'}"
os.environ["AUTO_SEED_DEMO"] = "false"
os.environ["GENERATED_ROOT"] = str(Path(__file__).parent.parent / ".generated-tests")

from fastapi.testclient import TestClient

from app.database import Base, SessionLocal, engine
from app.main import app


@pytest.fixture(autouse=True)
def reset_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    generated_root = Path(os.environ["GENERATED_ROOT"])
    legacy_generated_root = Path(__file__).parent / "generated"
    if generated_root.exists():
        shutil.rmtree(generated_root)
    if legacy_generated_root.exists():
        shutil.rmtree(legacy_generated_root)
    yield
    with SessionLocal() as session:
        session.rollback()


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client
