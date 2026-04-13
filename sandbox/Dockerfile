FROM python:3.11-slim

WORKDIR /sandbox

# numpy, pandas만 설치 — 다른 ML 라이브러리 없음
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY runner.py .

# 보안: root 아닌 사용자로 실행
RUN useradd -m -u 1000 sandboxuser
USER sandboxuser

CMD ["python", "runner.py"]
