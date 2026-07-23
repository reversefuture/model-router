from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.user import RegisterRequest, LoginRequest, TokenResponse, UserInfo
from app.services.auth_service import register_user, login_user
from app.utils.auth import get_current_user
from app.models.user import User

router = APIRouter()


@router.post("/register", response_model=TokenResponse)
async def register(req: RegisterRequest, db: AsyncSession = Depends(get_db)):
    if len(req.password) < 6:
        raise HTTPException(status_code=400, detail="密码长度至少6位")
    try:
        user = await register_user(db, req.email, req.password, req.nickname)
        token, _ = await login_user(db, req.email, req.password)
        return TokenResponse(access_token=token, user=UserInfo.model_validate(user))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    try:
        token, user = await login_user(db, req.email, req.password)
        return TokenResponse(access_token=token, user=UserInfo.model_validate(user))
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))


@router.get("/me", response_model=UserInfo)
async def get_me(current_user: User = Depends(get_current_user)):
    return UserInfo.model_validate(current_user)
