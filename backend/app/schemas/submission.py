import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class SubmitRequest(BaseModel):
    problem_id: uuid.UUID
    code: str


class SubmissionStatus(BaseModel):
    id: uuid.UUID
    status: str
    score: int
    time_ms: Optional[int]
    memory_kb: Optional[int]
    error_message: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


class SubmissionDetail(SubmissionStatus):
    code: str
    test_results: Optional[list[dict]]
    problem_id: uuid.UUID
    user_id: uuid.UUID

    model_config = {"from_attributes": True}


class SubmissionListItem(BaseModel):
    id: uuid.UUID
    status: str
    score: int
    time_ms: Optional[int]
    created_at: datetime

    model_config = {"from_attributes": True}
