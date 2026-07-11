from typing import Optional, List
from pydantic import BaseModel, EmailStr
from datetime import datetime

class UserBase(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    department: Optional[str] = None
    avatar: Optional[str] = None
    role: Optional[str] = "MEMBER"

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    department: Optional[str] = None
    avatar: Optional[str] = None
    role: Optional[str] = None
    password: Optional[str] = None

class UserInDBBase(UserBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True

class User(UserInDBBase):
    pass
