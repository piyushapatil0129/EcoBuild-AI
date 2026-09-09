"""
AI Recommendation API endpoints.
"""
from fastapi import APIRouter, HTTPException
from app.database.connection import get_database
from app.routes.analyze import analyze_building
from app.models.analysis import AnalyzeRequest

router = APIRouter(prefix="/api/recommendations", tags=["Recommendations"])

@router.get("/{design_id}")
async def get_design_recommendations(design_id: str):
    db = get_database()
    analysis = await db["analyses"].find_one({"design_id": design_id})
    if not analysis:
        # Run analysis on the fly
        res = await analyze_building(AnalyzeRequest(design_id=design_id))
        return res.recommendations
        
    return analysis.get("recommendations", [])
