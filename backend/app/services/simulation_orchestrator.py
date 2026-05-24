import asyncio
from app.models.schemas import CampaignInput, SimulationResult
from app.services.campaign_analyzer import analyze_campaign
from app.services.persona_generator import generate_persona_reactions
from app.services.forecast_engine import generate_forecast
from app.services.recommendation_engine import generate_recommendations
from app.services.qa_reviewer import run_qa_review


async def run_simulation(campaign: CampaignInput) -> SimulationResult:
    # Stage 1: Analyze campaign
    analysis = await analyze_campaign(campaign)

    # Stage 2 & 3: Generate personas
    personas = await generate_persona_reactions(campaign)

    # Stage 4 + 5 in parallel: forecast and recommendations are independent of each other
    (forecast, risks), (recommendations, optimized_copy) = await asyncio.gather(
        generate_forecast(campaign, analysis, personas),
        generate_recommendations(campaign, analysis),
    )

    # Stage 6: Re-simulate with optimized copy
    # Stage 6a + 6b in parallel: re-analysis and re-personas are independent
    optimized_campaign = CampaignInput(
        objective=campaign.objective,
        platform=campaign.platform,
        target_audience=campaign.target_audience,
        budget=campaign.budget,
        ad_copy=optimized_copy,
        image_path=campaign.image_path,
    )
    optimized_analysis, optimized_personas = await asyncio.gather(
        analyze_campaign(optimized_campaign),
        generate_persona_reactions(optimized_campaign),
    )
    optimized_forecast, _ = await generate_forecast(
        optimized_campaign, optimized_analysis, optimized_personas
    )

    result = SimulationResult(
        campaign_analysis=analysis,
        personas=personas,
        forecast=forecast,
        risks=risks,
        recommendations=recommendations,
        optimized_copy=optimized_copy,
        optimized_forecast=optimized_forecast,
    )

    # Stage 7: QA reviewer — independent second-pass quality check
    result.qa_review = await run_qa_review(campaign, result)

    return result
