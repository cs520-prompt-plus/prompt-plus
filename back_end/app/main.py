# ============================
# Imports and Setup
# ============================

from fastapi import Depends, FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from prisma import Prisma
from typing import List
import traceback
import time
import logging

from app.dependencies import use_logging
from app.middleware import LoggingMiddleware, AuthMiddleware
from app.types.response import (
    ResponseCreate, ResponseRead, UserRead, UserCreate,
    ResponseOutputUpdate, CategoryRead, CategoryPatternUpdate,
    MergePreviewPrompts
)
from app.generation_pipeline import improve_prompt, apply_category, merge_prompts
from app.client import prisma_client as prisma

# Initialize FastAPI app and set logging level
logging.basicConfig(level=logging.ERROR)
app = FastAPI()

# Priority sorting logic for category display
category_priority = {
    "Input Semantics": 0,
    "Output Customization": 1,
    "Error Identification": 2,
    "Prompt Improvement": 3,
    "Interaction": 4,
    "Context Control": 5,
}

# ============================
# Exception Handling
# ============================

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """
    Custom exception handler for request validation errors.
    Logs the payload and error details for debugging.
    """
    try:
        body = await request.json()
    except Exception:
        body = "<could not parse body>"

    logging.error(f"""
❌ 422 Validation error on POST {request.url.path}
    → Payload: {body!r}
    → Errors: {exc.errors()}
""")

    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors()}
    )

# ============================
# Middleware Setup
# ============================

