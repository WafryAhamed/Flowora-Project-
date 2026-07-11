import os
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.middleware import add_performance_middleware

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)

logger = logging.getLogger(__name__)

from fastapi_cache import FastAPICache
from fastapi_cache.backends.inmemory import InMemoryBackend


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize cache
    FastAPICache.init(InMemoryBackend(), prefix="fastapi-cache")

    # Auto-create all tables in PostgreSQL
    from app.db.database import engine, Base
    from app.models import User, Project, ProjectAssignment, Report, Notification, ActivityLog, ChatHistory

    logger.info("Creating database tables if they don't exist...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables ready.")

    # Auto-seed data if the database is empty (first-time setup)
    from app.db.database import SessionLocal
    db = SessionLocal()
    try:
        user_count = db.query(User).count()
        if user_count == 0:
            logger.info("No users found. Seeding database with initial data...")
            from seed_data import seed_database
            seed_database()
            logger.info("Database seeding complete.")
        else:
            logger.info(f"Database already has {user_count} users. Skipping seed.")
    except Exception as e:
        logger.error(f"Error during startup seed check: {e}")
    finally:
        db.close()

    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    description="Flowora Backend API",
    version="1.0.0",
    lifespan=lifespan,
)

# Add performance middleware
add_performance_middleware(app)

allowed_origins = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ALLOWED_ORIGINS",
        ",".join(
            [
                settings.FRONTEND_URL,
                "http://localhost:3000",
                "http://localhost:3001",
                "http://localhost:3002",
            ]
        ),
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "Welcome to the Flowora Backend API"}


@app.get("/health")
def health():
    return {"status": "ok"}


from app.api.routes import api_router

app.include_router(api_router, prefix=settings.API_V1_STR)
