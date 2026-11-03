from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text
from .config import settings
from .database import Base, engine
from .routers import auth, players, attendance, tournaments, registrations, announcements

from .auth_utils import hash_password
import os

# Create tables and automatically ensure all columns exist
def auto_migrate():
    try:
        Base.metadata.create_all(bind=engine)
        if engine.dialect.name == "postgresql":
            with engine.connect() as conn:
                stmts = [
                    "ALTER TABLE players ADD COLUMN IF NOT EXISTS batch VARCHAR(50);",
                    "ALTER TABLE players ADD COLUMN IF NOT EXISTS phone VARCHAR(20);",
                    "ALTER TABLE players ADD COLUMN IF NOT EXISTS avatar VARCHAR(255);",
                    "ALTER TABLE players ADD COLUMN IF NOT EXISTS gender VARCHAR(20);",
                    "ALTER TABLE players ADD COLUMN IF NOT EXISTS age INTEGER;",
                    "ALTER TABLE players ADD COLUMN IF NOT EXISTS joining_date DATE;",
                    "ALTER TABLE players ADD COLUMN IF NOT EXISTS performance_ratings JSON DEFAULT '{}'::json;",
                    "ALTER TABLE players ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;",
                ]
                for stmt in stmts:
                    try:
                        conn.execute(text(stmt))
                        conn.commit()
                    except Exception as col_err:
                        print(f"Notice applying migration: {col_err}")
    except Exception as e:
        print(f"Warning: Database initialization delayed or failed: {e}")

auto_migrate()

app = FastAPI(title=settings.APP_NAME)

# Mount static files for avatar uploads
STATIC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static")
os.makedirs(STATIC_DIR, exist_ok=True)
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_origin_regex=r"^https:\/\/.*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    import traceback
    traceback.print_exc()
    origin = request.headers.get("origin", "*")
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc), "type": type(exc).__name__},
        headers={
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*",
        }
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
