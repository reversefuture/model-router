from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.model import Model
from app.models.user import User
from app.schemas.model import ModelResponse, CreateModelRequest, UpdateModelRequest
from app.utils.auth import get_current_user, get_admin_user

router = APIRouter()


@router.get("", response_model=list[ModelResponse])
async def list_models(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Model).where(Model.is_active == True).order_by(Model.sort_order)
    )
    return result.scalars().all()


@router.get("/all", response_model=list[ModelResponse])
async def list_all_models(
    current_user: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Model).order_by(Model.sort_order))
    return result.scalars().all()


@router.post("", response_model=ModelResponse)
async def create_model(
    req: CreateModelRequest,
    _: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    model = Model(**req.model_dump())
    db.add(model)
    await db.commit()
    await db.refresh(model)
    return ModelResponse.model_validate(model)


@router.put("/{model_id}", response_model=ModelResponse)
async def update_model(
    model_id: str,
    req: UpdateModelRequest,
    _: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Model).where(Model.id == model_id))
    model = result.scalar_one_or_none()
    if not model:
        raise HTTPException(status_code=404, detail="模型不存在")
    for key, val in req.model_dump(exclude_unset=True).items():
        setattr(model, key, val)
    await db.commit()
    await db.refresh(model)
    return ModelResponse.model_validate(model)


@router.delete("/{model_id}")
async def delete_model(
    model_id: str,
    _: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Model).where(Model.id == model_id))
    model = result.scalar_one_or_none()
    if not model:
        raise HTTPException(status_code=404, detail="模型不存在")
    await db.delete(model)
    await db.commit()
    return {"message": "已删除"}
