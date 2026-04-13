from datetime import date, timedelta, datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import select

TIER_POINTS = {
    "iron": 50, "bronze": 100, "silver": 200, "gold": 350,
    "platinum": 550, "diamond": 800, "ruby": 1200,
}
TIER_THRESHOLDS = [
    (6000, "ruby"), (4000, "diamond"), (2500, "platinum"),
    (1400, "gold"), (700, "silver"), (300, "bronze"), (0, "iron"),
]
DECAY = 0.9


def rating_to_tier(rating: int) -> str:
    for threshold, tier in TIER_THRESHOLDS:
        if rating >= threshold:
            return tier
    return "iron"


def recalculate_user_rating_sync(user_id, db: Session) -> None:
    from app.models.user import User
    from app.models.submission import UserProblemStat
    from app.models.problem import Problem

    rows = db.execute(
        select(Problem.difficulty)
        .join(UserProblemStat, UserProblemStat.problem_id == Problem.id)
        .where(UserProblemStat.user_id == user_id, UserProblemStat.best_status == "accepted")
    ).all()

    if not rows:
        return

    points = sorted([TIER_POINTS.get(r.difficulty, 0) for r in rows], reverse=True)
    rating = int(sum(p * (DECAY ** i) for i, p in enumerate(points)))

    user = db.get(User, user_id)
    if user:
        user.rating = rating
        user.tier = rating_to_tier(rating)


def update_streak(user, solved_today: bool) -> None:
    if not solved_today:
        return

    today = date.today()
    if user.last_solved_at is None:
        user.streak_current = 1
    else:
        last = user.last_solved_at.date()
        if last == today:
            pass
        elif last == today - timedelta(days=1):
            user.streak_current += 1
        else:
            user.streak_current = 1

    user.streak_max = max(user.streak_max, user.streak_current)
    user.last_solved_at = datetime.now(timezone.utc)
