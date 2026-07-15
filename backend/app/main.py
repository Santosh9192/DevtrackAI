import os
import contextlib
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .config import settings
from .database import init_db
from .routes import api_router

@contextlib.asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    init_db()
    banner = r"""
  ___       _        _____            _   
 |   \ ___ | |_ __  |_   _|_ __  __ _| |_ 
 | |) / -_)| |/ _|   | | | '  \/ _` |  _|
 |___/\___||_|\__|   |_| |_|_|_\__,_|\__|
                                         
 DevTrack AI - Project Management Platform
 =========================================
"""
    print(banner)
    print(f" Server starting on http://localhost:8000")
    print(f" API Docs: http://localhost:8000/docs")
    print(f" Mock AI Mode: {'Enabled' if not settings.GEMINI_API_KEY else 'Disabled (Gemini active)'}")
    yield
    # Shutdown
    pass


app = FastAPI(
    title="DevTrack AI",
    description="AI-Powered Project & Developer Management Platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router)

# Serve uploaded files
upload_dir = settings.UPLOAD_DIR
os.makedirs(upload_dir, exist_ok=True)
os.makedirs(f"{upload_dir}/avatars", exist_ok=True)
app.mount("/uploads", StaticFiles(directory=upload_dir), name="uploads")


@app.get("/")
def root():
    return {
        "name": "DevTrack AI",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
    )
