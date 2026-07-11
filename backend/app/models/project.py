from sqlalchemy import Column, String, DateTime, ForeignKey, Index, UniqueConstraint
from sqlalchemy.orm import relationship
from app.db.database import Base
from datetime import datetime
from app.models.user import generate_uuid


class Project(Base):
    __tablename__ = "projects"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    color = Column(String, nullable=False, default="#415A77")
    status = Column(String, nullable=False, default="Active")  # 'Active' | 'Completed' | 'On Hold'
    description = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        Index("ix_projects_status", "status"),
    )

    # Relationships
    members = relationship("ProjectAssignment", back_populates="project", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="project")


class ProjectAssignment(Base):
    __tablename__ = "project_assignments"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    project_id = Column(String, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("user_id", "project_id", name="uq_project_assignment"),
        Index("ix_project_assignments_user_id", "user_id"),
        Index("ix_project_assignments_project_id", "project_id"),
    )

    user = relationship("User", back_populates="projects")
    project = relationship("Project", back_populates="members")
