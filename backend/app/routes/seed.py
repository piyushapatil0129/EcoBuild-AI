"""
Seed API endpoint for demo data reset.
"""
from fastapi import APIRouter
from app.database.connection import get_database
from app.database.seed_data import seed_database

router = APIRouter(prefix="/api/seed", tags=["Seed"])

@router.post("")
async def seed_data():
    db = get_database()
    await seed_database(db)
    return {"message": "Demo data successfully verified and seeded."}
