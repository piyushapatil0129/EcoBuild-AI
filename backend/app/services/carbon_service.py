"""
Carbon Service: Estimates embodied carbon, operational carbon, and 50-year lifecycle emissions.
Based on ICE Database (Inventory of Carbon & Energy) and IPCC emission factors.
"""
from typing import Dict, Any
import numpy as np
from app.ml.feature_extractor import get_climate_info
from app.ml.physics_constants import (
    STRUCTURAL_MATERIALS,
    WALL_MATERIALS,
    FLOORING_MATERIALS,
    ROOF_MATERIALS,
    INSULATION_TYPES
)

def calculate_carbon_metrics(building_data: Dict[str, Any], energy_metrics: Dict[str, Any]) -> Dict[str, Any]:
    area = float(building_data.get("built_up_area", 200.0) or 200.0)
    floors = float(building_data.get("num_floors", 2) or 2)
    roof_area = area / max(1.0, floors)
    
    # Estimate perimeter & exterior wall surface area:
    # Assume roughly square aspect ratio: perimeter = 4 * sqrt(footprint_area)
    footprint = area / max(1.0, floors)
    perimeter = 4.0 * np.sqrt(footprint)
    story_height = 3.2 # meters
    gross_wall_area = perimeter * story_height * floors
    
    wwr = float(building_data.get("window_to_wall_ratio", 25) or 25) / 100.0
    net_wall_area = gross_wall_area * (1.0 - wwr)
    
    # 1. Structural Embodied Carbon (tCO2e)
    # Average structural concrete/frame equivalent volume ~ 0.22 m³ per m² of floor area
    structural_volume = area * 0.22
    struct_name = building_data.get("structural_material", "Reinforced Concrete")
    struct_info = STRUCTURAL_MATERIALS.get(struct_name, STRUCTURAL_MATERIALS["Reinforced Concrete"])
    embodied_structural_kg = structural_volume * struct_info["carbon_per_m3"]
    
    # 2. Wall Embodied Carbon (tCO2e)
    wall_name = building_data.get("wall_material", "Standard Brick")
    wall_info = WALL_MATERIALS.get(wall_name, WALL_MATERIALS["Standard Brick"])
    embodied_wall_kg = net_wall_area * wall_info["carbon_per_m2"]
    
    # 3. Roof Embodied Carbon (tCO2e)
    roof_name = building_data.get("roof_material", "Asphalt Shingles")
    roof_info = ROOF_MATERIALS.get(roof_name, ROOF_MATERIALS["Asphalt Shingles"])
    embodied_roof_kg = roof_area * roof_info["carbon_per_m2"]
    
    # 4. Flooring Embodied Carbon (tCO2e)
    floor_name = building_data.get("flooring_material", "Ceramic Tiles")
    floor_info = FLOORING_MATERIALS.get(floor_name, FLOORING_MATERIALS["Ceramic Tiles"])
    embodied_floor_kg = area * floor_info["carbon_per_m2"]
    
    # 5. Insulation Embodied Carbon (tCO2e)
    insul_name = building_data.get("insulation_type", "Fiberglass Batt")
    insul_info = INSULATION_TYPES.get(insul_name, INSULATION_TYPES["Fiberglass Batt"])
    embodied_insul_kg = (net_wall_area + roof_area) * insul_info["carbon_per_m2"]
    
    # Gross Embodied Carbon
    gross_embodied_kg = embodied_structural_kg + embodied_wall_kg + embodied_roof_kg + embodied_floor_kg + embodied_insul_kg
    
    # Recycled Material Mitigation Credit (up to 35% reduction)
    recycled_pct = float(building_data.get("recycled_material_percentage", 10) or 10)
    recycled_credit_kg = max(0.0, gross_embodied_kg * (recycled_pct / 100.0) * 0.40)
    net_embodied_tco2e = round(max(2.0, (gross_embodied_kg - recycled_credit_kg) / 1000.0), 2)
    
    # Baseline Embodied Carbon for comparison (typical standard brick + concrete)
    baseline_embodied_tco2e = round((structural_volume * 380.0 + net_wall_area * 65.0 + roof_area * 24.0 + area * 22.0) / 1000.0, 2)
    
    # 6. Operational Carbon (tCO2e / year)
    climate = get_climate_info(building_data.get("location", ""))
    grid_factor = climate.get("grid_carbon_factor", 0.50) # kgCO2e / kWh
    
    net_annual_kwh = energy_metrics["annual_energy_kwh"]
    annual_operational_tco2e = round((net_annual_kwh * grid_factor) / 1000.0, 2)
    
    # Avoided carbon from renewables
    solar_kwh = energy_metrics.get("annual_solar_generation_kwh", 0.0)
    annual_avoided_solar_tco2e = round((solar_kwh * grid_factor) / 1000.0, 2)
    
    baseline_annual_kwh = energy_metrics["baseline_energy_kwh"]
    baseline_annual_operational_tco2e = round((baseline_annual_kwh * grid_factor) / 1000.0, 2)
    
    # 7. 50-Year Lifecycle Carbon (tCO2e)
    lifecycle_years = 50
    total_lifecycle_tco2e = round(net_embodied_tco2e + (annual_operational_tco2e * lifecycle_years), 2)
    baseline_lifecycle_tco2e = round(baseline_embodied_tco2e + (baseline_annual_operational_tco2e * lifecycle_years), 2)
    carbon_reduction_pct = round(max(0.0, ((baseline_lifecycle_tco2e - total_lifecycle_tco2e) / baseline_lifecycle_tco2e) * 100), 1)
    
    return {
        "embodied_carbon_tco2e": net_embodied_tco2e,
        "baseline_embodied_tco2e": baseline_embodied_tco2e,
        "annual_operational_carbon_tco2e": annual_operational_tco2e,
        "baseline_annual_operational_tco2e": baseline_annual_operational_tco2e,
        "annual_avoided_solar_carbon_tco2e": annual_avoided_solar_tco2e,
        "lifecycle_50yr_carbon_tco2e": total_lifecycle_tco2e,
        "baseline_lifecycle_50yr_carbon_tco2e": baseline_lifecycle_tco2e,
        "carbon_reduction_percentage": carbon_reduction_pct,
        "grid_carbon_intensity": grid_factor,
        "breakdown": {
            "structural_tco2e": round(embodied_structural_kg / 1000.0, 2),
            "walls_envelope_tco2e": round(embodied_wall_kg / 1000.0, 2),
            "roofing_tco2e": round(embodied_roof_kg / 1000.0, 2),
            "finishes_tco2e": round((embodied_floor_kg + embodied_insul_kg) / 1000.0, 2),
            "recycled_credit_tco2e": round(recycled_credit_kg / 1000.0, 2),
            "annual_grid_emissions_tco2e": annual_operational_tco2e
        }
    }
