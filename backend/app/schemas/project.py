from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

class ProjectBase(BaseModel):
    name: str
    color: Optional[str] = "#415A77"
    status: Optional[str] = "Active"
    description: Optional[str] = None

class ProjectCreate(ProjectBase):
    members: Optional[List[str]] = []

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    color: Optional[str] = None
    status: Optional[str] = None
    description: Optional[str] = None
    members: Optional[List[str]] = None

class ProjectInDBBase(ProjectBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True

class Project(ProjectInDBBase):
    members: List[str] = [] # User IDs
