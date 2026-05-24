import json
from app.services.openai_client import client
from app.services import rag_service, ml_forecast_service
from app.core.config import settings
from app.models.schemas import CampaignInput, CampaignAnalysis, PersonaReaction, ForecastMetrics

_FORECAST_SYSTEM = (
    "You are a campaign performance forecasting AI.\n"
    "A Random Forest ML model has already computed data-backed CTR and ROAS ranges from 1,800 ad records. "
    "Use those ranges verbatim — do NOT invent different figures.\n"
    "Your job: write engagement_estimate, conversion_trend, confidence_level, roi_direction, and risks "
    "that are consistent with the ML numbers and the campaign context provided.\n"
    "Return a JSON object with:\n"
    "- forecast: {ctr_range (ML range verbatim), engagement_estimate, conversion_trend, "
    "confidence_level (Low/Medium/High), roi_direction (Negative/Neutral/Positive), roas_range (ML range verbatim)}\n"
    "- risks: array of 3-5 short campaign-specific risk strings"
)


async def generate_forecast(
    campaign: CampaignInput,
    analysis: CampaignAnalysis,
    personas: list[PersonaReaction],
) -> tuple[ForecastMetrics, list[str]]:
    persona_summary = "\n".join([
        f"- {p.persona_name} ({p.persona_type}): engagement={p.engagement_likelihood}, "
        f"conversion={p.conversion_likelihood}, trust={p.trust_level}"
        for p in personas
    ])

    ml = ml_forecast_service.predict(
        platform=campaign.platform,
        objective=campaign.objective,
        budget=campaign.budget,
        campaign_score=analysis.overall_score,
    )

    rag_query = f"{campaign.platform} CTR benchmark ROAS conversion rate {campaign.objective}"
    benchmark_context = rag_service.retrieve(rag_query, n_results=2)

    user_prompt = (
        f"Campaign: {campaign.objective} on {campaign.platform} | Budget: {campaign.budget}\n"
        f"Analysis score: {analysis.overall_score}/100\n"
        f"Persona reactions:\n{persona_summary}\n\n"
        f"ML-predicted ranges:\n"
        f"  CTR: {ml.ctr_range_str}  ROAS: {ml.roas_range_str} "
        f"(platform: {ml.platform_used}, tier: {ml.budget_tier})\n"
    )
    if benchmark_context:
        user_prompt += f"\nBenchmark context:\n{benchmark_context}\n"

    response = await client.chat.completions.create(
        model=settings.openai_chat_model,
        messages=[
            {"role": "system", "content": _FORECAST_SYSTEM},
            {"role": "user", "content": user_prompt},
        ],
        response_format={"type": "json_object"},
        max_completion_tokens=500,
    )

    data = json.loads(response.choices[0].message.content)
    forecast = ForecastMetrics(**data["forecast"])
    risks = data.get("risks", [])
    return forecast, risks
