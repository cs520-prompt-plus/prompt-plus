from fastapi import Depends, FastAPI, HTTPException, Request
from prisma import Prisma
from typing import List
import traceback
import time
from app.dependencies import use_logging
from app.middleware import LoggingMiddleware, AuthMiddleware
from app.types.response import ResponseCreate, ResponseRead, UserRead, UserCreate, ResponseOutputUpdate, CategoryRead, CategoryPatternUpdate, MergePreviewPrompts
from app.generation_pipeline import improve_prompt, apply_category, merge_prompts

from app.client import prisma_client as prisma
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
import logging


logging.basicConfig(level=logging.ERROR)
app = FastAPI()

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    # read the raw body (you can only do this once, so be careful)
    try:
        body = await request.json()
    except Exception:
        body = "<could not parse body>"

    # log the path, body, and the list of validation errors
    logging.error(f"""
❌ 422 Validation error on POST {request.url.path}
    → Payload: {body!r}
    → Errors: {exc.errors()}
""")

    # return the normal 422 JSON response (or customize it)
    return JSONResponse(
        status_code=422,
        content={ "detail": exc.errors() }
    )

app.add_middleware(LoggingMiddleware, fastapi=app)
app.add_middleware(AuthMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],            
    allow_credentials=True,
    allow_methods=["*"],              
    allow_headers=["*"],
)

@app.get("/")
async def root(request: Request, logger=Depends(use_logging)):
    logger.info("Handling your request")
    return {"message": "Your app is working!"}

@app.post("/api/v1/health")
async def health_check(request: Request):
    print("Health check endpoint called")   
    return JSONResponse(content={"status": "ok"}, status_code=200) 

@app.post("/api/v1/users/", response_model=UserRead)
async def create_user(request: Request, user: UserCreate):
    new_user = await prisma.user.create(
        data={
            "name": user.name,
            "email": user.email,
            "password": user.password,
        }
    )
    return new_user

@app.get("/api/v1/responses/{response_id}", response_model=ResponseRead)
async def get_response_by_id(request: Request, response_id: str):
    response = await prisma.response.find_unique(
        where={"response_id": response_id},
        include={
            "categories": {
                "include": {
                    "patterns": True
                }
            }
        }
    )

    if not response:
        raise HTTPException(status_code=404, detail="Response not found")

    return response

@app.post("/api/v1/responses/", response_model=ResponseRead)
async def create_response(request: Request, response: ResponseCreate):
    print("Creating response...")
    start = time.time()
    user_id = request.state.userId
    print("input:", response.input, "user_id:", user_id)
    # return JSONResponse(content={"message": "Response created successfully"}, status_code=200)
    try:
        print("📥 Received input:", response.input)

        start_ai = time.time()
        improvement = await improve_prompt(response.input)
        print(f"🧠 AI call took {time.time() - start_ai:.2f}s")

        new_response = await prisma.response.create(
            data={
                "user_id": user_id,
                "input": response.input,
                "output": improvement["output"],
            }
        )

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

        full_response = await prisma.response.find_unique(
            where={"response_id": new_response.response_id},
            include={
                "categories": {
                    "include": {"patterns": True}
                }
            }
        )

        duration = time.time() - start
        print(f"✅ Done in {duration:.2f}s")
        return full_response

    except Exception as e:
        print("❌ Error in create_response:", str(e))
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Something went wrong while processing your request.")

@app.put("/api/v1/responses/merge/{response_id}", response_model=ResponseRead)
async def merge_and_update_response(request: Request, response_id: str, previews_input: MergePreviewPrompts):
    existing_response = await prisma.response.find_unique(where={"response_id": response_id})
    if not existing_response:
        raise HTTPException(status_code=404, detail="Response not found")

    merged_prompt = await merge_prompts(previews_input.previews)

    updated_response = await prisma.response.update(
        where={"response_id": response_id},
        data={"output": merged_prompt},
        include={
            "categories": {
                "include": {
                    "patterns": True
                }
            }
        }
    )

    return updated_response

@app.put("/api/v1/responses/update/{response_id}", response_model=ResponseRead)
async def update_response_output(request: Request, response_id: str, output_update: ResponseOutputUpdate):
    existing_response = await prisma.response.find_unique(where={"response_id": response_id})
    if not existing_response:
        raise HTTPException(status_code=404, detail="Response not found")

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
