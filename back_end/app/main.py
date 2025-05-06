from fastapi import Depends, FastAPI, HTTPException
from prisma import Prisma
from typing import List
import traceback
import time
from app.dependencies import use_logging
from app.middleware import LoggingMiddleware, AuthMiddleware
from app.types.response import ResponseCreate, ResponseRead, UserRead, UserCreate, ResponseOutputUpdate, MergePreviewPrompts
from app.generation_pipeline import improve_prompt, apply_category, merge_prompts
from app.client import prisma_client as prisma
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Request, Depends
from fastapi.responses import JSONResponse

app = FastAPI(prefix="/api/v1")
app.add_middleware(LoggingMiddleware, fastapi=app)
app.add_middleware(AuthMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],            
    allow_credentials=True,
    allow_methods=["*"],              
    allow_headers=["*"],
)

# prisma = Prisma(auto_register=True)

@app.get("/")
async def root(logger=Depends(use_logging)):
    logger.info("Handling your request")
    return {"message": "Your app is working!"}

# you can access request.state.userId to get the userId from the client
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

#Endpoint to get a response by id
@app.get("/api/v1/responses/{response_id}", response_model=ResponseRead)
async def get_response_by_id(response_id: str):
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

# Endpoint to create Response
@app.post("/api/v1/responses/", response_model=ResponseRead)
async def create_response(response: ResponseCreate):
    start = time.time()
    try:
        print("📥 Received input:", response.input)

        # Call AI service
        start_ai = time.time()
        improvement = await improve_prompt(response.input)
        print(f"🧠 AI call took {time.time() - start_ai:.2f}s")

        new_response = await prisma.response.create(
            data={
                "user_id": response.user_id,
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

# Endpoint to update final Response output, merging 6 previews.
@app.put("/api/v1/responses/merge/{response_id}", response_model=ResponseRead)
async def merge_and_update_response(response_id: str, previews_input: MergePreviewPrompts):
    # Validate that response exists
    existing_response = await prisma.response.find_unique(where={"response_id": response_id})
    if not existing_response:
        raise HTTPException(status_code=404, detail="Response not found")

    # Generate the merged prompt
    merged_prompt = await merge_prompts(previews_input.previews)

    # Update the response output field
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

# Endpoint to update final Response output, to be called after finalized editing with live OpenAI model in FE.
@app.put("/api/v1/responses/update/{response_id}", response_model=ResponseRead)
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

@app.on_event("startup")
async def startup() -> None:
    await prisma.connect()

@app.on_event("shutdown")
async def shutdown() -> None:
    if prisma.is_connected():
        await prisma.disconnect()

