from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .config import settings
from .database import Base, engine
from .routers import auth, players, attendance, tournaments, registrations, announcements

from .auth_utils import hash_password
import os

# Create tables on startup (safely handled if DB connection takes a moment to wake up)
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Warning: Database initialization delayed or failed: {e}")

app = FastAPI(title=settings.APP_NAME)

# Mount static files for avatar uploads
STATIC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static")
os.makedirs(STATIC_DIR, exist_ok=True)
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

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
