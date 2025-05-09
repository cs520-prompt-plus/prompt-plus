import pytest
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, MagicMock, patch

from app.main import app
from app.middleware.auth import AuthMiddleware

async def _dummy_dispatch(self, request, call_next):
    request.state.userId = "test-user-123"
    return await call_next(request)

AuthMiddleware.dispatch = _dummy_dispatch

@pytest.fixture
def client():
    return TestClient(app)

#make a mock client
@pytest.fixture
def prisma_mock():
    with patch("app.main.prisma", new_callable=AsyncMock) as mock:
        mock.response = AsyncMock()
        mock.category = AsyncMock()
        mock.pattern = AsyncMock()
        mock.user = AsyncMock()
        mock.connect = AsyncMock()
        mock.disconnect = AsyncMock()
        mock.is_connected = MagicMock(return_value=True)
        yield mock
