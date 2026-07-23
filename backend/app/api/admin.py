from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.user import User
from app.models.order import RechargeRecord, UsageRecord
from app.utils.auth import get_admin_user
from app.schemas.user import UserInfo

router = APIRouter()


@router.get("/users", response_model=list[UserInfo])
async def list_users(
    _: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).order_by(User.created_at.desc()))
    return result.scalars().all()


@router.get("/stats")
async def admin_stats(
    _: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    from sqlalchemy import func
    user_count = await db.scalar(select(func.count(User.id)))
    total_recharge = await db.scalar(
        select(func.coalesce(func.sum(RechargeRecord.amount), 0))
    )
    total_usage = await db.scalar(
        select(func.coalesce(func.sum(UsageRecord.cost), 0))
    )
    return {
        "user_count": user_count or 0,
        "total_recharge": round(total_recharge or 0, 2),
        "total_usage": round(total_usage or 0, 2),
    }
