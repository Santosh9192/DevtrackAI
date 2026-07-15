from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, UserSettings, ActivityLog
from ..schemas.user import UserUpdate, UserSettingsUpdate
from ..middleware.auth import get_current_user
import os
import shutil

router = APIRouter()


@router.get("/")
def get_profile(current_user: User = Depends(get_current_user)):
    data = current_user.to_dict()
    data["settings"] = current_user.settings.to_dict() if current_user.settings else {}
    return data


@router.put("/")
def update_profile(
    profile_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    update_data = profile_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(current_user, key, value)

    db.commit()
    db.refresh(current_user)

    return current_user.to_dict()


@router.post("/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Invalid file type. Only JPEG, PNG, GIF, WebP allowed.")

    # Create uploads directory
    upload_dir = "uploads/avatars"
    os.makedirs(upload_dir, exist_ok=True)

    # Save file
    file_path = os.path.join(upload_dir, f"user_{current_user.id}_{file.filename}")
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Update user avatar URL
    current_user.avatar_url = f"/{file_path}"
    db.commit()

    return {"avatar_url": current_user.avatar_url}


@router.get("/settings")
def get_settings(current_user: User = Depends(get_current_user)):
    if not current_user.settings:
        return {}
    return current_user.settings.to_dict()


@router.put("/settings")
def update_settings(
    settings_data: UserSettingsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.settings:
        from ..models import UserSettings
        settings = UserSettings(user_id=current_user.id)
        db.add(settings)
        db.flush()
    else:
        settings = current_user.settings

    update_data = settings_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(settings, key, value)

    db.commit()
    db.refresh(settings)

    return settings.to_dict()


@router.get("/activity")
def get_activity(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    activities = db.query(ActivityLog).filter(
        ActivityLog.user_id == current_user.id
    ).order_by(ActivityLog.created_at.desc()).limit(50).all()

    return {
        "activities": [
            {
                "id": a.id,
                "action": a.action,
                "entity_type": a.entity_type,
                "entity_id": a.entity_id,
                "description": a.description,
                "created_at": a.created_at.isoformat() if a.created_at else None,
            }
            for a in activities
        ]
    }
