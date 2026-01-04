# astrology-engine/api/main.py
# FastAPI Server - Main Entry Point for Astrology Engine (UPDATED)

from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict
from datetime import datetime
import uvicorn
import os

# Import route modules
from .routes import router
from .models import *

# Initialize FastAPI app
app = FastAPI(
    title="AstroAI Astrology Engine API",
    description="Vedic Astrology Calculations API using Swiss Ephemeris - Now with Horoscope Generation & Remedies",
    version="2.0.0",  # Updated version
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
ALLOWED_ORIGINS = os.getenv("CORS_ORIGIN", "http://localhost:3000,http://localhost:19006,http://localhost:5000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Key Authentication Middleware
API_KEY = os.getenv("PYTHON_ENGINE_API_KEY", "zodiacai-secret-key-2025")

async def verify_api_key(x_api_key: str = Header(None)):
    """Verify API key from request header"""
    if x_api_key != API_KEY:
        raise HTTPException(
            status_code=401,
            detail="Invalid or missing API key"
        )
    return x_api_key

# Health Check Endpoint
@app.get("/", tags=["Health"])
async def root():
    """Root endpoint - Health check"""
    return {
        "status": "online",
        "service": "AstroAI Astrology Engine",
        "version": "2.0.0",
        "features": [
            "Kundli Generation",
            "Planetary Analysis",
            "Dasha Calculations",
            "Transit Analysis",
            "Daily/Monthly/Yearly/Lifetime Horoscopes",
            "Personalized Remedies (Gemstones, Mantras)"
        ],
        "endpoints": {
            "docs": "/docs",
            "health": "/health",
            "kundli": "/api/kundli/generate",
            "dasha": "/api/dasha/calculate",
            "transits": "/api/transits/current",
            "horoscope_daily": "/api/horoscope/daily",
            "horoscope_monthly": "/api/horoscope/monthly",
            "horoscope_yearly": "/api/horoscope/yearly",
            "horoscope_lifetime": "/api/horoscope/lifetime",
            "remedies_complete": "/api/remedies/complete",
            "remedies_gemstones": "/api/remedies/gemstones",
            "remedies_mantras": "/api/remedies/mantras"
        }
    }

@app.get("/health", tags=["Health"])
async def health_check():
    """Detailed health check"""
    components_status = {}
    
    # Check FastAPI
    components_status["fastapi"] = "operational"
    
    # Check Swiss Ephemeris
    try:
        import swisseph as swe
        components_status["swiss_ephemeris"] = "operational"
    except Exception as e:
        components_status["swiss_ephemeris"] = f"error: {str(e)}"
    
    # Check Horoscope Generators
    try:
        from horoscopes.horoscope_generator import HoroscopeGenerator
        components_status["horoscope_generator"] = "operational"
    except Exception as e:
        components_status["horoscope_generator"] = f"error: {str(e)}"
    
    # Check Remedy Engine
    try:
        from remedies.remedy_engine import RemedyEngine
        components_status["remedy_engine"] = "operational"
    except Exception as e:
        components_status["remedy_engine"] = f"error: {str(e)}"
    
    # Overall status
    all_operational = all(status == "operational" for status in components_status.values())
    overall_status = "healthy" if all_operational else "degraded"
    
    return {
        "status": overall_status,
        "timestamp": datetime.now().isoformat(),
        "components": components_status
    }

# Include API routes
app.include_router(
    router,
    prefix="",
    dependencies=[Depends(verify_api_key)]
)

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Handle all uncaught exceptions"""
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": {
                "message": "Internal server error",
                "detail": str(exc) if os.getenv("DEBUG", "false").lower() == "true" else "An error occurred"
            }
        }
    )

# HTTPException Handler
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Handle HTTP exceptions"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {
                "message": exc.detail,
                "status_code": exc.status_code
            }
        }
    )

# Startup Event
@app.on_event("startup")
async def startup_event():
    """Run on application startup"""
    print("=" * 60)
    print("🚀 AstroAI Astrology Engine v2.0 Starting...")
    print("=" * 60)
    
    # Verify Swiss Ephemeris
    try:
        import swisseph as swe
        ephe_path = os.getenv("EPHEMERIS_PATH", "/usr/share/ephe")
        swe.set_ephe_path(ephe_path)
        print(f"✅ Swiss Ephemeris initialized at: {ephe_path}")
    except Exception as e:
        print(f"⚠️  Swiss Ephemeris warning: {e}")
    
    # Check Horoscope Generators
    try:
        from horoscopes.horoscope_generator import HoroscopeGenerator
        print("✅ Horoscope generators loaded successfully")
    except Exception as e:
        print(f"⚠️  Horoscope generators warning: {e}")
    
    # Check Remedy Engine
    try:
        from remedies.remedy_engine import RemedyEngine
        print("✅ Remedy engine loaded successfully")
    except Exception as e:
        print(f"⚠️  Remedy engine warning: {e}")
    
    # Check API Key
    if API_KEY == "your-python-engine-api-key":
        print("⚠️  WARNING: Using default API key! Set PYTHON_ENGINE_API_KEY in environment")
    else:
        print("✅ Custom API key configured")
    
    print("\n📦 Available Features:")
    print("   • Kundli Generation (D1, D9 charts)")
    print("   • Planetary Strength Analysis (Shadbala)")
    print("   • Vimshottari Dasha Calculations")
    print("   • Transit Analysis (Sade Sati, Jupiter)")
    print("   • Daily/Monthly/Yearly/Lifetime Horoscopes")
    print("   • Personalized Remedies (Gemstones, Mantras)")
    
    print("\n✅ Server ready to accept requests")
    print("📚 API Documentation: http://localhost:8000/docs")
    print("🔄 ReDoc: http://localhost:8000/redoc")
    print("=" * 60)

# Shutdown Event
@app.on_event("shutdown")
async def shutdown_event():
    """Run on application shutdown"""
    print("\n🛑 Shutting down AstroAI Astrology Engine...")
    print("✅ Cleanup completed")

# Request/Response Logging Middleware
@app.middleware("http")
async def log_requests(request, call_next):
    """Log all incoming requests"""
    start_time = datetime.now()
    
    # Process request
    response = await call_next(request)
    
    # Calculate processing time
    process_time = (datetime.now() - start_time).total_seconds()
    
    # Log (in production, use proper logging)
    if os.getenv("LOG_REQUESTS", "false").lower() == "true":
        print(f"{request.method} {request.url.path} - {response.status_code} - {process_time:.3f}s")
    
    # Add custom headers
    response.headers["X-Process-Time"] = str(process_time)
    response.headers["X-API-Version"] = "2.0.0"
    
    return response

# Run server
if __name__ == "__main__":
    # Configuration
    HOST = os.getenv("HOST", "0.0.0.0")
    PORT = int(os.getenv("PORT", 8000))
    RELOAD = os.getenv("RELOAD", "true").lower() == "true"
    
    print(f"\n🌟 Starting server on {HOST}:{PORT}")
    print(f"🔄 Auto-reload: {RELOAD}")
    print(f"🌐 Node.js backend should connect to: http://localhost:{PORT}")
    
    uvicorn.run(
        "main:app",
        host=HOST,
        port=PORT,
        reload=RELOAD,
        log_level="info"
    )