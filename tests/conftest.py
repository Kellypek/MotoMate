import pytest

from app import app
from database import initialize_database


@pytest.fixture
def client(tmp_path):
    test_database = tmp_path / "test_motomate.db"

    app.config["TESTING"] = True
    app.config["DATABASE_PATH"] = str(test_database)

    with app.app_context():
        initialize_database()

    with app.test_client() as test_client:
        yield test_client