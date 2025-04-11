from fastapi import Depends, FastAPI, HTTPException
from prisma import Prisma
from typing import List

from app.dependencies import use_logging
from app.middleware import LoggingMiddleware
from app.types.response import ResponseCreate, ResponseRead, ResponseComponentCreate, ResponseComponentRead, ResponseComponentUpdate, ResponseUpdate, UserRead, UserCreate, UserUpdate
from app.generation_pipeline import generate_response
from app.client import prisma_client as prisma, connect_db, disconnect_db

app = FastAPI(prefix="/api/v1")
app.add_middleware(LoggingMiddleware, fastapi=app)

# prisma = Prisma(auto_register=True)

@app.get("/")
async def root(logger=Depends(use_logging)):
    logger.info("Handling your request")
    return {"message": "Your app is working!"}


# Response CRUD

# Endpoint to create Response
@app.post("/api/v1/responses/", response_model=ResponseRead)
async def create_response(response: ResponseCreate):
    new_response = await prisma.response.create(
        data={
            "user_id": response.user_id,
            "input": response.input,
            "output": await generate_response(response.input),
        }
    )
    return new_response

# Endpoint to retrieve a Response via response_id
@app.get("/api/v1/responses/{response_id}", response_model=ResponseRead)
async def get_response(response_id: str):
    response = await prisma.response.find_unique(where={"response_id": response_id})
    if not response:
        raise HTTPException(status_code=404, detail="Response not found")
    return response

# Endpoint to retrieve Responses via user_id
@app.get("/api/v1/responses/user/{user_id}", response_model=List[ResponseRead])
async def get_responses_by_user(user_id: str):
    responses = await prisma.response.find_many(where={"user_id": user_id})
    return responses

# Endpoint to update a Response via response_id
@app.put("/api/v1/responses/{response_id}", response_model=ResponseRead)
async def update_response(response_id: str, response: ResponseUpdate):
    existing_response = await prisma.response.find_unique(where={"response_id": response_id})
    if not existing_response:
        raise HTTPException(status_code=404, detail="Response not found")
    
    updated_response = await prisma.response.update(
        where={"response_id": response_id},
        data={
            "input": response.input,
            "output": response.output,
        }
    )
    return updated_response

# Endpoint to delete a Response via response_id
@app.delete("/api/v1/responses/{response_id}")
async def delete_response(response_id: str):
    response = await prisma.response.find_unique(where={"response_id": response_id})
    if not response:
        raise HTTPException(status_code=404, detail="Response not found")
    
    await prisma.response.delete(where={"response_id": response_id})
    return {"message": "Response deleted successfully"}


# ResponseComponent CRUD

# Endpoint to create a ResponseComponent
@app.post("/api/v1/response-components/", response_model=ResponseComponentRead)
async def create_response_component(response_component: ResponseComponentCreate):
    new_component = await prisma.responsecomponent.create(
        data={
            "user_id" :response_component.user_id,
            "response_id": response_component.response_id,
            "subject": response_component.subject,
            "input": response_component.input,
            "output": response_component.output,
        }
    )
    return new_component

# Endpoint to bulk create ResponseComponents
@app.post("/api/v1/response-components/bulk", response_model=List[ResponseComponentRead])
async def bulk_create_response_components(response_components: List[ResponseComponentCreate]):
    components = await prisma.responsecomponent.create_many(
        data=[{
            "user_id" : component.user_id,
            "response_id": component.response_id,
            "subject": component.subject,
            "input": component.input,
            "output": component.output
        } for component in response_components]
    )
    created_ids = [component.response_id for component in response_components]
    stored_components = await prisma.responsecomponent.find_many(
        where={"response_id": {"in": created_ids}}
    )
    return stored_components

# Endpoint to retrieve ResponseComponents via response_id
@app.get("/api/v1/response-components/response/{response_id}", response_model=List[ResponseComponentRead])
async def get_response_components_by_response_id(response_id: str):
    components = await prisma.responsecomponent.find_many(where={"response_id": response_id})
    return components

# Endpoint to retrieve a ResponseComponent via component_id
@app.get("/api/v1/response-components/{component_id}", response_model=ResponseComponentRead)
async def get_response_component(component_id: str):
    component = await prisma.responsecomponent.find_unique(where={"component_id": component_id})
    if not component:
        raise HTTPException(status_code=404, detail="ResponseComponent not found")
    return component

# Endpoint to update a ResponseComponent via component_id
@app.put("/api/v1/response-components/{component_id}", response_model=ResponseComponentRead)
async def update_response_component(component_id: str, response_component: ResponseComponentUpdate):
    existing_component = await prisma.responsecomponent.find_unique(where={"component_id": component_id})
    if not existing_component:
        raise HTTPException(status_code=404, detail="ResponseComponent not found")
    
    updated_component = await prisma.responsecomponent.update(
        where={"component_id": component_id},
        data={
            "subject": response_component.subject,
            "input": response_component.input,
            "output": response_component.output,
        }
    )
    return updated_component

# Endpoint to delete a ResponseComponent via component_id
@app.delete("/api/v1/response-components/{component_id}")
async def delete_response_component(component_id: str):
    component = await prisma.responsecomponent.find_unique(where={"component_id": component_id})
    if not component:
        raise HTTPException(status_code=404, detail="ResponseComponent not found")
    
    await prisma.responsecomponent.delete(where={"component_id": component_id})
    return {"message": "ResponseComponent deleted successfully"}


# User CRUD

# Endpoint to create a User
@app.post("/api/v1/users/", response_model=UserRead)
async def create_user(user: UserCreate):
    new_user = await prisma.user.create(
        data={
            "name": user.name,
            "email": user.email,
            "password": user.password,
        }
    )
    return new_user

# Endpoint to retrieve all Users
@app.get("/api/v1/users/", response_model=List[UserRead])
async def get_all_users():
    users = await prisma.user.find_many()
    return users

# Endpoint to retrieve a User by user_id
@app.get("/api/v1/users/{user_id}", response_model=UserRead)
async def get_user(user_id: str):
    user = await prisma.user.find_unique(where={"user_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# Endpoint to update a User by user_id
@app.put("/api/v1/users/{user_id}", response_model=UserRead)
async def update_user(user_id: str, user: UserUpdate):
    existing_user = await prisma.user.find_unique(where={"user_id": user_id})
    if not existing_user:
        raise HTTPException(status_code=404, detail="User not found")

    updated_user = await prisma.user.update(
        where={"user_id": user_id},
        data=user.dict(exclude_unset=True)
    )
    return updated_user

# Endpoint to delete a User by user_id
@app.delete("/api/v1/users/{user_id}")
async def delete_user(user_id: str):
    user = await prisma.user.find_unique(where={"user_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    await prisma.user.delete(where={"user_id": user_id})
    return {"message": "User deleted successfully"}


@app.on_event("startup")
async def startup() -> None:
    await prisma.connect()

@app.on_event("shutdown")
async def shutdown() -> None:
    if prisma.is_connected():
        await prisma.disconnect()

