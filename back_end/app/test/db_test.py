import pytest
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, MagicMock, patch

from app.main import app

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture
def prisma_mock():
    with patch('app.main.prisma', new_callable=AsyncMock) as mock:
        mock.response = AsyncMock()
        mock.responsecomponent = AsyncMock()
        mock.connect = AsyncMock()
        mock.disconnect = AsyncMock()
        mock.is_connected = MagicMock(return_value=True)
        yield mock


#Test root endpoint
@pytest.mark.asyncio
async def test_root(client):
    response = client.get("/")
    assert response.json() == {"message": "Your app is working!"}


#Test create response and correct prisma interaction
@pytest.mark.asyncio
async def test_create_response(client, prisma_mock):    
    #Expected response
    test_response = {
        "response_id": "test-create-1",
        "user_id": "test-user-1",
        "input": "Test create input",
        "output": "Test create output",
        "created_at": "2025-04-01T12:00:00Z"
    }

    prisma_mock.response.create.return_value = test_response
    
    #Make post
    response = client.post("/api/v1/responses/", json= test_response)

    assert response.json()["input"] == "Test create input"
    assert response.json()["output"] == "Test create output"
    assert response.json() == test_response

    prisma_mock.response.create.assert_called_once_with(
        data={
            "user_id": test_response["user_id"],
            "input": test_response["input"],
            "output": test_response["output"]
        }
    )

#Test get and create synchronization
@pytest.mark.asyncio
async def test_get_response(client, prisma_mock):    
    #Expected response
    test_response = {
        "response_id": "test-get-1",
        "user_id": "test-user-2",
        "input": "Test get input",
        "output": "Test get output",
        "created_at": "2025-04-01T12:00:00Z"
    }
    
    prisma_mock.response.create.return_value = test_response
    prisma_mock.response.find_unique.return_value = test_response
    
    #Post test response
    post_data = {
        "user_id": test_response["user_id"],
        "input": test_response["input"],
        "output": test_response["output"]
    }
    post_response = client.post("/api/v1/responses/", json=post_data)
    
    #Check post
    assert post_response.json() == test_response
    
    #Check from prisma
    prisma_mock.response.create.assert_called_once_with(
        data=post_data
    )
    
    #Get data with response id
    get_response = client.get(f"/api/v1/responses/test-get-1")
    assert get_response.json() == test_response

    #Check from prisma
    prisma_mock.response.find_unique.assert_called_once_with(
        where={"response_id": test_response["response_id"]}
    )

#Test update
@pytest.mark.asyncio
async def test_update_response(client, prisma_mock):    
    #Expected response
    test_response = {
        "response_id": "test-update-1",
        "user_id": "test-user-3",
        "input": "Initial input",
        "output": "Initial output",
        "created_at": "2025-04-01T12:00:00Z"
    }
    
    #Updated response data
    updated_test_response = {
        "response_id": "test-update-1",
        "user_id": "test-user-3",
        "input": "Updated input",
        "output": "Updated output",
        "created_at": "2025-04-01T12:00:00Z"
    }
    
    prisma_mock.response.create.return_value = test_response
    prisma_mock.response.find_unique.return_value = test_response
    prisma_mock.response.update.return_value = updated_test_response
    
    post_data = {
        "user_id": test_response["user_id"],
        "input": test_response["input"],
        "output": test_response["output"]
    }
    #Create initial post
    post_response = client.post("/api/v1/responses/", json=post_data)
    assert post_response.json() == test_response
    
    #Check prisma
    prisma_mock.response.create.assert_called_once_with(data=post_data)
    
    get_response = client.get(f"/api/v1/responses/test-update-1")
    assert get_response.json() == test_response
    
    prisma_mock.response.find_unique.assert_called_once_with(where={"response_id": test_response["response_id"]})
    
    update_data = {
        "input": "Updated input",
        "output": "Updated output"
    }
    
    prisma_mock.response.find_unique.return_value = updated_test_response
    
    #Update data
    update_response = client.put("/api/v1/responses/test-update-1", json=update_data)
    assert update_response.json() == updated_test_response
    
    prisma_mock.response.update.assert_called_once_with(where={"response_id": test_response["response_id"]}, data=update_data)
    
    #Verify updated data
    get_updated_response = client.get(f"/api/v1/responses/test-update-1")
    assert get_updated_response.json() == updated_test_response

