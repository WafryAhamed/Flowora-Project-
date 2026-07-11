from typing import Optional
from pydantic import BaseModel
from datetime import datetime

class ReportBase(BaseModel):
    project_id: str
    week_start: str
    tasks_completed: str
    tasks_planned: str
    blockers: Optional[str] = None
    hours_worked: int
    notes: Optional[str] = None
    links: Optional[str] = None
    status: Optional[str] = "Draft"

class ReportCreate(ReportBase):
    pass

class ReportUpdate(BaseModel):
    project_id: Optional[str] = None
    week_start: Optional[str] = None
    tasks_completed: Optional[str] = None
    tasks_planned: Optional[str] = None
    blockers: Optional[str] = None
    hours_worked: Optional[int] = None
    notes: Optional[str] = None
    links: Optional[str] = None
    status: Optional[str] = None

class ReportInDBBase(ReportBase):
    id: str
    user_id: str
    submitted_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class Report(ReportInDBBase):
    pass
