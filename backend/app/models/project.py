"""
Project Pydantic models and schemas.
"""
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from app.models.design import BuildingDesignParams

class ProjectCreate(BaseModel):
    project_name: str = Field(..., min_length=2, max_length=150)
    building_type: str = "Residential"
    location: str = "Standard Climate"
    description: Optional[str] = ""
    initial_parameters: Optional[BuildingDesignParams] = None

class ProjectResponse(BaseModel):
    id: str
    user_id: str
    project_name: str
    building_type: str
    location: str
    description: Optional[str] = ""
    latest_score: Optional[float] = None
    latest_rating_tier: Optional[str] = None
    design_count: int = 1
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None
