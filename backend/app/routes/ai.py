import random
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from ..database import get_db
from ..models import User, Task, Project, Notification
from ..middleware.auth import get_current_user
from ..config import settings

router = APIRouter()


class AIRequest(BaseModel):
    prompt: str
    context: Optional[dict] = None


# Mock AI responses
MOCK_RESPONSES = {
    "generate_task": "This task involves implementing a new feature that requires careful planning and execution. "
                     "The developer should start by analyzing requirements, then design the solution architecture, "
                     "implement the code changes, write unit tests, and finally perform integration testing.",
    "generate_sprint": "Sprint Summary:\n\n"
                       "Completed Stories: 8\n"
                       "Total Story Points: 34\n"
                       "Completed Points: 28 (82% completion rate)\n\n"
                       "Key Achievements:\n"
                       "- Implemented user authentication module\n"
                       "- Completed dashboard redesign\n"
                       "- Fixed critical performance issues\n\n"
                       "Blockers:\n"
                       "- Awaiting third-party API integration\n"
                       "- Database migration pending review\n\n"
                       "Next Sprint Goals:\n"
                       "- Complete remaining 2 stories\n"
                       "- Begin API documentation\n"
                       "- Performance optimization sprint",
    "rewrite_bug": "Bug Report:\n\n"
                   "Issue: Application crashes when user submits form with invalid data\n\n"
                   "Severity: High\n"
                   "Steps to Reproduce:\n"
                   "1. Navigate to the form page\n"
                   "2. Leave required fields empty\n"
                   "3. Click submit\n"
                   "4. Application crashes with unhandled exception\n\n"
                   "Root Cause: Missing null check on form data before processing\n"
                   "Suggested Fix: Add input validation and error handling middleware",
    "generate_report": "Weekly Progress Report\n"
                       "====================\n\n"
                       "Period: Last 7 Days\n\n"
                       "Completed Tasks: 12\n"
                       "In Progress: 5\n"
                       "Code Reviews: 8\n"
                       "Bugs Fixed: 3\n\n"
                       "Highlights:\n"
                       "- Delivered feature X ahead of schedule\n"
                       "- Reduced API response time by 40%\n"
                       "- Onboarded 2 new team members\n\n"
                       "Challenges:\n"
                       "- Integration with legacy system\n"
                       "- Resource constraints on QA\n\n"
                       "Next Week Plan:\n"
                       "- Complete feature Y implementation\n"
                       "- Performance audit\n"
                       "- Team knowledge sharing session",
    "estimate_complexity": "Task Complexity Analysis:\n\n"
                           "Estimated Complexity: Medium\n"
                           "Story Points: 5\n"
                           "\n"
                           "Factors Considered:\n"
                           "- Number of files to modify: 3-5\n"
                           "- New concepts involved: 2\n"
                           "- Dependencies: 1 external service\n"
                           "- Testing effort: Moderate\n\n"
                           "Recommended:\n"
                           "- Assign to mid-level developer\n"
                           "- Estimated time: 2-3 days\n"
                           "- Code review required",
    "daily_standup": "Daily Standup Report\n"
                     "====================\n\n"
                     "Yesterday:\n"
                     "- Completed implementation of search feature\n"
                     "- Fixed 2 bugs in the authentication module\n"
                     "- Attended sprint planning meeting\n\n"
                     "Today:\n"
                     "- Start work on user profile page\n"
                     "- Review pull request #142\n"
                     "- Write unit tests for notification service\n\n"
                     "Blockers:\n"
                     "- Waiting for API documentation from backend team\n",
}

TEMPLATES = {
    "generate_task": "Generate a detailed task description for: ",
    "generate_sprint": "Generate a sprint summary for the current sprint. ",
    "rewrite_bug": "Rewrite and improve this bug report: ",
    "generate_report": "Generate a weekly progress report. ",
    "estimate_complexity": "Estimate the complexity of this task. ",
    "daily_standup": "Generate a daily standup report. ",
}


def get_ai_response(prompt: str, context: Optional[dict] = None) -> str:
    """Try Gemini API, fall back to mock AI."""
    if settings.GEMINI_API_KEY:
        try:
            import google.generativeai as genai
            genai.configure(api_key=settings.GEMINI_API_KEY)
            model = genai.GenerativeModel('gemini-pro')
            response = model.generate_content(prompt)
            return response.text
        except Exception:
            pass

    # Mock AI mode
    for key, template in TEMPLATES.items():
        if template.strip() in prompt or key.replace("_", " ") in prompt.lower():
            return MOCK_RESPONSES.get(key, MOCK_RESPONSES["generate_task"])

    return random.choice(list(MOCK_RESPONSES.values()))


@router.post("/generate")
def generate_ai_content(
    request: AIRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    prompt = request.prompt
    context = request.context

    # Enhance prompt with context if available
    if context:
        if "project" in context:
            project = db.query(Project).filter(Project.id == context["project"]).first()
            if project:
                prompt += f"\nProject context: {project.name} - {project.description}"
        if "task" in context:
            task = db.query(Task).filter(Task.id == context["task"]).first()
            if task:
                prompt += f"\nTask context: {task.title} - {task.description}"

    response = get_ai_response(prompt)

    # Log AI usage as notification
    notif = Notification(
        user_id=current_user.id,
        title="AI Report Ready",
        message="Your AI-generated content is ready",
        notification_type="ai_report",
    )
    db.add(notif)
    db.commit()

    return {"response": response}


@router.get("/features")
def get_ai_features():
    return {
        "features": [
            {
                "id": "generate_task",
                "name": "Generate Task Description",
                "description": "AI generates detailed task descriptions with requirements and acceptance criteria",
                "icon": "task",
            },
            {
                "id": "generate_sprint",
                "name": "Generate Sprint Summary",
                "description": "Create comprehensive sprint summaries with achievements and blockers",
                "icon": "sprint",
            },
            {
                "id": "rewrite_bug",
                "name": "Rewrite Bug Report",
                "description": "Improve and restructure bug reports for clarity",
                "icon": "bug",
            },
            {
                "id": "generate_report",
                "name": "Generate Weekly Progress Report",
                "description": "Auto-generate weekly progress reports for stakeholders",
                "icon": "report",
            },
            {
                "id": "estimate_complexity",
                "name": "Estimate Task Complexity",
                "description": "AI analyzes tasks and estimates complexity and story points",
                "icon": "complexity",
            },
            {
                "id": "daily_standup",
                "name": "Generate Daily Standup Report",
                "description": "Create daily standup reports with yesterday, today, and blockers",
                "icon": "standup",
            },
        ],
        "mock_mode": not bool(settings.GEMINI_API_KEY),
    }
