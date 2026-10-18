"""
Smart Health — FastAPI AI Service
Runs on PORT 8000 (internal only, proxied by Next.js API routes)
"""
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from backend.routers import triage, stock, incident


limiter = Limiter(key_func=get_remote_address)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown lifecycle."""
    print("✅ FastAPI AI service starting on port 8000 (internal)")
    yield
    print("🔴 FastAPI AI service shutting down")


app = FastAPI(
    title="Smart Health — AI Service",
    description="Internal AI microservice for Gemini-powered triage, stock prediction, and incident logging.",
    version="1.0.0",
    lifespan=lifespan,
    # Disable docs in production to reduce attack surface
    docs_url="/docs" if os.getenv("ENVIRONMENT", "development") != "production" else None,
    redoc_url=None,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS: only allow Next.js internal calls
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://localhost:3000"],
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "X-Internal-Key"],
)

# ── Routers ──────────────────────────────────────────────────────────────────
app.include_router(triage.router, prefix="/ai", tags=["triage"])
app.include_router(stock.router, prefix="/ai", tags=["supply"])
app.include_router(incident.router, prefix="/ai", tags=["incident"])


@app.get("/health", include_in_schema=False)
async def health_check():
    return {"status": "healthy", "service": "fastapi-ai"}


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    """Never leak internal errors to clients."""
    environment = os.getenv("ENVIRONMENT", "development")
    if environment == "production":
        return JSONResponse(status_code=500, content={"detail": "Internal server error"})
    return JSONResponse(status_code=500, content={"detail": str(exc)})


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("FASTAPI_PORT", 8000))
    uvicorn.run("backend.main:app", host="0.0.0.0", port=port, reload=False)
