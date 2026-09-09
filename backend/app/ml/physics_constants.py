"""
Physics Constants, Baseline Coefficients, and Emission Factors
for EcoBuild AI Building Assessment & ML Pipeline.
Based on standard engineering benchmarks (ASHRAE 90.1, ICE Database, IPCC, EPA).
"""

# Building Typology Baseline Energy Use Intensity (EUI in kWh/m²/year before efficiency measures)
BASELINE_EUI = {
    "Residential": 135.0,
    "Commercial": 210.0,
    "Educational": 160.0,
    "Hospital": 380.0,
    "Industrial": 240.0,
    "Office": 190.0,
    "Other": 170.0
}

# Regional climate heating & cooling degree day factors (relative severity)
CLIMATE_FACTORS = {
    "temperate": {"hdd": 2200, "cdd": 800, "solar_yield_kwh_kwp": 1350, "annual_rainfall_mm": 950, "grid_carbon_factor": 0.48},
    "tropical": {"hdd": 100, "cdd": 2600, "solar_yield_kwh_kwp": 1600, "annual_rainfall_mm": 1800, "grid_carbon_factor": 0.65},
    "arid": {"hdd": 600, "cdd": 2900, "solar_yield_kwh_kwp": 1900, "annual_rainfall_mm": 250, "grid_carbon_factor": 0.58},
    "cold": {"hdd": 4200, "cdd": 300, "solar_yield_kwh_kwp": 1150, "annual_rainfall_mm": 700, "grid_carbon_factor": 0.42},
    "mediterranean": {"hdd": 1200, "cdd": 1400, "solar_yield_kwh_kwp": 1700, "annual_rainfall_mm": 600, "grid_carbon_factor": 0.38},
    "default": {"hdd": 1800, "cdd": 1200, "solar_yield_kwh_kwp": 1450, "annual_rainfall_mm": 900, "grid_carbon_factor": 0.50}
}

# Location mapping helper
LOCATION_TO_CLIMATE = {
    "new york": "cold",
    "london": "temperate",
    "berlin": "cold",
    "tokyo": "temperate",
    "singapore": "tropical",
    "mumbai": "tropical",
    "delhi": "arid",
    "dubai": "arid",
    "los angeles": "mediterranean",
    "san francisco": "mediterranean",
    "sydney": "mediterranean",
    "toronto": "cold",
    "chicago": "cold",
    "default": "default"
}

# Structural materials: Embodied carbon factor in kgCO2e/m³ and base cost $/m³
STRUCTURAL_MATERIALS = {
    "Reinforced Concrete": {"carbon_per_m3": 380.0, "cost_per_m3": 170.0, "thermal_mass": "high"},
    "Structural Steel": {"carbon_per_m3": 1800.0, "cost_per_m3": 650.0, "thermal_mass": "low"}, # converted to equivalent structural volume
    "Mass Timber / CLT": {"carbon_per_m3": -450.0, "cost_per_m3": 280.0, "thermal_mass": "medium"}, # Net sequestered biogenic carbon
    "Recycled Steel Frame": {"carbon_per_m3": 750.0, "cost_per_m3": 580.0, "thermal_mass": "low"},
    "Low-Carbon Fly Ash Concrete": {"carbon_per_m3": 190.0, "cost_per_m3": 185.0, "thermal_mass": "high"},
    "Load-Bearing Masonry": {"carbon_per_m3": 240.0, "cost_per_m3": 160.0, "thermal_mass": "high"}
}

# Wall Materials: Embodied carbon (kgCO2e/m²) and U-value (W/m²K)
WALL_MATERIALS = {
    "Standard Brick": {"carbon_per_m2": 65.0, "u_value": 1.80, "durability_years": 80},
    "AAC Lightweight Concrete Blocks": {"carbon_per_m2": 32.0, "u_value": 0.70, "durability_years": 70},
    "Hempcrete / Bio-composite": {"carbon_per_m2": -12.0, "u_value": 0.45, "durability_years": 60},
    "Insulated Concrete Forms (ICF)": {"carbon_per_m2": 85.0, "u_value": 0.28, "durability_years": 100},
    "Curtain Glass Wall": {"carbon_per_m2": 110.0, "u_value": 2.20, "durability_years": 40},
    "Compressed Earth Block (CEB)": {"carbon_per_m2": 15.0, "u_value": 1.10, "durability_years": 60}
}

# Flooring materials
FLOORING_MATERIALS = {
    "Ceramic Tiles": {"carbon_per_m2": 22.0, "cost_per_m2": 35.0},
    "Polished Concrete": {"carbon_per_m2": 14.0, "cost_per_m2": 25.0},
    "FSC Hardwood / Bamboo": {"carbon_per_m2": -8.0, "cost_per_m2": 55.0},
    "Recycled Terrazzo": {"carbon_per_m2": 12.0, "cost_per_m2": 45.0},
    "Linoleum / Bio-flooring": {"carbon_per_m2": 5.0, "cost_per_m2": 30.0},
    "Vinyl / Carpet Tile": {"carbon_per_m2": 28.0, "cost_per_m2": 28.0}
}

