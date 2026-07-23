import secrets
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.api_key import ApiKey
from app.models.user import User
from app.schemas.api_key import ApiKeyResponse, CreateApiKeyRequest
from app.utils.auth import get_current_user

router = APIRouter()


def _generate_key() -> str:
    return f"sk-{secrets.token_hex(24)}"


@router.get("", response_model=list[ApiKeyResponse])
async def list_keys(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(ApiKey).where(ApiKey.user_id == current_user.id).order_by(ApiKey.created_at.desc())
    )
    return result.scalars().all()


@router.post("", response_model=ApiKeyResponse)
async def create_key(req: CreateApiKeyRequest, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    key = ApiKey(user_id=current_user.id, key=_generate_key(), name=req.name or "默认")
    db.add(key)
    await db.commit()
    await db.refresh(key)
    return ApiKeyResponse.model_validate(key)


@router.delete("/{key_id}")
async def delete_key(key_id: str, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ApiKey).where(ApiKey.id == key_id, ApiKey.user_id == current_user.id))
    key = result.scalar_one_or_none()
    if not key:
        raise HTTPException(status_code=404, detail="Key 不存在")
    await db.delete(key)
    await db.commit()
    return {"message": "已删除"}


@router.post("/{key_id}/toggle", response_model=ApiKeyResponse)
async def toggle_key(key_id: str, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ApiKey).where(ApiKey.id == key_id, ApiKey.user_id == current_user.id))
    key = result.scalar_one_or_none()
    if not key:
        raise HTTPException(status_code=404, detail="Key 不存在")
    key.is_active = not key.is_active
    await db.commit()
    await db.refresh(key)
    return ApiKeyResponse.model_validate(key)
