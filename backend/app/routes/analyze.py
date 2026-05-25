from fastapi import APIRouter
from pydantic import BaseModel
from app.services.campaign_analyzer import analyze_campaign
from app.models.schemas import CampaignInput, CampaignAnalysis

router = APIRouter(prefix="/api", tags=["analyze"])


class AnalyzeRequest(BaseModel):
    ad_copy: str
    platform: str
    objective: str


@router.post("/analyze/", response_model=CampaignAnalysis)
async def analyze_ad_copy(req: AnalyzeRequest):
    """Stage 1 only — quick creative analysis without running the full pipeline."""
    campaign = CampaignInput(
        objective=req.objective,
        platform=req.platform,
        target_audience="general",
        budget="0",
        ad_copy=req.ad_copy,
    )
    return await analyze_campaign(campaign)
