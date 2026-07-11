from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Index, Text
from sqlalchemy.orm import relationship
from app.db.database import Base
from datetime import datetime
from app.models.user import generate_uuid


class Report(Base):
    __tablename__ = "reports"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    project_id = Column(String, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    week_start = Column(String, nullable=False)  # YYYY-MM-DD
    tasks_completed = Column(Text, nullable=False)
    tasks_planned = Column(Text, nullable=False)
    blockers = Column(Text, nullable=True)
    hours_worked = Column(Integer, nullable=False, default=0)
    notes = Column(Text, nullable=True)
    links = Column(Text, nullable=True)
    status = Column(String, nullable=False, default="Draft")  # 'Draft' | 'Submitted' | 'Late'
    submitted_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        Index("ix_reports_user_id", "user_id"),
        Index("ix_reports_project_id", "project_id"),
        Index("ix_reports_week_start", "week_start"),
        Index("ix_reports_status", "status"),
    )

    # Relationships
    user = relationship("User", back_populates="reports")
    project = relationship("Project", back_populates="reports")
