from pydantic import BaseModel
from typing import Optional
from datetime import date


class TaskCreate(BaseModel):
    title: str
    description: str = ""
    status: str = "todo"
    priority: str = "medium"
    complexity: str = "medium"
    story_points: int = 1
    project_id: int
    assignee_id: Optional[int] = None
    deadline: Optional[date] = None
    estimated_hours: Optional[float] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    complexity: Optional[str] = None
    story_points: Optional[int] = None
    assignee_id: Optional[int] = None
    deadline: Optional[date] = None
    estimated_hours: Optional[float] = None
    actual_hours: Optional[float] = None
    board_order: Optional[int] = None


class TaskCommentCreate(BaseModel):
    content: str
    attachment_url: str = ""
