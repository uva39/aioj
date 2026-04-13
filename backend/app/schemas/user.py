import uuid
from datetime import datetime
from pydantic import BaseModel


class UserPublic(BaseModel):
    id: uuid.UUID
    username: str
    tier: str
    rating: int
    solved_count: int
    streak_current: int
    streak_max: int
    created_at: datetime

    model_config = {"from_attributes": True}


class UserMe(UserPublic):
    email: str
    role: str


class UserStats(BaseModel):
    username: str
    tier: str
    rating: int
    solved_count: int
    streak_current: int
    streak_max: int
    category_ratings: list[dict]

    model_config = {"from_attributes": True}
