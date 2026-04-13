import uuid
from datetime import datetime
from sqlalchemy import Boolean, DateTime, Integer, Text, ForeignKey, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

StatusEnum = SAEnum(
    "pending", "running",
    "accepted", "wrong_answer", "time_limit_exceeded",
    "illegal_import", "runtime_error", "memory_limit_exceeded", "partial",
    name="submission_status_enum"
)


class Submission(Base):
    __tablename__ = "submissions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    problem_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("problems.id"), nullable=False, index=True)
    code: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(StatusEnum, default="pending", nullable=False)
    score: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    time_ms: Mapped[int | None] = mapped_column(Integer, nullable=True)
    memory_kb: Mapped[int | None] = mapped_column(Integer, nullable=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    # 테스트케이스별 결과: [{"id": "...", "status": "ac", "score": 10, "time_ms": 5}]
    test_results: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    # AC 후 본인이 공개 여부를 설정
    is_visible: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="submissions")
    problem: Mapped["Problem"] = relationship("Problem", back_populates="submissions")


class UserProblemStat(Base):
    __tablename__ = "user_problem_stats"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    problem_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("problems.id", ondelete="CASCADE"), nullable=False)
    best_status: Mapped[str] = mapped_column(StatusEnum, nullable=False)
    best_score: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    attempt_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    first_solved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    last_attempted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="problem_stats")
    problem: Mapped["Problem"] = relationship("Problem")
