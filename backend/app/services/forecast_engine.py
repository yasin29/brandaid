import json
from app.services.openai_client import client
from app.services import rag_service, ml_forecast_service
from app.core.config import settings
from app.models.schemas import CampaignInput, CampaignAnalysis, PersonaReaction, ForecastMetrics


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

    # ML model: data-backed CTR and ROAS ranges
    ml = ml_forecast_service.predict(
        platform=campaign.platform,
        objective=campaign.objective,
        budget=campaign.budget,
        campaign_score=analysis.overall_score,
    )
    ml_section = (
        f"\nML-predicted ranges (Random Forest trained on 1,800 ad records):\n"
        f"  CTR range:  {ml.ctr_range_str}\n"
        f"  ROAS range: {ml.roas_range_str}\n"
        f"  (Platform: {ml.platform_used}, Budget tier: {ml.budget_tier})\n"
    )

    # RAG: industry benchmark context
    rag_query = f"{campaign.platform} CTR benchmark ROAS conversion rate {campaign.objective}"
    benchmark_context = rag_service.retrieve(rag_query, n_results=3)
    rag_section = (
        f"\nIndustry benchmark context:\n{benchmark_context}\n"
        if benchmark_context
        else ""
    )

    prompt = (
        f"You are a campaign performance forecasting AI.\n"
        f"The ML model has already computed data-backed CTR and ROAS ranges — use these as your numbers.\n"
        f"Your job is to write the engagement estimate, conversion trend, confidence level, "
        f"ROI direction, and risks in a way that is consistent with these ML numbers.\n"
        f"Do NOT invent different CTR or ROAS figures — use the ML ranges verbatim in ctr_range.\n\n"
        f"Campaign: {campaign.objective} on {campaign.platform} | Budget: {campaign.budget}\n"
        f"Analysis score: {analysis.overall_score}/100\n"
        f"Persona reactions:\n{persona_summary}\n"
        f"{ml_section}"
        f"{rag_section}\n"
        f"Return a JSON object with:\n"
        f"- forecast: object with ctr_range (use the ML range above verbatim), "
        f"engagement_estimate (string), conversion_trend (string), "
        f"confidence_level (Low/Medium/High), roi_direction (Negative/Neutral/Positive), "
        f"roas_range (use the ML range above verbatim)\n"
        f"- risks: array of 3-5 short risk strings"
    )

    response = await client.chat.completions.create(
        model=settings.openai_chat_model,
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
        max_completion_tokens=600,
    )

    data = json.loads(response.choices[0].message.content)
    forecast = ForecastMetrics(**data["forecast"])
    risks = data.get("risks", [])
    return forecast, risks
