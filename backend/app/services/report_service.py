from typing import List
from sqlalchemy.orm import Session
from app.models.report import Report
from app.schemas.report import ReportCreate, ReportUpdate
from datetime import datetime

def get_reports(db: Session, skip: int = 0, limit: int = 100) -> List[Report]:
    return db.query(Report).offset(skip).limit(limit).all()

def get_reports_by_user(db: Session, user_id: str, skip: int = 0, limit: int = 100) -> List[Report]:
    return db.query(Report).filter(Report.user_id == user_id).offset(skip).limit(limit).all()

def get_report(db: Session, report_id: str) -> Report:
    return db.query(Report).filter(Report.id == report_id).first()

def create_report(db: Session, report: ReportCreate, user_id: str) -> Report:
    db_report = Report(**report.model_dump(), user_id=user_id)
    if db_report.status == "Submitted":
        db_report.submitted_at = datetime.utcnow()
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    return db_report

def update_report(db: Session, report_id: str, report_update: ReportUpdate) -> Report:
    db_report = db.query(Report).filter(Report.id == report_id).first()
    if not db_report:
        return None
    
    update_data = report_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_report, key, value)
        
    if "status" in update_data and update_data["status"] == "Submitted" and not db_report.submitted_at:
        db_report.submitted_at = datetime.utcnow()
    
    db.commit()
    db.refresh(db_report)
    return db_report

def delete_report(db: Session, report_id: str) -> bool:
    db_report = db.query(Report).filter(Report.id == report_id).first()
    if not db_report:
        return False
    db.delete(db_report)
    db.commit()
    return True
