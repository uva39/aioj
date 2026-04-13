from enum import Enum


class JudgeStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    ACCEPTED = "accepted"
    WRONG_ANSWER = "wrong_answer"
    TIME_LIMIT_EXCEEDED = "time_limit_exceeded"
    ILLEGAL_IMPORT = "illegal_import"
    RUNTIME_ERROR = "runtime_error"
    MEMORY_LIMIT_EXCEEDED = "memory_limit_exceeded"
    PARTIAL = "partial"


# 최종 상태 (폴링 종료 조건)
TERMINAL_STATUSES = {
    JudgeStatus.ACCEPTED,
    JudgeStatus.WRONG_ANSWER,
    JudgeStatus.TIME_LIMIT_EXCEEDED,
    JudgeStatus.ILLEGAL_IMPORT,
    JudgeStatus.RUNTIME_ERROR,
    JudgeStatus.MEMORY_LIMIT_EXCEEDED,
    JudgeStatus.PARTIAL,
}
