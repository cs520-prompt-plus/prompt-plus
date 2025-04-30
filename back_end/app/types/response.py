from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class UserCreate(BaseModel):
    name: str
    email: str
    password: str

class UserRead(BaseModel):
    user_id: str
    name: str
    email: str

class ResponseCreate(BaseModel):
    user_id: str
    input: str

class PatternRead(BaseModel):
    pattern_id: str
    pattern: str
    feedback: str
    applied: bool

class CategoryRead(BaseModel):
    category_id: str
    category: str
    input: str
    preview: str
    patterns: List[PatternRead] = []

class ResponseRead(BaseModel):
    response_id: str
    user_id: str
    input: str
    output: str
    created_at: datetime
    categories: List[CategoryRead] = []

class ResponseOutputUpdate(BaseModel):
    output: str

class PatternUpdate(BaseModel):
    pattern_id: str
    applied: bool

class CategoryPatternUpdate(BaseModel):
    patterns: List[PatternUpdate]