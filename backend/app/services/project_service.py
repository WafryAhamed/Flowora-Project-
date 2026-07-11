from typing import List
from sqlalchemy.orm import Session
from app.models.project import Project, ProjectAssignment
from app.schemas.project import ProjectCreate, ProjectUpdate

def get_projects(db: Session) -> List[Project]:
    return db.query(Project).all()

def get_project(db: Session, project_id: str) -> Project:
    return db.query(Project).filter(Project.id == project_id).first()

def create_project(db: Session, project: ProjectCreate) -> Project:
    db_project = Project(
        name=project.name,
        color=project.color,
        status=project.status,
        description=project.description
    )
    db.add(db_project)
    db.commit()
    db.refresh(db_project)

    if project.members:
        for member_id in project.members:
            assignment = ProjectAssignment(user_id=member_id, project_id=db_project.id)
            db.add(assignment)
        db.commit()
    
    return db_project

def update_project(db: Session, project_id: str, project_update: ProjectUpdate) -> Project:
    db_project = db.query(Project).filter(Project.id == project_id).first()
    if not db_project:
        return None
    
    update_data = project_update.model_dump(exclude_unset=True)
    
    # Handle members separately if provided
    if "members" in update_data:
        new_members = update_data.pop("members")
        # Remove existing
        db.query(ProjectAssignment).filter(ProjectAssignment.project_id == project_id).delete()
        # Add new
        for member_id in new_members:
            assignment = ProjectAssignment(user_id=member_id, project_id=db_project.id)
            db.add(assignment)

    for key, value in update_data.items():
        setattr(db_project, key, value)
    
    db.commit()
    db.refresh(db_project)
    return db_project

def delete_project(db: Session, project_id: str) -> bool:
    db_project = db.query(Project).filter(Project.id == project_id).first()
    if not db_project:
        return False
    db.delete(db_project)
    db.commit()
    return True