# Roof Materials
ROOF_MATERIALS = {
    "Asphalt Shingles": {"carbon_per_m2": 24.0, "u_value": 2.10, "albedo": 0.15},
    "Cool Metal Roof (Reflective)": {"carbon_per_m2": 18.0, "u_value": 1.40, "albedo": 0.75},
    "Extensive Green Roof": {"carbon_per_m2": -5.0, "u_value": 0.35, "albedo": 0.30},
    "Clay / Concrete Tile": {"carbon_per_m2": 26.0, "u_value": 1.70, "albedo": 0.35},
    "Solar Integrated Shingles (BIPV)": {"carbon_per_m2": 45.0, "u_value": 0.80, "albedo": 0.20}
}

# Insulation types: R-value per inch, carbon per m² at standard thickness (100mm)
INSULATION_TYPES = {
    "None / Minimal": {"r_per_inch": 0.5, "carbon_per_m2": 0.0, "u_factor": 1.0},
    "Fiberglass Batt": {"r_per_inch": 3.2, "carbon_per_m2": 6.5, "u_factor": 0.45},
    "Mineral Rockwool": {"r_per_inch": 4.0, "carbon_per_m2": 11.0, "u_factor": 0.36},
    "Expanded Polystyrene (EPS)": {"r_per_inch": 3.8, "carbon_per_m2": 14.5, "u_factor": 0.38},
    "Cellulose (Recycled Paper)": {"r_per_inch": 3.6, "carbon_per_m2": 1.8, "u_factor": 0.40},
    "Wood Fiber Insulation": {"r_per_inch": 3.8, "carbon_per_m2": -4.2, "u_factor": 0.38},
    "Aerogel High-Performance": {"r_per_inch": 9.5, "carbon_per_m2": 22.0, "u_factor": 0.18}
}

# Glazing types: U-value (W/m²K), SHGC (Solar Heat Gain Coefficient), and cost factor
GLAZING_TYPES = {
    "Single Glazed Clear": {"u_value": 5.80, "shgc": 0.82, "cost_multiplier": 1.0},
    "Double Glazed Standard": {"u_value": 2.80, "shgc": 0.70, "cost_multiplier": 1.5},
    "Double Glazed Low-E (Argon)": {"u_value": 1.40, "shgc": 0.38, "cost_multiplier": 2.1},
    "Triple Glazed Low-E (Krypton)": {"u_value": 0.80, "shgc": 0.32, "cost_multiplier": 3.2},
    "Electrochromic Smart Glass": {"u_value": 1.20, "shgc": 0.15, "cost_multiplier": 4.5}
}

# Window Frame types
WINDOW_FRAME_TYPES = {
    "Standard Aluminum": {"u_value_penalty": 0.6, "carbon_factor": 1.4},
    "Thermal Break Aluminum": {"u_value_penalty": 0.2, "carbon_factor": 1.2},
    "uPVC / Vinyl": {"u_value_penalty": 0.1, "carbon_factor": 1.0},
    "Wood / Timber Frame": {"u_value_penalty": -0.1, "carbon_factor": 0.6},
    "Fiberglass Composite": {"u_value_penalty": -0.05, "carbon_factor": 0.8}
}

# HVAC Systems: Seasonal Energy Efficiency Ratio / COP factor
HVAC_SYSTEMS = {
    "Conventional Split AC + Gas Furnace": {"cop_cooling": 2.8, "eff_heating": 0.78, "annual_adj": 1.15},
    "High-Efficiency Air-Source Heat Pump": {"cop_cooling": 4.2, "eff_heating": 3.20, "annual_adj": 0.75},
    "Ground-Source Geothermal Heat Pump": {"cop_cooling": 5.5, "eff_heating": 4.50, "annual_adj": 0.55},
    "Variable Refrigerant Flow (VRF)": {"cop_cooling": 4.6, "eff_heating": 3.80, "annual_adj": 0.68},
    "Natural Ventilation Only (No Central AC)": {"cop_cooling": 0.0, "eff_heating": 0.80, "annual_adj": 0.35},
    "District Heating & Cooling": {"cop_cooling": 4.0, "eff_heating": 2.80, "annual_adj": 0.82}
}

# Baseline water consumption in Liters/Person/Day
WATER_BASELINE_PER_CAPITA = {
    "Residential": 140.0,
    "Commercial": 45.0,
    "Educational": 35.0,
    "Hospital": 220.0,
    "Industrial": 60.0,
    "Office": 40.0,
    "Other": 65.0
}

# Utility Costs
ELECTRICITY_COST_PER_KWH = 0.14  # USD
WATER_COST_PER_M3 = 2.40         # USD per m³ (1000 Liters)
GAS_COST_PER_THERM = 1.10

# Base construction cost per m² by building type ($/m²)
BASE_CONSTRUCTION_COST_PER_M2 = {
    "Residential": 1400.0,
    "Commercial": 1850.0,
    "Educational": 1650.0,
    "Hospital": 2800.0,
    "Industrial": 1100.0,
    "Office": 1950.0,
    "Other": 1500.0
}
