from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.database import engine, Base
from app.routers import auth, users, problems, submissions, leaderboard, admin


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 시작: 테이블 생성 (개발용, 프로덕션은 Alembic 사용)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    # 종료
    await engine.dispose()


app = FastAPI(
    title=settings.APP_TITLE,
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(problems.router)
app.include_router(submissions.router)
app.include_router(leaderboard.router)
app.include_router(admin.router)


@app.get("/health")
async def health():
    return {"status": "ok"}
