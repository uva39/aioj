import uuid
from datetime import datetime
from sqlalchemy import String, Integer, Boolean, DateTime, Text, ForeignKey, ARRAY
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models import Base
from app.models.user import TierEnum, CategoryEnum


class Problem(Base):
    __tablename__ = "problems"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True)
    slug: Mapped[str] = mapped_column(String(100))
    title: Mapped[str] = mapped_column(String(200))
    function_name: Mapped[str] = mapped_column(String(100))
    difficulty: Mapped[str] = mapped_column(TierEnum)
    category: Mapped[str] = mapped_column(CategoryEnum)
    time_limit_sec: Mapped[int] = mapped_column(Integer, default=10)
    memory_limit_mb: Mapped[int] = mapped_column(Integer, default=512)
    ac_count: Mapped[int] = mapped_column(Integer, default=0)
    submission_count: Mapped[int] = mapped_column(Integer, default=0)

    test_cases: Mapped[list["TestCase"]] = relationship("TestCase", back_populates="problem")
