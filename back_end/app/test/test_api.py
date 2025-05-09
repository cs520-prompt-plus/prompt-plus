import pytest
from fastapi import HTTPException

# The `client` and `prisma_mock` fixtures come from conftest.py

@pytest.mark.asyncio
async def test_root(client):
    r = client.get("/")
    assert r.status_code == 200
    assert r.json() == {"message": "Your app is working!"}

# def test_create_user(client, prisma_mock):
#     sample = {"name":"Alice","email":"a@x.com","password":"pw"}
#     created = {"user_id":"u1",**sample}
#     prisma_mock.user.create.return_value = created

#     r = client.post("/api/v1/users/", json=sample)
#     assert r.status_code == 200
#     assert r.json() == created
#     prisma_mock.user.create.assert_called_once_with(data=sample)

# def test_get_all_users(client, prisma_mock):
#     user = {"user_id":"u1","name":"A","email":"a@x.com"}
#     prisma_mock.user.find_many.return_value = [user]

#     r = client.get("/api/v1/users/")
#     assert r.status_code == 200
#     assert r.json() == [user]

# def test_get_user_not_found(client, prisma_mock):
#     prisma_mock.user.find_unique.return_value = None
#     r = client.get("/api/v1/users/nonexistent")
#     assert r.status_code == 404
#     assert r.json()["detail"] == "User not found"

# def test_update_user(client, prisma_mock):
#     orig = {"user_id":"u1","name":"A","email":"a@x.com"}
#     updated = {**orig,"name":"B"}
#     prisma_mock.user.find_unique.return_value = orig
#     prisma_mock.user.update.return_value = updated

#     r = client.put("/api/v1/users/u1", json={"name":"B"})
#     assert r.status_code == 200
#     assert r.json()["name"] == "B"

# def test_delete_user(client, prisma_mock):
#     user = {"user_id":"u1","name":"A","email":"a@x.com"}
#     prisma_mock.user.find_unique.return_value = user
#     prisma_mock.user.delete.return_value = None

#     r = client.delete("/api/v1/users/u1")
#     assert r.status_code == 200
#     assert r.json()["message"] == "User deleted successfully"

#     # subsequent GET yields 404
#     prisma_mock.user.find_unique.return_value = None
#     r2 = client.get("/api/v1/users/u1")
#     assert r2.status_code == 404
