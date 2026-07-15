from pydantic import BaseModel
from typing import Optional


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    department: Optional[str] = None
    designation: Optional[str] = None
    bio: Optional[str] = None
    phone: Optional[str] = None


class UserSettingsUpdate(BaseModel):
    theme: Optional[str] = None
    language: Optional[str] = None
    notify_task_assigned: Optional[bool] = None
    notify_task_completed: Optional[bool] = None
    notify_project_deadline: Optional[bool] = None
    notify_bug_assigned: Optional[bool] = None
    notify_ai_report: Optional[bool] = None
    email_notifications: Optional[bool] = None
