"""
Energy Service: loads trained ML energy model and calculates detailed energy analytics.
"""
import os
import joblib
import numpy as np
from typing import Dict, Any
from app.ml.feature_extractor import extract_features, features_to_array, get_climate_info
from app.ml.physics_constants import BASELINE_EUI

# Global cached model
_MODEL = None

def get_model():
    global _MODEL
    if _MODEL is None:
        base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
        model_path = os.path.join(base_dir, "models", "energy_model.pkl")
        if os.path.exists(model_path):
            _MODEL = joblib.load(model_path)
        else:
            raise FileNotFoundError(f"Energy model not found at {model_path}. Please run train_energy_model.py first.")
    return _MODEL

def calculate_energy_metrics(building_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Predicts net annual energy consumption and computes engineering breakdown.
    """
    features = extract_features(building_data)
    X = features_to_array(features)
    
    model = get_model()
    predicted_annual_kwh = float(model.predict(X)[0])
    predicted_annual_kwh = max(100.0, round(predicted_annual_kwh, 1))
    
    area = features["built_up_area"]
    b_type = building_data.get("building_type", "Residential")
    base_eui = BASELINE_EUI.get(b_type, 150.0)
    baseline_annual_kwh = round(area * base_eui * (features["operating_hours"] / 12.0), 1)
    
    # Calculate Solar Generation
    climate = get_climate_info(building_data.get("location", ""))
    solar_kwp = features["solar_capacity_kwp"]
    solar_yield = climate.get("solar_yield_kwh_kwp", 1400.0)
    annual_solar_generation_kwh = round(solar_kwp * solar_yield * 0.82, 1)
    
    gross_annual_kwh = round(predicted_annual_kwh + annual_solar_generation_kwh, 1)
    eui = round(predicted_annual_kwh / max(1.0, area), 1) # kWh/m²/year
    
    # Sub-system energy breakdown estimation
    hvac_factor = features["hvac_efficiency_factor"]
    cooling_ratio = 0.35 * (features["climate_cdd"] / 1500.0) * hvac_factor
    heating_ratio = 0.30 * (features["climate_hdd"] / 2000.0) * hvac_factor
    lighting_ratio = 0.20 * (1.2 - 0.4 * features["led_lighting_ratio"])
    equipment_ratio = 0.25
    
    total_ratio = cooling_ratio + heating_ratio + lighting_ratio + equipment_ratio
    cooling_kwh = round(gross_annual_kwh * (cooling_ratio / total_ratio), 1)
    heating_kwh = round(gross_annual_kwh * (heating_ratio / total_ratio), 1)
    lighting_kwh = round(gross_annual_kwh * (lighting_ratio / total_ratio), 1)
    equipment_kwh = round(gross_annual_kwh * (equipment_ratio / total_ratio), 1)
    
    energy_savings_pct = round(max(0.0, ((baseline_annual_kwh - predicted_annual_kwh) / baseline_annual_kwh) * 100), 1)
    
    return {
        "annual_energy_kwh": predicted_annual_kwh,
        "baseline_energy_kwh": baseline_annual_kwh,
        "gross_energy_kwh": gross_annual_kwh,
        "annual_solar_generation_kwh": annual_solar_generation_kwh,
        "energy_use_intensity_eui": eui,
        "baseline_eui": base_eui,
        "energy_savings_percentage": energy_savings_pct,
        "breakdown": {
            "cooling_kwh": cooling_kwh,
            "heating_kwh": heating_kwh,
            "lighting_kwh": lighting_kwh,
            "equipment_kwh": equipment_kwh,
            "solar_offset_kwh": annual_solar_generation_kwh
        }
    }
