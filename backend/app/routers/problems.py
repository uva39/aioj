import uuid
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.problem import Problem
from app.models.test_case import TestCase
from app.models.submission import Submission, UserProblemStat
from app.models.user import User
from app.schemas.problem import ProblemListItem, ProblemDetail, TestCaseSample
from app.schemas.submission import SubmissionListItem
from app.dependencies import get_current_user
from app.core.exceptions import NotFoundError, ForbiddenError

router = APIRouter(prefix="/api/problems", tags=["problems"])


@router.get("", response_model=list[ProblemListItem])
async def list_problems(
    category: Optional[str] = Query(None),
    difficulty: Optional[str] = Query(None),
    tag: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    query = select(Problem).where(Problem.is_public == True)
    if category:
        query = query.where(Problem.category == category)
    if difficulty:
        query = query.where(Problem.difficulty == difficulty)
    if tag:
        query = query.where(Problem.tags.any(tag))

    query = query.order_by(Problem.created_at.desc()).offset((page - 1) * limit).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{problem_id}", response_model=ProblemDetail)
async def get_problem(problem_id: str, db: AsyncSession = Depends(get_db)):
    # slug 또는 UUID로 조회
    try:
        pid = uuid.UUID(problem_id)
        query = select(Problem).where(Problem.id == pid, Problem.is_public == True)
    except ValueError:
        query = select(Problem).where(Problem.slug == problem_id, Problem.is_public == True)

    result = await db.execute(query)
    problem = result.scalar_one_or_none()
    if not problem:
        raise NotFoundError("문제를 찾을 수 없습니다.")

    # 공개 테스트케이스 로드
    tc_result = await db.execute(
        select(TestCase)
        .where(TestCase.problem_id == problem.id, TestCase.is_sample == True)
        .order_by(TestCase.order_index)
    )
    sample_tcs = tc_result.scalars().all()

    detail = ProblemDetail.model_validate(problem)
    detail.sample_test_cases = [TestCaseSample.model_validate(tc) for tc in sample_tcs]
    return detail


@router.get("/{problem_id}/submissions", response_model=list[SubmissionListItem])
async def get_my_submissions(
    problem_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        pid = uuid.UUID(problem_id)
    except ValueError:
        r = await db.execute(select(Problem.id).where(Problem.slug == problem_id))
        row = r.scalar_one_or_none()
        if not row:
            raise NotFoundError()
        pid = row

    result = await db.execute(
        select(Submission)
        .where(Submission.user_id == current_user.id, Submission.problem_id == pid)
        .order_by(Submission.created_at.desc())
        .limit(50)
    )
    return result.scalars().all()


@router.get("/{problem_id}/solutions", response_model=list[SubmissionListItem])
async def get_solutions(
    problem_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """AC 달성한 사용자만 다른 사람 풀이 열람 가능."""
    try:
        pid = uuid.UUID(problem_id)
    except ValueError:
        r = await db.execute(select(Problem.id).where(Problem.slug == problem_id))
        row = r.scalar_one_or_none()
        if not row:
            raise NotFoundError()
        pid = row

    # 본인이 AC했는지 확인
    stat = await db.execute(
        select(UserProblemStat).where(
            UserProblemStat.user_id == current_user.id,
            UserProblemStat.problem_id == pid,
            UserProblemStat.best_status == "accepted",
        )
    )
    if not stat.scalar_one_or_none():
        raise ForbiddenError("이 문제를 먼저 해결해야 다른 사람의 풀이를 볼 수 있습니다.")

    result = await db.execute(
        select(Submission)
        .where(
            Submission.problem_id == pid,
            Submission.status == "accepted",
            Submission.is_visible == True,
        )
        .order_by(Submission.time_ms.asc())
        .limit(50)
    )
    return result.scalars().all()
