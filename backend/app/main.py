from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .database import Base, engine
from .routers import auth, players, attendance, tournaments, registrations, announcements

from .auth_utils import hash_password

# settings = get_settings()

# Create tables on startup (use Alembic in real prod)
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.APP_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(players.router)
app.include_router(attendance.router)
app.include_router(tournaments.router)
app.include_router(registrations.router)
app.include_router(announcements.router)


@app.get("/")
def root():
    return {"ok": True, "app": settings.APP_NAME}



