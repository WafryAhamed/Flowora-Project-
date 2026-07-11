from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.user import User
from app.schemas.report import Report as ReportSchema, ReportCreate, ReportUpdate
from app.api.dependencies import get_current_user, get_current_active_manager
from app.services import report_service

router = APIRouter()

@router.get("", response_model=List[ReportSchema])
def read_reports(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Retrieve reports.
    Managers see all reports. Members see only their own.
    """
    if current_user.role in ["MANAGER", "ADMIN"]:
        return report_service.get_reports(db, skip=skip, limit=limit)
    return report_service.get_reports_by_user(db, current_user.id, skip=skip, limit=limit)

@router.post("", response_model=ReportSchema)
def create_report(
    report_in: ReportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new report."""
    return report_service.create_report(db, report_in, current_user.id)

@router.put("/{report_id}", response_model=ReportSchema)
def update_report(
    report_id: str,
    report_in: ReportUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a report."""
    report = report_service.get_report(db, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    # Ownership validation
    if report.user_id != current_user.id and current_user.role not in ["MANAGER", "ADMIN"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    return report_service.update_report(db, report_id, report_in)

@router.delete("/{report_id}")
def delete_report(
    report_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a report."""
    report = report_service.get_report(db, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    # Ownership validation
    if report.user_id != current_user.id and current_user.role not in ["MANAGER", "ADMIN"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    report_service.delete_report(db, report_id)
    return {"message": "Report deleted successfully"}
