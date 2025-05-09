import pytest
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, MagicMock, patch

from app.main import app
from app.middleware.auth import AuthMiddleware

# ===========================
# Mock Auth Middleware
# ===========================

# Override AuthMiddleware dispatch to inject a mock user ID for all tests
async def _dummy_dispatch(self, request, call_next):
    request.state.userId = "test-user-123"
    return await call_next(request)

# Apply the mocked dispatch globally for tests
AuthMiddleware.dispatch = _dummy_dispatch

# ===========================
# FastAPI Test Client Fixture
# ===========================

@pytest.fixture
def client():
    """
    Provides a FastAPI test client for endpoint testing.
    """
    return TestClient(app)

# ===========================
# Prisma Client Mock Fixture
# ===========================

@pytest.fixture
def prisma_mock():
    """
    Provides a mocked Prisma client with async support.
    Used to stub out DB calls during endpoint testing.
    """
    with patch("app.main.prisma", new_callable=AsyncMock) as mock:
        # Mock submodules (tables/relations)
        mock.response = AsyncMock()
        mock.category = AsyncMock()
        mock.pattern = AsyncMock()
        mock.user = AsyncMock()

        # Mock lifecycle methods
        mock.connect = AsyncMock()
        mock.disconnect = AsyncMock()
        mock.is_connected = MagicMock(return_value=True)

        yield mock
