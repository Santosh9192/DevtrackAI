from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import Optional
from ..database import get_db
from ..models import Project, ProjectMember, User, ActivityLog, Task
from ..schemas.project import ProjectCreate, ProjectUpdate, ProjectMemberAdd
from ..middleware.auth import get_current_user, require_role
from ..utils.helpers import calculate_progress
import datetime

router = APIRouter()


@router.get("/")
def get_projects(
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    manager_id: Optional[int] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    sort_by: str = Query("created_at"),
    sort_order: str = Query("desc"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Project)

    # Filtering
    if search:
        query = query.filter(Project.name.ilike(f"%{search}%"))
    if status:
        query = query.filter(Project.status == status)
    if priority:
        query = query.filter(Project.priority == priority)
    if manager_id:
        query = query.filter(Project.manager_id == manager_id)

    # Non-admin sees only their projects
    if current_user.role_name not in ["admin", "superadmin"]:
        query = query.filter(
            (Project.created_by == current_user.id) |
            (Project.manager_id == current_user.id) |
            (Project.members.any(ProjectMember.user_id == current_user.id))
        )

    # Sorting
    sort_column = getattr(Project, sort_by, Project.created_at)
    if sort_order == "desc":
        query = query.order_by(desc(sort_column))
    else:
        query = query.order_by(sort_column)

    # Pagination
    total = query.count()
    total_pages = (total + per_page - 1) // per_page
    projects = query.offset((page - 1) * per_page).limit(per_page).all()

    return {
        "projects": [p.to_dict() for p in projects],
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": total_pages,
    }


@router.get("/{project_id}")
def get_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    data = project.to_dict()
    data["members"] = [
        {
            "id": m.id,
            "user_id": m.user_id,
            "role_in_project": m.role_in_project,
            "user": m.user.to_dict() if m.user else None,
            "joined_at": m.joined_at.isoformat() if m.joined_at else None,
        }
        for m in project.members
    ]
    data["tasks"] = [t.to_dict() for t in project.tasks]
    data["manager"] = project.manager.to_dict() if project.manager else None

    return data


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_project(
    project_data: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = Project(
        name=project_data.name,
        description=project_data.description,
        status=project_data.status,
        priority=project_data.priority,
        deadline=project_data.deadline,
        created_by=current_user.id,
        manager_id=project_data.manager_id or current_user.id,
        start_date=project_data.start_date or datetime.date.today(),
    )
    db.add(project)
    db.flush()

    # Add creator as member
    member = ProjectMember(
        project_id=project.id,
        user_id=current_user.id,
        role_in_project="manager",
    )
    db.add(member)

    # Add manager as member if different from creator
    if project_data.manager_id and project_data.manager_id != current_user.id:
        manager_member = ProjectMember(
            project_id=project.id,
            user_id=project_data.manager_id,
            role_in_project="manager",
        )
        db.add(manager_member)

    # Log activity
    log = ActivityLog(
        user_id=current_user.id,
        action="created_project",
        entity_type="project",
        entity_id=project.id,
        description=f"Created project '{project.name}'",
    )
    db.add(log)
    db.commit()
    db.refresh(project)

    return project.to_dict()


@router.put("/{project_id}")
def update_project(
    project_id: int,
    project_data: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Check permission
    if current_user.role_name not in ["admin"] and project.created_by != current_user.id and project.manager_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    update_data = project_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(project, key, value)

    project.updated_at = datetime.datetime.utcnow()

    log = ActivityLog(
        user_id=current_user.id,
        action="updated_project",
        entity_type="project",
        entity_id=project.id,
        description=f"Updated project '{project.name}'",
    )
    db.add(log)
    db.commit()
    db.refresh(project)

    return project.to_dict()


@router.delete("/{project_id}")
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if current_user.role_name not in ["admin"] and project.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    db.delete(project)
    db.commit()

    return {"message": "Project deleted successfully"}


@router.post("/{project_id}/members")
def add_project_member(
    project_id: int,
    member_data: ProjectMemberAdd,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if current_user.role_name not in ["admin"] and project.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Check if already a member
    existing = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == member_data.user_id,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="User is already a member")

    member = ProjectMember(
        project_id=project_id,
        user_id=member_data.user_id,
        role_in_project=member_data.role_in_project,
    )
    db.add(member)
    db.commit()
    db.refresh(member)

    return {
        "id": member.id,
        "project_id": member.project_id,
        "user_id": member.user_id,
        "role_in_project": member.role_in_project,
    }


@router.delete("/{project_id}/members/{member_id}")
def remove_project_member(
    project_id: int,
    member_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    member = db.query(ProjectMember).filter(
        ProjectMember.id == member_id,
        ProjectMember.project_id == project_id,
    ).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    if current_user.role_name not in ["admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    db.delete(member)
    db.commit()

    return {"message": "Member removed successfully"}
