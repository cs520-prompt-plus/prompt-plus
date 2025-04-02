import pytest
from fastapi.testclient import TestClient
from httpx import AsyncClient
from unittest.mock import AsyncMock, MagicMock, patch

from app.main import app
from app.types.response import ResponseCreate, ResponseComponentCreate, ResponseUpdate, ResponseComponentUpdate
from app.client import prisma_client

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture
def mock_prisma():
    with patch('app.main.prisma', new_callable=AsyncMock) as mock:
        mock.response = AsyncMock()
        mock.responsecomponent = AsyncMock()
        mock.connect = AsyncMock()
        mock.disconnect = AsyncMock()
        mock.is_connected = MagicMock(return_value=True)
        yield mock


# Test root endpoint
@pytest.mark.asyncio
async def test_root(client, mock_prisma):
    response = client.get("/")
    assert response.json() == {"message": "Your app is working!"}


@pytest.mark.asyncio
async def test_create_response(client, mock_prisma, sample_response_data):
    mock_prisma.response.create.return_value = {
        "response_id": "test-response-123",
        "user_id": "test-user-123",
        "input": "Test input",
        "output": "Test output",
        "created_at": "2025-03-29T12:00:00Z"
    }

    response = client.post("/api/v1/responses/", json=sample_response_data)

    assert response.json()["response_id"] == "test-response-123"
    assert response.json()["created_at"] == "2025-03-29T12:00:00Z"