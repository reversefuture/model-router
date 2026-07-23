import bcrypt as _bcrypt
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.user import User
from app.utils.auth import create_access_token


def _hash(pw: str) -> str:
    return _bcrypt.hashpw(pw.encode(), _bcrypt.gensalt()).decode()


def _verify(pw: str, hashed: str) -> bool:
    return _bcrypt.checkpw(pw.encode(), hashed.encode())


async def register_user(db: AsyncSession, email: str, password: str, nickname: str = "") -> User:
    result = await db.execute(select(User).where(User.email == email))
    if result.scalar_one_or_none():
        raise ValueError("邮箱已被注册")

    user = User(
        email=email,
        hashed_password=_hash(password),
        nickname=nickname or email.split("@")[0],
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


async def login_user(db: AsyncSession, email: str, password: str) -> tuple[str, User]:
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if not user or not _verify(password, user.hashed_password):
        raise ValueError("邮箱或密码错误")

    if not user.is_active:
        raise ValueError("账号已被禁用")

    token = create_access_token(user.id)
    return token, user
