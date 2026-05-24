import json
from app.services.openai_client import client
from app.services import rag_service
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

    rag_query = f"{campaign.platform} CTR benchmark ROAS conversion rate {campaign.objective}"
    benchmark_context = rag_service.retrieve(rag_query, n_results=4)
    rag_section = (
        f"\nIndustry benchmark data for reference:\n{benchmark_context}\n"
        if benchmark_context
        else ""
    )

    prompt = (
        f"You are a campaign performance forecasting AI. Based on the campaign, simulation data, "
        f"and industry benchmarks below, generate directional performance forecasts.\n"
        f"Use the benchmark data to ground your CTR range and ROAS estimates in real industry figures.\n"
        f"These are simulated estimates, not guarantees.\n\n"
        f"Campaign: {campaign.objective} on {campaign.platform} | Budget: {campaign.budget}\n"
        f"Analysis score: {analysis.overall_score}/100\n"
        f"Persona reactions:\n{persona_summary}\n"
        f"{rag_section}\n"
        f"Return a JSON object with:\n"
        f"- forecast: object with ctr_range (e.g. '1.2%–2.8%'), engagement_estimate (string), "
        f"conversion_trend (string), confidence_level (Low/Medium/High), roi_direction (Negative/Neutral/Positive)\n"
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
