from pydantic import BaseModel
from typing import Optional


class CampaignInput(BaseModel):
    objective: str
    platform: str
    target_audience: str
    budget: str
    ad_copy: str
    image_path: Optional[str] = None


class PersonaReaction(BaseModel):
    persona_name: str
    persona_type: str
    engagement_likelihood: str
    emotional_reaction: str
    trust_level: str
    conversion_likelihood: str
    objections: list[str]


class ForecastMetrics(BaseModel):
    ctr_range: str
    engagement_estimate: str
    conversion_trend: str
    confidence_level: str
    roi_direction: str


class DimensionScores(BaseModel):
    emotional_tone: int
    cta_strength: int
    audience_fit: int
    trust_signals: int
    clarity: int
    emotional_appeal: int


class CampaignAnalysis(BaseModel):
    emotional_tone: str
    cta_strength: str
    audience_fit: str
    trust_signals: str
    clarity: str
    emotional_appeal: str
    overall_score: int
    dimension_scores: DimensionScores


class Recommendation(BaseModel):
    improved_cta: str
    stronger_messaging: str
    audience_refinement: str
    platform_strategy: str
    optimization_tips: list[str]


class SimulationResult(BaseModel):
    campaign_analysis: CampaignAnalysis
    personas: list[PersonaReaction]
    forecast: ForecastMetrics
    risks: list[str]
    recommendations: Recommendation
    optimized_copy: Optional[str] = None
    optimized_forecast: Optional[ForecastMetrics] = None