app.add_middleware(LoggingMiddleware, fastapi=app)
app.add_middleware(AuthMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================
# Basic Health Check
# ============================

@app.get("/")
async def root(request: Request, logger=Depends(use_logging)):
    logger.info("Handling your request")
    return {"message": "Your app is working!"}

@app.post("/api/v1/health")
async def health_check(request: Request):
    print("Health check endpoint called")
    return JSONResponse(content={"status": "ok"}, status_code=200)

# ============================
# User Management
# ============================

@app.post("/api/v1/users/", response_model=UserRead)
async def create_user(request: Request, user: UserCreate):
    """
    Creates a new user record in the database.
    """
    new_user = await prisma.user.create(
        data={
            "name": user.name,
            "email": user.email,
            "password": user.password,
        }
    )
    return new_user

# ============================
# Response CRUD
# ============================

@app.get("/api/v1/responses/{response_id}", response_model=ResponseRead)
async def get_response_by_id(request: Request, response_id: str):
    """
    Retrieve a specific response by its ID, including its categories and patterns.
    """
    response = await prisma.response.find_unique(
        where={"response_id": response_id},
        include={"categories": {"include": {"patterns": True}}}
    )

    if not response:
        raise HTTPException(status_code=404, detail="Response not found")

    # Sort categories and patterns
    response.categories.sort(key=lambda c: category_priority.get(c.category, float('inf')))
    for category in response.categories:
        category.patterns.sort(key=lambda p: p.pattern.lower())

    return response

@app.delete("/api/v1/responses/{response_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_response_by_id(request: Request, response_id: str):
    """
    Delete a response and all its related data.
    """
    existing = await prisma.response.find_unique(where={"response_id": response_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Response not found")

    await prisma.response.delete(where={"response_id": response_id})
    return  # 204 No Content

@app.get("/api/v1/responses/", response_model=List[ResponseRead])
async def get_all_responses(request: Request):
    """
    Get all responses belonging to the authenticated user.
    """
    responses = await prisma.response.find_many(
        where={"user_id": request.state.userId},
        include={"categories": {"include": {"patterns": True}}}
    )

    # Sort each response's categories and patterns
    for response in responses:
        response.categories.sort(key=lambda c: category_priority.get(c.category, float('inf')))
        for category in response.categories:
            category.patterns.sort(key=lambda p: p.pattern.lower())

    return responses

@app.post("/api/v1/responses/", response_model=ResponseRead)
async def create_response(request: Request, response: ResponseCreate):
    """
    Generate a new response using the prompt improvement pipeline,
    store it along with associated categories and patterns.
    """
    print("Creating response...")
    start = time.time()
    user_id = request.state.userId

    try:
        print("📥 Received input:", response.input)
        start_ai = time.time()
        improvement = await improve_prompt(response.input)
        print(f"🧠 AI call took {time.time() - start_ai:.2f}s")

        # Store response
        new_response = await prisma.response.create(
            data={
                "user_id": user_id,
                "input": response.input,
                "output": improvement["output"],
            }
        )

        # Store associated categories and patterns
        for category_data in improvement["categories"]:
            new_category = await prisma.category.create(
                data={
                    "response_id": new_response.response_id,
                    "category": category_data["category"],
                    "input": improvement["input"],
                    "preview": category_data["preview"],
                }
            )

            for pattern_data in category_data.get("patterns", []):
                await prisma.pattern.create(
                    data={
                        "category_id": new_category.category_id,
                        "pattern": pattern_data["pattern"],
                        "feedback": pattern_data.get("feedback", ""),
                        "applied": pattern_data.get("applied", False),
                    }
                )

        # Fetch full response including nested data
        full_response = await prisma.response.find_unique(
            where={"response_id": new_response.response_id},
            include={"categories": {"include": {"patterns": True}}}
        )

        # Sort categories and patterns
        full_response.categories.sort(key=lambda c: category_priority.get(c.category, float('inf')))
        for category in full_response.categories:
            category.patterns.sort(key=lambda p: p.pattern.lower())

        print(f"✅ Done in {time.time() - start:.2f}s")
        return full_response

    except Exception as e:
        print("❌ Error in create_response:", str(e))
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Something went wrong while processing your request.")

# ============================
# Response Updates
# ============================

@app.put("/api/v1/responses/merge/{response_id}", response_model=ResponseRead)
async def merge_and_update_response(request: Request, response_id: str, previews_input: MergePreviewPrompts):
    """
    Merge preview prompts and update the main output for a response.
    """
    existing_response = await prisma.response.find_unique(where={"response_id": response_id})
    if not existing_response:
        raise HTTPException(status_code=404, detail="Response not found")

    merged_prompt = await merge_prompts(previews_input.previews)

    updated_response = await prisma.response.update(
        where={"response_id": response_id},
        data={"output": merged_prompt},
        include={"categories": {"include": {"patterns": True}}}
    )

    # Sort after update
    updated_response.categories.sort(key=lambda c: category_priority.get(c.category, float('inf')))
    for category in updated_response.categories:
        category.patterns.sort(key=lambda p: p.pattern.lower())

    return updated_response

@app.put("/api/v1/responses/update/{response_id}", response_model=ResponseRead)
async def update_response_output(request: Request, response_id: str, output_update: ResponseOutputUpdate):
    """
    Directly update the main output of a response (manual override).
    """
    existing_response = await prisma.response.find_unique(where={"response_id": response_id})
    if not existing_response:
        raise HTTPException(status_code=404, detail="Response not found")

    updated_response = await prisma.response.update(
        where={"response_id": response_id},
        data={"output": output_update.output},
        include={"categories": {"include": {"patterns": True}}}
    )

    updated_response.categories.sort(key=lambda c: category_priority.get(c.category, float('inf')))
    for category in updated_response.categories:
        category.patterns.sort(key=lambda p: p.pattern.lower())

    return updated_response

# ============================
# Category & Pattern Management
# ============================

@app.put("/api/v1/categories/{category_id}/patterns", response_model=CategoryRead)
async def update_category_patterns(category_id: str, update_data: CategoryPatternUpdate):
    """
    Toggle active patterns for a given category and regenerate the preview.
    """
    logging.info("category_id", category_id)

    category = await prisma.category.find_unique(
        where={"category_id": category_id},
        include={"patterns": True, "response": True}
    )

    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    # Update applied status for each pattern
    for pattern_update in update_data.patterns:
        await prisma.pattern.update(
            where={"pattern_id": pattern_update.pattern_id},
            data={"applied": pattern_update.applied}
        )

    # Generate new preview using only active patterns
    updated_patterns = await prisma.pattern.find_many(
        where={"category_id": category_id, "applied": True}
    )

    new_preview = await apply_category(
        user_input=category.input,
        category=category.category,
        force_patterns=[pattern.pattern for pattern in updated_patterns]
    )

    updated_category = await prisma.category.update(
        where={"category_id": category_id},
        data={"preview": new_preview["preview"]},
        include={"patterns": True}
    )

    # Sort patterns
    updated_category.patterns.sort(key=lambda p: p.pattern.lower())

    return updated_category

# ============================
# Lifecycle Events
# ============================

@app.on_event("startup")
async def startup() -> None:
    """Connect Prisma client on app startup."""
    await prisma.connect()

@app.on_event("shutdown")
async def shutdown() -> None:
    """Disconnect Prisma client on app shutdown."""
    if prisma.is_connected():
        await prisma.disconnect()
