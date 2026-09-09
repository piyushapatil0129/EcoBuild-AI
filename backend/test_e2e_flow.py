"""
End-to-End Simulation of User Actions across EcoBuild AI.
Validates complete user journey through HTTP requests against the live local backend server.
"""
import urllib.request
import json

BASE_URL = "http://127.0.0.1:8000/api"

def make_request(url, method="GET", data=None, token=None):
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    body = json.dumps(data).encode("utf-8") if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    with urllib.request.urlopen(req) as resp:
        return resp.status, json.loads(resp.read().decode("utf-8"))

def run_e2e():
    print("=== STARTING FULL END-TO-END FLOW VALIDATION ===")

    # 1. Register a new user
    import time
    test_email = f"architect_{int(time.time())}@ecobuild.ai"
    status, reg = make_request(f"{BASE_URL}/auth/register", "POST", {
        "name": "Sarah Connor",
        "email": test_email,
        "password": "securepassword123",
        "role": "Sustainability Engineer"
    })
    assert status == 200, "Registration failed"
    token = reg["access_token"]
    print(f"[OK] User Registered: {reg['user']['name']} ({reg['user']['email']})")

    # 2. Verify Profile /auth/me
    status, me = make_request(f"{BASE_URL}/auth/me", "GET", token=token)
    assert status == 200 and me["email"] == test_email
    print(f"[OK] Auth Me Verified: {me['role']}")

    # 3. Create a New Building Project (Step 1 - 6 assessment submission)
    project_payload = {
        "project_name": "Solarium Net-Zero Academy",
        "building_type": "Educational",
        "location": "Denver, CO (Cold Mountain Climate)",
        "description": "High-efficiency educational center with mass timber and solar PV.",
        "initial_parameters": {
            "project_name": "Solarium Net-Zero Academy",
            "building_type": "Educational",
            "location": "Denver, CO (Cold Mountain Climate)",
            "built_up_area": 1400.0,
            "num_floors": 3,
            "occupants": 120,
            "operating_hours": 10.0,
            "building_orientation": "South-Facing",
            "structural_material": "Mass Timber / CLT",
            "wall_material": "AAC Lightweight Concrete Blocks",
            "flooring_material": "Polished Concrete",
            "roof_material": "Cool Metal Roof (Reflective)",
            "insulation_type": "Mineral Rockwool",
            "recycled_material_percentage": 30.0,
            "window_type": "Thermal Break Aluminum",
            "window_to_wall_ratio": 30.0,
            "glazing_type": "Double Glazed Low-E (Argon)",
            "external_shading": True,
            "natural_ventilation": True,
            "electricity_source": "Grid + Rooftop Solar",
            "solar_installed": True,
            "solar_capacity": 35.0,
            "hvac_system": "Ground-Source Geothermal Heat Pump",
            "led_lighting": True,
            "water_source": "Municipal + Reclaimed",
            "rainwater_harvesting": True,
            "water_efficient_fixtures": True,
            "wastewater_recycling": False,
            "greywater_reuse": True
        }
    }
    status, proj = make_request(f"{BASE_URL}/projects", "POST", project_payload, token=token)
    assert status == 200, "Project creation failed"
    proj_id = proj["id"]
    print(f"[OK] Project Created: {proj['project_name']} (ID: {proj_id}) with Score: {proj['latest_score']}/100")

    # 4. Fetch Project Details & Designs
    status, full_proj = make_request(f"{BASE_URL}/projects/{proj_id}", "GET", token=token)
    assert status == 200 and len(full_proj["designs"]) >= 1
    design_a_id = full_proj["designs"][0]["id"]
    print(f"[OK] Project Details retrieved: {len(full_proj['designs'])} design(s)")

    # 5. Inspect Sustainability Analysis for Design A
    status, analysis = make_request(f"{BASE_URL}/analysis/{design_a_id}", "GET", token=token)
    assert status == 200
    print(f"[OK] Analysis Verified:")
    print(f"     - Sustainability Score: {analysis['sustainability_score']}/100 ({analysis['rating_tier']})")
    print(f"     - Net Annual Energy: {analysis['energy_metrics']['annual_energy_kwh']:,} kWh/yr (EUI: {analysis['energy_metrics']['energy_use_intensity_eui']} kWh/m²)")
    print(f"     - Lifecycle Carbon: {analysis['carbon_metrics']['lifecycle_50yr_carbon_tco2e']} tCO2e")
    print(f"     - Potable Water: {analysis['water_metrics']['annual_water_consumption_m3']} m³/yr")
    print(f"     - Initial CapEx: ${analysis['cost_metrics']['estimated_initial_cost_usd']:,}")
    print(f"     - Annual OpEx: ${analysis['cost_metrics']['annual_operating_cost_usd']:,}/yr")

    # 6. Fetch AI Recommendations
    status, recs = make_request(f"{BASE_URL}/recommendations/{design_a_id}", "GET", token=token)
    assert status == 200 and len(recs) > 0
    print(f"[OK] AI Recommendations: {len(recs)} suggestions generated. Top Priority: {recs[0]['title']}")

    # 7. Create Design Version B (Alternative Deep Retrofit / Ultra-Sustainable)
    design_b_payload = {
        "project_id": proj_id,
        "design_name": "Design B (Maximal Decarbonization)",
        "description": "Upgraded with triple glazing, expanded 50 kWp solar PV, and hempcrete wall envelope.",
        "parameters": {
            **project_payload["initial_parameters"],
            "wall_material": "Hempcrete / Bio-composite",
            "glazing_type": "Triple Glazed Low-E (Krypton)",
            "solar_capacity": 50.0,
            "recycled_material_percentage": 45.0
        }
    }
    status, design_b = make_request(f"{BASE_URL}/designs", "POST", design_b_payload, token=token)
    assert status == 200
    design_b_id = design_b["id"]
    print(f"[OK] Design Version B Created: {design_b['design_name']} (ID: {design_b_id})")

    # 8. Compare Design A vs Design B
    status, comp = make_request(f"{BASE_URL}/compare", "POST", {
        "design_a_id": design_a_id,
        "design_b_id": design_b_id
    }, token=token)
    assert status == 200
    print(f"[OK] Design Comparison Completed:")
    print(f"     - Better Overall: {comp['better_overall']}")
    print(f"     - AI Comparative Synthesis: \"{comp['ai_comparison_summary'][:140]}...\"")

    # 9. Run Design Optimization (Lowest Carbon Priority)
    status, opt = make_request(f"{BASE_URL}/optimize", "POST", {
        "design_id": design_a_id,
        "priority": "Lowest Carbon"
    }, token=token)
    assert status == 200
    print(f"[OK] Optimization (Lowest Carbon) Solved:")
    print(f"     - Current Score: {opt['current_metrics']['score']} -> Optimized Score: {opt['optimized_metrics']['score']}")
    print(f"     - 50-yr Carbon Reduction: -{opt['improvements']['lifecycle_carbon_avoided_tco2e']} tCO2e")
    print(f"     - Trade-off Rationale: \"{opt['tradeoff_explanation'][:140]}...\"")

    # 10. Generate PDF Report
    pdf_req = urllib.request.Request(f"{BASE_URL}/reports/{proj_id}/pdf")
    with urllib.request.urlopen(pdf_req) as pdf_resp:
        assert pdf_resp.status == 200
        pdf_bytes = pdf_resp.read()
        assert len(pdf_bytes) > 2000
        print(f"[OK] PDF Audit Report Generated: {len(pdf_bytes)} bytes")

    print("\n>>> ALL 10 END-TO-END STEPS VALIDATED AND FUNCTIONING FLAWLESSLY! <<<")

if __name__ == "__main__":
    run_e2e()
