"""
EcoBuild AI — Sustainable Construction Advisor
Main FastAPI application entry point.
"""
import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.connection import connect_to_database, close_database_connection
from app.database.seed_data import seed_database
from app.services.energy_service import get_model
from app.routes.auth import router as auth_router
from app.routes.projects import router as projects_router
from app.routes.designs import router as designs_router
from app.routes.analyze import router as analyze_router
from app.routes.recommendations import router as recommendations_router
from app.routes.compare import router as compare_router
from app.routes.optimize import router as optimize_router
from app.routes.reports import router as reports_router
from app.routes.seed import router as seed_router

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("ecobuild.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Initializing EcoBuild AI Backend Services...")
    db = await connect_to_database()
    
    # Preload ML model
    try:
        get_model()
        logger.info("AI Energy prediction ML model loaded and verified.")
    except Exception as e:
        logger.warning("ML Model loading alert: %s", str(e))
        
    # Auto-seed demo projects & demo user
    try:
        await seed_database(db)
        logger.info("EcoBuild AI seed demo projects initialized.")
    except Exception as e:
        logger.error("Error seeding demo projects: %s", str(e))
        
    yield
    
    # Shutdown
    logger.info("Shutting down EcoBuild AI Services...")
    await close_database_connection()

app = FastAPI(
    title="EcoBuild AI — Sustainable Construction Advisor API",
    description="Intelligent building sustainability evaluation, decarbonization roadmap, and multi-objective design optimization.",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(auth_router)
app.include_router(projects_router)
app.include_router(designs_router)
app.include_router(analyze_router)
app.include_router(recommendations_router)
app.include_router(compare_router)
app.include_router(optimize_router)
app.include_router(reports_router)
app.include_router(seed_router)

@app.get("/")
async def root():
    return {
        "app": "EcoBuild AI — Sustainable Construction Advisor",
        "status": "operational",
        "version": "1.0.0",
        "docs_url": "/docs"
    }

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "services": {
            "api": "online",
            "ml_model": "loaded",
            "scoring_engine": "active"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
