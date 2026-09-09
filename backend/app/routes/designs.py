"""
Design Versioning endpoints.
Allows creating multiple iterations (Design A, Design B, Design C) under a project.
"""
import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException
from app.database.connection import get_database
from app.models.design import DesignCreate, DesignResponse
from app.routes.analyze import analyze_building
from app.models.analysis import AnalyzeRequest

router = APIRouter(prefix="/api/designs", tags=["Designs"])

@router.post("", response_model=DesignResponse)
async def create_design(req: DesignCreate):
    db = get_database()
    projects = db["projects"]
    designs = db["designs"]
    
    project = await projects.find_one({"_id": req.project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")
        
    design_id = str(uuid.uuid4())
    params = req.parameters.model_dump()
    
    # Inherit project location & type if not explicitly set
    if not params.get("location"):
        params["location"] = project.get("location", "Standard Climate")
    if not params.get("building_type"):
        params["building_type"] = project.get("building_type", "Residential")
        
    design_doc = {
        "_id": design_id,
        "project_id": req.project_id,
        "design_name": req.design_name,
        "description": req.description or "",
        "parameters": params,
        "createdAt": datetime.utcnow().isoformat()
    }
    await designs.insert_one(design_doc)
    
    # Run analysis for this new design version
    analysis_res = await analyze_building(AnalyzeRequest(design_id=design_id))
    
    # Update project latest score and design count
    all_designs = await designs.find({"project_id": req.project_id}).to_list()
    await projects.update_one(
        {"_id": req.project_id},
        {
            "$set": {
                "latest_score": analysis_res["sustainability_score"],
                "latest_rating_tier": analysis_res["rating_tier"],
                "design_count": len(all_designs),
                "updatedAt": datetime.utcnow().isoformat()
            }
        }
    )
    
    return {
        "id": design_id,
        "project_id": req.project_id,
        "design_name": req.design_name,
        "description": req.description or "",
        "parameters": params,
        "analysis_id": analysis_res["id"],
        "createdAt": design_doc["createdAt"]
    }

@router.get("/{design_id}")
async def get_design(design_id: str):
    db = get_database()
    design = await db["designs"].find_one({"_id": design_id})
    if not design:
        raise HTTPException(status_code=404, detail="Design not found.")
        
    analysis = await db["analyses"].find_one({"design_id": design_id})
    if not analysis:
        # Run on-demand analysis if none exists yet
        analysis_res = await analyze_building(AnalyzeRequest(design_id=design_id))
        analysis = await db["analyses"].find_one({"design_id": design_id})
        
    return {
        "id": str(design["_id"]),
        "project_id": str(design.get("project_id", "")),
        "design_name": design.get("design_name", "Design"),
        "description": design.get("description", ""),
        "parameters": design.get("parameters", {}),
        "analysis": analysis,
        "createdAt": design.get("createdAt")
    }
