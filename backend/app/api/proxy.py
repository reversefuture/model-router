from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.api_key import ApiKey
from app.models.user import User
from app.services.proxy_service import proxy_chat_completion

router = APIRouter()


async def resolve_api_key(request: Request, db: AsyncSession = Depends(get_db)):
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="缺少 API Key")
    key_value = auth[7:]

    result = await db.execute(select(ApiKey).where(ApiKey.key == key_value))
    api_key = result.scalar_one_or_none()
    if not api_key or not api_key.is_active:
        raise HTTPException(status_code=401, detail="无效或已禁用的 API Key")

    from datetime import datetime, timezone
    api_key.last_used_at = datetime.now(timezone.utc)
    await db.commit()

    result = await db.execute(select(User).where(User.id == api_key.user_id))
    user = result.scalar_one_or_none()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="用户不存在或已禁用")

    return user, api_key


@router.post("/chat/completions")
async def chat_completions(request: Request, db: AsyncSession = Depends(get_db)):
    user, api_key = await resolve_api_key(request, db)
    body = await request.json()
    try:
        data = await proxy_chat_completion(body, user.id, api_key.id, db)
        return data
    except ValueError as e:
        raise HTTPException(status_code=402, detail=str(e))
