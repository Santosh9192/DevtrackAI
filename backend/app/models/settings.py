import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from ..database import Base


class UserSettings(Base):
    __tablename__ = "user_settings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    theme = Column(String(20), default="dark")
    language = Column(String(10), default="en")
    notify_task_assigned = Column(Boolean, default=True)
    notify_task_completed = Column(Boolean, default=True)
    notify_project_deadline = Column(Boolean, default=True)
    notify_bug_assigned = Column(Boolean, default=True)
    notify_ai_report = Column(Boolean, default=True)
    email_notifications = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="settings")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "theme": self.theme,
            "language": self.language,
            "notify_task_assigned": self.notify_task_assigned,
            "notify_task_completed": self.notify_task_completed,
            "notify_project_deadline": self.notify_project_deadline,
            "notify_bug_assigned": self.notify_bug_assigned,
            "notify_ai_report": self.notify_ai_report,
            "email_notifications": self.email_notifications,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
