import uuid
import json
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.problem import Problem
from app.models.submission import Submission
from app.models.user import User
from app.schemas.submission import SubmitRequest, SubmissionStatus, SubmissionDetail
from app.dependencies import get_current_user
from app.core.exceptions import NotFoundError, ForbiddenError

router = APIRouter(prefix="/api/submissions", tags=["submissions"])


@router.post("", response_model=SubmissionStatus, status_code=202)
async def submit(
    req: SubmitRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # 문제 존재 확인
    result = await db.execute(
        select(Problem).where(Problem.id == req.problem_id, Problem.is_public == True)
    )
    problem = result.scalar_one_or_none()
    if not problem:
        raise NotFoundError("문제를 찾을 수 없습니다.")

    # 제출 레코드 생성
    submission = Submission(
        user_id=current_user.id,
        problem_id=problem.id,
        code=req.code,
        status="pending",
    )
    db.add(submission)
    await db.flush()

    # 채점 태스크 enqueue (judge worker 미배포 시 에러를 무시하고 pending 유지)
    try:
        from app.services.submission_service import enqueue_judge
        await enqueue_judge(str(submission.id))
    except Exception:
        pass

    return submission


@router.get("/{submission_id}", response_model=SubmissionStatus)
async def get_submission_status(
    submission_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Submission).where(Submission.id == submission_id))
    sub = result.scalar_one_or_none()
    if not sub:
        raise NotFoundError()
    if sub.user_id != current_user.id and current_user.role != "admin":
        raise ForbiddenError()
    return sub


@router.get("/{submission_id}/detail", response_model=SubmissionDetail)
async def get_submission_detail(
    submission_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Submission).where(Submission.id == submission_id))
    sub = result.scalar_one_or_none()
    if not sub:
        raise NotFoundError()
    if sub.user_id != current_user.id and current_user.role != "admin":
        raise ForbiddenError()
    return sub


@router.patch("/{submission_id}/visibility")
async def set_visibility(
    submission_id: uuid.UUID,
    visible: bool,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Submission).where(Submission.id == submission_id))
    sub = result.scalar_one_or_none()
    if not sub:
        raise NotFoundError()
    if sub.user_id != current_user.id:
        raise ForbiddenError()
    if sub.status != "accepted":
        raise ForbiddenError("AC 된 제출만 공개할 수 있습니다.")
    sub.is_visible = visible
    return {"is_visible": sub.is_visible}
