import uuid
from datetime import datetime
from sqlalchemy import String, Integer, Boolean, DateTime, Text, ForeignKey, ARRAY
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.user import TierEnum, CategoryEnum


class Problem(Base):
    __tablename__ = "problems"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    slug: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    title_en: Mapped[str | None] = mapped_column(String(200), nullable=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    function_signature: Mapped[str] = mapped_column(Text, nullable=False)
    difficulty: Mapped[str] = mapped_column(TierEnum, nullable=False)
    category: Mapped[str] = mapped_column(CategoryEnum, nullable=False)
    tags: Mapped[list[str]] = mapped_column(ARRAY(String), default=list, nullable=False)
    allowed_libs: Mapped[list[str]] = mapped_column(ARRAY(String), default=lambda: ["numpy"], nullable=False)
    function_name: Mapped[str] = mapped_column(String(100), nullable=False)
    time_limit_sec: Mapped[int] = mapped_column(Integer, default=10, nullable=False)
    memory_limit_mb: Mapped[int] = mapped_column(Integer, default=512, nullable=False)
    score: Mapped[int] = mapped_column(Integer, default=100, nullable=False)
    partial_score: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_public: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    ac_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    submission_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    author_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    test_cases: Mapped[list["TestCase"]] = relationship("TestCase", back_populates="problem", lazy="select", cascade="all, delete-orphan")
    submissions: Mapped[list["Submission"]] = relationship("Submission", back_populates="problem", lazy="select")
