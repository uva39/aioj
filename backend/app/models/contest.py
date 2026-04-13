import uuid
from datetime import datetime
from sqlalchemy import String, Boolean, DateTime, Integer, Text, ForeignKey, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

ContestTypeEnum = SAEnum("open_challenge", "speed_round", "marathon", name="contest_type_enum")


class Contest(Base):
    __tablename__ = "contests"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    slug: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    contest_type: Mapped[str] = mapped_column(ContestTypeEnum, default="open_challenge", nullable=False)
    starts_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    ends_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    is_rated: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    contest_problems: Mapped[list["ContestProblem"]] = relationship("ContestProblem", back_populates="contest", lazy="select")


class ContestProblem(Base):
    __tablename__ = "contest_problems"

    contest_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("contests.id", ondelete="CASCADE"), primary_key=True)
    problem_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("problems.id", ondelete="CASCADE"), primary_key=True)
    order_index: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    contest: Mapped["Contest"] = relationship("Contest", back_populates="contest_problems")
