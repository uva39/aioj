from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import date

from app.database import get_db
from app.models.user import User, CategoryRating
from app.models.submission import Submission, UserProblemStat
from app.schemas.user import UserMe, UserPublic, UserStats
from app.dependencies import get_current_user
from app.core.exceptions import NotFoundError

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("/me", response_model=UserMe)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.get("/{username}", response_model=UserPublic)
async def get_user(username: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.username == username))
    user = result.scalar_one_or_none()
    if not user:
        raise NotFoundError(f"'{username}' 사용자를 찾을 수 없습니다.")
    return user


@router.get("/{username}/stats", response_model=UserStats)
async def get_user_stats(username: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.username == username))
    user = result.scalar_one_or_none()
    if not user:
        raise NotFoundError()

    cat_result = await db.execute(
        select(CategoryRating).where(CategoryRating.user_id == user.id)
    )
    cat_ratings = cat_result.scalars().all()

    return UserStats(
        username=user.username,
        tier=user.tier,
        rating=user.rating,
        solved_count=user.solved_count,
        streak_current=user.streak_current,
        streak_max=user.streak_max,
        category_ratings=[
            {"category": cr.category, "rating": cr.rating, "solved_count": cr.solved_count}
            for cr in cat_ratings
        ],
    )


@router.get("/{username}/calendar")
async def get_user_calendar(username: str, db: AsyncSession = Depends(get_db)):
    """날짜별 AC 수 반환 (GitHub 잔디용)."""
    result = await db.execute(select(User).where(User.username == username))
    user = result.scalar_one_or_none()
    if not user:
        raise NotFoundError()

    rows = await db.execute(
        select(
            func.date(Submission.created_at).label("day"),
            func.count().label("count"),
        )
        .where(Submission.user_id == user.id, Submission.status == "accepted")
        .group_by(func.date(Submission.created_at))
    )
    return [{"date": str(row.day), "count": row.count} for row in rows]
