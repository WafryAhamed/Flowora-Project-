from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.user import User
from app.schemas.project import Project as ProjectSchema, ProjectCreate, ProjectUpdate
from app.api.dependencies import get_current_user, get_current_active_manager
from app.services import project_service

router = APIRouter()

def map_project(project):
    return {
        "id": project.id,
        "name": project.name,
        "color": project.color,
        "status": project.status,
        "description": project.description,
        "created_at": project.created_at,
        "members": [m.user_id for m in project.members]
    }

@router.get("", response_model=List[ProjectSchema])
def read_projects(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Retrieve all projects. Accessible to members and managers."""
    projects = project_service.get_projects(db)
    return [map_project(p) for p in projects]

@router.post("", response_model=ProjectSchema)
def create_project(
    project_in: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_manager)
):
    """Create a new project. (Manager only)"""
    project = project_service.create_project(db, project_in)
    return map_project(project)

@router.put("/{project_id}", response_model=ProjectSchema)
def update_project(
    project_id: str,
    project_in: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_manager)
):
    """Update a project. (Manager only)"""
    project = project_service.update_project(db, project_id, project_in)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return map_project(project)

@router.delete("/{project_id}")
def delete_project(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_manager)
):
    """Delete a project. (Manager only)"""
    success = project_service.delete_project(db, project_id)
    if not success:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"message": "Project deleted successfully"}
