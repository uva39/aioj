"""
레이팅 계산 서비스.
solved.ac 방식: 상위 N개 문제 점수의 가중 합산.
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import date, timedelta

from app.models.user import User, CategoryRating
from app.models.submission import UserProblemStat
from app.models.problem import Problem

TIER_POINTS = {
    "iron": 50,
    "bronze": 100,
    "silver": 200,
    "gold": 350,
    "platinum": 550,
    "diamond": 800,
    "ruby": 1200,
}

TIER_THRESHOLDS = [
    (6000, "ruby"),
    (4000, "diamond"),
    (2500, "platinum"),
    (1400, "gold"),
    (700, "silver"),
    (300, "bronze"),
    (0, "iron"),
]

DECAY_FACTOR = 0.9


def rating_to_tier(rating: int) -> str:
    for threshold, tier in TIER_THRESHOLDS:
        if rating >= threshold:
            return tier
    return "iron"


async def recalculate_user_rating(user_id, db: AsyncSession) -> None:
    """사용자의 전체 레이팅과 티어를 재계산."""
    # AC된 문제 목록 가져오기 (문제 난이도 포함)
    rows = await db.execute(
        select(Problem.difficulty, UserProblemStat.best_score)
        .join(UserProblemStat, UserProblemStat.problem_id == Problem.id)
        .where(
            UserProblemStat.user_id == user_id,
            UserProblemStat.best_status == "accepted",
        )
    )
    solved = rows.all()

    if not solved:
        return

    # 각 문제의 포인트 계산 (난이도 기반)
    points = sorted(
        [TIER_POINTS.get(row.difficulty, 0) for row in solved],
        reverse=True
    )

    # 감쇠 합산
    rating = sum(p * (DECAY_FACTOR ** i) for i, p in enumerate(points))
    rating = int(rating)

    # DB 업데이트
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user:
        user.rating = rating
        user.tier = rating_to_tier(rating)


def update_streak(user: User, solved_today: bool) -> None:
    """스트릭 갱신 (last_solved_at 기준)."""
    from datetime import datetime, timezone
    today = date.today()

    if not solved_today:
        return

    if user.last_solved_at is None:
        user.streak_current = 1
    else:
        last_date = user.last_solved_at.date()
        if last_date == today:
            pass  # 오늘 이미 풀었음, 스트릭 유지
        elif last_date == today - timedelta(days=1):
            user.streak_current += 1
        else:
            user.streak_current = 1  # 연속 끊김

    if user.streak_current > user.streak_max:
        user.streak_max = user.streak_current

    user.last_solved_at = datetime.now(timezone.utc)
