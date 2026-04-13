"""
시드 스크립트: seeds/problems/*.json → DB 삽입
사용법: docker compose exec backend python seeds/seed.py
"""
import asyncio
import json
import os
import sys
from pathlib import Path

# /app 기준 실행 (Docker 컨테이너 내부)
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import select

from app.config import settings
from app.database import Base
from app.models.user import User
from app.models.problem import Problem
from app.models.test_case import TestCase

SEEDS_DIR = Path(__file__).parent / "problems"

engine = create_async_engine(settings.DATABASE_URL, echo=False)
SessionFactory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def seed_problems():
    async with SessionFactory() as session:
        json_files = sorted(SEEDS_DIR.glob("*.json"))
        if not json_files:
            print("시드 파일이 없습니다.")
            return

        inserted = 0
        skipped = 0

        for path in json_files:
            data = json.loads(path.read_text(encoding="utf-8"))
            slug = data["slug"]

            # 중복 확인
            result = await session.execute(select(Problem).where(Problem.slug == slug))
            if result.scalar_one_or_none():
                print(f"  SKIP  {slug} (이미 존재)")
                skipped += 1
                continue

            problem = Problem(
                slug=slug,
                title=data["title"],
                title_en=data.get("title_en"),
                description=data["description"],
                function_signature=data["function_signature"],
                difficulty=data["difficulty"],
                category=data["category"],
                tags=data.get("tags", []),
                allowed_libs=data.get("allowed_libs", ["numpy"]),
                function_name=data["function_name"],
                time_limit_sec=data.get("time_limit_sec", 10),
                memory_limit_mb=data.get("memory_limit_mb", 512),
                partial_score=data.get("partial_score", True),
                is_public=True,
            )
            session.add(problem)
            await session.flush()  # problem.id 확보

            # 테스트케이스 삽입
            all_tcs = data.get("sample_test_cases", []) + data.get("judge_test_cases", [])
            for tc_data in all_tcs:
                tc = TestCase(
                    problem_id=problem.id,
                    input_data=tc_data["input_data"],
                    input_types=tc_data.get("input_types", "{}"),
                    expected_output=tc_data["expected_output"],
                    is_sample=tc_data.get("is_sample", False),
                    score_weight=tc_data.get("score_weight", 1.0),
                    order_index=tc_data.get("order_index", 0),
                )
                session.add(tc)

            print(f"  INSERT {slug}")
            inserted += 1

        await session.commit()
        print(f"\n완료: {inserted}개 삽입, {skipped}개 스킵")


async def main():
    print("=== AIOJ 시드 데이터 삽입 ===\n")
    await seed_problems()
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
