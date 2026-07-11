from sqlalchemy import Column, String, DateTime, ForeignKey, Index, Text
from sqlalchemy.orm import relationship
from app.db.database import Base
from datetime import datetime
from app.models.user import generate_uuid


class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    action = Column(String, nullable=False)
    entity_type = Column(String, nullable=False)  # e.g. 'Report', 'Project'
    entity_id = Column(String, nullable=True)
    details = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        Index("ix_activity_logs_user_id", "user_id"),
        Index("ix_activity_logs_entity_type", "entity_type"),
        Index("ix_activity_logs_created_at", "created_at"),
    )

    # Relationships
    user = relationship("User", backref="activity_logs")
