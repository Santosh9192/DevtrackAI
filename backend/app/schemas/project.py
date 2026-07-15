from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime


class ProjectCreate(BaseModel):
    name: str
    description: str = ""
    status: str = "pending"
    priority: str = "medium"
    deadline: Optional[date] = None
    manager_id: Optional[int] = None
    start_date: Optional[date] = None


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    deadline: Optional[date] = None
    manager_id: Optional[int] = None
    start_date: Optional[date] = None
    progress: Optional[float] = None


class ProjectMemberAdd(BaseModel):
    user_id: int
    role_in_project: str = "developer"


class ProjectResponse(BaseModel):
    id: int
    name: str
    description: str
    status: str
    priority: str
    progress: float
    deadline: Optional[str] = None
    created_by: int
    manager_id: Optional[int] = None
    start_date: Optional[str] = None
    completed_at: Optional[str] = None
    task_count: int = 0
    member_count: int = 0
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
