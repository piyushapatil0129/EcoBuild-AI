"""
Sustainability Scoring Engine: Configurable multi-attribute rating system (0-100).
Weights: Carbon (30%), Energy (25%), Water (20%), Materials (15%), Waste/Circularity (10%).
"""
from typing import Dict, Any

DEFAULT_WEIGHTS = {
    "carbon": 0.30,
    "energy": 0.25,
    "water": 0.20,
    "materials": 0.15,
    "waste": 0.10
}

DISCLAIMER = (
    "The EcoBuild AI sustainability rating is an automated engineering assessment (0-100 scale) "
    "calibrated against ASHRAE 90.1, the Inventory of Carbon & Energy (ICE), and life-cycle assessment (LCA) benchmarks. "
    "It is intended to guide early-stage sustainable design decisions and does not replace official third-party "
    "certifications such as LEED, GRIHA, BREEAM, DGNB, or statutory local building permits."
)

def calculate_sustainability_score(
    building_data: Dict[str, Any],
    energy_metrics: Dict[str, Any],
    carbon_metrics: Dict[str, Any],
    water_metrics: Dict[str, Any],
    custom_weights: Dict[str, float] = None
) -> Dict[str, Any]:
    weights = DEFAULT_WEIGHTS.copy()
    if custom_weights:
        weights.update({k: float(v) for k, v in custom_weights.items() if k in weights})
        total_w = sum(weights.values())
        if total_w > 0:
            weights = {k: v / total_w for k, v in weights.items()}

    # 1. Carbon Score (0 - 100)
    # Benchmark: 0% reduction = 40 pts, 30% reduction = 70 pts, 60%+ reduction = 95+ pts
    carbon_red_pct = carbon_metrics.get("carbon_reduction_percentage", 0.0)
    has_solar = energy_metrics.get("annual_solar_generation_kwh", 0) > 0
    solar_bonus = 6.0 if has_solar else 0.0
    carbon_score = min(100.0, max(20.0, 35.0 + (carbon_red_pct * 1.05) + solar_bonus))
    
    # 2. Energy Score (0 - 100)
    # Benchmark: based on energy savings % vs baseline EUI and on-site renewables
    energy_savings_pct = energy_metrics.get("energy_savings_percentage", 0.0)
    led = building_data.get("led_lighting", True)
    hvac = building_data.get("hvac_system", "")
    hvac_bonus = 8.0 if "Heat Pump" in hvac or "VRF" in hvac or "Geothermal" in hvac else 0.0
    shading_bonus = 4.0 if building_data.get("external_shading", False) else 0.0
    energy_score = min(100.0, max(20.0, 30.0 + (energy_savings_pct * 1.1) + hvac_bonus + shading_bonus))
    
    # 3. Water Score (0 - 100)
    # Benchmark: freshwater dependency & alternative water usage
    water_savings_pct = water_metrics.get("water_savings_percentage", 0.0)
    has_rwh = building_data.get("rainwater_harvesting", False)
    has_greywater = building_data.get("greywater_reuse", False)
    rwh_bonus = 10.0 if has_rwh else 0.0
    greywater_bonus = 8.0 if has_greywater else 0.0
    water_score = min(100.0, max(25.0, 35.0 + (water_savings_pct * 0.9) + rwh_bonus + greywater_bonus))
    
    # 4. Materials Score (0 - 100)
    struct = building_data.get("structural_material", "Reinforced Concrete")
    wall = building_data.get("wall_material", "Standard Brick")
    insul = building_data.get("insulation_type", "Fiberglass Batt")
    
    mat_base = 45.0
    if "Mass Timber" in struct:
        mat_base += 32.0
    elif "Low-Carbon" in struct or "Recycled Steel" in struct:
        mat_base += 20.0
    elif "Steel" in struct:
        mat_base += 5.0
        
    if "Hempcrete" in wall or "Compressed Earth" in wall:
        mat_base += 15.0
    elif "AAC" in wall:
        mat_base += 10.0
        
    if "Cellulose" in insul or "Wood Fiber" in insul or "Aerogel" in insul:
        mat_base += 10.0
        
    recycled_pct = float(building_data.get("recycled_material_percentage", 10) or 10)
    mat_score = min(100.0, max(20.0, mat_base + (recycled_pct * 0.35)))
    
    # 5. Waste & Circularity Score (0 - 100)
    circularity_base = 40.0 + (recycled_pct * 0.70)
    if building_data.get("natural_ventilation", False):
        circularity_base += 8.0
    if building_data.get("wastewater_recycling", False):
        circularity_base += 10.0
    waste_score = min(100.0, max(20.0, circularity_base))
    
    # Category Scores (rounded)
    category_scores = {
        "carbon": round(carbon_score, 1),
        "energy": round(energy_score, 1),
        "water": round(water_score, 1),
        "materials": round(mat_score, 1),
        "waste": round(waste_score, 1)
    }
    
    # Overall Weighted Score (0 - 100)
    overall_score = round(
        category_scores["carbon"] * weights["carbon"] +
        category_scores["energy"] * weights["energy"] +
        category_scores["water"] * weights["water"] +
        category_scores["materials"] * weights["materials"] +
        category_scores["waste"] * weights["waste"],
        1
    )
    
    # Rating Tier
    if overall_score >= 85:
        tier = "Platinum / High Performance"
        badge_color = "emerald"
    elif overall_score >= 70:
        tier = "Gold / Advanced Sustainable"
        badge_color = "green"
    elif overall_score >= 55:
        tier = "Silver / Standard Sustainable"
        badge_color = "teal"
    elif overall_score >= 40:
        tier = "Bronze / Compliant Baseline"
        badge_color = "amber"
    else:
        tier = "Sub-optimal / Conventional"
        badge_color = "rose"
        
    return {
        "overall_score": overall_score,
        "rating_tier": tier,
        "badge_color": badge_color,
        "weights": weights,
        "category_scores": category_scores,
        "disclaimer": DISCLAIMER,
        "summary_explanation": (
            f"Building scored {overall_score}/100 ({tier}). Strongest dimension: "
            f"{max(category_scores, key=category_scores.get).capitalize()} ({max(category_scores.values())} pts). "
            f"Primary opportunity for gain: {min(category_scores, key=category_scores.get).capitalize()} ({min(category_scores.values())} pts)."
        )
    }
