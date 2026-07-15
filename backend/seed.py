"""DevTrack AI - Database Seed Script
Run this AFTER the schema is created and the server has been started once.
Generates proper bcrypt hashes and inserts comprehensive sample data.

Usage:
    cd backend
    python seed.py
"""

import sys
import os
import datetime
from passlib.hash import bcrypt
from sqlalchemy.orm import Session

sys.path.insert(0, os.path.dirname(__file__))

from app.database import SessionLocal
from app.models import (
    Role, User, UserSettings, Project, ProjectMember,
    Task, TaskComment, BugReport, BugComment,
    Notification, ActivityLog
)


def hash_password(password: str) -> str:
    return bcrypt.using(rounds=12).hash(password)


def log(msg):
    print(msg)
    sys.stdout.flush()


def seed():
    db: Session = SessionLocal()
    try:
        log("=== Seeding DevTrack AI database... ===")

        # ---- Roles ----
        if not db.query(Role).first():
            roles = [
                Role(name="admin", description="Administrator with full system access"),
                Role(name="project_manager", description="Project manager"),
                Role(name="developer", description="Developer"),
            ]
            db.add_all(roles)
            db.flush()
            log("  [OK] Roles created")
        else:
            roles = db.query(Role).all()
            log("  [i] Roles already exist")

        role_map = {r.name: r.id for r in roles}

        # ---- Users ----
        now = datetime.datetime.utcnow()
        users_data = [
            ("admin@devtrack.ai", "admin", "System Admin", "Admin@123", "admin", "Administration", "System Administrator"),
            ("manager@devtrack.ai", "manager", "Sarah Johnson", "Manager@123", "project_manager", "Engineering", "Senior Project Manager"),
            ("dev@devtrack.ai", "developer", "Mike Chen", "Dev@123", "developer", "Engineering", "Full Stack Developer"),
            ("alice@devtrack.ai", "alice", "Alice Williams", "Dev@123", "developer", "Engineering", "Frontend Developer"),
            ("bob@devtrack.ai", "bob", "Bob Martinez", "Dev@123", "developer", "Design", "UI/UX Designer"),
            ("carol@devtrack.ai", "carol", "Carol Davis", "Dev@123", "developer", "Engineering", "Backend Developer"),
            ("david@devtrack.ai", "david", "David Kim", "Manager@123", "project_manager", "Product", "Product Manager"),
        ]

        user_map = {}
        for email, uname, full, pw, role, dept, title in users_data:
            existing = db.query(User).filter(User.email == email).first()
            if existing:
                user_map[uname] = existing.id
                continue
            user = User(
                email=email, username=uname, full_name=full,
                hashed_password=hash_password(pw), role_id=role_map[role],
                department=dept, designation=title, is_active=1, is_verified=1,
            )
            db.add(user)
            db.flush()
            user_map[uname] = user.id

        log(f"  [OK] {len(users_data)} users ready")

        # ---- User Settings ----
        for uid in user_map.values():
            if not db.query(UserSettings).filter(UserSettings.user_id == uid).first():
                db.add(UserSettings(user_id=uid, theme="dark", language="en"))
        db.flush()
        log("  [OK] User settings created")

        # ---- Projects ----
        today = datetime.date.today()
        projects = [
            ("DevTrack AI Platform", "AI-powered project management platform with kanban, bugs, and analytics.",
             "in_progress", "critical", 65.0, today + datetime.timedelta(days=45), today - datetime.timedelta(days=30),
             "admin", "manager", ["admin", "manager", "developer", "alice", "bob", "carol"], None),
            ("Mobile App Redesign", "Complete redesign of mobile app with modern UI/UX.",
             "in_progress", "high", 40.0, today + datetime.timedelta(days=60), today - datetime.timedelta(days=14),
             "manager", "david", ["manager", "david", "alice", "bob"], None),
            ("API Gateway Migration", "Migrate to new microservices architecture.",
             "pending", "high", 0.0, today + datetime.timedelta(days=90), today + datetime.timedelta(days=7),
             "admin", "manager", ["admin", "manager", "developer", "carol"], None),
            ("Customer Dashboard MVP", "Customer-facing analytics dashboard with real-time data.",
             "completed", "medium", 100.0, today - datetime.timedelta(days=5), today - datetime.timedelta(days=60),
             "david", "david", ["david", "alice", "carol", "bob"], now - datetime.timedelta(days=2)),
            ("Security Audit", "SOC2 compliance and security audit.",
             "on_hold", "critical", 25.0, today + datetime.timedelta(days=30), today - datetime.timedelta(days=20),
             "admin", "manager", ["admin", "manager", "developer"], None),
            ("Documentation Portal", "Centralized docs with API guides and onboarding.",
             "pending", "low", 0.0, today + datetime.timedelta(days=120), None,
             "manager", None, ["manager", "bob"], None),
        ]

        proj_map = {}
        for name, desc, status, priority, progress, deadline, start, creator, mgr, members, completed in projects:
            existing = db.query(Project).filter(Project.name == name).first()
            if existing:
                proj_map[name] = existing.id
                continue
            p = Project(
                name=name, description=desc, status=status, priority=priority,
                progress=progress, deadline=deadline, start_date=start,
                created_by=user_map[creator], manager_id=user_map[mgr] if mgr else None,
                completed_at=completed,
            )
            db.add(p)
            db.flush()
            for uname in members:
                uid = user_map[uname]
                rp = "manager" if uid == p.manager_id else "developer"
                if not db.query(ProjectMember).filter(
                    ProjectMember.project_id == p.id, ProjectMember.user_id == uid
                ).first():
                    db.add(ProjectMember(project_id=p.id, user_id=uid, role_in_project=rp))
            proj_map[name] = p.id

        db.flush()
        log(f"  [OK] {len(projects)} projects created")

        # ---- Tasks ----
        tasks = [
            ("Design user authentication flow", "JWT auth with login, register, and password reset.",
             "completed", "critical", "medium", 8, "DevTrack AI Platform", "developer", "manager",
             today - datetime.timedelta(days=10), 16, 0, now - datetime.timedelta(days=5)),
            ("Build Kanban board component", "Drag-and-drop kanban with 4 columns.",
             "completed", "high", "hard", 13, "DevTrack AI Platform", "developer", "manager",
             today - datetime.timedelta(days=3), 24, 1, now - datetime.timedelta(days=1)),
            ("Implement dashboard charts", "Recharts: task progress, weekly productivity, monthly completion.",
             "in_progress", "high", "medium", 8, "DevTrack AI Platform", "alice", "manager",
             today + datetime.timedelta(days=5), 12, 2, None),
            ("Add AI-powered task generation", "Gemini API for task descriptions, sprint summaries, standups.",
             "in_progress", "medium", "hard", 13, "DevTrack AI Platform", "carol", "manager",
             today + datetime.timedelta(days=14), 20, 3, None),
            ("Write unit tests for API", "Test suite for all CRUD endpoints.",
             "todo", "medium", "medium", 8, "DevTrack AI Platform", "developer", "manager",
             today + datetime.timedelta(days=10), 16, 4, None),
            ("Implement notification system", "Real-time notifications for assignments, completions, deadlines.",
             "review", "high", "medium", 8, "DevTrack AI Platform", "carol", "manager",
             today + datetime.timedelta(days=3), 10, 5, None),
            ("Create wireframes for new UI", "Low-fidelity wireframes for all mobile screens.",
             "completed", "high", "medium", 5, "Mobile App Redesign", "bob", "david",
             today - datetime.timedelta(days=2), 8, 0, now - datetime.timedelta(days=1)),
            ("Implement new navigation system", "Gesture-based navigation replacement.",
             "in_progress", "critical", "hard", 13, "Mobile App Redesign", "alice", "david",
             today + datetime.timedelta(days=7), 24, 1, None),
            ("Build analytics data pipeline", "ETL pipeline for usage data.",
             "completed", "high", "hard", 13, "Customer Dashboard MVP", "carol", "david",
             today - datetime.timedelta(days=15), 20, 0, now - datetime.timedelta(days=12)),
            ("Create real-time chart components", "Live-updating charts via WebSocket.",
             "completed", "medium", "medium", 8, "Customer Dashboard MVP", "alice", "david",
             today - datetime.timedelta(days=10), 12, 1, now - datetime.timedelta(days=8)),
            ("User acceptance testing", "Coordinate UAT with stakeholders.",
             "completed", "high", "easy", 5, "Customer Dashboard MVP", "david", "david",
             today - datetime.timedelta(days=5), 8, 2, now - datetime.timedelta(days=3)),
        ]

        for title, desc, status, priority, complexity, points, proj, assignee, creator, deadline, hours, order, completed in tasks:
            existing = db.query(Task).filter(Task.title == title, Task.project_id == proj_map[proj]).first()
            if existing:
                continue
            is_overdue = 1 if deadline and deadline < today and status != "completed" else 0
            t = Task(
                title=title, description=desc, status=status, priority=priority,
                complexity=complexity, story_points=points, project_id=proj_map[proj],
                assignee_id=user_map[assignee], created_by=user_map[creator],
                deadline=deadline, estimated_hours=hours, board_order=order,
                completed_at=completed, is_overdue=is_overdue,
            )
            db.add(t)

        db.flush()
        log(f"  [OK] {len(tasks)} tasks created")

        # ---- Task Comments ----
        comments = [
            ("Build Kanban board component", "manager", "Great work! The drag-and-drop feels smooth. Can we add auto-save?"),
            ("Build Kanban board component", "developer", "Thanks! Auto-save is already in progress."),
            ("Implement dashboard charts", "alice", "Finished the pie chart. Working on the line chart now."),
            ("Implement notification system", "carol", "Ready for review. Added email fallback too."),
        ]
        cc = 0
        for task_title, uname, content in comments:
            t = db.query(Task).filter(Task.title == task_title).first()
            if t and not db.query(TaskComment).filter(TaskComment.task_id == t.id, TaskComment.content == content).first():
                db.add(TaskComment(task_id=t.id, user_id=user_map[uname], content=content))
                cc += 1
        db.flush()
        log(f"  [OK] {cc} task comments created")

        # ---- Bug Reports ----
        bugs = [
            ("Login page crashes on invalid input", "500 error on special chars in login form.",
             "1. Go to login page\n2. Enter '--DROP TABLE' in email\n3. Click submit\n4. Page crashes",
             "critical", "critical", "open", "DevTrack AI Platform", "alice", "developer", None),
            ("Kanban card not persisting after drag", "Drag position lost on page refresh.",
             "1. Open kanban board\n2. Drag task to new column\n3. Refresh page\n4. Task is back in original position",
             "high", "high", "in_progress", "DevTrack AI Platform", "bob", "developer", None),
            ("Dashboard charts not loading in Safari", "Recharts fails in Safari browser.",
             "1. Open in Safari\n2. Go to Dashboard\n3. Charts are blank\n4. Console shows Recharts errors",
             "medium", "high", "open", "DevTrack AI Platform", "bob", "alice", None),
            ("Notification count badge stale", "Badge shows wrong count after reading notifications.",
             "1. Have 5 unread\n2. Mark 3 as read\n3. Badge still shows 5\n4. Refresh fixes it",
             "low", "medium", "open", "DevTrack AI Platform", "carol", "developer", None),
            ("Mobile nav overlaps content", "Sidebar overlaps page on mobile viewport.",
             "1. Open on mobile (<768px)\n2. Click hamburger menu\n3. Content visible behind sidebar",
             "medium", "medium", "open", "Mobile App Redesign", "bob", "alice", None),
            ("API returns 500 for empty project list", "Division by zero on empty projects.",
             "1. New user with no projects\n2. GET /api/projects/\n3. Returns 500",
             "high", "critical", "resolved", "DevTrack AI Platform", "developer", "carol",
             now - datetime.timedelta(days=1)),
        ]

        bc = 0
        for title, desc, steps, severity, priority, status, proj, reporter, assignee, resolved in bugs:
            existing = db.query(BugReport).filter(BugReport.title == title).first()
            if existing:
                continue
            b = BugReport(
                title=title, description=desc, steps_to_reproduce=steps,
                severity=severity, priority=priority, status=status,
                project_id=proj_map[proj], reported_by=user_map[reporter],
                assigned_to=user_map[assignee], resolved_at=resolved,
            )
            db.add(b)
            bc += 1

        db.flush()
        log(f"  [OK] {bc} bug reports created")

        # ---- Bug Comments ----
        bug_comments = [
            ("Kanban card not persisting after drag", "developer", "Found the issue - board_order not updated on drop. Fix in review."),
            ("Kanban card not persisting after drag", "manager", "Great! Let's prioritize for next release."),
            ("API returns 500 for empty project list", "carol", "Fixed! Division by zero on empty projects."),
        ]
        bcc = 0
        for bug_title, uname, content in bug_comments:
            bug = db.query(BugReport).filter(BugReport.title == bug_title).first()
            if bug and not db.query(BugComment).filter(BugComment.bug_id == bug.id, BugComment.content == content).first():
                db.add(BugComment(bug_id=bug.id, user_id=user_map[uname], content=content))
                bcc += 1
        db.flush()
        log(f"  [OK] {bcc} bug comments created")

        # ---- Notifications ----
        notifs = [
            ("developer", "Task Assigned", "Assigned to 'Implement notification system'", "task_assigned"),
            ("alice", "Task Assigned", "Assigned to 'Implement dashboard charts'", "task_assigned"),
            ("carol", "Task Assigned", "Assigned to 'Add AI-powered task generation'", "task_assigned"),
            ("developer", "Bug Assigned", "Bug 'Login page crashes' assigned to you", "bug_assigned"),
            ("manager", "Project Deadline", "Project deadline approaching in 45 days", "project_deadline"),
            ("admin", "AI Report Ready", "Weekly report generated by AI", "ai_report"),
        ]
        nc = 0
        for uname, title, msg, ntype in notifs:
            if not db.query(Notification).filter(
                Notification.user_id == user_map[uname], Notification.title == title, Notification.message == msg
            ).first():
                db.add(Notification(user_id=user_map[uname], title=title, message=msg, notification_type=ntype, is_read=0))
                nc += 1
        db.flush()
        log(f"  [OK] {nc} notifications created")

        # ---- Activity Logs ----
        activities = [
            ("admin", "created_project", "project", "Created project 'DevTrack AI Platform'"),
            ("manager", "created_task", "task", "Created task 'Design user authentication flow'"),
            ("developer", "completed_task", "task", "Completed task 'Design user authentication flow'"),
            ("developer", "completed_task", "task", "Completed task 'Build Kanban board component'"),
            ("david", "created_project", "project", "Created project 'Customer Dashboard MVP'"),
            ("alice", "reported_bug", "bug", "Reported bug 'Login page crashes on invalid input'"),
            ("carol", "resolved_bug", "bug", "Resolved bug 'API returns 500 for empty project list'"),
            ("manager", "updated_project", "project", "Updated project progress to 65%"),
        ]
        ac = 0
        for uname, action, etype, desc in activities:
            if not db.query(ActivityLog).filter(
                ActivityLog.user_id == user_map[uname], ActivityLog.action == action, ActivityLog.description == desc
            ).first():
                db.add(ActivityLog(user_id=user_map[uname], action=action, entity_type=etype, description=desc))
                ac += 1

        db.commit()
        log(f"  [OK] {ac} activity logs created")

        log("")
        log("*** Database seeding complete! ***")
        log("=" * 50)
        log("Sample Accounts:")
        log("  Admin:     admin@devtrack.ai / Admin@123")
        log("  Manager:   manager@devtrack.ai / Manager@123")
        log("  Developer: dev@devtrack.ai / Dev@123")
        log("  Designer:  bob@devtrack.ai / Dev@123")
        log("=" * 50)

    except Exception as e:
        db.rollback()
        log(f"[ERROR] Seeding failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
