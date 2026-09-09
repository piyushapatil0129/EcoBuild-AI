"""
Design Comparison API endpoint.
Compares two distinct design versions (Design A vs Design B) across all sustainability dimensions.
"""
from fastapi import APIRouter, HTTPException
from app.database.connection import get_database
from app.models.analysis import CompareRequest, CompareResponse
from app.routes.analyze import analyze_building
from app.models.analysis import AnalyzeRequest

router = APIRouter(prefix="/api", tags=["Comparison"])

@router.post("/compare", response_model=CompareResponse)
async def compare_designs(req: CompareRequest):
    db = get_database()
    designs = db["designs"]
    analyses = db["analyses"]
    
    design_a = await designs.find_one({"_id": req.design_a_id})
    design_b = await designs.find_one({"_id": req.design_b_id})
    
    if not design_a or not design_b:
        raise HTTPException(status_code=404, detail="One or both design versions could not be located.")
        
    analysis_a = await analyses.find_one({"design_id": req.design_a_id})
    if not analysis_a:
        res_a = await analyze_building(AnalyzeRequest(design_id=req.design_a_id))
        analysis_a = await analyses.find_one({"design_id": req.design_a_id})
        
    analysis_b = await analyses.find_one({"design_id": req.design_b_id})
    if not analysis_b:
        res_b = await analyze_building(AnalyzeRequest(design_id=req.design_b_id))
        analysis_b = await analyses.find_one({"design_id": req.design_b_id})

    # Metric comparison table data
    score_a = analysis_a["sustainability_score"]
    score_b = analysis_b["sustainability_score"]
    
    energy_a = analysis_a["energy_metrics"]["annual_energy_kwh"]
    energy_b = analysis_b["energy_metrics"]["annual_energy_kwh"]
    
    carbon_a = analysis_a["carbon_metrics"]["lifecycle_50yr_carbon_tco2e"]
    carbon_b = analysis_b["carbon_metrics"]["lifecycle_50yr_carbon_tco2e"]
    
    water_a = analysis_a["water_metrics"]["annual_water_consumption_m3"]
    water_b = analysis_b["water_metrics"]["annual_water_consumption_m3"]
    
    capex_a = analysis_a["cost_metrics"]["estimated_initial_cost_usd"]
    capex_b = analysis_b["cost_metrics"]["estimated_initial_cost_usd"]
    
    opex_a = analysis_a["cost_metrics"]["annual_operating_cost_usd"]
    opex_b = analysis_b["cost_metrics"]["annual_operating_cost_usd"]

    metrics_comparison = {
        "sustainability_score": {
            "label": "Overall Sustainability Score",
            "unit": "pts",
            "val_a": score_a,
            "val_b": score_b,
            "better": "Design A" if score_a > score_b else ("Design B" if score_b > score_a else "Tie"),
            "delta": round(score_b - score_a, 1),
            "higher_is_better": True
        },
        "annual_energy": {
            "label": "Annual Net Energy Demand",
            "unit": "kWh/yr",
            "val_a": energy_a,
            "val_b": energy_b,
            "better": "Design B" if energy_b < energy_a else ("Design A" if energy_a < energy_b else "Tie"),
            "delta": round(energy_b - energy_a, 0),
            "higher_is_better": False
        },
        "carbon_footprint": {
            "label": "50-Year Lifecycle Carbon",
            "unit": "tCO2e",
            "val_a": carbon_a,
            "val_b": carbon_b,
            "better": "Design B" if carbon_b < carbon_a else ("Design A" if carbon_a < carbon_b else "Tie"),
            "delta": round(carbon_b - carbon_a, 1),
            "higher_is_better": False
        },
        "water_consumption": {
            "label": "Annual Potable Water Consumption",
            "unit": "m³/yr",
            "val_a": water_a,
            "val_b": water_b,
            "better": "Design B" if water_b < water_a else ("Design A" if water_a < water_b else "Tie"),
            "delta": round(water_b - water_a, 1),
            "higher_is_better": False
        },
        "initial_cost": {
            "label": "Estimated Initial Construction Cost (CapEx)",
            "unit": "USD",
            "val_a": capex_a,
            "val_b": capex_b,
            "better": "Design A" if capex_a < capex_b else ("Design B" if capex_b < capex_a else "Tie"),
            "delta": round(capex_b - capex_a, 0),
            "higher_is_better": False
        },
        "annual_operating_cost": {
            "label": "Annual Utility Operating Cost (OpEx)",
            "unit": "USD/yr",
            "val_a": opex_a,
            "val_b": opex_b,
            "better": "Design B" if opex_b < opex_a else ("Design A" if opex_a < opex_b else "Tie"),
            "delta": round(opex_b - opex_a, 2),
            "higher_is_better": False
        }
    }

    # Radar chart category scores
    categories = ["carbon", "energy", "water", "materials", "waste"]
    radar_data = []
    for cat in categories:
        radar_data.append({
            "category": cat.capitalize(),
            "Design_A": analysis_a["category_scores"].get(cat, 50.0),
            "Design_B": analysis_b["category_scores"].get(cat, 50.0)
        })

    # AI Synthesis Narrative
    better_overall = "Design B" if score_b > score_a else ("Design A" if score_a > score_b else "Tie")
    
    if score_b > score_a:
        better_name = design_b.get("design_name", "Design B")
        alt_name = design_a.get("design_name", "Design A")
        diff_score = round(score_b - score_a, 1)
        diff_energy = round(energy_a - energy_b, 0)
        diff_carbon = round(carbon_a - carbon_b, 1)
        diff_opex = round(opex_a - opex_b, 0)
        cost_prem = round(capex_b - capex_a, 0)
        
        summary = (
            f"{better_name} provides superior overall sustainability performance, surpassing {alt_name} "
            f"by +{diff_score} sustainability score points. It slashes annual net energy consumption by {int(diff_energy):,} kWh/yr "
            f"and avoids {diff_carbon} tCO2e in 50-year lifecycle emissions, yielding ${int(diff_opex):,}/yr in utility bill savings. "
        )
        if cost_prem > 0:
            payback = round(cost_prem / max(100.0, diff_opex), 1) if diff_opex > 100 else "N/A"
            summary += f"While {better_name} entails an upfront initial cost premium of ${int(cost_prem):,}, this investment pays back in ~{payback} years through operational efficiencies."
        else:
            summary += f"{better_name} is simultaneously more economical or equal in initial upfront capital expenditure."
    elif score_a > score_b:
        summary = (
            f"{design_a.get('design_name', 'Design A')} achieves higher overall environmental marks (+{round(score_a - score_b, 1)} pts). "
            f"{design_b.get('design_name', 'Design B')} may offer lower upfront initial costs, but results in higher lifetime utility OpEx and carbon intensity."
        )
    else:
        summary = "Both design variations achieve comparable holistic sustainability marks with alternate domain trade-offs."

    return {
        "design_a": {
            "id": req.design_a_id,
            "name": design_a.get("design_name", "Design A"),
            "analysis": analysis_a
        },
        "design_b": {
            "id": req.design_b_id,
            "name": design_b.get("design_name", "Design B"),
            "analysis": analysis_b
        },
        "metrics_comparison": metrics_comparison,
        "radar_chart_data": radar_data,
        "better_overall": better_overall,
        "ai_comparison_summary": summary
    }
