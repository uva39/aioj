from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+psycopg2://aioj:aiojpassword@localhost:5432/aioj"
    REDIS_URL: str = "redis://localhost:6379/0"
    SANDBOX_IMAGE: str = "aioj-sandbox:latest"

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
