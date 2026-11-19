"""
backend/main.py
FastAPI Application Entry Point for ClubHub.
Integrates modular routers, database initialization, CORS, OpenAPI docs, and static file hosting.
"""

import os
import tempfile
from contextlib import asynccontextmanager
from pathlib import Path
from dotenv import load_dotenv

from fastapi import FastAPI, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy import text

# Load environment configuration
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)

from backend.database import init_db, get_db
from backend.seed import seed_data
from backend.routers import (
    auth,
    students,
    clubs,
    applications,
    events,
    network,
    badges,
    dashboard,
    admin,
    upload
)

# Parse CORS Origins from environment
raw_cors = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:8000,http://127.0.0.1:8000,http://localhost:5500,http://127.0.0.1:5500,http://localhost:8001,http://127.0.0.1:8001,https://club-hub-inky.vercel.app,https://club-hub-9c2de.web.app"
)
origins = [origin.strip() for origin in raw_cors.split(",") if origin.strip()]


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure database schema is created
    print("[STARTUP] Initializing ClubHub Database...")
    init_db()
    if not os.getenv("TESTING"):
        seed_data()
    print("[STARTUP] ClubHub Backend Ready.")
    yield
    print("[SHUTDOWN] ClubHub Backend Shutting Down.")


app = FastAPI(
    title="ClubHub Smart Campus API",
    version="2.0.0",
    description="Backend REST API for ClubHub Smart Campus Platform",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Modular API Routers
app.include_router(auth.router)
app.include_router(students.router)
app.include_router(clubs.router)
app.include_router(applications.router)
app.include_router(events.router)
app.include_router(network.router)
app.include_router(badges.router)
app.include_router(dashboard.router)
app.include_router(admin.router)
app.include_router(upload.router)


@app.get(
    "/health",
    tags=["General"],
    summary="Health check endpoint"
)
def health_check(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {
            "status": "healthy",
            "database": "connected (SQLite)",
            "api_version": "2.0.0"
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "database_error": str(e)
        }


# Mount Uploads directory for user profile avatars and banners
upload_dir = Path(tempfile.gettempdir()) / "clubhub_uploads"
upload_dir.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(upload_dir)), name="uploads")

# Mount Static Files to serve frontend HTML, CSS, JS at root when running locally
if not os.getenv("VERCEL"):
    project_root = Path(__file__).resolve().parent.parent
    if project_root.exists():
        app.mount("/", StaticFiles(directory=str(project_root), html=True), name="static")
