from fastapi import FastAPI
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.middleware.gzip import GZipMiddleware
from starlette.requests import Request
from starlette.responses import Response
import time

class CacheHeaderMiddleware(BaseHTTPMiddleware):
    """Add caching headers to responses"""
    
    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)
        
        # Cache GET requests
        if request.method == "GET":
            # Cache API responses for 5 minutes
            if request.url.path.startswith("/api/"):
                response.headers["Cache-Control"] = "public, max-age=300"
            # Cache static assets longer
            elif any(ext in request.url.path for ext in ['.js', '.css', '.png', '.jpg', '.webp']):
                response.headers["Cache-Control"] = "public, max-age=31536000, immutable"
        
        # Add performance headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        
        return response

class ResponseTimeMiddleware(BaseHTTPMiddleware):
    """Track response times"""
    
    async def dispatch(self, request: Request, call_next) -> Response:
        start_time = time.time()
        response = await call_next(request)
        process_time = time.time() - start_time
        response.headers["X-Process-Time"] = str(process_time)
        return response

def add_performance_middleware(app: FastAPI):
    """Add all performance-related middleware"""
    # Add GZIP compression (minimum 500 bytes)
    app.add_middleware(GZipMiddleware, minimum_size=500)
    
    # Add custom middleware
    app.add_middleware(CacheHeaderMiddleware)
    app.add_middleware(ResponseTimeMiddleware)