@pytest.mark.asyncio
async def test_delete_response(client, prisma_mock):    
    test_response = {
        "response_id": "test-delete-1",
        "user_id": "test-user-4",
        "input": "Delete test input",
        "output": "Delete test output",
        "created_at": "2025-04-01T12:00:00Z"
    }
    
    prisma_mock.response.create.return_value = test_response
    prisma_mock.response.find_unique.return_value = test_response
    prisma_mock.response.delete.return_value = {"message": "Response deleted successfully"}
 
    post_data = {
        "user_id": test_response["user_id"],
        "input": test_response["input"],
        "output": test_response["output"]
    }

    #Check post
    post_response = client.post("/api/v1/responses/", json=post_data)
    assert post_response.json() == test_response
    
    #Delete post
    delete_response = client.delete("/api/v1/responses/test-delete-1")
    assert delete_response.json() == {"message": "Response deleted successfully"}
    
    #Ensure delete with prisma mock
    prisma_mock.response.delete.assert_called_once_with(where={"response_id": test_response["response_id"]})
    
    prisma_mock.response.find_unique.return_value = None
    get_deleted_response = client.get(f"/api/v1/responses/test-delete-1")
    assert get_deleted_response.status_code == 404

#sample user for all tests
@pytest.fixture
def test_user(): 
    return {
        "user_id": "user1",
        "name": "test user",
        "email": "user1@etc.com",
        "password": "Pass"
    }

# Create new user

def test_create_user(client, prisma_mock, test_user):   
    test_user_create = {
        "name": "test user",
        "email": "user1@etc.com",
        "password": "Pass"
    }
    prisma_mock.user.create.return_value = test_user
    response = client.post("/api/v1/users/", json= test_user_create)
    assert response.json()["user_id"] == test_user["user_id"]
    prisma_mock.user.create.assert_called_once_with(data=test_user_create)

#Get all users from database
def test_get_all_users(client, prisma_mock, test_user):
    prisma_mock.user.find_many.return_value = [test_user]
    response = client.get("/api/v1/users/")
    assert len(response.json()) == 1
    assert response.json()[0]["email"] == test_user["email"]

#Get specific user
def test_get_user_by_id(client, prisma_mock, test_user):
    prisma_mock.user.find_unique.return_value = test_user
    response = client.get(f"/api/v1/users/{test_user['user_id']}")
    assert response.json()["user_id"] == test_user["user_id"]

#Get non-existent user (exceptional behavior)
def test_get_user_by_id_not_found(client, prisma_mock):
    prisma_mock.user.find_unique.return_value = None
    response = client.get("/api/v1/users/none_test")
    assert response.status_code == 404
    assert response.json()["detail"] == "User not found"

#Modify existing user
def test_update_user(client, prisma_mock, test_user):
    updated_user = test_user.copy()
    updated_user["name"] = "Update from test"

    prisma_mock.user.find_unique.return_value = test_user
    prisma_mock.user.update.return_value = updated_user
    response = client.put(f"/api/v1/users/user1", json={"name": "Update from test"})
    assert response.json()["name"] == "Update from test"

#Modify non-existent user (exceptional behavior)
def test_update_user_not_found(client, prisma_mock):
    prisma_mock.user.find_unique.return_value = None

    response = client.put("/api/v1/users/none_test", json={"name": "Update from test"})
    assert response.status_code == 404
    assert response.json()["detail"] == "User not found"

#Delete a user
def test_delete_user(client, prisma_mock, test_user):
    prisma_mock.user.find_unique.return_value = test_user
    prisma_mock.user.delete.return_value = None

    response = client.delete(f"/api/v1/users/user1")
    assert response.status_code == 200
    assert response.json()["message"] == "User deleted successfully"

#Delete non-existent user (exceptional behavior)
def test_delete_user_not_found(client, prisma_mock):
    prisma_mock.user.find_unique.return_value = None

    response = client.delete("/api/v1/users/none_test")
    assert response.status_code == 404
    assert response.json()["detail"] == "User not found"
