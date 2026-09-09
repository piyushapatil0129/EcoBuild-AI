"""
Feature Extractor and Input Processor for Building Energy Model.
Converts high-level building parameters into numerical feature vectors.
"""
from typing import Dict, Any, List
import numpy as np
from app.ml.physics_constants import (
    BASELINE_EUI,
    CLIMATE_FACTORS,
    LOCATION_TO_CLIMATE,
    STRUCTURAL_MATERIALS,
    WALL_MATERIALS,
    ROOF_MATERIALS,
    INSULATION_TYPES,
    GLAZING_TYPES,
    WINDOW_FRAME_TYPES,
    HVAC_SYSTEMS
)

BUILDING_TYPE_MAPPING = {
    "Residential": 0,
    "Commercial": 1,
    "Educational": 2,
    "Hospital": 3,
    "Industrial": 4,
    "Office": 5,
    "Other": 6
}

FEATURE_NAMES = [
    "built_up_area",
    "num_floors",
    "occupants",
    "operating_hours",
    "building_type_code",
    "climate_hdd",
    "climate_cdd",
    "window_to_wall_ratio",
    "window_u_value",
    "window_shgc",
    "wall_u_value",
    "roof_u_value",
    "hvac_efficiency_factor",
    "led_lighting_ratio",
    "solar_capacity_kwp",
    "natural_ventilation",
    "external_shading",
    "recycled_material_ratio"
]

def get_climate_info(location_name: str) -> Dict[str, float]:
    loc = (location_name or "").lower().strip()
    climate_zone = "default"
    for key, zone in LOCATION_TO_CLIMATE.items():
        if key in loc:
            climate_zone = zone
            break
    return CLIMATE_FACTORS.get(climate_zone, CLIMATE_FACTORS["default"])

def extract_features(building_data: Dict[str, Any]) -> Dict[str, float]:
    """Extract numeric features from raw building design data."""
    # Basic info
    b_type = building_data.get("building_type", "Residential")
    type_code = BUILDING_TYPE_MAPPING.get(b_type, 0)
    location = building_data.get("location", "Standard Climate")
    climate = get_climate_info(location)
    
    # Building geometric info
    area = float(building_data.get("built_up_area", 200.0) or 200.0)
    floors = float(building_data.get("num_floors", 2) or 2)
    occupants = float(building_data.get("occupants", 4) or 4)
    op_hours = float(building_data.get("operating_hours", 12) or 12)
    
    # Windows & Envelope
    wwr = float(building_data.get("window_to_wall_ratio", 25) or 25) / 100.0
    wwr = max(0.05, min(0.90, wwr))
    
    glazing_name = building_data.get("glazing_type", "Double Glazed Standard")
    glazing_props = GLAZING_TYPES.get(glazing_name, GLAZING_TYPES["Double Glazed Standard"])
    
    frame_name = building_data.get("window_type", "uPVC / Vinyl")
    frame_props = WINDOW_FRAME_TYPES.get(frame_name, WINDOW_FRAME_TYPES["uPVC / Vinyl"])
    window_u = max(0.6, glazing_props["u_value"] + frame_props["u_value_penalty"])
    window_shgc = glazing_props["shgc"]
    
    wall_name = building_data.get("wall_material", "Standard Brick")
    wall_props = WALL_MATERIALS.get(wall_name, WALL_MATERIALS["Standard Brick"])
    
    insulation_name = building_data.get("insulation_type", "Fiberglass Batt")
    insul_props = INSULATION_TYPES.get(insulation_name, INSULATION_TYPES["Fiberglass Batt"])
    wall_u = wall_props["u_value"] * insul_props["u_factor"]
    
    roof_name = building_data.get("roof_material", "Asphalt Shingles")
    roof_props = ROOF_MATERIALS.get(roof_name, ROOF_MATERIALS["Asphalt Shingles"])
    roof_u = roof_props["u_value"] * insul_props["u_factor"]
    
    # HVAC and Energy
    hvac_name = building_data.get("hvac_system", "Conventional Split AC + Gas Furnace")
    hvac_props = HVAC_SYSTEMS.get(hvac_name, HVAC_SYSTEMS["Conventional Split AC + Gas Furnace"])
    hvac_factor = hvac_props["annual_adj"]
    
    led_pct = float(building_data.get("led_lighting_percentage", 80) if "led_lighting_percentage" in building_data else (100 if building_data.get("led_lighting", True) else 30)) / 100.0
    solar_kwp = float(building_data.get("solar_capacity", 0.0) or 0.0)
    
    nat_vent = 1.0 if building_data.get("natural_ventilation", False) else 0.0
    shading = 1.0 if building_data.get("external_shading", False) else 0.0
    
    recycled_ratio = float(building_data.get("recycled_material_percentage", 10) or 10) / 100.0
    
    return {
        "built_up_area": area,
        "num_floors": floors,
        "occupants": occupants,
        "operating_hours": op_hours,
        "building_type_code": float(type_code),
        "climate_hdd": float(climate["hdd"]),
        "climate_cdd": float(climate["cdd"]),
        "window_to_wall_ratio": wwr,
        "window_u_value": window_u,
        "window_shgc": window_shgc,
        "wall_u_value": wall_u,
        "roof_u_value": roof_u,
        "hvac_efficiency_factor": hvac_factor,
        "led_lighting_ratio": led_pct,
        "solar_capacity_kwp": solar_kwp,
        "natural_ventilation": nat_vent,
        "external_shading": shading,
        "recycled_material_ratio": recycled_ratio
    }

def features_to_array(features_dict: Dict[str, float]):
    import pandas as pd
    return pd.DataFrame([[features_dict[name] for name in FEATURE_NAMES]], columns=FEATURE_NAMES)
