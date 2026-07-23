import math
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.models.order import UsageRecord
from app.models.model import Model


async def calculate_cost(input_tokens: int, output_tokens: int, model_name: str, db: AsyncSession) -> float:
    result = await db.execute(select(Model).where(Model.name == model_name))
    model = result.scalar_one_or_none()
    if not model:
        return 0.0

    input_cost = (input_tokens / 1000) * model.input_price
    output_cost = (output_tokens / 1000) * model.output_price
    return round(input_cost + output_cost, 6)


async def record_usage(
    db: AsyncSession,
    user_id: str,
    api_key_id: str,
    model_name: str,
    input_tokens: int,
    output_tokens: int,
    cost: float,
    request_id: str,
) -> UsageRecord:
    record = UsageRecord(
        user_id=user_id,
        api_key_id=api_key_id,
        model_name=model_name,
        input_tokens=input_tokens,
        output_tokens=output_tokens,
        cost=cost,
        request_id=request_id,
    )
    db.add(record)
    await db.commit()
    await db.refresh(record)
    return record


async def deduct_balance(db: AsyncSession, user, cost: float):
    if user.balance < cost:
        raise ValueError("余额不足")
    user.balance = round(user.balance - cost, 4)
    await db.commit()


async def get_usage_stats(db: AsyncSession, user_id: str):
    total_calls = await db.scalar(
        select(func.count(UsageRecord.id)).where(UsageRecord.user_id == user_id)
    )
    total_cost = await db.scalar(
        select(func.coalesce(func.sum(UsageRecord.cost), 0)).where(UsageRecord.user_id == user_id)
    )
    total_input = await db.scalar(
        select(func.coalesce(func.sum(UsageRecord.input_tokens), 0)).where(UsageRecord.user_id == user_id)
    )
    total_output = await db.scalar(
        select(func.coalesce(func.sum(UsageRecord.output_tokens), 0)).where(UsageRecord.user_id == user_id)
    )
    recent = await db.execute(
        select(UsageRecord)
        .where(UsageRecord.user_id == user_id)
        .order_by(UsageRecord.created_at.desc())
        .limit(20)
    )
    return {
        "total_calls": total_calls or 0,
        "total_cost": round(total_cost or 0, 4),
        "total_input_tokens": total_input or 0,
        "total_output_tokens": total_output or 0,
        "recent_records": recent.scalars().all(),
    }
