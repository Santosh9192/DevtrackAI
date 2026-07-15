from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import Optional
from ..database import get_db
from ..models import Task, User, ActivityLog, Notification
from ..schemas.task import TaskCreate, TaskUpdate
from ..middleware.auth import get_current_user
from ..utils.helpers import is_overdue
import datetime

router = APIRouter()


@router.get("/")
def get_tasks(
    project_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    assignee_id: Optional[int] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    sort_by: str = Query("created_at"),
    sort_order: str = Query("desc"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Task)

    if project_id:
        query = query.filter(Task.project_id == project_id)
    if status:
        query = query.filter(Task.status == status)
    if priority:
        query = query.filter(Task.priority == priority)
    if assignee_id:
        query = query.filter(Task.assignee_id == assignee_id)
    if search:
        query = query.filter(Task.title.ilike(f"%{search}%"))

    sort_column = getattr(Task, sort_by, Task.created_at)
    if sort_order == "desc":
        query = query.order_by(desc(sort_column))
    else:
        query = query.order_by(sort_column)

    total = query.count()
    tasks = query.offset((page - 1) * per_page).limit(per_page).all()

    return {
        "tasks": [t.to_dict() for t in tasks],
        "total": total,
        "page": page,
        "per_page": per_page,
    }


@router.get("/{task_id}")
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    data = task.to_dict()
    data["comments"] = [
        {
            "id": c.id,
            "content": c.content,
            "user": c.user.to_dict() if c.user else None,
            "created_at": c.created_at.isoformat() if c.created_at else None,
        }
        for c in task.comments
    ]
    data["assignee"] = task.assignee.to_dict() if task.assignee else None

    return data


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_task(
    task_data: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = Task(
        title=task_data.title,
        description=task_data.description,
        status=task_data.status,
        priority=task_data.priority,
        complexity=task_data.complexity,
        story_points=task_data.story_points,
        project_id=task_data.project_id,
        assignee_id=task_data.assignee_id,
        deadline=task_data.deadline,
        estimated_hours=task_data.estimated_hours,
        created_by=current_user.id,
        is_overdue=1 if is_overdue(task_data.deadline) else 0,
    )
    db.add(task)
    db.flush()

    # Notify assignee
    if task_data.assignee_id:
        notification = Notification(
            user_id=task_data.assignee_id,
            title="Task Assigned",
            message=f"You have been assigned to task '{task.title}'",
            notification_type="task_assigned",
            reference_id=task.id,
            reference_type="task",
        )
        db.add(notification)

    # Log activity
    log = ActivityLog(
        user_id=current_user.id,
        action="created_task",
        entity_type="task",
        entity_id=task.id,
        description=f"Created task '{task.title}'",
    )
    db.add(log)
    db.commit()
    db.refresh(task)

    return task.to_dict()


@router.put("/{task_id}")
def update_task(
    task_id: int,
    task_data: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    update_data = task_data.model_dump(exclude_unset=True)

    # If status changed to completed
    if "status" in update_data and update_data["status"] == "completed" and task.status != "completed":
        update_data["completed_at"] = datetime.datetime.utcnow()
        # Notify creator
        notification = Notification(
            user_id=task.created_by,
            title="Task Completed",
            message=f"Task '{task.title}' has been completed",
            notification_type="task_completed",
            reference_id=task.id,
            reference_type="task",
        )
        db.add(notification)

    # Update overdue status if deadline changed
    if "deadline" in update_data:
        update_data["is_overdue"] = 1 if is_overdue(update_data["deadline"]) else 0

    for key, value in update_data.items():
        setattr(task, key, value)

    task.updated_at = datetime.datetime.utcnow()

    log = ActivityLog(
        user_id=current_user.id,
        action="updated_task",
        entity_type="task",
        entity_id=task.id,
        description=f"Updated task '{task.title}'",
    )
    db.add(log)
    db.commit()
    db.refresh(task)

    return task.to_dict()


@router.delete("/{task_id}")
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    db.delete(task)
    db.commit()

    return {"message": "Task deleted successfully"}


@router.get("/kanban/{project_id}")
def get_kanban_board(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    tasks = db.query(Task).filter(Task.project_id == project_id).order_by(Task.board_order).all()

    board = {
        "todo": [],
        "in_progress": [],
        "review": [],
        "completed": [],
    }

    for task in tasks:
        status = task.status if task.status in board else "todo"
        task_data = task.to_dict()
        task_data["assignee"] = task.assignee.to_dict() if task.assignee else None
        board[status].append(task_data)

    return board
