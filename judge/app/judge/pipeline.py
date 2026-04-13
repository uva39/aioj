"""
채점 파이프라인 오케스트레이터.
submission_id를 받아 전체 채점 과정을 수행하고 DB를 업데이트한다.
"""
import json
import uuid
from datetime import datetime, timezone

from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session

from app.judge.static_analyzer import analyze
from app.judge.sandbox import SandboxRunner
from app.judge.comparator import compare, calculate_score
from app.judge.result_types import JudgeStatus
from app.config import settings

# judge worker는 sync SQLAlchemy 사용 (Celery와 호환)
_engine = None


def get_engine():
    global _engine
    if _engine is None:
        sync_url = settings.DATABASE_URL.replace("+asyncpg", "").replace("+aiopg", "")
        _engine = create_engine(sync_url, pool_pre_ping=True)
    return _engine


def judge_submission(submission_id: str) -> None:
    """메인 채점 함수."""
    from app.models.submission import Submission, UserProblemStat
    from app.models.problem import Problem
    from app.models.test_case import TestCase
    from app.models.user import User

    engine = get_engine()

    with Session(engine) as db:
        # 1. 제출 및 문제 로드
        sub = db.get(Submission, uuid.UUID(submission_id))
        if not sub:
            return

        sub.status = JudgeStatus.RUNNING
        db.commit()

        problem = db.get(Problem, sub.problem_id)
        if not problem:
            _fail(db, sub, JudgeStatus.RUNTIME_ERROR, "문제를 찾을 수 없습니다.")
            return

        # 2. 정적 분석 (IE 감지)
        violations = analyze(sub.code)
        if violations:
            _fail(db, sub, JudgeStatus.ILLEGAL_IMPORT, "\n".join(violations))
            return

        # 3. 테스트케이스 로드
        test_cases = db.execute(
            select(TestCase)
            .where(TestCase.problem_id == problem.id)
            .order_by(TestCase.order_index)
        ).scalars().all()

        if not test_cases:
            _fail(db, sub, JudgeStatus.RUNTIME_ERROR, "테스트케이스가 없습니다.")
            return

        # 4. 샌드박스 실행용 테스트케이스 변환
        tc_payloads = []
        for tc in test_cases:
            tc_payloads.append({
                "id": str(tc.id),
                "inputs": json.loads(tc.input_data),
                "input_types": json.loads(tc.input_types),
            })

        runner = SandboxRunner()
        sandbox_result = runner.run(
            code=sub.code,
            function_name=problem.function_name,
            test_cases=tc_payloads,
            time_limit_sec=problem.time_limit_sec,
            memory_limit_mb=problem.memory_limit_mb,
        )

        if sandbox_result.get("container_error"):
            err = sandbox_result["container_error"]
            if "TLE" in err:
                _fail(db, sub, JudgeStatus.TIME_LIMIT_EXCEEDED, err)
            else:
                _fail(db, sub, JudgeStatus.RUNTIME_ERROR, err)
            return

        # 5. 각 테스트케이스 결과 비교
        results_by_id = {r["id"]: r for r in sandbox_result.get("results", [])}
        tc_results = []
        max_time_ms = 0

        for tc in test_cases:
            tc_id = str(tc.id)
            result = results_by_id.get(tc_id, {})

            if result.get("error"):
                err = result["error"]
                if "TLE" in err:
                    _fail(db, sub, JudgeStatus.TIME_LIMIT_EXCEEDED, err)
                    return
                tc_results.append({"id": tc_id, "passed": False, "error": err[:500], "time_ms": result.get("time_ms", 0)})
                continue

            passed = compare(result.get("output"), tc.expected_output)
            time_ms = result.get("time_ms", 0)
            max_time_ms = max(max_time_ms, time_ms)

            tc_results.append({"id": tc_id, "passed": passed, "time_ms": time_ms})

        # 6. 점수 계산
        score, status = calculate_score(tc_results, test_cases)

        sub.status = status
        sub.score = score
        sub.time_ms = max_time_ms
        sub.test_results = tc_results
        problem.submission_count += 1

        if status == "accepted":
            problem.ac_count += 1
            _handle_ac(db, sub, problem)

        db.commit()


def _fail(db, sub, status: JudgeStatus, message: str):
    from app.models.problem import Problem
    sub.status = status
    sub.error_message = message
    problem = db.get(Problem, sub.problem_id)
    if problem:
        problem.submission_count += 1
    db.commit()


def _handle_ac(db, sub, problem):
    """AC 처리: UserProblemStat 갱신, 레이팅 갱신, 스트릭 갱신."""
    from app.models.submission import UserProblemStat
    from app.models.user import User
    from app.services.rating_service import recalculate_user_rating_sync, update_streak

    now = datetime.now(timezone.utc)

    # UserProblemStat 갱신
    stat = db.execute(
        select(UserProblemStat).where(
            UserProblemStat.user_id == sub.user_id,
            UserProblemStat.problem_id == sub.problem_id,
        )
    ).scalar_one_or_none()

    if stat is None:
        stat = UserProblemStat(
            user_id=sub.user_id,
            problem_id=sub.problem_id,
            best_status="accepted",
            best_score=sub.score,
            attempt_count=1,
            first_solved_at=now,
            last_attempted_at=now,
        )
        db.add(stat)
        # 처음 AC한 경우만 solved_count 증가
        user = db.get(User, sub.user_id)
        if user:
            user.solved_count += 1
            update_streak(user, solved_today=True)
            recalculate_user_rating_sync(sub.user_id, db)
    else:
        stat.best_status = "accepted"
        stat.best_score = max(stat.best_score, sub.score)
        stat.attempt_count += 1
        stat.last_attempted_at = now
