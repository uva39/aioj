"""
Celery 워커 진입점.
Redis 큐에서 채점 요청을 가져와 pipeline.judge_submission을 실행.
"""
import json
import redis

from app.config import settings
from app.judge.pipeline import judge_submission


def run_worker():
    """단순 Redis BRPOP 기반 워커 (Celery 대신 경량 방식 사용)."""
    r = redis.from_url(settings.REDIS_URL)
    print(f"[Judge Worker] 시작 — 큐 대기 중: judge_queue_raw")

    while True:
        # BRPOP: 큐에 메시지가 올 때까지 블로킹 대기
        item = r.brpop("judge_queue_raw", timeout=30)
        if item is None:
            continue

        _, payload = item
        try:
            data = json.loads(payload)
            submission_id = data["submission_id"]
            print(f"[Judge Worker] 채점 시작: {submission_id}")
            judge_submission(submission_id)
            print(f"[Judge Worker] 채점 완료: {submission_id}")
        except Exception as e:
            print(f"[Judge Worker] 오류: {e}")


if __name__ == "__main__":
    run_worker()
