import uuid
from datetime import datetime
from sqlalchemy import Boolean, DateTime, Integer, Text, ForeignKey, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.models import Base

StatusEnum = SAEnum(
    "pending", "running",
    "accepted", "wrong_answer", "time_limit_exceeded",
    "illegal_import", "runtime_error", "memory_limit_exceeded", "partial",
    name="submission_status_enum", create_constraint=False
)


class Submission(Base):
    __tablename__ = "submissions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    problem_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("problems.id"))
    code: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(StatusEnum, default="pending")
    score: Mapped[int] = mapped_column(Integer, default=0)
    time_ms: Mapped[int | None] = mapped_column(Integer, nullable=True)
    memory_kb: Mapped[int | None] = mapped_column(Integer, nullable=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    test_results: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    is_visible: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))


class UserProblemStat(Base):
    __tablename__ = "user_problem_stats"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    problem_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("problems.id"))
    best_status: Mapped[str] = mapped_column(StatusEnum)
    best_score: Mapped[int] = mapped_column(Integer, default=0)
    attempt_count: Mapped[int] = mapped_column(Integer, default=0)
    first_solved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    last_attempted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
