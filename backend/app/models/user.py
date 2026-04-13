import uuid
from datetime import datetime
from sqlalchemy import String, Integer, Boolean, DateTime, Enum as SAEnum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

TierEnum = SAEnum(
    "iron", "bronze", "silver", "gold", "platinum", "diamond", "ruby",
    name="tier_enum"
)

RoleEnum = SAEnum("user", "setter", "admin", name="role_enum")

CategoryEnum = SAEnum(
    "linear_model", "tree_ensemble", "clustering", "dimensionality_reduction",
    "probability_model", "distance_similarity",
    "forward_backward", "activation", "optimizer",
    "regularization", "convolution", "loss_function",
    "rnn", "attention", "self_supervised", "reinforcement", "numerical_opt",
    name="category_enum"
)


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(RoleEnum, default="user", nullable=False)
    tier: Mapped[str] = mapped_column(TierEnum, default="iron", nullable=False)
    rating: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    solved_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    streak_current: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    streak_max: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    last_solved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    submissions: Mapped[list["Submission"]] = relationship("Submission", back_populates="user", lazy="select")
    category_ratings: Mapped[list["CategoryRating"]] = relationship("CategoryRating", back_populates="user", lazy="select")
    problem_stats: Mapped[list["UserProblemStat"]] = relationship("UserProblemStat", back_populates="user", lazy="select")


class CategoryRating(Base):
    __tablename__ = "category_ratings"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    category: Mapped[str] = mapped_column(CategoryEnum, nullable=False)
    rating: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    solved_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="category_ratings")

    __table_args__ = (
        {"schema": None},
    )
