from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from datetime import datetime, timedelta, date
from ..database import get_db
from ..models import Project, Task, BugReport, User, ActivityLog, Notification, ProjectMember
from ..middleware.auth import get_current_user

router = APIRouter()


@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    today = date.today()
    role = current_user.role_name
    is_admin = role in ["admin", "superadmin"]

    # Base data for all roles
    base = {
        "role": role,
        "unread_notifications": db.query(Notification).filter(
            Notification.user_id == current_user.id,
            Notification.is_read == False,
        ).count(),
    }

    # ─── ADMIN DASHBOARD ─────────────────────────────────────
    if is_admin:
        total_users = db.query(User).count()
        active_users = db.query(User).filter(User.is_active == True).count()

        total_projects = db.query(Project).count()
        completed_projects = db.query(Project).filter(Project.status == "completed").count()
        in_progress_projects = db.query(Project).filter(Project.status == "in_progress").count()

        total_tasks = db.query(Task).count()
        completed_tasks = db.query(Task).filter(Task.status == "completed").count()
        overdue_tasks = db.query(Task).filter(Task.is_overdue == 1, Task.status != "completed").count()

        open_bugs = db.query(BugReport).filter(BugReport.status == "open").count()
        critical_bugs = db.query(BugReport).filter(BugReport.severity == "critical", BugReport.status != "resolved").count()

        # Role distribution
        role_counts = {}
        for r in ["admin", "project_manager", "developer"]:
            rid = db.query(User.role_id).join(User.role).filter(User.role.has(name=r)).first()
            if rid:
                role_counts[r] = db.query(User).filter(User.role_id == rid[0]).count()
            else:
                role_counts[r] = 0

        # Project health
        healthy_projects = db.query(Project).filter(
            Project.status.in_(["completed", "in_progress"]),
            Project.progress >= 50,
        ).count()
        at_risk_projects = db.query(Project).filter(
            Project.status == "in_progress",
            Project.deadline <= today + timedelta(days=14),
            Project.progress < 50,
        ).count()

        return {
            **base,
            "role_specific": "admin",
            "total_users": total_users,
            "active_users": active_users,
            "total_projects": total_projects,
            "completed_projects": completed_projects,
            "in_progress_projects": in_progress_projects,
            "total_tasks": total_tasks,
            "completed_tasks": completed_tasks,
            "overdue_tasks": overdue_tasks,
            "open_bugs": open_bugs,
            "critical_bugs": critical_bugs,
            "role_distribution": role_counts,
            "healthy_projects": healthy_projects,
            "at_risk_projects": at_risk_projects,
            "pending_projects": db.query(Project).filter(Project.status == "pending").count(),
            "on_hold_projects": db.query(Project).filter(Project.status == "on_hold").count(),
        }

    # ─── PROJECT MANAGER DASHBOARD ──────────────────────────
    elif role == "project_manager":
        managed_project_ids = [
            p.id for p in db.query(Project).filter(
                (Project.manager_id == current_user.id) |
                (Project.created_by == current_user.id)
            ).all()
        ]
        # Also include projects where user is a member
        member_project_ids = [pm.project_id for pm in db.query(ProjectMember).filter(
            ProjectMember.user_id == current_user.id
        ).all()]
        all_project_ids = list(set(managed_project_ids + member_project_ids))

        project_query = db.query(Project).filter(Project.id.in_(all_project_ids)) if all_project_ids else db.query(Project).filter(False)

        total_managed = project_query.count()
        completed_managed = project_query.filter(Project.status == "completed").count()
        in_progress_managed = project_query.filter(Project.status == "in_progress").count()

        # Tasks from managed projects
        task_query = db.query(Task).filter(Task.project_id.in_(all_project_ids)) if all_project_ids else db.query(Task).filter(False)
        total_team_tasks = task_query.count()
        completed_team_tasks = task_query.filter(Task.status == "completed").count()
        overdue_team_tasks = task_query.filter(Task.is_overdue == 1, Task.status != "completed").count()
        todo_tasks = task_query.filter(Task.status == "todo").count()

        # Team members across projects
        team_member_ids = set()
        for pid in all_project_ids:
            members = db.query(ProjectMember.user_id).filter(ProjectMember.project_id == pid).all()
            team_member_ids.update(m[0] for m in members)
        team_size = len(team_member_ids)

        # Workload: tasks per team member
        workload = []
        for uid in team_member_ids:
            u = db.query(User).filter(User.id == uid).first()
            if u and u.id != current_user.id:
                task_count = db.query(Task).filter(
                    Task.assignee_id == uid,
                    Task.project_id.in_(all_project_ids),
                    Task.status != "completed",
                ).count()
                if task_count > 0:
                    workload.append({"user_id": uid, "name": u.full_name, "tasks": task_count})

        workload.sort(key=lambda x: x["tasks"], reverse=True)

        return {
            **base,
            "role_specific": "manager",
            "total_managed": total_managed,
            "completed_managed": completed_managed,
            "in_progress_managed": in_progress_managed,
            "total_team_tasks": total_team_tasks,
            "completed_team_tasks": completed_team_tasks,
            "overdue_team_tasks": overdue_team_tasks,
            "todo_tasks": todo_tasks,
            "team_size": team_size,
            "workload": workload[:8],
            "pending_projects": project_query.filter(Project.status == "pending").count(),
        }

    # ─── DEVELOPER DASHBOARD ─────────────────────────────────
    else:
        # Personal task stats
        my_tasks = db.query(Task).filter(Task.assignee_id == current_user.id)
        total_my_tasks = my_tasks.count()
        completed_my_tasks = my_tasks.filter(Task.status == "completed").count()
        in_progress_my_tasks = my_tasks.filter(Task.status == "in_progress").count()
        overdue_my_tasks = my_tasks.filter(Task.is_overdue == 1, Task.status != "completed").count()
        todo_my_tasks = my_tasks.filter(Task.status == "todo").count()

        # My projects count
        my_project_ids = set()
        for pm in db.query(ProjectMember).filter(ProjectMember.user_id == current_user.id).all():
            my_project_ids.add(pm.project_id)
        my_project_count = len(my_project_ids)

        # My bugs
        my_bugs = db.query(BugReport).filter(
            (BugReport.assigned_to == current_user.id) | (BugReport.reported_by == current_user.id)
        )
        total_my_bugs = my_bugs.count()
        open_my_bugs = my_bugs.filter(BugReport.status == "open").count()

        # Recent tasks (next 5 upcoming)
        upcoming_tasks = db.query(Task).filter(
            Task.assignee_id == current_user.id,
            Task.status.in_(["todo", "in_progress", "review"]),
            Task.deadline != None,
        ).order_by(Task.deadline.asc()).limit(5).all()

        # Current week completion
        week_start = today - timedelta(days=today.weekday())
        this_week_completed = db.query(Task).filter(
            Task.assignee_id == current_user.id,
            Task.status == "completed",
            func.date(Task.completed_at) >= week_start,
        ).count()

        return {
            **base,
            "role_specific": "developer",
            "total_my_tasks": total_my_tasks,
            "completed_my_tasks": completed_my_tasks,
            "in_progress_my_tasks": in_progress_my_tasks,
            "overdue_my_tasks": overdue_my_tasks,
            "todo_my_tasks": todo_my_tasks,
            "my_project_count": my_project_count,
            "total_my_bugs": total_my_bugs,
            "open_my_bugs": open_my_bugs,
            "this_week_completed": this_week_completed,
            "upcoming_tasks": [
                {
                    "id": t.id,
                    "title": t.title,
                    "deadline": t.deadline.isoformat() if t.deadline else None,
                    "priority": t.priority,
                    "project_name": t.project.name if t.project else None,
                    "status": t.status,
                }
                for t in upcoming_tasks
            ],
        }


