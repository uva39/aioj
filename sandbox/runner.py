"""
AIOJ 채점 샌드박스 실행기
stdin으로 채점 요청 JSON을 받아 실행 후 stdout에 결과 JSON 출력.

입력 형식 (JSON):
{
  "code": "def solution(X, y): ...",
  "function_name": "solution",
  "test_cases": [
    {
      "id": "tc-001",
      "inputs": {"X": [[1,2],[3,4]], "y": [1.0, 2.0]},
      "input_types": {"X": "ndarray", "y": "ndarray"}
    }
  ],
  "time_limit_sec": 10
}

출력 형식 (JSON):
{
  "results": [
    {
      "id": "tc-001",
      "output": [0.5, 0.25],
      "output_type": "ndarray",
      "time_ms": 12,
      "error": null
    }
  ]
}
"""
import sys
import json
import time
import traceback
import types

import numpy as np
import pandas as pd


def deserialize_input(value, type_hint: str):
    """입력 데이터를 타입 힌트에 따라 역직렬화."""
    if type_hint == "ndarray":
        return np.array(value)
    elif type_hint == "dataframe":
        return pd.DataFrame(value)
    elif type_hint == "float":
        return float(value)
    elif type_hint == "int":
        return int(value)
    elif type_hint == "list":
        return list(value)
    else:
        return value


def serialize_output(value):
    """출력 결과를 JSON 직렬화 가능한 형태로 변환."""
    if isinstance(value, np.ndarray):
        return {"type": "ndarray", "data": value.tolist(), "shape": list(value.shape), "dtype": str(value.dtype)}
    elif isinstance(value, pd.DataFrame):
        return {"type": "dataframe", "data": value.to_dict(orient="list")}
    elif isinstance(value, (np.integer,)):
        return {"type": "int", "data": int(value)}
    elif isinstance(value, (np.floating,)):
        return {"type": "float", "data": float(value)}
    elif isinstance(value, (list, tuple)):
        return {"type": "list", "data": [serialize_output(v) for v in value]}
    else:
        return {"type": "primitive", "data": value}


def run_test_case(func, test_case: dict, time_limit_sec: float) -> dict:
    """단일 테스트케이스 실행."""
    tc_id = test_case["id"]
    inputs_raw = test_case["inputs"]
    input_types = test_case.get("input_types", {})

    # 입력 역직렬화
    kwargs = {}
    for key, val in inputs_raw.items():
        type_hint = input_types.get(key, "auto")
        kwargs[key] = deserialize_input(val, type_hint)

    start = time.perf_counter()
    try:
        output = func(**kwargs)
        elapsed_ms = int((time.perf_counter() - start) * 1000)

        if elapsed_ms > time_limit_sec * 1000:
            return {"id": tc_id, "output": None, "time_ms": elapsed_ms, "error": "TLE"}

        serialized = serialize_output(output)
        return {"id": tc_id, "output": serialized, "time_ms": elapsed_ms, "error": None}

    except Exception:
        elapsed_ms = int((time.perf_counter() - start) * 1000)
        return {"id": tc_id, "output": None, "time_ms": elapsed_ms, "error": traceback.format_exc()}


def main():
    raw = sys.stdin.read()
    request = json.loads(raw)

    code: str = request["code"]
    function_name: str = request["function_name"]
    test_cases: list = request["test_cases"]
    time_limit_sec: float = request.get("time_limit_sec", 10.0)

    # 제출 코드를 독립 모듈로 로드
    module = types.ModuleType("submission")
    module.__dict__["np"] = np
    module.__dict__["numpy"] = np
    module.__dict__["pd"] = pd
    module.__dict__["pandas"] = pd

    try:
        exec(compile(code, "<submission>", "exec"), module.__dict__)
    except Exception:
        # 컴파일/실행 오류
        results = [{"id": tc["id"], "output": None, "time_ms": 0, "error": traceback.format_exc()} for tc in test_cases]
        print(json.dumps({"results": results}))
        return

    func = module.__dict__.get(function_name)
    if func is None:
        results = [{"id": tc["id"], "output": None, "time_ms": 0, "error": f"함수 '{function_name}'을 찾을 수 없습니다."} for tc in test_cases]
        print(json.dumps({"results": results}))
        return

    results = []
    for tc in test_cases:
        result = run_test_case(func, tc, time_limit_sec)
        results.append(result)

    print(json.dumps({"results": results}))


if __name__ == "__main__":
    main()
