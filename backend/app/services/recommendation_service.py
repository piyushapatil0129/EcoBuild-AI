"""
AI Recommendation Engine: Synthesizes multi-disciplinary engineering criteria,
detects efficiency gaps, and outputs prioritized actionable interventions.
"""
from typing import Dict, Any, List

def generate_recommendations(
    building_data: Dict[str, Any],
    energy_metrics: Dict[str, Any],
    carbon_metrics: Dict[str, Any],
    water_metrics: Dict[str, Any],
    score_metrics: Dict[str, Any]
) -> List[Dict[str, Any]]:
    recs = []
    
    # Extract key parameters
    solar_kwp = float(building_data.get("solar_capacity", 0.0) or 0.0)
    has_rwh = building_data.get("rainwater_harvesting", False)
    has_greywater = building_data.get("greywater_reuse", False)
    water_eff_fixtures = building_data.get("water_efficient_fixtures", False)
    has_shading = building_data.get("external_shading", False)
    has_nat_vent = building_data.get("natural_ventilation", False)
    hvac = building_data.get("hvac_system", "")
    glazing = building_data.get("glazing_type", "")
    insul = building_data.get("insulation_type", "")
    struct = building_data.get("structural_material", "")
    wall = building_data.get("wall_material", "")
    recycled_pct = float(building_data.get("recycled_material_percentage", 10) or 10)
    wwr = float(building_data.get("window_to_wall_ratio", 25) or 25)
    
    area = float(building_data.get("built_up_area", 200.0) or 200.0)
    floors = float(building_data.get("num_floors", 2) or 2)
    roof_area = area / max(1.0, floors)
    
    # 1. SOLAR PV INTEGRATION (Opportunity / High)
    if solar_kwp < 2.0:
        recommended_solar_kwp = round(min(50.0, max(4.0, (roof_area * 0.12))), 1)
        est_solar_yield = round(recommended_solar_kwp * 1450.0 * 0.82, 0)
        est_cost_savings = round(est_solar_yield * 0.14, 0)
        est_carbon_avoided = round((est_solar_yield * carbon_metrics.get("grid_carbon_intensity", 0.50)) / 1000.0, 1)
        
        recs.append({
            "id": "rec-solar-pv",
            "title": "Deploy Rooftop Solar Photovoltaic (PV) Array",
            "category": "Energy & Renewables",
            "priority": "High" if energy_metrics.get("annual_energy_kwh", 0) > 12000 else "Medium",
            "badge_type": "HIGH PRIORITY" if energy_metrics.get("annual_energy_kwh", 0) > 12000 else "OPPORTUNITY",
            "reason": f"Building roof footprint of {int(roof_area)} m² is unutilized for on-site renewable generation while grid demand is {int(energy_metrics.get('annual_energy_kwh', 0)):,} kWh/yr.",
            "explanation": f"Installing an estimated {recommended_solar_kwp} kWp rooftop solar PV array directly offsets grid electricity purchases and protects against peak tariff hikes.",
            "expected_impact": f"Generates ~{int(est_solar_yield):,} kWh/yr, saves ${int(est_cost_savings):,}/yr, and avoids ~{est_carbon_avoided} tCO2e/yr.",
            "estimated_savings_usd": est_cost_savings,
            "estimated_carbon_avoided_tco2e": est_carbon_avoided,
            "estimated_energy_saved_kwh": est_solar_yield
        })

    # 2. ENVELOPE INSULATION & THERMAL BRIDGING (High / Medium)
    if insul in ["None / Minimal", "Fiberglass Batt"]:
        cooling_kwh = energy_metrics["breakdown"].get("cooling_kwh", 0)
        heating_kwh = energy_metrics["breakdown"].get("heating_kwh", 0)
        thermal_kwh = cooling_kwh + heating_kwh
        potential_thermal_savings = round(thermal_kwh * 0.28, 0)
        cost_save = round(potential_thermal_savings * 0.14, 0)
        carbon_save = round((potential_thermal_savings * 0.50) / 1000.0, 1)
        
        recs.append({
            "id": "rec-insulation-upgrade",
            "title": "Upgrade Thermal Envelope to Continuous Bio-Based or Rockwool Insulation",
            "category": "Building Envelope",
            "priority": "High",
            "badge_type": "HIGH PRIORITY",
            "reason": f"Current thermal insulation ({insul}) exhibits significant conduction heat transfer, causing HVAC heating/cooling loads of {int(thermal_kwh):,} kWh/yr.",
            "explanation": "Switching to continuous high-density mineral rockwool or wood-fiber insulation dramatically reduces thermal bridging and air infiltration.",
            "expected_impact": f"Cuts thermal loads by ~28% (~{int(potential_thermal_savings):,} kWh/yr) and lowers utility costs by ${int(cost_save):,}/yr.",
            "estimated_savings_usd": cost_save,
            "estimated_carbon_avoided_tco2e": carbon_save,
            "estimated_energy_saved_kwh": potential_thermal_savings
        })

    # 3. GLAZING & SOLAR HEAT GAIN (SHGC)
    if "Single" in glazing or ("Double" in glazing and "Low-E" not in glazing):
        glaze_savings_kwh = round(energy_metrics["breakdown"].get("cooling_kwh", 2000) * 0.22, 0)
        recs.append({
            "id": "rec-glazing-low-e",
            "title": "Upgrade to Double/Triple Glazed Low-E Argon Windows",
            "category": "Building Envelope",
            "priority": "Medium",
            "badge_type": "MEDIUM PRIORITY",
            "reason": f"Standard glazing ({glazing}) has high thermal transmittance (U > 2.8 W/m²K) and solar heat gain coefficient (SHGC > 0.70).",
            "explanation": "Low-Emissivity (Low-E) coatings reflect long-wave infrared heat while admitting visible daylight, keeping interior spaces cooler in summer and warmer in winter.",
            "expected_impact": f"Lowers cooling energy by ~{int(glaze_savings_kwh):,} kWh/yr and significantly improves occupant thermal comfort.",
            "estimated_savings_usd": round(glaze_savings_kwh * 0.14, 0),
            "estimated_carbon_avoided_tco2e": round((glaze_savings_kwh * 0.50) / 1000.0, 1),
            "estimated_energy_saved_kwh": glaze_savings_kwh
        })

    # 4. EXTERNAL SHADING & SOLAR CONTROL
    if not has_shading and wwr >= 20:
        cooling_kwh = energy_metrics["breakdown"].get("cooling_kwh", 0)
        shading_savings = round(cooling_kwh * 0.18, 0)
        recs.append({
            "id": "rec-external-shading",
            "title": "Install Architectural External Shading / Louvers",
            "category": "Passive Design",
            "priority": "Medium",
            "badge_type": "MEDIUM PRIORITY",
            "reason": f"Window-to-wall ratio is {wwr}% without external shading, inducing heavy solar radiation heat spikes.",
            "explanation": "Overhangs, brise-soleil, or dynamic exterior louvers block high summer sun before it enters the envelope, without obstructing views or natural daylight.",
            "expected_impact": f"Reduces peak chiller/AC demand by 15-20% (~{int(shading_savings):,} kWh/yr).",
            "estimated_savings_usd": round(shading_savings * 0.14, 0),
            "estimated_carbon_avoided_tco2e": round((shading_savings * 0.50) / 1000.0, 1),
            "estimated_energy_saved_kwh": shading_savings
        })

    # 5. RAINWATER HARVESTING & WATER SECURITY
    if not has_rwh:
        water_metrics_pot = round(roof_area * 900.0 * 0.85 * 0.90 / 1000.0, 1)
        cost_save_water = round(water_metrics_pot * 2.40, 0)
        recs.append({
            "id": "rec-rainwater-harvesting",
            "title": "Implement Rooftop Rainwater Harvesting & Filtration",
            "category": "Water Management",
            "priority": "High" if water_metrics.get("freshwater_dependency_percentage", 100) > 85 else "Medium",
            "badge_type": "HIGH PRIORITY" if water_metrics.get("freshwater_dependency_percentage", 100) > 85 else "OPPORTUNITY",
            "reason": "100% of water demand currently relies on external municipal grid with zero on-site retention.",
            "explanation": f"A catchment system on the {int(roof_area)} m² roof combined with sediment filtration can supply non-potable domestic or landscaping demands.",
            "expected_impact": f"Captures ~{int(water_metrics_pot):,} m³ (kL) of freshwater per year, saving ${int(cost_save_water):,}/yr.",
            "estimated_savings_usd": cost_save_water,
            "estimated_carbon_avoided_tco2e": 0.2,
            "estimated_energy_saved_kwh": 0.0
        })

    # 6. GREYWATER REUSE & ULTRA-LOW FLOW FIXTURES
    if not water_eff_fixtures or not has_greywater:
        pot_water_reduction = round(water_metrics.get("baseline_water_consumption_m3", 100) * 0.35, 1)
        recs.append({
            "id": "rec-water-fixtures-greywater",
            "title": "Install WaterSense Low-Flow Fixtures & Greywater Diverter",
            "category": "Water Management",
            "priority": "Medium",
            "badge_type": "MEDIUM PRIORITY",
            "reason": "Baseline plumbing fixtures exhaust municipal water without dual-cycle plumbing reuse.",
            "explanation": "Aerated faucets, dual-flush toilets, and showerhead flow restrictors slash volume by 35% with zero user inconvenience.",
            "expected_impact": f"Saves ~{int(pot_water_reduction):,} m³ of treated municipal water annually.",
            "estimated_savings_usd": round(pot_water_reduction * 2.40, 0),
            "estimated_carbon_avoided_tco2e": 0.3,
            "estimated_energy_saved_kwh": 0.0
        })

    # 7. EMBODIED CARBON & STRUCTURAL MATERIAL (High / Medium)
    if "Reinforced Concrete" in struct or "Structural Steel" in struct:
        recs.append({
            "id": "rec-low-carbon-structure",
            "title": "Specify Low-Carbon Concrete (SCMs) or Mass Timber / CLT",
            "category": "Materials & Embodied Carbon",
            "priority": "High" if carbon_metrics.get("embodied_carbon_tco2e", 0) > 30 else "Medium",
            "badge_type": "HIGH PRIORITY" if carbon_metrics.get("embodied_carbon_tco2e", 0) > 30 else "OPPORTUNITY",
            "reason": f"Embodied carbon from structure accounts for {carbon_metrics['breakdown'].get('structural_tco2e', 0)} tCO2e of total footprint.",
            "explanation": "Replacing 40-50% of Portland cement with supplementary cementitious materials (fly ash / slag) or utilizing certified Mass Timber sequesters carbon into the structural frame.",
            "expected_impact": f"Reduces upfront embodied carbon by 35-65% (avoiding up to {round(carbon_metrics.get('embodied_carbon_tco2e', 10) * 0.45, 1)} tCO2e).",
            "estimated_savings_usd": 0.0,
            "estimated_carbon_avoided_tco2e": round(carbon_metrics.get("embodied_carbon_tco2e", 10) * 0.45, 1),
            "estimated_energy_saved_kwh": 0.0
        })

    # 8. HVAC HEAT PUMP CONVERSION
    if "Conventional" in hvac or "Furnace" in hvac:
        hvac_savings_kwh = round(energy_metrics.get("annual_energy_kwh", 10000) * 0.25, 0)
        recs.append({
            "id": "rec-hvac-heat-pump",
            "title": "Transition to High-COP Heat Pump or VRF HVAC System",
            "category": "HVAC & Mechanical",
            "priority": "High",
            "badge_type": "HIGH PRIORITY",
            "reason": f"Current system ({hvac}) exhibits lower seasonal efficiency (COP < 3.0) and high operational draw.",
            "explanation": "Inverter-driven air-source heat pumps or variable refrigerant flow (VRF) units achieve seasonal COPs exceeding 4.2 with zoning controls.",
            "expected_impact": f"Reduces space conditioning electric demand by ~{int(hvac_savings_kwh):,} kWh/yr.",
            "estimated_savings_usd": round(hvac_savings_kwh * 0.14, 0),
            "estimated_carbon_avoided_tco2e": round((hvac_savings_kwh * 0.50) / 1000.0, 1),
            "estimated_energy_saved_kwh": hvac_savings_kwh
        })

    # 9. NATURAL VENTILATION
    if not has_nat_vent:
        recs.append({
            "id": "rec-natural-ventilation",
            "title": "Incorporate Passive Cross-Ventilation & Stack Effect",
            "category": "Passive Design",
            "priority": "Low",
            "badge_type": "OPPORTUNITY",
            "reason": "Building relies entirely on mechanical air cycling during mild climate shoulder seasons.",
            "explanation": "Operable high-low clerestory windows leverage pressure and buoyancy differentials, allowing natural night flushing without active AC.",
            "expected_impact": "Reduces mechanical runtime by 150-300 operating hours annually.",
            "estimated_savings_usd": round(area * 0.80, 0),
            "estimated_carbon_avoided_tco2e": 0.4,
            "estimated_energy_saved_kwh": round(area * 5.0, 0)
        })

    # 10. SMART IOT SUBMETERING & DEMAND-CONTROLLED VENTILATION (General Opportunity)
    recs.append({
        "id": "rec-smart-submetering",
        "title": "Install IoT Energy Submetering & Demand-Controlled Ventilation (DCV)",
        "category": "Energy & Renewables",
        "priority": "Medium",
        "badge_type": "OPPORTUNITY",
        "reason": "Fine-grained circuit-level submetering and CO2 sensor-based ventilation controls eliminate unoccupied conditioning waste.",
        "explanation": "Integrating building automation system (BAS) submeters with modulating fresh air dampers ensures energy is only consumed where occupants are present.",
        "expected_impact": f"Yields an estimated 8-12% baseline energy savings (~{int(energy_metrics.get('annual_energy_kwh', 5000) * 0.08):,} kWh/yr).",
        "estimated_savings_usd": round(energy_metrics.get("annual_energy_kwh", 5000) * 0.08 * 0.14, 0),
        "estimated_carbon_avoided_tco2e": round((energy_metrics.get("annual_energy_kwh", 5000) * 0.08 * 0.50) / 1000.0, 1),
        "estimated_energy_saved_kwh": round(energy_metrics.get("annual_energy_kwh", 5000) * 0.08, 0)
    })

    # 11. FSC CERTIFICATION & CIRCULAR MATERIAL PASSPORTS
    recs.append({
        "id": "rec-material-passports",
        "title": "Implement Digital Material Passports & Environmental Product Declarations (EPDs)",
        "category": "Materials & Embodied Carbon",
        "priority": "Low",
        "badge_type": "OPPORTUNITY",
        "reason": "Documenting circular material passports ensures salvageability and deconstruction value at end of lifecycle.",
        "explanation": "Require Tier-1 material suppliers to provide ISO 14025 verified Type III Environmental Product Declarations to guarantee cradle-to-cradle transparency.",
        "expected_impact": "Maximizes circularity credits and reduces end-of-life landfill demolition burden by up to 40%.",
        "estimated_savings_usd": 0.0,
        "estimated_carbon_avoided_tco2e": 1.2,
        "estimated_energy_saved_kwh": 0.0
    })

    return recs