@router.get("/charts")
def get_chart_data(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    role = current_user.role_name
    is_admin = role in ["admin", "superadmin"]

    # Common weekly productivity (filtered by role)
    week_data = []
    for i in range(6, -1, -1):
        day = datetime.utcnow() - timedelta(days=i)

        if is_admin:
            count = db.query(Task).filter(func.date(Task.completed_at) == day.date()).count()
        elif role == "project_manager":
            managed_ids = [p.id for p in db.query(Project).filter(
                (Project.manager_id == current_user.id) | (Project.created_by == current_user.id)
            ).all()]
            count = db.query(Task).filter(
                func.date(Task.completed_at) == day.date(),
                Task.project_id.in_(managed_ids) if managed_ids else False,
            ).count()
        else:
            count = db.query(Task).filter(
                func.date(Task.completed_at) == day.date(),
                Task.assignee_id == current_user.id,
            ).count()

        week_data.append({"date": day.strftime("%a"), "completed": count})

    # Monthly completion (filtered by role)
    monthly_data = []
    for i in range(5, -1, -1):
        first_day = (datetime.utcnow().replace(day=1) - timedelta(days=30 * i)).replace(day=1)
        if i > 0:
            last_day = (first_day + timedelta(days=32)).replace(day=1) - timedelta(days=1)
        else:
            last_day = datetime.utcnow()

        if is_admin:
            count = db.query(Task).filter(
                Task.completed_at >= first_day, Task.completed_at <= last_day
            ).count()
        elif role == "project_manager":
            managed_ids = [p.id for p in db.query(Project).filter(
                (Project.manager_id == current_user.id) | (Project.created_by == current_user.id)
            ).all()]
            count = db.query(Task).filter(
                Task.completed_at >= first_day, Task.completed_at <= last_day,
                Task.project_id.in_(managed_ids) if managed_ids else False,
            ).count()
        else:
            count = db.query(Task).filter(
                Task.completed_at >= first_day, Task.completed_at <= last_day,
                Task.assignee_id == current_user.id,
            ).count()

        monthly_data.append({"month": first_day.strftime("%b"), "completed": count})

    # Role-specific chart data
    result = {
        "weekly_productivity": week_data,
        "monthly_completion": monthly_data,
    }

    if is_admin:
        # Task progress (all)
        task_statuses = db.query(Task.status, func.count(Task.id)).group_by(Task.status).all()
        result["task_progress"] = {s: c for s, c in task_statuses}

        # Project distribution
        proj_statuses = db.query(Project.status, func.count(Project.id)).group_by(Project.status).all()
        result["project_distribution"] = {s: c for s, c in proj_statuses}

        # Bug severity stats
        bug_severity = db.query(BugReport.severity, func.count(BugReport.id)).group_by(BugReport.severity).all()
        result["bug_severity"] = {s: c for s, c in bug_severity}

    elif role == "project_manager":
        managed_ids = [p.id for p in db.query(Project).filter(
            (Project.manager_id == current_user.id) | (Project.created_by == current_user.id)
        ).all()] or [0]

        # Managed project status
        proj_statuses = db.query(Project.status, func.count(Project.id)).filter(
            Project.id.in_(managed_ids)
        ).group_by(Project.status).all()
        result["project_distribution"] = {s: c for s, c in proj_statuses}

        # Team task status
        task_statuses = db.query(Task.status, func.count(Task.id)).filter(
            Task.project_id.in_(managed_ids)
        ).group_by(Task.status).all()
        result["task_progress"] = {s: c for s, c in task_statuses}

        # Team member task counts
        team_tasks = db.query(Task.assignee_id, func.count(Task.id)).filter(
            Task.project_id.in_(managed_ids),
            Task.assignee_id != None,
            Task.status != "completed",
        ).group_by(Task.assignee_id).order_by(func.count(Task.id).desc()).limit(5).all()
        result["team_workload"] = [
            {"user_id": uid, "tasks": cnt}
            for uid, cnt in team_tasks
        ]

    else:
        # Developer personal task progress
        my_stats = db.query(Task.status, func.count(Task.id)).filter(
            Task.assignee_id == current_user.id
        ).group_by(Task.status).all()
        result["task_progress"] = {s: c for s, c in my_stats}

        # Priority distribution of my tasks
        my_priorities = db.query(Task.priority, func.count(Task.id)).filter(
            Task.assignee_id == current_user.id,
            Task.status != "completed",
        ).group_by(Task.priority).all()
        result["my_priorities"] = {p: c for p, c in my_priorities}

    return result
