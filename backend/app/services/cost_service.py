"""
Cost Service: Lifecycle initial construction cost (CapEx) and annual utility operating cost (OpEx).
"""
from typing import Dict, Any
from app.ml.physics_constants import (
    BASE_CONSTRUCTION_COST_PER_M2,
    ELECTRICITY_COST_PER_KWH,
    WATER_COST_PER_M3,
    STRUCTURAL_MATERIALS,
    GLAZING_TYPES
)

def calculate_cost_metrics(building_data: Dict[str, Any], energy_metrics: Dict[str, Any], water_metrics: Dict[str, Any]) -> Dict[str, Any]:
    b_type = building_data.get("building_type", "Residential")
    area = float(building_data.get("built_up_area", 200.0) or 200.0)
    floors = float(building_data.get("num_floors", 2) or 2)
    roof_area = area / max(1.0, floors)
    
    # Base construction cost
    base_m2_cost = BASE_CONSTRUCTION_COST_PER_M2.get(b_type, 1500.0)
    base_capex = area * base_m2_cost
    
    # Material adjustments
    struct_name = building_data.get("structural_material", "Reinforced Concrete")
    struct_info = STRUCTURAL_MATERIALS.get(struct_name, STRUCTURAL_MATERIALS["Reinforced Concrete"])
    # Differential from standard reinforced concrete ($170/m³ * 0.22 m³/m² floor = $37.4/m²)
    struct_diff_per_m2 = (struct_info.get("cost_per_m3", 170.0) - 170.0) * 0.22
    
    # Glazing cost adjustment
    glazing_name = building_data.get("glazing_type", "Double Glazed Standard")
    glazing_info = GLAZING_TYPES.get(glazing_name, GLAZING_TYPES["Double Glazed Standard"])
    wwr = float(building_data.get("window_to_wall_ratio", 25) or 25) / 100.0
    glazing_premium_per_m2 = (glazing_info.get("cost_multiplier", 1.0) - 1.0) * (wwr * 80.0)
    
    # Solar PV system cost ($1,150 / kWp installed)
    solar_kwp = float(building_data.get("solar_capacity", 0.0) or 0.0)
    solar_capex = solar_kwp * 1150.0
    
    # Rainwater & Greywater capital costs
    has_rwh = building_data.get("rainwater_harvesting", False)
    rwh_capex = (2500.0 + roof_area * 8.0) if has_rwh else 0.0
    
    has_greywater = building_data.get("greywater_reuse", False)
    greywater_capex = (3500.0 + area * 6.0) if has_greywater else 0.0
    
    # Total initial capital expenditure
    total_initial_capex = round(base_capex + (struct_diff_per_m2 + glazing_premium_per_m2) * area + solar_capex + rwh_capex + greywater_capex, 0)
    baseline_initial_capex = round(base_capex, 0)
    
    # Annual Operating Costs (OpEx)
    annual_electricity_cost = round(energy_metrics["annual_energy_kwh"] * ELECTRICITY_COST_PER_KWH, 2)
    baseline_electricity_cost = round(energy_metrics["baseline_energy_kwh"] * ELECTRICITY_COST_PER_KWH, 2)
    
    annual_water_cost = round(water_metrics["annual_water_consumption_m3"] * WATER_COST_PER_M3, 2)
    baseline_water_cost = round(water_metrics["baseline_water_consumption_m3"] * WATER_COST_PER_M3, 2)
    
    annual_opex = round(annual_electricity_cost + annual_water_cost, 2)
    baseline_annual_opex = round(baseline_electricity_cost + baseline_water_cost, 2)
    annual_savings_usd = round(max(0.0, baseline_annual_opex - annual_opex), 2)
    
    # 25-Year Lifecycle Operating Cost
    lifecycle_25yr_opex = round(annual_opex * 25.0, 0)
    baseline_25yr_opex = round(baseline_annual_opex * 25.0, 0)
    
    # Payback period on green investments
    green_capex_premium = max(0.0, total_initial_capex - baseline_initial_capex)
    simple_payback_years = round(green_capex_premium / max(100.0, annual_savings_usd), 1) if annual_savings_usd > 100 else 0.0
    
    return {
        "estimated_initial_cost_usd": total_initial_capex,
        "baseline_initial_cost_usd": baseline_initial_capex,
        "green_premium_usd": green_capex_premium,
        "annual_operating_cost_usd": annual_opex,
        "baseline_annual_operating_cost_usd": baseline_annual_opex,
        "annual_utility_savings_usd": annual_savings_usd,
        "payback_period_years": simple_payback_years,
        "lifecycle_25yr_opex_usd": lifecycle_25yr_opex,
        "breakdown": {
            "annual_electricity_cost_usd": annual_electricity_cost,
            "annual_water_cost_usd": annual_water_cost,
            "solar_investment_usd": round(solar_capex, 0),
            "water_systems_investment_usd": round(rwh_capex + greywater_capex, 0)
        }
    }
