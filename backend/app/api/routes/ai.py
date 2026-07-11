from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.user import User
from app.models.project import Project
from app.models.report import Report
from app.models.chat_history import ChatHistory
from app.api.dependencies import get_current_active_manager
from app.services.ai_service import ai_service
from sqlalchemy import func

router = APIRouter()


class AIRequest(BaseModel):
    prompt: str
    context: str | None = None


class AIResponse(BaseModel):
    response: str


def _build_db_context(db: Session) -> dict:
    """
    Fetch real-time data from the database to provide accurate context to the AI.
    Returns a structured dict with users, projects, reports, and metrics.
    """
    # Users
    users = db.query(User).all()
    users_data = [
        {
            "id": u.id,
            "first_name": u.first_name,
            "last_name": u.last_name,
            "email": u.email,
            "role": u.role,
            "department": getattr(u, "department", None),
        }
        for u in users
    ]

    # Projects
    projects = db.query(Project).all()
    projects_data = [
        {
            "id": p.id,
            "name": p.name,
            "status": p.status,
            "description": getattr(p, "description", None),
        }
        for p in projects
    ]

    # Reports – join with users and projects for human-readable names
    reports = db.query(Report).order_by(Report.week_start.desc()).limit(200).all()

    # Build lookup maps
    user_map = {u["id"]: f"{u['first_name']} {u['last_name']}" for u in users_data}
    project_map = {p["id"]: p["name"] for p in projects_data}

    reports_data = [
        {
            "id": r.id,
            "user_id": r.user_id,
            "user_name": user_map.get(r.user_id, r.user_id),
            "project_id": r.project_id,
            "project_name": project_map.get(r.project_id, r.project_id),
            "week_start": r.week_start,
            "tasks_completed": r.tasks_completed or "",
            "tasks_planned": r.tasks_planned or "",
            "blockers": r.blockers or "",
            "hours_worked": r.hours_worked or 0,
            "status": r.status,
            "submitted_at": str(r.submitted_at) if r.submitted_at else None,
        }
        for r in reports
    ]

    # Metrics
    total_reports = db.query(Report).count()
    pending_reports = db.query(Report).filter(Report.status == "Draft").count()
    late_reports = db.query(Report).filter(Report.status == "Late").count()
    submitted_reports = db.query(Report).filter(Report.status == "Submitted").count()
    total_hours = db.query(func.sum(Report.hours_worked)).scalar() or 0
    compliance_rate = (submitted_reports / total_reports * 100) if total_reports > 0 else 100
    open_blockers = db.query(Report).filter(
        Report.blockers != None,
        Report.blockers != "",
        Report.blockers != "None"
    ).count()

    metrics = {
        "total_reports": total_reports,
        "pending_reports": pending_reports,
        "late_reports": late_reports,
        "total_hours": total_hours,
        "compliance_rate": round(compliance_rate, 1),
        "open_blockers": open_blockers,
        "total_projects": len(projects_data),
        "total_users": len(users_data),
    }

    return {
        "users": users_data,
        "projects": projects_data,
        "reports": reports_data,
        "metrics": metrics,
    }


@router.get("/history")
def get_chat_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_manager)
):
    """Retrieve chat history for the current manager from the database."""
    history = (
        db.query(ChatHistory)
        .filter(ChatHistory.user_id == current_user.id)
        .order_by(ChatHistory.created_at.asc())
        .all()
    )
    return [
        {
            "id": h.id,
            "role": h.role,
            "content": h.content,
            "created_at": h.created_at.isoformat() if h.created_at else None,
        }
        for h in history
    ]


@router.post("/ask", response_model=AIResponse)
def ask_ai(
    request: AIRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_manager)
):
    """
    Ask the AI Assistant a question using real-time database context.
    The AI always has access to the latest users, projects, reports, and metrics.
    """
    # Pull real-time data from the DB for AI context
    context_data = _build_db_context(db)

    # Build the full prompt (include any extra context hint from the frontend)
    full_prompt = request.prompt
    if request.context:
        full_prompt = f"[Context hint: {request.context}]\n{request.prompt}"

    # Persist the user message
    user_msg = ChatHistory(
        user_id=current_user.id,
        role="user",
        content=request.prompt  # store original prompt without system hints
    )
    db.add(user_msg)
    db.flush()  # ensure ID is generated before AI call

    # Call AI with real DB context
    response_text = ai_service.generate_response(full_prompt, context_data=context_data)

    # Persist the assistant response
    ai_msg = ChatHistory(
        user_id=current_user.id,
        role="assistant",
        content=response_text
    )
    db.add(ai_msg)
    db.commit()

    return {"response": response_text}
