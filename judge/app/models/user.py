import uuid
from datetime import datetime
from sqlalchemy import String, Integer, Boolean, DateTime, Enum as SAEnum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models import Base

TierEnum = SAEnum(
    "iron", "bronze", "silver", "gold", "platinum", "diamond", "ruby",
    name="tier_enum", create_constraint=False
)
RoleEnum = SAEnum("user", "setter", "admin", name="role_enum", create_constraint=False)
CategoryEnum = SAEnum(
    "linear_model", "tree_ensemble", "clustering", "dimensionality_reduction",
    "probability_model", "distance_similarity",
    "forward_backward", "activation", "optimizer",
    "regularization", "convolution", "loss_function",
    "rnn", "attention", "self_supervised", "reinforcement", "numerical_opt",
    name="category_enum", create_constraint=False
)


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True)
    username: Mapped[str] = mapped_column(String(50))
    email: Mapped[str] = mapped_column(String(255))
    hashed_password: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(RoleEnum, default="user")
    tier: Mapped[str] = mapped_column(TierEnum, default="iron")
    rating: Mapped[int] = mapped_column(Integer, default=0)
    solved_count: Mapped[int] = mapped_column(Integer, default=0)
    streak_current: Mapped[int] = mapped_column(Integer, default=0)
    streak_max: Mapped[int] = mapped_column(Integer, default=0)
    last_solved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))


class CategoryRating(Base):
    __tablename__ = "category_ratings"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    category: Mapped[str] = mapped_column(CategoryEnum)
    rating: Mapped[int] = mapped_column(Integer, default=0)
    solved_count: Mapped[int] = mapped_column(Integer, default=0)
