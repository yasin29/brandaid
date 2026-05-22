from app.models.schemas import CampaignInput, SimulationResult
from app.services.campaign_analyzer import analyze_campaign
from app.services.persona_generator import generate_persona_reactions
from app.services.forecast_engine import generate_forecast
from app.services.recommendation_engine import generate_recommendations


async def run_simulation(campaign: CampaignInput) -> SimulationResult:
    # Stage 1: Analyze campaign
    analysis = await analyze_campaign(campaign)

    # Stage 2 & 3: Generate personas and simulate reactions (personas already include reactions)
    personas = await generate_persona_reactions(campaign)

    # Stage 4: Forecast performance + extract risks
    forecast, risks = await generate_forecast(campaign, analysis, personas)

    # Stage 5: Recommendations + optimized copy
    recommendations, optimized_copy = await generate_recommendations(campaign, analysis)

    # Stage 6: Re-simulate with optimized copy
    optimized_campaign = CampaignInput(
        objective=campaign.objective,
        platform=campaign.platform,
        target_audience=campaign.target_audience,
        budget=campaign.budget,
        ad_copy=optimized_copy,
        image_path=campaign.image_path,
    )
    optimized_analysis = await analyze_campaign(optimized_campaign)
    optimized_personas = await generate_persona_reactions(optimized_campaign)
    optimized_forecast, _ = await generate_forecast(optimized_campaign, optimized_analysis, optimized_personas)

    return SimulationResult(
        campaign_analysis=analysis,
        personas=personas,
        forecast=forecast,
        risks=risks,
        recommendations=recommendations,
        optimized_copy=optimized_copy,
        optimized_forecast=optimized_forecast,
    )
