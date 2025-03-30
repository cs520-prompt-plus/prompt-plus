from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ResponseCreate(BaseModel):
    user_id: str
    input: str
    output: str

class ResponseRead(BaseModel):
    response_id: str
    user_id: str
    input: str
    output: str
    created_at: datetime

class ResponseUpdate(BaseModel):
    user_id: Optional[str] = None
    input: str
    output: str

class ResponseComponentCreate(BaseModel):
    response_id: str
    user_id: str
    subject: str
    input: str
    output: str

class ResponseComponentRead(BaseModel):
    component_id: str
    response_id: str
    user_id: str 
    subject: str
    input: str
    output: str

class ResponseComponentUpdate(BaseModel):
    response_id: Optional[str] = None
    user_id: Optional[str] = None
    subject: str
    input: str
    output: str