from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

# ========================
# User Models
# ========================

class UserCreate(BaseModel):
    """
    Schema for creating a new user.
    """
    name: str
    email: str
    password: str


class UserRead(BaseModel):
    """
    Schema for reading user data from the database.
    """
    user_id: str
    name: str
    email: str


# ========================
# Response Models
# ========================

class ResponseCreate(BaseModel):
    """
    Schema for creating a new response by submitting a user prompt.
    """
    input: str


class ResponseOutputUpdate(BaseModel):
    """
    Schema for updating the final output of a response.
    """
    output: str


class MergePreviewPrompts(BaseModel):
    """
    Schema for merging multiple category previews into a unified prompt.
    """
    previews: List[str]


# ========================
# Pattern and Category Models
# ========================

class PatternRead(BaseModel):
    """
    Read schema for a pattern associated with a category.
    """
    pattern_id: str
    pattern: str
    feedback: str
    applied: bool


class PatternUpdate(BaseModel):
    """
    Update schema to toggle 'applied' status of a pattern.
    """
    pattern_id: str
    applied: bool


class CategoryRead(BaseModel):
    """
    Read schema for a category and its associated patterns.
    """
    category_id: str
    category: str
    input: str
    preview: str
    patterns: List[PatternRead] = []


class CategoryPatternUpdate(BaseModel):
    """
    Update schema to manage applied patterns in a category.
    """
    patterns: List[PatternUpdate]


# ========================
# Response with Full Detail
# ========================

class ResponseRead(BaseModel):
    """
    Full schema for reading a response with all nested categories and patterns.
    """
    response_id: str
    user_id: str
    input: str
    output: str
    created_at: datetime
    categories: List[CategoryRead] = []
