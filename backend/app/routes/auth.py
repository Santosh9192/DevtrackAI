from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..schemas.auth import LoginRequest, RegisterRequest, TokenResponse, RefreshTokenRequest, ForgotPasswordRequest, ChangePasswordRequest
from ..services.auth import authenticate_user, register_user, create_access_token, create_refresh_token, refresh_access_token, hash_password, verify_password
from ..models import User, UserSettings, Role
from ..middleware.auth import get_current_user

router = APIRouter()


@router.post("/login", response_model=TokenResponse)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    user = authenticate_user(db, login_data.email, login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    access_token = create_access_token({"sub": str(user.id)})
    refresh_token = create_refresh_token({"sub": str(user.id)})

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user.to_dict(),
    }


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(register_data: RegisterRequest, db: Session = Depends(get_db)):
    success, message, user = register_user(
        db,
        email=register_data.email,
        username=register_data.username,
        full_name=register_data.full_name,
        password=register_data.password,
        role_id=register_data.role_id,
    )

    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=message)

    # Create default settings
    settings = UserSettings(user_id=user.id)
    db.add(settings)
    db.commit()

    return {"message": message, "user": user.to_dict()}


@router.post("/refresh")
def refresh_token(token_data: RefreshTokenRequest):
    result = refresh_access_token(token_data.refresh_token)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )
    return result


@router.post("/forgot-password")
def forgot_password(forgot_data: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == forgot_data.email).first()
    if not user:
        # Don't reveal if email exists
        return {"message": "If the email exists, a password reset link has been sent."}

    # In production, send email here
    return {"message": "If the email exists, a password reset link has been sent."}


@router.post("/change-password")
def change_password(
    password_data: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not verify_password(password_data.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    current_user.hashed_password = hash_password(password_data.new_password)
    db.commit()

    return {"message": "Password changed successfully"}


@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return current_user.to_dict()
