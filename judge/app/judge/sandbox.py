"""
Docker SDK를 사용한 샌드박스 실행기.
제출 코드를 aioj-sandbox 컨테이너에서 격리 실행한다.
"""
import json
import os
import time
from typing import Optional

import docker
from docker.errors import DockerException

SANDBOX_IMAGE = os.environ.get("SANDBOX_IMAGE", "aioj-sandbox:latest")


class SandboxRunner:
    def __init__(self):
        self.client = docker.from_env()

    def run(
        self,
        code: str,
        function_name: str,
        test_cases: list[dict],
        time_limit_sec: int = 10,
        memory_limit_mb: int = 512,
    ) -> dict:
        """
        샌드박스 컨테이너에서 코드를 실행하고 결과를 반환한다.

        Returns:
            {
                "results": [{"id": ..., "output": ..., "time_ms": ..., "error": ...}],
                "container_error": str | None
            }
        """
        payload = json.dumps({
            "code": code,
            "function_name": function_name,
            "test_cases": test_cases,
            "time_limit_sec": time_limit_sec,
        })

        container = None
        try:
            container = self.client.containers.run(
                SANDBOX_IMAGE,
                command=["python", "runner.py"],
                stdin_open=True,
                detach=True,
                network_disabled=True,
                mem_limit=f"{memory_limit_mb}m",
                memswap_limit=f"{memory_limit_mb}m",
                cpu_period=100_000,
                cpu_quota=50_000,  # 50% CPU
                read_only=True,
                tmpfs={"/tmp": "size=64m,mode=1777"},
                remove=False,
            )

            # stdin으로 payload 전송
            sock = container.attach_socket(params={"stdin": 1, "stream": 1})
            sock._sock.sendall((payload + "\n").encode())
            sock._sock.close()

            # 타임아웃 대기 (여유 5초 추가)
            timeout = time_limit_sec + 5
            try:
                exit_code = container.wait(timeout=timeout)["StatusCode"]
            except Exception:
                container.stop(timeout=1)
                return {"results": [], "container_error": "TLE: 컨테이너 타임아웃"}

            logs = container.logs(stdout=True, stderr=False).decode("utf-8", errors="replace")
            return json.loads(logs.strip())

        except DockerException as e:
            return {"results": [], "container_error": str(e)}
        except json.JSONDecodeError:
            return {"results": [], "container_error": "샌드박스 출력 파싱 실패"}
        finally:
            if container:
                try:
                    container.remove(force=True)
                except Exception:
                    pass
