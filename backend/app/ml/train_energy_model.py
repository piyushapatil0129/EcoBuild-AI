"""
Synthetic Dataset Generator and ML Energy Model Training Script.
Trains a Scikit-Learn Ensemble Pipeline to predict annual building energy consumption (kWh).
"""
import os
import sys
import numpy as np
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

# Ensure root backend dir is in sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
from app.ml.physics_constants import BASELINE_EUI, CLIMATE_FACTORS
from app.ml.feature_extractor import FEATURE_NAMES, BUILDING_TYPE_MAPPING

def generate_synthetic_building_dataset(n_samples: int = 6000, random_state: int = 42) -> pd.DataFrame:
    """
    Generate synthetic building data grounded in building energy physics.
    Simulates thermal transmission, solar heat gain, HVAC performance, and occupancy loads.
    """
    np.random.seed(random_state)
    
    # 1. Building types & area
    building_types = list(BUILDING_TYPE_MAPPING.keys())
    type_names = np.random.choice(building_types, size=n_samples, p=[0.35, 0.20, 0.12, 0.08, 0.10, 0.10, 0.05])
    type_codes = np.array([BUILDING_TYPE_MAPPING[t] for t in type_names])
    
    # Area based on type
    areas = []
    floors_list = []
    occupants_list = []
    op_hours_list = []
    
    for t in type_names:
        if t == "Residential":
            area = np.random.uniform(70, 550)
            floors = np.random.choice([1, 2, 3, 4], p=[0.3, 0.5, 0.15, 0.05])
            occ = max(1, int(area / np.random.uniform(30, 60)))
            hours = np.random.uniform(10, 24)
        elif t in ["Commercial", "Office"]:
            area = np.random.uniform(400, 15000)
            floors = np.random.randint(2, 25)
            occ = max(10, int(area / np.random.uniform(15, 30)))
            hours = np.random.uniform(9, 16)
        elif t == "Hospital":
            area = np.random.uniform(1200, 25000)
            floors = np.random.randint(3, 15)
            occ = max(30, int(area / np.random.uniform(20, 45)))
            hours = 24.0
        elif t == "Educational":
            area = np.random.uniform(800, 10000)
            floors = np.random.randint(2, 6)
            occ = max(40, int(area / np.random.uniform(8, 18)))
            hours = np.random.uniform(8, 12)
        else: # Industrial & Other
            area = np.random.uniform(500, 12000)
            floors = np.random.randint(1, 4)
            occ = max(5, int(area / np.random.uniform(40, 80)))
            hours = np.random.uniform(8, 18)
            
        areas.append(area)
        floors_list.append(floors)
        occupants_list.append(occ)
        op_hours_list.append(hours)
        
    areas = np.array(areas)
    floors_list = np.array(floors_list)
    occupants_list = np.array(occupants_list)
    op_hours_list = np.array(op_hours_list)
    
    # 2. Climate parameters
    climates = list(CLIMATE_FACTORS.keys())
    sampled_climates = np.random.choice(climates, size=n_samples)
    hdd = np.array([CLIMATE_FACTORS[c]["hdd"] * np.random.uniform(0.9, 1.1) for c in sampled_climates])
    cdd = np.array([CLIMATE_FACTORS[c]["cdd"] * np.random.uniform(0.9, 1.1) for c in sampled_climates])
    solar_yields = np.array([CLIMATE_FACTORS[c]["solar_yield_kwh_kwp"] for c in sampled_climates])
    
    # 3. Envelope properties
    wwr = np.random.uniform(0.12, 0.70, size=n_samples)
    window_u = np.random.uniform(0.8, 5.8, size=n_samples)
    window_shgc = np.random.uniform(0.20, 0.82, size=n_samples)
    wall_u = np.random.uniform(0.18, 1.90, size=n_samples)
    roof_u = np.random.uniform(0.15, 1.80, size=n_samples)
    
    # 4. Systems & efficiency
    hvac_factor = np.random.choice([0.55, 0.68, 0.75, 0.82, 1.0, 1.15], size=n_samples, p=[0.15, 0.2, 0.25, 0.15, 0.15, 0.1])
    led_ratio = np.random.uniform(0.3, 1.0, size=n_samples)
    natural_vent = np.random.choice([0.0, 1.0], size=n_samples, p=[0.6, 0.4])
    external_shading = np.random.choice([0.0, 1.0], size=n_samples, p=[0.65, 0.35])
    recycled_ratio = np.random.uniform(0.05, 0.60, size=n_samples)
    
    # Solar PV capacity based on roof footprint
    roof_area = areas / np.maximum(1, floors_list)
    solar_eligible = np.random.choice([0.0, 1.0], size=n_samples, p=[0.4, 0.6])
    solar_kwp = solar_eligible * np.clip(roof_area * np.random.uniform(0.04, 0.14), 0, 500.0)
    
    # Physics Calculation for Target: Annual Energy Consumption (kWh)
    # Baseline EUI (kWh/m²/yr)
    base_eui = np.array([BASELINE_EUI[t] for t in type_names])
    base_energy = areas * base_eui * (op_hours_list / 14.0)
    
    # Envelope transmission load (Heating and cooling conduction)
    envelope_u_effective = (wall_u * (1.0 - wwr) + window_u * wwr + roof_u * 0.4)
    envelope_factor = envelope_u_effective / 1.5  # normalized
    
    heating_energy = areas * (hdd / 2200.0) * envelope_factor * 28.0 * hvac_factor
    
    # Solar gain cooling load
    shading_factor = np.where(external_shading > 0.5, 0.72, 1.0)
    cooling_energy = areas * (cdd / 1200.0) * (wwr * window_shgc * shading_factor * 1.5 + 0.3) * 35.0 * hvac_factor
    
    # Ventilation bonus
    vent_reduction = np.where(natural_vent > 0.5, 0.88, 1.0)
    cooling_energy = cooling_energy * vent_reduction
    
    # Lighting energy
    lighting_energy = areas * (30.0 - 16.0 * led_ratio) * (op_hours_list / 12.0)
    
    # Equipment & internal occupant load
    plug_loads = occupants_list * 450.0 + areas * 12.0
    
    # Total Gross Energy
    gross_energy = (base_energy * 0.35 + heating_energy + cooling_energy + lighting_energy + plug_loads)
    
    # Solar generation offset (kWh/year)
    solar_generation = solar_kwp * solar_yields * 0.82  # derating factor
    net_annual_energy = np.maximum(100.0, gross_energy - solar_generation * 0.90)
    
    # Add realistic stochastic engineering noise (3-4% std dev)
    noise = np.random.normal(1.0, 0.035, size=n_samples)
    final_annual_energy = np.round(net_annual_energy * noise, 1)
    
    df = pd.DataFrame({
        "built_up_area": areas,
        "num_floors": floors_list,
        "occupants": occupants_list,
        "operating_hours": op_hours_list,
        "building_type_code": type_codes,
        "climate_hdd": hdd,
        "climate_cdd": cdd,
        "window_to_wall_ratio": wwr,
        "window_u_value": window_u,
        "window_shgc": window_shgc,
        "wall_u_value": wall_u,
        "roof_u_value": roof_u,
        "hvac_efficiency_factor": hvac_factor,
        "led_lighting_ratio": led_ratio,
        "solar_capacity_kwp": solar_kwp,
        "natural_ventilation": natural_vent,
        "external_shading": external_shading,
        "recycled_material_ratio": recycled_ratio,
        "annual_energy_kwh": final_annual_energy
    })
    
    return df

