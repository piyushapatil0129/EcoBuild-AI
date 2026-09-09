"""
Design Optimization API endpoint.
Generates an optimized configuration matching user priorities.
"""
from fastapi import APIRouter, HTTPException
from app.database.connection import get_database
from app.models.analysis import OptimizeRequest, OptimizeResponse
from app.services.optimization_service import optimize_building_design

router = APIRouter(prefix="/api", tags=["Optimization"])

@router.post("/optimize", response_model=OptimizeResponse)
async def optimize_design(req: OptimizeRequest):
    db = get_database()
    params = None
    
    if req.design_id:
        design = await db["designs"].find_one({"_id": req.design_id})
        if not design:
            raise HTTPException(status_code=404, detail="Design not found.")
        params = design.get("parameters", {})
    elif req.parameters:
        params = req.parameters.model_dump()
    else:
        raise HTTPException(status_code=400, detail="Must provide design_id or parameters.")
        
    optimization_result = optimize_building_design(params, priority=req.priority)
    return optimization_result
