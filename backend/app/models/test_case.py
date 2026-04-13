import uuid
from datetime import datetime
from sqlalchemy import Boolean, DateTime, Float, Integer, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class TestCase(Base):
    __tablename__ = "test_cases"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    problem_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("problems.id", ondelete="CASCADE"), nullable=False, index=True)
    is_sample: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    # JSON 직렬화된 입력 데이터: {"X": [...], "y": [...]}
    input_data: Mapped[str] = mapped_column(Text, nullable=False)
    # JSON 직렬화된 기대 출력: {"type": "ndarray", "data": [...], ...}
    expected_output: Mapped[str] = mapped_column(Text, nullable=False)
    # 입력 타입 힌트: {"X": "ndarray", "y": "ndarray"}
    input_types: Mapped[str] = mapped_column(Text, default="{}", nullable=False)
    score_weight: Mapped[float] = mapped_column(Float, default=1.0, nullable=False)
    order_index: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    problem: Mapped["Problem"] = relationship("Problem", back_populates="test_cases")
