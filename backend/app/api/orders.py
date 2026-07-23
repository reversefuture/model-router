from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.user import User
from app.models.order import RechargeRecord
from app.schemas.order import RechargeRequest, RechargeResponse, UsageStatsResponse, UsageRecordResponse
from app.utils.auth import get_current_user
from app.services.billing_service import get_usage_stats

router = APIRouter()


@router.post("/recharge", response_model=RechargeResponse)
async def recharge(
    req: RechargeRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if req.amount <= 0:
        raise HTTPException(status_code=400, detail="充值金额必须大于0")

    record = RechargeRecord(user_id=current_user.id, amount=req.amount, method=req.method)
    current_user.balance = round(current_user.balance + req.amount, 4)
    db.add(record)
    await db.commit()
    await db.refresh(record)
    return RechargeResponse.model_validate(record)


@router.get("/recharge-records", response_model=list[RechargeResponse])
async def recharge_records(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(RechargeRecord)
        .where(RechargeRecord.user_id == current_user.id)
        .order_by(RechargeRecord.created_at.desc())
        .limit(50)
    )
    return result.scalars().all()


@router.get("/usage-stats", response_model=UsageStatsResponse)
async def usage_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stats = await get_usage_stats(db, current_user.id)
    stats["recent_records"] = [UsageRecordResponse.model_validate(r) for r in stats["recent_records"]]
    return UsageStatsResponse(**stats)
