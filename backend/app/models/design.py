"""
Design parameters and schemas.
"""
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

class BuildingDesignParams(BaseModel):
    # Step 1: Basic
    project_name: Optional[str] = "EcoBuild Project"
    building_type: str = "Residential"
    location: str = "Standard Climate"
    
    # Step 2: Building Geometry & Schedule
    built_up_area: float = Field(200.0, ge=10.0, description="Gross floor area in m²")
    num_floors: int = Field(2, ge=1, le=100)
    occupants: int = Field(4, ge=1)
    operating_hours: float = Field(12.0, ge=1.0, le=24.0)
    building_orientation: str = "South-Facing"
    
    # Step 3: Construction Materials
    structural_material: str = "Reinforced Concrete"
    wall_material: str = "Standard Brick"
    flooring_material: str = "Ceramic Tiles"
    roof_material: str = "Asphalt Shingles"
    insulation_type: str = "Fiberglass Batt"
    recycled_material_percentage: float = Field(10.0, ge=0.0, le=100.0)
    
    # Step 4: Windows and Envelope
    window_type: str = "uPVC / Vinyl"
    window_to_wall_ratio: float = Field(25.0, ge=5.0, le=90.0)
    glazing_type: str = "Double Glazed Standard"
    external_shading: bool = False
    natural_ventilation: bool = False
    
    # Step 5: Energy & Renewables
    electricity_source: str = "Municipal Grid"
    solar_installed: bool = False
    solar_capacity: float = Field(0.0, ge=0.0, description="Solar capacity in kWp")
    hvac_system: str = "Conventional Split AC + Gas Furnace"
    led_lighting: bool = True
    other_renewable: str = "None"
    
    # Step 6: Water & Circularity
    water_source: str = "Municipal Supply"
    rainwater_harvesting: bool = False
    water_efficient_fixtures: bool = False
    wastewater_recycling: bool = False
    greywater_reuse: bool = False

class DesignCreate(BaseModel):
    project_id: str
    design_name: str = "Design A (Initial)"
    description: Optional[str] = ""
    parameters: BuildingDesignParams

class DesignResponse(BaseModel):
    id: str
    project_id: str
    design_name: str
    description: Optional[str] = ""
    parameters: Dict[str, Any]
    analysis_id: Optional[str] = None
    createdAt: Optional[str] = None
