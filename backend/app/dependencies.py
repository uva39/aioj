from fastapi import Depends, Header
from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import uuid

from app.database import get_db
from app.models.user import User
from app.core.security import decode_token
from app.core.exceptions import UnauthorizedError, ForbiddenError


async def get_current_user(
    authorization: str = Header(...),
    db: AsyncSession = Depends(get_db),
) -> User:
    if not authorization.startswith("Bearer "):
        raise UnauthorizedError()
    token = authorization[7:]
    try:
        payload = decode_token(token)
        if payload.get("type") != "access":
            raise UnauthorizedError()
        user_id = uuid.UUID(payload["sub"])
    except (JWTError, ValueError, KeyError):
        raise UnauthorizedError()

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user or not user.is_active:
        raise UnauthorizedError()
    return user


async def get_current_admin(
    current_user: User = Depends(get_current_user),
) -> User:
    if current_user.role != "admin":
        raise ForbiddenError("관리자 권한이 필요합니다.")
    return current_user


async def get_current_setter_or_admin(
    current_user: User = Depends(get_current_user),
) -> User:
    if current_user.role not in ("setter", "admin"):
        raise ForbiddenError("출제자 이상의 권한이 필요합니다.")
    return current_user
