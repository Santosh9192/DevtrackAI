from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel
from ..database import get_db
from ..models import BugReport, BugComment, User, Notification, ActivityLog
from ..middleware.auth import get_current_user
import datetime

router = APIRouter()


class BugCreate(BaseModel):
    title: str
    description: str
    project_id: int
    severity: str = "medium"
    priority: str = "medium"
    steps_to_reproduce: str = ""
    assigned_to: Optional[int] = None


class BugUpdate(BaseModel):
    status: Optional[str] = None
    severity: Optional[str] = None
    priority: Optional[str] = None
    assigned_to: Optional[int] = None


@router.get("/")
def get_bugs(
    project_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    assigned_to: Optional[int] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(BugReport)

    if project_id:
        query = query.filter(BugReport.project_id == project_id)
    if status:
        query = query.filter(BugReport.status == status)
    if severity:
        query = query.filter(BugReport.severity == severity)
    if priority:
        query = query.filter(BugReport.priority == priority)
    if assigned_to:
        query = query.filter(BugReport.assigned_to == assigned_to)
    if search:
        query = query.filter(BugReport.title.ilike(f"%{search}%"))

    query = query.order_by(BugReport.created_at.desc())
    total = query.count()
    bugs = query.offset((page - 1) * per_page).limit(per_page).all()

    return {
        "bugs": [b.to_dict() for b in bugs],
        "total": total,
        "page": page,
        "per_page": per_page,
    }


@router.get("/{bug_id}")
def get_bug(
    bug_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    bug = db.query(BugReport).filter(BugReport.id == bug_id).first()
    if not bug:
        raise HTTPException(status_code=404, detail="Bug not found")

    data = bug.to_dict()
    data["comments"] = [
        {
            "id": c.id,
            "content": c.content,
            "user": c.user.to_dict() if c.user else None,
            "created_at": c.created_at.isoformat() if c.created_at else None,
        }
        for c in bug.comments
    ]
    data["reporter"] = bug.reporter.to_dict() if bug.reporter else None
    data["assignee"] = bug.assignee.to_dict() if bug.assignee else None

    return data


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_bug(
    bug_data: BugCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    bug = BugReport(
        title=bug_data.title,
        description=bug_data.description,
        severity=bug_data.severity,
        priority=bug_data.priority,
        project_id=bug_data.project_id,
        reported_by=current_user.id,
        assigned_to=bug_data.assigned_to,
        steps_to_reproduce=bug_data.steps_to_reproduce,
    )
    db.add(bug)
    db.flush()

    if bug_data.assigned_to:
        notification = Notification(
            user_id=bug_data.assigned_to,
            title="Bug Assigned",
            message=f"Bug '{bug.title}' has been assigned to you",
            notification_type="bug_assigned",
            reference_id=bug.id,
            reference_type="bug",
        )
        db.add(notification)

    log = ActivityLog(
        user_id=current_user.id,
        action="created_bug",
        entity_type="bug",
        entity_id=bug.id,
        description=f"Reported bug '{bug.title}'",
    )
    db.add(log)
    db.commit()
    db.refresh(bug)

    return bug.to_dict()


@router.put("/{bug_id}")
def update_bug(
    bug_id: int,
    bug_data: BugUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    bug = db.query(BugReport).filter(BugReport.id == bug_id).first()
    if not bug:
        raise HTTPException(status_code=404, detail="Bug not found")

    update_data = bug_data.model_dump(exclude_unset=True)

    if "status" in update_data:
        bug.status = update_data["status"]
        if update_data["status"] == "resolved":
            bug.resolved_at = datetime.datetime.utcnow()
    if "severity" in update_data:
        bug.severity = update_data["severity"]
    if "priority" in update_data:
        bug.priority = update_data["priority"]
    if "assigned_to" in update_data and update_data["assigned_to"] is not None:
        bug.assigned_to = update_data["assigned_to"]
        notif = Notification(
            user_id=update_data["assigned_to"],
            title="Bug Assigned",
            message=f"Bug '{bug.title}' has been assigned to you",
            notification_type="bug_assigned",
            reference_id=bug.id,
            reference_type="bug",
        )
        db.add(notif)

    bug.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(bug)

    return bug.to_dict()


@router.delete("/{bug_id}")
def delete_bug(
    bug_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    bug = db.query(BugReport).filter(BugReport.id == bug_id).first()
    if not bug:
        raise HTTPException(status_code=404, detail="Bug not found")

    db.delete(bug)
    db.commit()

    return {"message": "Bug deleted successfully"}
