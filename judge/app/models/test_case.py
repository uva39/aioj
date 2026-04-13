import uuid
from datetime import datetime
from sqlalchemy import Boolean, DateTime, Float, Integer, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models import Base


class TestCase(Base):
    __tablename__ = "test_cases"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True)
    problem_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("problems.id"))
    is_sample: Mapped[bool] = mapped_column(Boolean, default=False)
    input_data: Mapped[str] = mapped_column(Text)
    expected_output: Mapped[str] = mapped_column(Text)
    input_types: Mapped[str] = mapped_column(Text, default="{}")
    score_weight: Mapped[float] = mapped_column(Float, default=1.0)
    order_index: Mapped[int] = mapped_column(Integer, default=0)

    problem: Mapped["Problem"] = relationship("Problem", back_populates="test_cases")
