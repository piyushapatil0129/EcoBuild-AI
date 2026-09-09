"""
Sustainability Reports API endpoint.
Compiles executive audit reports and generates downloadable PDF reports via ReportLab.
"""
import io
from datetime import datetime
from fastapi import APIRouter, HTTPException, Response
from app.database.connection import get_database
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

router = APIRouter(prefix="/api/reports", tags=["Reports"])

@router.get("/{project_id}")
async def get_project_report(project_id: str):
    db = get_database()
    project = await db["projects"].find_one({"_id": project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")
        
    designs = await db["designs"].find({"project_id": project_id}).to_list()
    designs_with_analyses = []
    for d in designs:
        d_id = str(d["_id"])
        analysis = await db["analyses"].find_one({"design_id": d_id})
        designs_with_analyses.append({
            "id": d_id,
            "design_name": d.get("design_name", "Design"),
            "description": d.get("description", ""),
            "parameters": d.get("parameters", {}),
            "analysis": analysis
        })
        
    primary_design = designs_with_analyses[0] if designs_with_analyses else None
    
    return {
        "project": {
            "id": str(project["_id"]),
            "project_name": project.get("project_name", ""),
            "building_type": project.get("building_type", "Residential"),
            "location": project.get("location", ""),
            "description": project.get("description", ""),
            "createdAt": project.get("createdAt")
        },
        "primary_design": primary_design,
        "all_designs": designs_with_analyses,
        "generatedAt": datetime.utcnow().isoformat()
    }

@router.get("/{project_id}/pdf")
async def download_project_report_pdf(project_id: str):
    db = get_database()
    project = await db["projects"].find_one({"_id": project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")
        
    designs = await db["designs"].find({"project_id": project_id}).to_list()
    primary_design = designs[0] if designs else None
    analysis = None
    if primary_design:
        analysis = await db["analyses"].find_one({"design_id": str(primary_design["_id"])})
        
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )
    
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=22,
        leading=26,
        textColor=colors.HexColor('#064e3b')
    )
    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#047857')
    )
    h2_style = ParagraphStyle(
        'H2',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=colors.HexColor('#065f46')
    )
    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#1f2937')
    )
    disclaimer_style = ParagraphStyle(
        'Disclaimer',
        parent=styles['Italic'],
        fontName='Helvetica-Oblique',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor('#6b7280')
    )
    
    story = []
    
    # Title & Header
    story.append(Paragraph("EcoBuild AI — Sustainable Construction Assessment Report", title_style))
    story.append(Paragraph("Automated Engineering Lifecycle Analysis & Decarbonization Roadmap", subtitle_style))
    story.append(Spacer(1, 15))
    
    # Project Metadata Table
    p_name = project.get("project_name", "Building Project")
    b_type = project.get("building_type", "Residential")
    loc = project.get("location", "Standard Climate")
    score_val = f"{analysis['sustainability_score']} / 100" if analysis else "Pending"
    tier_val = analysis.get("rating_tier", "Evaluation") if analysis else "N/A"
    
    meta_data = [
        [Paragraph("<b>Project Name:</b>", body_style), Paragraph(p_name, body_style), Paragraph("<b>Assessment Date:</b>", body_style), Paragraph(datetime.utcnow().strftime("%Y-%m-%d"), body_style)],
        [Paragraph("<b>Building Typology:</b>", body_style), Paragraph(b_type, body_style), Paragraph("<b>Sustainability Score:</b>", body_style), Paragraph(f"<b>{score_val}</b> ({tier_val})", body_style)],
        [Paragraph("<b>Location / Climate:</b>", body_style), Paragraph(loc, body_style), Paragraph("<b>Design Version:</b>", body_style), Paragraph(primary_design.get("design_name", "Design A") if primary_design else "Default", body_style)]
    ]
    meta_table = Table(meta_data, colWidths=[110, 150, 120, 150])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f0fdf4')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#a7f3d0')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e5e7eb')),
        ('PADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 15))
    
    if analysis:
        # Category Scores Table
        story.append(Paragraph("Category Performance Ratings", h2_style))
        story.append(Spacer(1, 5))
        cat_scores = analysis.get("category_scores", {})
        cat_data = [
            ["Dimension", "Score (0-100)", "Weight", "Weighted Impact"],
            ["Carbon & Decarbonization", f"{cat_scores.get('carbon', 0)} / 100", "30%", f"{round(cat_scores.get('carbon', 0) * 0.30, 1)} pts"],
            ["Energy Efficiency", f"{cat_scores.get('energy', 0)} / 100", "25%", f"{round(cat_scores.get('energy', 0) * 0.25, 1)} pts"],
            ["Water Stewardship", f"{cat_scores.get('water', 0)} / 100", "20%", f"{round(cat_scores.get('water', 0) * 0.20, 1)} pts"],
            ["Circular Materials", f"{cat_scores.get('materials', 0)} / 100", "15%", f"{round(cat_scores.get('materials', 0) * 0.15, 1)} pts"],
            ["Waste & Passive Systems", f"{cat_scores.get('waste', 0)} / 100", "10%", f"{round(cat_scores.get('waste', 0) * 0.10, 1)} pts"],
            ["OVERALL COMPOSITE RATING", f"{analysis.get('sustainability_score', 0)} / 100", "100%", f"{analysis.get('sustainability_score', 0)} pts"]
        ]
        cat_table = Table(cat_data, colWidths=[180, 110, 100, 140])
        cat_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#047857')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('ROWBACKGROUNDS', (0, 1), (-1, -2), [colors.white, colors.HexColor('#f9fafb')]),
            ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor('#d1fae5')),
            ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#d1d5db')),
            ('PADDING', (0, 0), (-1, -1), 5),
        ]))
        story.append(cat_table)
        story.append(Spacer(1, 15))
        
        # Engineering Quantities Summary Table
        story.append(Paragraph("Core Environmental & Lifecycle Metrics", h2_style))
        story.append(Spacer(1, 5))
        e = analysis.get("energy_metrics", {})
        c = analysis.get("carbon_metrics", {})
        w = analysis.get("water_metrics", {})
        cost = analysis.get("cost_metrics", {})
        
        quant_data = [
            ["Metric Parameter", "Estimated Value", "Baseline Benchmark", "Net Reduction / Savings"],
            ["Annual Net Energy Demand", f"{int(e.get('annual_energy_kwh', 0)):,} kWh/yr", f"{int(e.get('baseline_energy_kwh', 0)):,} kWh/yr", f"-{e.get('energy_savings_percentage', 0)}%"],
            ["Energy Use Intensity (EUI)", f"{e.get('energy_use_intensity_eui', 0)} kWh/m²/yr", f"{e.get('baseline_eui', 0)} kWh/m²/yr", f"Optimal envelope"],
            ["Annual Operational Carbon", f"{c.get('annual_operational_carbon_tco2e', 0)} tCO2e/yr", f"{c.get('baseline_annual_operational_tco2e', 0)} tCO2e/yr", f"Avoids {round(c.get('baseline_annual_operational_tco2e', 0) - c.get('annual_operational_carbon_tco2e', 0), 1)} t/yr"],
            ["50-Year Lifecycle Carbon", f"{c.get('lifecycle_50yr_carbon_tco2e', 0)} tCO2e", f"{c.get('baseline_lifecycle_50yr_carbon_tco2e', 0)} tCO2e", f"-{c.get('carbon_reduction_percentage', 0)}% lifetime"],
            ["Potable Water Consumption", f"{w.get('annual_water_consumption_m3', 0)} m³/yr", f"{w.get('baseline_water_consumption_m3', 0)} m³/yr", f"-{w.get('water_savings_percentage', 0)}% municipal draw"],
            ["Annual Utility Operating OpEx", f"${int(cost.get('annual_operating_cost_usd', 0)):,}/yr", f"${int(cost.get('baseline_annual_operating_cost_usd', 0)):,}/yr", f"${int(cost.get('annual_utility_savings_usd', 0)):,}/yr saved"]
        ]
        quant_table = Table(quant_data, colWidths=[170, 110, 120, 130])
        quant_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1f2937')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f9fafb')]),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#d1d5db')),
            ('PADDING', (0, 0), (-1, -1), 5),
        ]))
        story.append(quant_table)
        story.append(Spacer(1, 15))
        
        # Recommendations
        story.append(Paragraph("AI Recommendations & Decarbonization Roadmap", h2_style))
        story.append(Spacer(1, 5))
        recs = analysis.get("recommendations", [])
        for r in recs[:4]: # Top recommendations in PDF summary
            p_text = f"<b>[{r.get('priority', 'Medium').upper()} PRIORITY] {r.get('title', '')}</b> ({r.get('category', '')})<br/>" \
                     f"<i>Reason:</i> {r.get('reason', '')}<br/>" \
                     f"<i>Action:</i> {r.get('explanation', '')}<br/>" \
                     f"<i>Expected Impact:</i> <b>{r.get('expected_impact', '')}</b>"
            story.append(Paragraph(p_text, body_style))
            story.append(Spacer(1, 6))

    story.append(Spacer(1, 10))
    story.append(Paragraph(
        "Disclaimer: EcoBuild AI sustainability ratings and lifecycle calculations are algorithmic estimations "
        "calibrated against ASHRAE 90.1, the Inventory of Carbon & Energy (ICE), and IPCC emission factors. "
        "They are intended for early-stage design optimization and do not replace official LEED, BREEAM, GRIHA, "
        "or licensed professional engineer certification.",
        disclaimer_style
    ))
    
    doc.build(story)
    buffer.seek(0)
    pdf_bytes = buffer.getvalue()
    
    filename = f"EcoBuild_Report_{project_id[:8]}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
