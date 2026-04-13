import uuid
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.problem import Problem
from app.models.test_case import TestCase
from app.models.user import User
from app.schemas.problem import ProblemCreate, ProblemDetail, TestCaseCreate
from app.dependencies import get_current_admin
from app.core.exceptions import NotFoundError, ConflictError

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.post("/problems", response_model=ProblemDetail, status_code=201)
async def create_problem(
    req: ProblemCreate,
    current_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    existing = await db.execute(select(Problem).where(Problem.slug == req.slug))
    if existing.scalar_one_or_none():
        raise ConflictError(f"slug '{req.slug}'가 이미 존재합니다.")

    problem = Problem(
        **req.model_dump(),
        author_id=current_user.id,
    )
    db.add(problem)
    await db.flush()

    detail = ProblemDetail.model_validate(problem)
    detail.sample_test_cases = []
    return detail


@router.patch("/problems/{problem_id}/publish")
async def publish_problem(
    problem_id: uuid.UUID,
    current_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Problem).where(Problem.id == problem_id))
    problem = result.scalar_one_or_none()
    if not problem:
        raise NotFoundError()
    problem.is_public = True
    return {"message": "문제가 공개되었습니다.", "slug": problem.slug}


@router.post("/problems/{problem_id}/test-cases", status_code=201)
async def add_test_case(
    problem_id: uuid.UUID,
    req: TestCaseCreate,
    current_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Problem).where(Problem.id == problem_id))
    problem = result.scalar_one_or_none()
    if not problem:
        raise NotFoundError()

    tc = TestCase(
        problem_id=problem.id,
        is_sample=req.is_sample,
        input_data=req.input_data,
        expected_output=req.expected_output,
        input_types=req.input_types,
        score_weight=req.score_weight,
        order_index=req.order_index,
    )
    db.add(tc)
    await db.flush()
    return {"id": str(tc.id), "message": "테스트케이스가 추가되었습니다."}
