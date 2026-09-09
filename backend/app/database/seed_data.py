"""
Demo seed data for EcoBuild AI.
Populates 3 representative building archetypes:
1. Conventional Residential Building (Baseline, Score ~46)
2. Sustainable Residential Building (Eco-Haven Residence, Score ~86)
3. Commercial Office Building (Apex Tech Park, Score ~75)
"""
import uuid
from datetime import datetime
from app.services.auth_service import hash_password
from app.services.energy_service import calculate_energy_metrics
from app.services.carbon_service import calculate_carbon_metrics
from app.services.water_service import calculate_water_metrics
from app.services.cost_service import calculate_cost_metrics
from app.services.score_service import calculate_sustainability_score
from app.services.recommendation_service import generate_recommendations

DEMO_USER_ID = "demo-user-001"

async def seed_database(db):
    users_col = db["users"]
    projects_col = db["projects"]
    designs_col = db["designs"]
    analyses_col = db["analyses"]

    # 1. Create or ensure Demo User
    existing_user = await users_col.find_one({"email": "demo@ecobuild.ai"})
    if not existing_user:
        await users_col.insert_one({
            "_id": DEMO_USER_ID,
            "name": "Alex Vance",
            "email": "demo@ecobuild.ai",
            "passwordHash": hash_password("password123"),
            "role": "Lead Sustainability Architect",
            "createdAt": datetime.utcnow().isoformat()
        })

    # Check if demo projects already exist
    count = await projects_col.count_documents({"user_id": DEMO_USER_ID})
    if count >= 3:
        return

    # Clear existing demo projects if any partial
    # -------------------------------------------------------------
    # 1. PROJECT 1: Conventional Residential Building (Baseline)
    # -------------------------------------------------------------
    proj1_id = "proj-demo-conv-01"
    design1_a_id = "design-demo-conv-a"
    
    params1 = {
        "project_name": "Cedar Ridge Suburban Home [DEMO]",
        "building_type": "Residential",
        "location": "Chicago, IL (Cold Climate)",
        "built_up_area": 240.0,
        "num_floors": 2,
        "occupants": 4,
        "operating_hours": 16.0,
        "building_orientation": "East-Facing",
        "structural_material": "Reinforced Concrete",
        "wall_material": "Standard Brick",
        "flooring_material": "Ceramic Tiles",
        "roof_material": "Asphalt Shingles",
        "insulation_type": "Fiberglass Batt",
        "recycled_material_percentage": 5.0,
        "window_type": "Standard Aluminum",
        "window_to_wall_ratio": 30.0,
        "glazing_type": "Single Glazed Clear",
        "external_shading": False,
        "natural_ventilation": False,
        "electricity_source": "Municipal Grid",
        "solar_installed": False,
        "solar_capacity": 0.0,
        "hvac_system": "Conventional Split AC + Gas Furnace",
        "led_lighting": False,
        "other_renewable": "None",
        "water_source": "Municipal Supply",
        "rainwater_harvesting": False,
        "water_efficient_fixtures": False,
        "wastewater_recycling": False,
        "greywater_reuse": False
    }
    
    # Run backend analysis pipeline
    e1 = calculate_energy_metrics(params1)
    c1 = calculate_carbon_metrics(params1, e1)
    w1 = calculate_water_metrics(params1)
    cost1 = calculate_cost_metrics(params1, e1, w1)
    s1 = calculate_sustainability_score(params1, e1, c1, w1)
    recs1 = generate_recommendations(params1, e1, c1, w1, s1)
    
    analysis1_id = "analysis-demo-conv-1"
    await analyses_col.insert_one({
        "_id": analysis1_id,
        "design_id": design1_a_id,
        "sustainability_score": s1["overall_score"],
        "rating_tier": s1["rating_tier"],
        "badge_color": s1["badge_color"],
        "category_scores": s1["category_scores"],
        "energy_metrics": e1,
        "carbon_metrics": c1,
        "water_metrics": w1,
        "cost_metrics": cost1,
        "recommendations": recs1,
        "assumptions": [
            "ASHRAE 90.1 baseline building envelope U-factors",
            "Regional electricity grid emission factor: 0.50 kgCO2e/kWh",
            "ICE database v3.0 cradle-to-gate embodied carbon factors"
        ],
        "disclaimer": s1["disclaimer"],
        "createdAt": datetime.utcnow().isoformat()
    })
    
    await designs_col.insert_one({
        "_id": design1_a_id,
        "project_id": proj1_id,
        "design_name": "Design A (Standard Baseline)",
        "description": "Standard suburban residential specification with conventional code envelope.",
        "parameters": params1,
        "analysis_id": analysis1_id,
        "createdAt": datetime.utcnow().isoformat()
    })

    # Add Design B for comparison demo:
    design1_b_id = "design-demo-conv-b"
    params1_b = params1.copy()
    params1_b["design_name"] = "Design B (Retrofit Sustainable)"
    params1_b["glazing_type"] = "Double Glazed Low-E (Argon)"
    params1_b["insulation_type"] = "Mineral Rockwool"
    params1_b["solar_capacity"] = 6.5
    params1_b["solar_installed"] = True
    params1_b["water_efficient_fixtures"] = True
    params1_b["rainwater_harvesting"] = True
    params1_b["external_shading"] = True
    params1_b["hvac_system"] = "High-Efficiency Air-Source Heat Pump"
    
    e1_b = calculate_energy_metrics(params1_b)
    c1_b = calculate_carbon_metrics(params1_b, e1_b)
    w1_b = calculate_water_metrics(params1_b)
    cost1_b = calculate_cost_metrics(params1_b, e1_b, w1_b)
    s1_b = calculate_sustainability_score(params1_b, e1_b, c1_b, w1_b)
    recs1_b = generate_recommendations(params1_b, e1_b, c1_b, w1_b, s1_b)
    
    analysis1_b_id = "analysis-demo-conv-1-b"
    await analyses_col.insert_one({
        "_id": analysis1_b_id,
        "design_id": design1_b_id,
        "sustainability_score": s1_b["overall_score"],
        "rating_tier": s1_b["rating_tier"],
        "badge_color": s1_b["badge_color"],
        "category_scores": s1_b["category_scores"],
        "energy_metrics": e1_b,
        "carbon_metrics": c1_b,
        "water_metrics": w1_b,
        "cost_metrics": cost1_b,
        "recommendations": recs1_b,
        "assumptions": ["Upgraded high-efficiency thermal envelope", "On-site 6.5 kWp solar array"],
        "disclaimer": s1_b["disclaimer"],
        "createdAt": datetime.utcnow().isoformat()
    })
    
    await designs_col.insert_one({
        "_id": design1_b_id,
        "project_id": proj1_id,
        "design_name": "Design B (Retrofit Sustainable)",
        "description": "High-efficiency retrofit with Low-E argon glazing, rockwool, and 6.5 kWp solar.",
        "parameters": params1_b,
        "analysis_id": analysis1_b_id,
        "createdAt": datetime.utcnow().isoformat()
    })
    
    await projects_col.insert_one({
        "_id": proj1_id,
        "user_id": DEMO_USER_ID,
        "project_name": "Cedar Ridge Suburban Home [DEMO]",
        "building_type": "Residential",
        "location": "Chicago, IL (Cold Climate)",
        "description": "Comparative evaluation of a conventional Midwest family residence vs high-performance deep retrofit.",
        "latest_score": s1["overall_score"],
        "latest_rating_tier": s1["rating_tier"],
        "design_count": 2,
        "createdAt": datetime.utcnow().isoformat()
    })

    # -------------------------------------------------------------
    # 2. PROJECT 2: Sustainable Residential Building (Eco-Haven)
    # -------------------------------------------------------------
    proj2_id = "proj-demo-sust-02"
    design2_a_id = "design-demo-sust-a"
    
    params2 = {
        "project_name": "Eco-Haven Mass Timber Residence [DEMO]",
        "building_type": "Residential",
        "location": "Seattle, WA (Temperate Marine)",
        "built_up_area": 320.0,
        "num_floors": 2,
        "occupants": 5,
        "operating_hours": 14.0,
        "building_orientation": "South-Facing",
        "structural_material": "Mass Timber / CLT",
        "wall_material": "Hempcrete / Bio-composite",
        "flooring_material": "FSC Hardwood / Bamboo",
        "roof_material": "Extensive Green Roof",
        "insulation_type": "Wood Fiber Insulation",
        "recycled_material_percentage": 42.0,
        "window_type": "Wood / Timber Frame",
        "window_to_wall_ratio": 22.0,
        "glazing_type": "Triple Glazed Low-E (Krypton)",
        "external_shading": True,
        "natural_ventilation": True,
        "electricity_source": "Solar + Grid Hybrid",
        "solar_installed": True,
        "solar_capacity": 14.0,
        "hvac_system": "Ground-Source Geothermal Heat Pump",
        "led_lighting": True,
        "other_renewable": "Geothermal Loop",
        "water_source": "Rainwater + Municipal Backup",
        "rainwater_harvesting": True,
        "water_efficient_fixtures": True,
        "wastewater_recycling": True,
        "greywater_reuse": True
    }
    
    e2 = calculate_energy_metrics(params2)
    c2 = calculate_carbon_metrics(params2, e2)
    w2 = calculate_water_metrics(params2)
    cost2 = calculate_cost_metrics(params2, e2, w2)
    s2 = calculate_sustainability_score(params2, e2, c2, w2)
    recs2 = generate_recommendations(params2, e2, c2, w2, s2)
    
    analysis2_id = "analysis-demo-sust-2"
    await analyses_col.insert_one({
        "_id": analysis2_id,
        "design_id": design2_a_id,
        "sustainability_score": s2["overall_score"],
        "rating_tier": s2["rating_tier"],
        "badge_color": s2["badge_color"],
        "category_scores": s2["category_scores"],
        "energy_metrics": e2,
        "carbon_metrics": c2,
        "water_metrics": w2,
        "cost_metrics": cost2,
        "recommendations": recs2,
        "assumptions": [
            "Biogenic carbon sequestered in CLT structural framing",
            "Geothermal ground-loop COP = 4.8",
            "Rainwater cistern collection efficiency = 85%"
        ],
        "disclaimer": s2["disclaimer"],
        "createdAt": datetime.utcnow().isoformat()
    })
    
    await designs_col.insert_one({
        "_id": design2_a_id,
        "project_id": proj2_id,
        "design_name": "Design A (Ultra-Low Carbon CLT)",
        "description": "State-of-the-art regenerative mass timber home with circular bio-materials.",
        "parameters": params2,
        "analysis_id": analysis2_id,
        "createdAt": datetime.utcnow().isoformat()
    })
    
    await projects_col.insert_one({
        "_id": proj2_id,
        "user_id": DEMO_USER_ID,
        "project_name": "Eco-Haven Mass Timber Residence [DEMO]",
        "building_type": "Residential",
        "location": "Seattle, WA (Temperate Marine)",
        "description": "Zero-carbon residential archetype designed with cross-laminated timber and geothermal heating.",
        "latest_score": s2["overall_score"],
        "latest_rating_tier": s2["rating_tier"],
        "design_count": 1,
        "createdAt": datetime.utcnow().isoformat()
    })

    # -------------------------------------------------------------
    # 3. PROJECT 3: Commercial Office Building (Apex Tech Park)
    # -------------------------------------------------------------
    proj3_id = "proj-demo-comm-03"
    design3_a_id = "design-demo-comm-a"
    
    params3 = {
        "project_name": "Apex Tech Park Tower [DEMO]",
        "building_type": "Office",
        "location": "Austin, TX (Hot & Humid)",
        "built_up_area": 4800.0,
        "num_floors": 6,
        "occupants": 240,
        "operating_hours": 12.0,
        "building_orientation": "South-Facing",
        "structural_material": "Low-Carbon Fly Ash Concrete",
        "wall_material": "AAC Lightweight Concrete Blocks",
        "flooring_material": "Recycled Terrazzo",
        "roof_material": "Cool Metal Roof (Reflective)",
        "insulation_type": "Mineral Rockwool",
        "recycled_material_percentage": 30.0,
        "window_type": "Thermal Break Aluminum",
        "window_to_wall_ratio": 35.0,
        "glazing_type": "Double Glazed Low-E (Argon)",
        "external_shading": True,
        "natural_ventilation": True,
        "electricity_source": "Grid + Rooftop Solar",
        "solar_installed": True,
        "solar_capacity": 65.0,
        "hvac_system": "Variable Refrigerant Flow (VRF)",
        "led_lighting": True,
        "other_renewable": "None",
        "water_source": "Municipal + Reclaimed",
        "rainwater_harvesting": True,
        "water_efficient_fixtures": True,
        "wastewater_recycling": False,
        "greywater_reuse": True
    }
    
    e3 = calculate_energy_metrics(params3)
    c3 = calculate_carbon_metrics(params3, e3)
    w3 = calculate_water_metrics(params3)
    cost3 = calculate_cost_metrics(params3, e3, w3)
    s3 = calculate_sustainability_score(params3, e3, c3, w3)
    recs3 = generate_recommendations(params3, e3, c3, w3, s3)
    
    analysis3_id = "analysis-demo-comm-3"
    await analyses_col.insert_one({
        "_id": analysis3_id,
        "design_id": design3_a_id,
        "sustainability_score": s3["overall_score"],
        "rating_tier": s3["rating_tier"],
        "badge_color": s3["badge_color"],
        "category_scores": s3["category_scores"],
        "energy_metrics": e3,
        "carbon_metrics": c3,
        "water_metrics": w3,
        "cost_metrics": cost3,
        "recommendations": recs3,
        "assumptions": [
            "Commercial ASHRAE 90.1-2019 baseline model",
            "Variable Refrigerant Flow (VRF) with heat recovery COP = 4.4",
            "Rainwater and dual plumbing greywater offset cooling tower makeup"
        ],
        "disclaimer": s3["disclaimer"],
        "createdAt": datetime.utcnow().isoformat()
    })
    
    await designs_col.insert_one({
        "_id": design3_a_id,
        "project_id": proj3_id,
        "design_name": "Design A (VRF & Solar Shaded)",
        "description": "High-density commercial office design with automated solar shading and 65 kWp solar array.",
        "parameters": params3,
        "analysis_id": analysis3_id,
        "createdAt": datetime.utcnow().isoformat()
    })
    
    await projects_col.insert_one({
        "_id": proj3_id,
        "user_id": DEMO_USER_ID,
        "project_name": "Apex Tech Park Tower [DEMO]",
        "building_type": "Office",
        "location": "Austin, TX (Hot & Humid)",
        "description": "Commercial multi-story office building demonstrating high efficiency VRF, smart shading, and greywater recycling.",
        "latest_score": s3["overall_score"],
        "latest_rating_tier": s3["rating_tier"],
        "design_count": 1,
        "createdAt": datetime.utcnow().isoformat()
    })
