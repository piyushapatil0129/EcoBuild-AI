"""
Building Sustainability Analysis API endpoints.
Runs the complete multi-disciplinary engineering calculation pipeline.
"""
import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends
from typing import Optional
from app.database.connection import get_database
from app.models.analysis import AnalyzeRequest, AnalysisResponse
from app.services.energy_service import calculate_energy_metrics
from app.services.carbon_service import calculate_carbon_metrics
from app.services.water_service import calculate_water_metrics
from app.services.cost_service import calculate_cost_metrics
from app.services.score_service import calculate_sustainability_score
from app.services.recommendation_service import generate_recommendations

router = APIRouter(prefix="/api", tags=["Analysis"])

@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_building(req: AnalyzeRequest):
    db = get_database()
    designs = db["designs"]
    analyses = db["analyses"]
    
    building_params = None
    design_id = req.design_id
    
    if design_id:
        design = await designs.find_one({"_id": design_id})
        if not design:
            raise HTTPException(status_code=404, detail="Design not found.")
        building_params = design.get("parameters", {})
    elif req.parameters:
        building_params = req.parameters.model_dump()
    else:
        raise HTTPException(status_code=400, detail="Must provide either design_id or parameters.")
        
    # Execute full calculation pipeline
    energy_metrics = calculate_energy_metrics(building_params)
    carbon_metrics = calculate_carbon_metrics(building_params, energy_metrics)
    water_metrics = calculate_water_metrics(building_params)
    cost_metrics = calculate_cost_metrics(building_params, energy_metrics, water_metrics)
    score_metrics = calculate_sustainability_score(
        building_params,
        energy_metrics,
        carbon_metrics,
        water_metrics,
        req.custom_weights
    )
    recommendations = generate_recommendations(
        building_params,
        energy_metrics,
        carbon_metrics,
        water_metrics,
        score_metrics
    )
    
    assumptions = [
        f"Grid electricity carbon factor: {carbon_metrics.get('grid_carbon_intensity', 0.50)} kgCO2e/kWh",
        f"ASHRAE 90.1 baseline building benchmark EUI: {energy_metrics.get('baseline_eui', 150)} kWh/m²/year",
        "Embodied carbon factors referenced from ICE Database v3.0",
        "Rainwater cistern collection efficiency calibrated to 85% runoff capture",
        "Utility tariffs: $0.14/kWh electricity, $2.40/m³ municipal potable water"
    ]
    
    analysis_id = str(uuid.uuid4())
    analysis_doc = {
        "_id": analysis_id,
        "design_id": design_id,
        "sustainability_score": score_metrics["overall_score"],
        "rating_tier": score_metrics["rating_tier"],
        "badge_color": score_metrics["badge_color"],
        "category_scores": score_metrics["category_scores"],
        "energy_metrics": energy_metrics,
        "carbon_metrics": carbon_metrics,
        "water_metrics": water_metrics,
        "cost_metrics": cost_metrics,
        "recommendations": recommendations,
        "assumptions": assumptions,
        "disclaimer": score_metrics["disclaimer"],
        "createdAt": datetime.utcnow().isoformat()
    }
    
    if design_id:
        # Save or update analysis
        existing = await analyses.find_one({"design_id": design_id})
        if existing:
            await analyses.update_one({"_id": existing["_id"]}, {"$set": analysis_doc})
            analysis_id = str(existing["_id"])
        else:
            await analyses.insert_one(analysis_doc)
            
        await designs.update_one({"_id": design_id}, {"$set": {"analysis_id": analysis_id}})
        
    return {
        "id": analysis_id,
        "design_id": design_id,
        "sustainability_score": score_metrics["overall_score"],
        "rating_tier": score_metrics["rating_tier"],
        "badge_color": score_metrics["badge_color"],
        "category_scores": score_metrics["category_scores"],
        "energy_metrics": energy_metrics,
        "carbon_metrics": carbon_metrics,
        "water_metrics": water_metrics,
        "cost_metrics": cost_metrics,
        "recommendations": recommendations,
        "assumptions": assumptions,
        "disclaimer": score_metrics["disclaimer"],
        "createdAt": analysis_doc["createdAt"]
    }

@router.get("/analysis/{design_id}")
async def get_design_analysis(design_id: str):
    db = get_database()
    analysis = await db["analyses"].find_one({"design_id": design_id})
    if not analysis:
        # Try finding design and generating on the fly
        design = await db["designs"].find_one({"_id": design_id})
        if not design:
            raise HTTPException(status_code=404, detail="Analysis not found for specified design.")
        # Auto-run analysis
        req = AnalyzeRequest(design_id=design_id)
        return await analyze_building(req)
        
    analysis["id"] = str(analysis["_id"])
    return analysis
