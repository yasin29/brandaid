import json
from app.services.openai_client import client
from app.services import rag_service
from app.core.config import settings
from app.models.schemas import CampaignInput, CampaignAnalysis, Recommendation


async def generate_recommendations(
    campaign: CampaignInput,
    analysis: CampaignAnalysis,
) -> tuple[Recommendation, str]:
    rag_query = (
        f"{campaign.platform} advertising best practices {campaign.target_audience} "
        f"ad copy CTA creative guidelines"
    )
    platform_context = rag_service.retrieve(rag_query, n_results=4)
    rag_section = (
        f"\nPlatform and creative best practices for reference:\n{platform_context}\n"
        if platform_context
        else ""
    )

    prompt = (
        f"You are a senior marketing strategist AI. Review this campaign and provide concrete improvements.\n"
        f"Use the platform best practices below to make specific, grounded recommendations.\n\n"
        f"Original Ad Copy:\n{campaign.ad_copy}\n\n"
        f"Campaign Details: {campaign.objective} on {campaign.platform}, targeting {campaign.target_audience}\n"
        f"Analysis: tone={analysis.emotional_tone}, CTA={analysis.cta_strength}, "
        f"clarity={analysis.clarity}, score={analysis.overall_score}/100\n"
        f"{rag_section}\n"
        f"Return a JSON object with:\n"
        f"- recommendations: object with improved_cta (string), stronger_messaging (string), "
        f"audience_refinement (string), platform_strategy (string), optimization_tips (array of 3-5 strings)\n"
        f"- optimized_copy: a fully rewritten version of the ad copy (string)"
    )

    response = await client.chat.completions.create(
        model=settings.openai_chat_model,
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
        max_completion_tokens=800,
    )

    data = json.loads(response.choices[0].message.content)
    recommendations = Recommendation(**data["recommendations"])
    optimized_copy = data.get("optimized_copy", "")
    return recommendations, optimized_copy