def train_and_save_model(model_save_path: str = None) -> Pipeline:
    """Trains regression pipeline and saves joblib artifact."""
    if model_save_path is None:
        base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
        models_dir = os.path.join(base_dir, "models")
        os.makedirs(models_dir, exist_ok=True)
        model_save_path = os.path.join(models_dir, "energy_model.pkl")
        
    print(f"Generating synthetic physics-grounded dataset (6,000 buildings)...")
    df = generate_synthetic_building_dataset(n_samples=6000, random_state=42)
    
    X = df[FEATURE_NAMES]
    y = df["annual_energy_kwh"]
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Training Scikit-learn RandomForestRegressor Pipeline...")
    pipeline = Pipeline([
        ("scaler", StandardScaler()),
        ("regressor", RandomForestRegressor(
            n_estimators=120,
            max_depth=16,
            min_samples_split=4,
            min_samples_leaf=2,
            n_jobs=-1,
            random_state=42
        ))
    ])
    
    pipeline.fit(X_train, y_train)
    
    # Evaluate
    y_pred = pipeline.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    r2 = r2_score(y_test, y_pred)
    
    print(f"\n================ Model Performance ================")
    print(f"R² Score: {r2:.4f} (Target > 0.94)")
    print(f"MAE: {mae:.2f} kWh/year")
    print(f"RMSE: {rmse:.2f} kWh/year")
    print(f"==================================================\n")
    
    # Save model
    joblib.dump(pipeline, model_save_path)
    print(f"Successfully saved trained energy model to:\n{model_save_path}")
    
    # Save a sample dataset CSV for reference / transparency
    sample_csv_path = os.path.join(os.path.dirname(model_save_path), "synthetic_training_sample.csv")
    df.head(200).to_csv(sample_csv_path, index=False)
    print(f"Saved synthetic dataset sample to: {sample_csv_path}")
    
    return pipeline

if __name__ == "__main__":
    train_and_save_model()
