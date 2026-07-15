from fastapi import APIRouter
from .auth import router as auth_router
from .users import router as users_router
from .projects import router as projects_router
from .tasks import router as tasks_router
from .comments import router as comments_router
from .bugs import router as bugs_router
from .notifications import router as notifications_router
from .dashboard import router as dashboard_router
from .profile import router as profile_router
from .ai import router as ai_router
from .admin import router as admin_router

api_router = APIRouter(prefix="/api")

api_router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users_router, prefix="/users", tags=["Users"])
api_router.include_router(projects_router, prefix="/projects", tags=["Projects"])
api_router.include_router(tasks_router, prefix="/tasks", tags=["Tasks"])
api_router.include_router(comments_router, prefix="/comments", tags=["Comments"])
api_router.include_router(bugs_router, prefix="/bugs", tags=["Bug Reports"])
api_router.include_router(notifications_router, prefix="/notifications", tags=["Notifications"])
api_router.include_router(dashboard_router, prefix="/dashboard", tags=["Dashboard"])
api_router.include_router(profile_router, prefix="/profile", tags=["Profile"])
api_router.include_router(ai_router, prefix="/ai", tags=["AI Features"])
api_router.include_router(admin_router, prefix="/admin", tags=["Admin"])
