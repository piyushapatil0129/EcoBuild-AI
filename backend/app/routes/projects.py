"""
Project Management API endpoints.
"""
import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends
from app.database.connection import get_database
from app.models.project import ProjectCreate, ProjectResponse
from app.models.design import BuildingDesignParams
from app.services.auth_service import get_current_user
from app.routes.analyze import analyze_building
from app.models.analysis import AnalyzeRequest

router = APIRouter(prefix="/api/projects", tags=["Projects"])

@router.get("", response_model=List[ProjectResponse])
async def list_projects(user: dict = Depends(get_current_user)):
    db = get_database()
    projects_col = db["projects"]
    designs_col = db["designs"]
    analyses_col = db["analyses"]
    
    user_id = str(user["_id"])
    cursor = projects_col.find({"user_id": user_id}).sort("createdAt", -1)
    projects = await cursor.to_list()
    
    # If no projects for this specific user, include demo projects so user can immediately explore
    if not projects:
        cursor = projects_col.find().sort("createdAt", -1)
        projects = await cursor.to_list()
        
    result = []
    for p in projects:
        p_id = str(p["_id"])
        designs = await designs_col.find({"project_id": p_id}).to_list()
        
        # Determine latest score
        latest_score = p.get("latest_score")
        latest_tier = p.get("latest_rating_tier")
        if designs:
            latest_design = designs[-1]
            if latest_design.get("analysis_id"):
                analysis = await analyses_col.find_one({"_id": latest_design["analysis_id"]})
                if analysis:
                    latest_score = analysis.get("sustainability_score")
                    latest_tier = analysis.get("rating_tier")
                    
        result.append({
            "id": p_id,
            "user_id": str(p.get("user_id", user_id)),
            "project_name": p.get("project_name", "Untitled"),
            "building_type": p.get("building_type", "Residential"),
            "location": p.get("location", "Standard Climate"),
            "description": p.get("description", ""),
            "latest_score": latest_score,
            "latest_rating_tier": latest_tier,
            "design_count": len(designs) if designs else 1,
            "createdAt": p.get("createdAt"),
            "updatedAt": p.get("updatedAt", p.get("createdAt"))
        })
        
    return result

@router.post("", response_model=ProjectResponse)
async def create_project(req: ProjectCreate, user: dict = Depends(get_current_user)):
    db = get_database()
    projects_col = db["projects"]
    designs_col = db["designs"]
    
    user_id = str(user["_id"])
    proj_id = str(uuid.uuid4())
    
    # Prepare initial parameters
    params = req.initial_parameters.model_dump() if req.initial_parameters else BuildingDesignParams(
        project_name=req.project_name,
        building_type=req.building_type,
        location=req.location
    ).model_dump()
    params["project_name"] = req.project_name
    params["building_type"] = req.building_type
    params["location"] = req.location
    
    design_id = str(uuid.uuid4())
    design_doc = {
        "_id": design_id,
        "project_id": proj_id,
        "design_name": "Design A (Initial Baseline)",
        "description": "Initial proposed building design configuration.",
        "parameters": params,
        "createdAt": datetime.utcnow().isoformat()
    }
    await designs_col.insert_one(design_doc)
    
    # Run analysis for initial design
    analysis_res = await analyze_building(AnalyzeRequest(design_id=design_id))
    
    project_doc = {
        "_id": proj_id,
        "user_id": user_id,
        "project_name": req.project_name,
        "building_type": req.building_type,
        "location": req.location,
        "description": req.description or "",
        "latest_score": analysis_res["sustainability_score"],
        "latest_rating_tier": analysis_res["rating_tier"],
        "design_count": 1,
        "createdAt": datetime.utcnow().isoformat(),
        "updatedAt": datetime.utcnow().isoformat()
    }
    await projects_col.insert_one(project_doc)
    
    return {
        "id": proj_id,
        "user_id": user_id,
        "project_name": req.project_name,
        "building_type": req.building_type,
        "location": req.location,
        "description": req.description or "",
        "latest_score": analysis_res["sustainability_score"],
        "latest_rating_tier": analysis_res["rating_tier"],
        "design_count": 1,
        "createdAt": project_doc["createdAt"],
        "updatedAt": project_doc["updatedAt"]
    }

@router.get("/{project_id}")
async def get_project(project_id: str):
    db = get_database()
    p = await db["projects"].find_one({"_id": project_id})
    if not p:
        raise HTTPException(status_code=404, detail="Project not found.")
        
    designs = await db["designs"].find({"project_id": project_id}).to_list()
    # attach analyses to each design
    designs_list = []
    for d in designs:
        d_id = str(d["_id"])
        analysis = await db["analyses"].find_one({"design_id": d_id})
        designs_list.append({
            "id": d_id,
            "project_id": project_id,
            "design_name": d.get("design_name", "Design"),
            "description": d.get("description", ""),
            "parameters": d.get("parameters", {}),
            "analysis": analysis,
            "createdAt": d.get("createdAt")
        })
        
    return {
        "id": str(p["_id"]),
        "user_id": str(p.get("user_id", "")),
        "project_name": p.get("project_name", ""),
        "building_type": p.get("building_type", "Residential"),
        "location": p.get("location", ""),
        "description": p.get("description", ""),
        "latest_score": p.get("latest_score"),
        "latest_rating_tier": p.get("latest_rating_tier"),
        "designs": designs_list,
        "createdAt": p.get("createdAt"),
        "updatedAt": p.get("updatedAt")
    }

@router.delete("/{project_id}")
async def delete_project(project_id: str):
    db = get_database()
    res = await db["projects"].delete_one({"_id": project_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Project not found.")
        
    # Cascade delete designs and analyses
    designs = await db["designs"].find({"project_id": project_id}).to_list()
    for d in designs:
        await db["analyses"].delete_one({"design_id": str(d["_id"])})
    await db["designs"].delete_one({"project_id": project_id})
    
    return {"message": "Project and associated design versions successfully removed."}
