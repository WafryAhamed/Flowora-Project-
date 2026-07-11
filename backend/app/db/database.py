from sqlalchemy import create_engine, event
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.pool import QueuePool
from app.core.config import settings

# Optimized connection pool for production
engine = create_engine(
    settings.DATABASE_URL,
    poolclass=QueuePool,
    pool_size=20,  # Increased for better concurrency
    max_overflow=40,
    pool_pre_ping=True,
    pool_recycle=3600,  # Recycle connections every hour
    echo_pool=False,
    connect_args={
        "connect_timeout": 10,
        "options": "-c statement_timeout=30000"  # 30 second timeout
    },
)

SessionLocal = sessionmaker(
    autocommit=False, 
    autoflush=False, 
    bind=engine,
    expire_on_commit=False  # Reduce database queries
)

# Log slow queries in development
@event.listens_for(engine, "before_cursor_execute")
def receive_before_cursor_execute(conn, cursor, statement, parameters, context, executemany):
    pass

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
