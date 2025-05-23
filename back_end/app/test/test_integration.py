import pytest
from fastapi.testclient import TestClient
from datetime import datetime
from types import SimpleNamespace
from unittest.mock import AsyncMock

from app.main import app
from app.types.response import ResponseRead, CategoryRead, PatternRead

# ===========================
# Auto-used Fixture:
# - Disables AuthMiddleware
# - Stubs out Langchain pipeline calls
# ===========================

@pytest.fixture(autouse=True)
def disable_auth_and_stub_pipeline(monkeypatch):
    # Bypass AuthMiddleware by injecting a static userId
    from app.middleware.auth import AuthMiddleware
    async def dummy_dispatch(self, request, call_next):
        request.state.userId = "test-user-123"
        return await call_next(request)
    monkeypatch.setattr(AuthMiddleware, "dispatch", dummy_dispatch)

    # Stub the generation pipeline functions to prevent LLM calls
    async def stub_improve_prompt(user_input):
        return {"input": user_input, "categories": [], "output": user_input}

    async def stub_apply_category(user_input, category, force_patterns=None):
        return {"preview": f"{user_input}-preview", "patterns": []}

    async def stub_merge_prompts(previews):
        return previews[0] if previews else ""

    import app.generation_pipeline as gp
    monkeypatch.setattr(gp, "improve_prompt", stub_improve_prompt)
    monkeypatch.setattr(gp, "apply_category", stub_apply_category)
    monkeypatch.setattr(gp, "merge_prompts", stub_merge_prompts)

    import app.main as main_mod
    monkeypatch.setattr(main_mod, "improve_prompt", stub_improve_prompt)
    monkeypatch.setattr(main_mod, "apply_category", stub_apply_category)
    monkeypatch.setattr(main_mod, "merge_prompts", stub_merge_prompts)

# ===========================
# Prisma Mock Fixture
# ===========================

@pytest.fixture
def prisma_mock(monkeypatch):
    """
    Mock the Prisma client and all its modules (response, category, pattern, user).
    """
    mock = SimpleNamespace(
        connect=AsyncMock(),
        disconnect=AsyncMock(),
        is_connected=lambda: True,
        response=SimpleNamespace(
            create=AsyncMock(),
            find_unique=AsyncMock(),
        ),
        category=SimpleNamespace(
            find_unique=AsyncMock(),
            update=AsyncMock(),
        ),
        pattern=SimpleNamespace(
            find_many=AsyncMock(),
            update=AsyncMock(),
        ),
        user=SimpleNamespace(
            create=AsyncMock(),
            find_many=AsyncMock(),
            find_unique=AsyncMock(),
            update=AsyncMock(),
            delete=AsyncMock(),
        ),
    )
    monkeypatch.setattr("app.main.prisma", mock)
    return mock

# ===========================
# FastAPI Test Client Fixture
# ===========================

@pytest.fixture
def client():
    return TestClient(app)

# ===========================
# Test: Create + Get Response
# ===========================

def test_create_and_read_response(client, prisma_mock):
    """
    Verify the flow for creating a response and fetching it by ID.
    """
    # Mock response returned from DB
    response_obj = ResponseRead(
        response_id="r1",
        user_id="test-user-123",
        input="hello",
        output="hello",
        created_at=datetime.utcnow(),
        categories=[]
    )
    prisma_mock.response.create.return_value = response_obj
    prisma_mock.response.find_unique.return_value = response_obj

    # POST: Create response
    r = client.post("/api/v1/responses/", json={"input": "hello"})
    assert r.status_code == 200
    body = r.json()
    assert body["response_id"] == "r1"

    # GET: Retrieve the same response
    r2 = client.get("/api/v1/responses/r1")
    assert r2.status_code == 200
    assert r2.json() == body

# ===========================
# Test: Update Category Patterns
# ===========================

def test_update_category_patterns(client, prisma_mock):
    """
    Test updating the applied state of patterns and regenerating preview.
    """
    # Original pattern and category object
    pattern_obj = PatternRead(
        pattern_id="p1", pattern="pat", feedback="f", applied=False
    )
    existing = CategoryRead(
        category_id="c1", category="X", input="orig", preview="old", patterns=[pattern_obj]
    )

    # Expected updated category (after patch)
    updated = CategoryRead(
        category_id="c1", category="X", input="orig", preview="new-preview",
        patterns=[PatternRead(
            pattern_id="p1", pattern="pat", feedback="f", applied=True
        )]
    )

    # Setup mock returns
    prisma_mock.category.find_unique.return_value = existing
    prisma_mock.pattern.find_many.return_value = [pattern_obj]
    prisma_mock.pattern.update.return_value = None
    prisma_mock.category.update.return_value = updated

    # PUT: Update pattern applied state
    res = client.put(
        "/api/v1/categories/c1/patterns",
        json={"patterns": [{"pattern_id": "p1", "applied": True}]},
    )

    assert res.status_code == 200
    out = res.json()
    assert out["preview"] == "new-preview"
    assert out["patterns"][0]["applied"] is True
