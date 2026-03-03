import os
from pathlib import Path

import pytest


os.environ["DATABASE_URL"] = f"sqlite:///{Path(__file__).parent / 'test.db'}"
os.environ["AUTO_SEED_DEMO"] = "false"

from fastapi.testclient import TestClient

from app.database import Base, SessionLocal, engine
from app.main import app


@pytest.fixture(autouse=True)
def reset_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    with SessionLocal() as session:
        session.rollback()


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client
