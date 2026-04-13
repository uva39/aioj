from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.user import User

router = APIRouter(prefix="/api/leaderboard", tags=["leaderboard"])


@router.get("", response_model=list[dict])
async def get_leaderboard(
    tier: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    query = select(User).where(User.is_active == True)
    if tier:
        query = query.where(User.tier == tier)
    query = query.order_by(User.rating.desc()).offset((page - 1) * limit).limit(limit)

    result = await db.execute(query)
    users = result.scalars().all()
    return [
        {
            "rank": (page - 1) * limit + i + 1,
            "username": u.username,
            "tier": u.tier,
            "rating": u.rating,
            "solved_count": u.solved_count,
        }
        for i, u in enumerate(users)
    ]
