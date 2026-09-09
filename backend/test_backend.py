"""
Automated Backend Verification Test Script.
Validates ML model inference, database seeding, calculation pipeline, and API endpoints.
"""
import sys
import os
import asyncio
from httpx import AsyncClient, ASGITransport

sys.path.append(os.path.abspath(os.path.dirname(__file__)))
from app.main import app
from app.database.connection import get_database
from app.database.seed_data import seed_database

async def run_tests():
    print("Testing EcoBuild AI Backend Pipeline...")
    db = get_database()
    await seed_database(db)
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Health check
        res = await client.get("/api/health")
        assert res.status_code == 200, f"Health check failed: {res.text}"
        print("[PASS] Health Check Passed:", res.json())
        
        # 2. List Projects (should contain seeded demo projects)
        res = await client.get("/api/projects")
        assert res.status_code == 200, f"List projects failed: {res.text}"
        projects = res.json()
        print(f"[PASS] List Projects Passed: {len(projects)} projects found")
        assert len(projects) >= 3, "Demo projects not seeded properly"
        
        # 3. Analyze raw building parameters
        sample_params = {
            "parameters": {
                "project_name": "Test Villa",
                "building_type": "Residential",
                "location": "London (Temperate)",
                "built_up_area": 250.0,
                "num_floors": 2,
                "occupants": 4,
                "operating_hours": 14.0,
                "structural_material": "Reinforced Concrete",
                "wall_material": "Standard Brick",
                "flooring_material": "Ceramic Tiles",
                "roof_material": "Asphalt Shingles",
                "insulation_type": "Fiberglass Batt",
                "recycled_material_percentage": 15.0,
                "window_type": "uPVC / Vinyl",
                "window_to_wall_ratio": 25.0,
                "glazing_type": "Double Glazed Standard",
                "external_shading": False,
                "natural_ventilation": False,
                "solar_installed": False,
                "solar_capacity": 0.0,
                "hvac_system": "Conventional Split AC + Gas Furnace",
                "led_lighting": True,
                "water_efficient_fixtures": False,
                "rainwater_harvesting": False,
                "greywater_reuse": False
            }
        }
        res = await client.post("/api/analyze", json=sample_params)
        assert res.status_code == 200, f"Analyze failed: {res.text}"
        analysis = res.json()
        print(f"[PASS] Analyze Passed: Sustainability Score = {analysis['sustainability_score']}/100, Tier = {analysis['rating_tier']}")
        print(f"  Annual Energy: {analysis['energy_metrics']['annual_energy_kwh']} kWh/yr")
        print(f"  Lifecycle Carbon: {analysis['carbon_metrics']['lifecycle_50yr_carbon_tco2e']} tCO2e")
        print(f"  Water Consumption: {analysis['water_metrics']['annual_water_consumption_m3']} m³/yr")
        print(f"  AI Recommendations: {len(analysis['recommendations'])} generated")
        
        # 4. Test Comparison
        demo_proj = projects[0]
        proj_detail = (await client.get(f"/api/projects/{demo_proj['id']}")).json()
        if len(proj_detail["designs"]) >= 2:
            design_a_id = proj_detail["designs"][0]["id"]
            design_b_id = proj_detail["designs"][1]["id"]
            comp_res = await client.post("/api/compare", json={"design_a_id": design_a_id, "design_b_id": design_b_id})
            assert comp_res.status_code == 200, f"Compare failed: {comp_res.text}"
            comp_data = comp_res.json()
            print(f"[PASS] Compare Passed: Better = {comp_data['better_overall']}")
            print(f"  AI Summary: {comp_data['ai_comparison_summary'][:120]}...")
            
        # 5. Test Optimization
        opt_res = await client.post("/api/optimize", json={"priority": "Lowest Carbon", "parameters": sample_params["parameters"]})
        assert opt_res.status_code == 200, f"Optimize failed: {opt_res.text}"
        opt_data = opt_res.json()
        print(f"[PASS] Optimize (Lowest Carbon) Passed: Current Score = {opt_data['current_metrics']['score']} -> Optimized = {opt_data['optimized_metrics']['score']}")
        print(f"  Carbon reduction: -{opt_data['improvements']['lifecycle_carbon_avoided_tco2e']} tCO2e")
        
        # 6. Test PDF Report generation
        pdf_res = await client.get(f"/api/reports/{demo_proj['id']}/pdf")
        assert pdf_res.status_code == 200, f"PDF report failed: {pdf_res.text}"
        assert len(pdf_res.content) > 1000, "PDF content too small"
        print(f"[PASS] PDF Report Generation Passed: {len(pdf_res.content)} bytes generated")

    print("\nALL BACKEND API TESTS COMPLETED SUCCESSFULLY!")

if __name__ == "__main__":
    asyncio.run(run_tests())
