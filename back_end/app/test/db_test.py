import pytest
from prisma import Prisma
from dotenv import load_dotenv
import httpx
from fastapi import FastAPI
from fastapi.testclient import TestClient
from app.main import app

prisma = Prisma(auto_register=True)
app = FastAPI()
client = TestClient(app)

@pytest.mark.asyncio
async def test_create_response():
    response = await prisma.response.create(
        data={
            "user_id": "test_user",
            "input": "Prompt",
            "output": "PromptPlus!",
        }
    )
    assert response.response_id is not None
    assert response.user_id == "test_user"
    assert response.input == "Prompt"
    assert response.output == "PromptPlus!"

@pytest.mark.asyncio
async def test_create_response(test_db):
    response = client.post("/api/v1/responses/", json=TEST_RESPONSE)
    assert response.status_code == 200
    data = response.json()
    assert data["user_id"] == TEST_RESPONSE["user_id"]
    assert data["input"] == TEST_RESPONSE["input"]
    assert data["output"] == TEST_RESPONSE["output"]
    assert "response_id" in data