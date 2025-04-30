from fastapi import Depends, FastAPI, HTTPException
from prisma import Prisma
from typing import List

from app.dependencies import use_logging
from app.middleware import LoggingMiddleware
from app.types.response import ResponseCreate, ResponseRead, UserRead, UserCreate, ResponseOutputUpdate, CategoryRead, CategoryPatternUpdate
from app.generation_pipeline import improve_prompt, apply_category
from app.client import prisma_client as prisma, connect_db, disconnect_db

app = FastAPI(prefix="/api/v1")
app.add_middleware(LoggingMiddleware, fastapi=app)

# prisma = Prisma(auto_register=True)

@app.get("/")
async def root(logger=Depends(use_logging)):
    logger.info("Handling your request")
    return {"message": "Your app is working!"}

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

# Response CRUD

# Endpoint to create Response
@app.post("/api/v1/responses/", response_model=ResponseRead)
async def create_response(response: ResponseCreate):
    # Call AI service to improve the prompt
    improvement = await improve_prompt(response.input)

    # 1. Create the Response first
    new_response = await prisma.response.create(
        data={
            "user_id": response.user_id,
            "input": response.input,
            "output": improvement["new_prompt"],
        }
    )

    # 2. Loop through each Category in the result
    for category_data in improvement["categories"]:
        # Create Category
        new_category = await prisma.category.create(
            data={
                "response_id": new_response.response_id,
                "category": category_data["name"],
                "input": improvement["original_prompt"],
                "preview": category_data["new_prompt"],
            }
        )

        # 3. Loop through each Pattern inside this Category
        for pattern_data in category_data.get("patterns", []):
            await prisma.pattern.create(
                data={
                    "category_id": new_category.category_id,
                    "pattern": pattern_data["name"],
                    "feedback": pattern_data.get("feedback", ""),
                    "applied": pattern_data.get("applied", False),
                }
            )

    # Fetch the full Response including Categories and Patterns
    full_response = await prisma.response.find_unique(
        where={"response_id": new_response.response_id},
        include={
            "categories": {
                "include": {
                    "patterns": True
                }
            }
        }
    )

    return full_response

# Endpoint to update final Response output, to be called after finalized editing.
@app.put("/api/v1/responses/{response_id}/output", response_model=ResponseRead)
async def update_response_output(response_id: str, output_update: ResponseOutputUpdate):
    # Check if response exists
    existing_response = await prisma.response.find_unique(where={"response_id": response_id})
    if not existing_response:
        raise HTTPException(status_code=404, detail="Response not found")

    # Update only the output field
    updated_response = await prisma.response.update(
        where={"response_id": response_id},
        data={"output": output_update.output},
        include={
            "categories": {
                "include": {
                    "patterns": True
                }
            }
        }
    )
    return updated_response

#endpoint for updating active patterns for cateogry
@app.put("/api/v1/categories/{category_id}/patterns", response_model=CategoryRead)
async def update_category_patterns(category_id: str, update_data: CategoryPatternUpdate):
    #get active patterns for current category
    category = await prisma.category.find_unique(
        where={"category_id": category_id},
        include={"patterns": True, "response": True}
    )
    #no active patterns, return error
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    #apply changes from user selection
    for pattern_update in update_data.patterns:
        await prisma.pattern.update(
            where={"pattern_id": pattern_update.pattern_id},
            data={"applied": pattern_update.applied}
        )

    #get all active patterns
    updated_patterns = await prisma.pattern.find_many(
        where={"category_id": category_id, "applied": True}
    )

    new_preview = await apply_category(
        original_prompt=category.input,
        patterns=[pattern.pattern for pattern in updated_patterns]
    )

    updated_category = await prisma.category.update(
        where={"category_id": category_id},
        data={"preview": new_preview},
        include={"patterns": True}
    )

    return updated_category

@app.on_event("startup")
async def startup() -> None:
    await prisma.connect()

@app.on_event("shutdown")
async def shutdown() -> None:
    if prisma.is_connected():
        await prisma.disconnect()

