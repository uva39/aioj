import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class TestCaseSample(BaseModel):
    id: uuid.UUID
    input_data: str
    expected_output: str
    order_index: int

    model_config = {"from_attributes": True}


class ProblemListItem(BaseModel):
    id: uuid.UUID
    slug: str
    title: str
    difficulty: str
    category: str
    tags: list[str]
    ac_count: int
    submission_count: int

    model_config = {"from_attributes": True}


class ProblemDetail(ProblemListItem):
    title_en: Optional[str]
    description: str
    function_signature: str
    function_name: str
    allowed_libs: list[str]
    time_limit_sec: int
    memory_limit_mb: int
    partial_score: bool
    sample_test_cases: list[TestCaseSample] = []

    model_config = {"from_attributes": True}


class ProblemCreate(BaseModel):
    slug: str
    title: str
    title_en: Optional[str] = None
    description: str
    function_signature: str
    function_name: str
    difficulty: str
    category: str
    tags: list[str] = []
    allowed_libs: list[str] = ["numpy"]
    time_limit_sec: int = 10
    memory_limit_mb: int = 512
    partial_score: bool = True


class TestCaseCreate(BaseModel):
    is_sample: bool = False
    input_data: str      # JSON 문자열
    expected_output: str # JSON 문자열
    input_types: str = "{}"
    score_weight: float = 1.0
    order_index: int = 0
