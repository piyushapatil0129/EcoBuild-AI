"""
Water Service: Calculates annual building water demand, rainwater harvesting potential,
greywater reclamation, and freshwater dependency index.
"""
from typing import Dict, Any
from app.ml.feature_extractor import get_climate_info
from app.ml.physics_constants import WATER_BASELINE_PER_CAPITA, WATER_COST_PER_M3

def calculate_water_metrics(building_data: Dict[str, Any]) -> Dict[str, Any]:
    b_type = building_data.get("building_type", "Residential")
    occupants = float(building_data.get("occupants", 4) or 4)
    area = float(building_data.get("built_up_area", 200.0) or 200.0)
    floors = float(building_data.get("num_floors", 2) or 2)
    roof_area = area / max(1.0, floors)
    
    # 1. Baseline Domestic Water Demand (Liters/year)
    base_liters_per_day = WATER_BASELINE_PER_CAPITA.get(b_type, 100.0)
    # Hospital/Office/Commercial also have HVAC cooling tower & cleaning water
    process_multiplier = 1.25 if b_type in ["Hospital", "Commercial", "Office"] else 1.05
    baseline_annual_liters = occupants * base_liters_per_day * 365.0 * process_multiplier
    baseline_annual_m3 = round(baseline_annual_liters / 1000.0, 1) # in m³ (kL)
    
    # 2. Efficiency Measures Reduction
    fixture_efficient = building_data.get("water_efficient_fixtures", False)
    fixture_reduction_factor = 0.35 if fixture_efficient else 0.05
    
    net_indoor_demand_m3 = round(baseline_annual_m3 * (1.0 - fixture_reduction_factor), 1)
    
    # 3. Rainwater Harvesting Potential (m³/year)
    has_rwh = building_data.get("rainwater_harvesting", False)
    climate = get_climate_info(building_data.get("location", ""))
    annual_rainfall_mm = climate.get("annual_rainfall_mm", 900.0)
    
    # Runoff coefficient ~ 0.85 for pitched/metal roof, 0.75 for tiles
    runoff_coefficient = 0.85
    filter_efficiency = 0.90
    
    if has_rwh:
        # Volume (Liters) = Area (m²) * Rainfall (mm) * Runoff * Filter
        rwh_annual_liters = roof_area * annual_rainfall_mm * runoff_coefficient * filter_efficiency
        rwh_harvested_m3 = round(rwh_annual_liters / 1000.0, 1)
    else:
        rwh_harvested_m3 = 0.0
        
    # 4. Greywater & Wastewater Recycling
    has_greywater = building_data.get("greywater_reuse", False)
    has_wastewater_recycle = building_data.get("wastewater_recycling", False)
    
    reclaim_factor = 0.0
    if has_greywater:
        reclaim_factor += 0.28  # captures shower/sink water for toilet flushing & irrigation
    if has_wastewater_recycle:
        reclaim_factor += 0.35  # full blackwater/MBR system
        
    reclaim_factor = min(0.65, reclaim_factor)
    reused_water_m3 = round(net_indoor_demand_m3 * reclaim_factor, 1)
    
    # 5. Net Municipal Freshwater Dependency
    total_alternative_water_m3 = rwh_harvested_m3 + reused_water_m3
    net_freshwater_m3 = round(max(0.0, net_indoor_demand_m3 - total_alternative_water_m3), 1)
    
    freshwater_dependency_pct = round(min(100.0, max(5.0, (net_freshwater_m3 / max(1.0, baseline_annual_m3)) * 100.0)), 1)
    water_savings_m3 = round(max(0.0, baseline_annual_m3 - net_freshwater_m3), 1)
    water_savings_pct = round(max(0.0, (water_savings_m3 / max(1.0, baseline_annual_m3)) * 100.0), 1)
    annual_cost_savings = round(water_savings_m3 * WATER_COST_PER_M3, 2)
    
    return {
        "annual_water_consumption_m3": net_freshwater_m3,
        "baseline_water_consumption_m3": baseline_annual_m3,
        "indoor_demand_m3": net_indoor_demand_m3,
        "rainwater_harvested_m3": rwh_harvested_m3,
        "reused_water_m3": reused_water_m3,
        "total_alternative_water_m3": total_alternative_water_m3,
        "freshwater_dependency_percentage": freshwater_dependency_pct,
        "water_savings_m3": water_savings_m3,
        "water_savings_percentage": water_savings_pct,
        "annual_water_utility_savings_usd": annual_cost_savings,
        "breakdown": {
            "potable_municipal_m3": net_freshwater_m3,
            "rainwater_m3": rwh_harvested_m3,
            "greywater_recycled_m3": reused_water_m3,
            "fixtures_conservation_m3": round(baseline_annual_m3 * fixture_reduction_factor, 1)
        }
    }
