"""
Analysis, Comparison, and Optimization schemas.
"""
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from app.models.design import BuildingDesignParams

class AnalyzeRequest(BaseModel):
    design_id: Optional[str] = None
    parameters: Optional[BuildingDesignParams] = None
    custom_weights: Optional[Dict[str, float]] = None

class AnalysisResponse(BaseModel):
    id: Optional[str] = None
    design_id: Optional[str] = None
    sustainability_score: float
    rating_tier: str
    badge_color: str
    category_scores: Dict[str, float]
    energy_metrics: Dict[str, Any]
    carbon_metrics: Dict[str, Any]
    water_metrics: Dict[str, Any]
    cost_metrics: Dict[str, Any]
    recommendations: List[Dict[str, Any]]
    assumptions: List[str]
    disclaimer: str
    createdAt: Optional[str] = None

class CompareRequest(BaseModel):
    design_a_id: str
    design_b_id: str

class CompareResponse(BaseModel):
    design_a: Dict[str, Any]
    design_b: Dict[str, Any]
    metrics_comparison: Dict[str, Dict[str, Any]]
    radar_chart_data: List[Dict[str, Any]]
    better_overall: str
    ai_comparison_summary: str

class OptimizeRequest(BaseModel):
    design_id: Optional[str] = None
    parameters: Optional[BuildingDesignParams] = None
    priority: str = Field("Balanced", description="Lowest Cost, Lowest Carbon, Lowest Energy, Lowest Water, Balanced")

class OptimizeResponse(BaseModel):
    priority: str
    tradeoff_explanation: str
    recommended_configuration: Dict[str, Any]
    current_metrics: Dict[str, Any]
    optimized_metrics: Dict[str, Any]
    improvements: Dict[str, Any]
