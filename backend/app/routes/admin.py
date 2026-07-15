from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from ..database import get_db
from ..models import User, Role, Project, Task, BugReport
from ..middleware.auth import get_current_user, require_role

router = APIRouter()


@router.get("/users")
def admin_get_users(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "superadmin")),
):
    users = db.query(User).offset((page - 1) * per_page).limit(per_page).all()
    total = db.query(User).count()

    return {
        "users": [u.to_dict() for u in users],
        "total": total,
        "page": page,
        "per_page": per_page,
    }


@router.put("/users/{user_id}/role")
def admin_update_user_role(
    user_id: int,
    role_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "superadmin")),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=400, detail="Invalid role")

    user.role_id = role_id
    db.commit()

    return user.to_dict()


@router.put("/users/{user_id}/toggle-active")
def admin_toggle_user_active(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "superadmin")),
):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot deactivate yourself")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_active = not user.is_active
    db.commit()

    return user.to_dict()


@router.get("/stats")
def admin_get_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "superadmin")),
):
    return {
        "total_users": db.query(User).count(),
        "active_users": db.query(User).filter(User.is_active == True).count(),
        "total_projects": db.query(Project).count(),
        "total_tasks": db.query(Task).count(),
        "completed_tasks": db.query(Task).filter(Task.status == "completed").count(),
        "open_bugs": db.query(BugReport).filter(BugReport.status == "open").count(),
        "total_bugs": db.query(BugReport).count(),
        "roles": {
            r.name: db.query(User).filter(User.role_id == r.id).count()
            for r in db.query(Role).all()
        },
    }
