from functools import lru_cache
from typing import List
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "baseline-elite-api"
    ENV: str = "dev"
    PORT: int = 8000

    DATABASE_URL: str 

    JWT_SECRET: str 
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS :int 
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000", "http://localhost:8080"]

    model_config = {
        "env_file": ".env",
        "extra": "ignore",
    }


# @lru_cache
# def get_settings() -> Settings:
#     return Settings()
settings = Settings()