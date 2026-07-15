import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base


class BugReport(Base):
    __tablename__ = "bug_reports"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    steps_to_reproduce = Column(Text, default="")
    severity = Column(String(20), default="medium")  # critical, high, medium, low
    priority = Column(String(20), default="medium")  # critical, high, medium, low
    status = Column(String(50), default="open")  # open, in_progress, resolved, closed, re opened
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    reported_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    assigned_to = Column(Integer, ForeignKey("users.id"), nullable=True)
    attachment_url = Column(String(500), default="")
    resolved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    project = relationship("Project", back_populates="bug_reports")
    reporter = relationship("User", back_populates="bug_reports", foreign_keys=[reported_by])
    assignee = relationship("User", back_populates="bug_assignments", foreign_keys=[assigned_to])
    comments = relationship("BugComment", back_populates="bug", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "steps_to_reproduce": self.steps_to_reproduce,
            "severity": self.severity,
            "priority": self.priority,
            "status": self.status,
            "project_id": self.project_id,
            "reported_by": self.reported_by,
            "assigned_to": self.assigned_to,
            "attachment_url": self.attachment_url,
            "resolved_at": self.resolved_at.isoformat() if self.resolved_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class BugComment(Base):
    __tablename__ = "bug_comments"

    id = Column(Integer, primary_key=True, index=True)
    bug_id = Column(Integer, ForeignKey("bug_reports.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    attachment_url = Column(String(500), default="")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    bug = relationship("BugReport", back_populates="comments")
    user = relationship("User", back_populates="bug_comments")
