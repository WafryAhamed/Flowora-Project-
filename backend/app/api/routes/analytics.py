from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.database import get_db
from app.models.user import User
from app.models.report import Report
from app.models.project import Project
from app.api.dependencies import get_current_active_manager
from fastapi_cache.decorator import cache
import re

router = APIRouter()

@router.get("/dashboard-metrics", response_model=Dict[str, Any])
@cache(expire=60)
async def get_dashboard_metrics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_manager)
):
    """Retrieve high-level metrics for the manager dashboard."""
    total_reports = db.query(Report).count()
    pending_reports = db.query(Report).filter(Report.status == "Draft").count()
    late_reports = db.query(Report).filter(Report.status == "Late").count()
    
    total_projects = db.query(Project).count()
    total_users = db.query(User).count()
    
    total_hours_result = db.query(func.sum(Report.hours_worked)).scalar()
    total_hours = total_hours_result if total_hours_result else 0
    
    submitted_reports = db.query(Report).filter(Report.status == "Submitted").count()
    compliance_rate = (submitted_reports / total_reports * 100) if total_reports > 0 else 100
    
    # Calculate task trend by fetching all reports and counting non-empty lines in tasks_planned / tasks_completed
    all_reports = db.query(Report.week_start, Report.tasks_planned, Report.tasks_completed).all()
    
    weekly_trend = {}
    for r in all_reports:
        week = r.week_start
        if week not in weekly_trend:
            weekly_trend[week] = {"planned": 0, "completed": 0}
            
        planned_count = len([line for line in (r.tasks_planned or "").split("\n") if line.strip()])
        completed_count = len([line for line in (r.tasks_completed or "").split("\n") if line.strip()])
        
        weekly_trend[week]["planned"] += planned_count
        weekly_trend[week]["completed"] += completed_count
        
    task_trend = [
        {"week": week, "planned": data["planned"], "completed": data["completed"]}
        for week, data in sorted(weekly_trend.items())
    ]
    
    return {
        "total_reports": total_reports,
        "pending_reports": pending_reports,
        "late_reports": late_reports,
        "total_hours": total_hours,
        "compliance_rate": round(compliance_rate, 1),
        "open_blockers": db.query(Report).filter(Report.blockers != None, Report.blockers != "", Report.blockers != "None").count(),
        "total_projects": total_projects,
        "total_users": total_users,
        "task_trend": task_trend
    }
