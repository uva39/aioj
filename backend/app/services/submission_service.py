import json
from app.config import settings


async def enqueue_judge(submission_id: str) -> None:
    """Celery judge 태스크를 Redis 큐에 enqueue."""
    import redis
    r = redis.from_url(settings.REDIS_URL)

    # Celery 태스크 메시지 수동 구성 (celery.send_task 없이 간단히 처리)
    # judge worker는 이 메시지를 consume하여 채점 실행
    task_payload = {
        "submission_id": submission_id,
    }
    r.lpush("judge_queue_raw", json.dumps(task_payload))
    r.close()
