"""
수치 비교 및 부분 점수 계산기.
np.allclose를 사용하여 출력값과 기대값을 비교한다.
"""
import json
import numpy as np
from typing import Any

RTOL = 1e-4
ATOL = 1e-6


def deserialize_expected(expected_json: str) -> Any:
    """DB에 저장된 기대 출력 JSON을 역직렬화."""
    data = json.loads(expected_json)
    return _restore(data)


def _restore(obj: Any) -> Any:
    if isinstance(obj, dict):
        t = obj.get("type")
        if t == "ndarray":
            return np.array(obj["data"])
        elif t == "float":
            return float(obj["data"])
        elif t == "int":
            return int(obj["data"])
        elif t == "list":
            return [_restore(v) for v in obj["data"]]
        elif t == "primitive":
            return obj["data"]
    return obj


def restore_actual(output_obj: Any) -> Any:
    """sandbox runner가 반환한 직렬화 출력을 numpy/Python 값으로 복원."""
    if output_obj is None:
        return None
    return _restore(output_obj)


def compare(actual_serialized: Any, expected_json: str) -> bool:
    """
    실제 출력과 기대 출력을 비교.
    Returns True if they match within tolerance.
    """
    if actual_serialized is None:
        return False

    actual = restore_actual(actual_serialized)
    expected = deserialize_expected(expected_json)

    return _compare_values(actual, expected)


def _compare_values(actual: Any, expected: Any) -> bool:
    if isinstance(expected, np.ndarray):
        if not isinstance(actual, np.ndarray):
            try:
                actual = np.array(actual)
            except Exception:
                return False
        if actual.shape != expected.shape:
            return False
        return bool(np.allclose(actual, expected, rtol=RTOL, atol=ATOL, equal_nan=True))

    elif isinstance(expected, (int, float, np.integer, np.floating)):
        try:
            return bool(np.isclose(float(actual), float(expected), rtol=RTOL, atol=ATOL))
        except Exception:
            return False

    elif isinstance(expected, list):
        if not isinstance(actual, list) or len(actual) != len(expected):
            return False
        return all(_compare_values(a, e) for a, e in zip(actual, expected))

    else:
        return actual == expected


def calculate_score(
    tc_results: list[dict],
    test_cases: list,  # TestCase ORM 객체 리스트
) -> tuple[int, str]:
    """
    전체 점수를 계산하고 최종 상태를 반환.
    Returns: (score 0~100, status)
    """
    total_weight = sum(tc.score_weight for tc in test_cases)
    if total_weight == 0:
        return 0, "wrong_answer"

    earned_weight = 0.0
    for tc_obj, tc_result in zip(test_cases, tc_results):
        if tc_result.get("passed"):
            earned_weight += tc_obj.score_weight

    score = int(round(earned_weight / total_weight * 100))

    if score == 100:
        status = "accepted"
    elif score > 0:
        status = "partial"
    else:
        status = "wrong_answer"

    return score, status
