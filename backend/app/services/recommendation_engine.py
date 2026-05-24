import json
from app.services.openai_client import client
from app.services import rag_service
from app.core.config import settings
from app.models.schemas import CampaignInput, CampaignAnalysis, Recommendation

_REC_SYSTEM = (
    "You are a senior marketing strategist AI. "
    "Review the campaign provided and give concrete, specific improvements grounded in the platform best practices supplied. "
    "Return a JSON object with:\n"
    "- recommendations: {improved_cta, stronger_messaging, audience_refinement, platform_strategy, "
    "optimization_tips (array of 3-5 strings)}\n"
    "- optimized_copy: a fully rewritten version of the ad copy that addresses the identified weaknesses"
)


async def generate_recommendations(
    campaign: CampaignInput,
    analysis: CampaignAnalysis,
) -> tuple[Recommendation, str]:
    rag_query = (
        f"{campaign.platform} advertising best practices {campaign.target_audience} "
        f"ad copy CTA creative guidelines"
    )
    platform_context = rag_service.retrieve(rag_query, n_results=2)

    user_prompt = (
        f"Original Ad Copy:\n{campaign.ad_copy}\n\n"
        f"Campaign: {campaign.objective} on {campaign.platform}, targeting {campaign.target_audience}\n"
        f"Analysis: tone={analysis.emotional_tone}, CTA={analysis.cta_strength}, "
        f"clarity={analysis.clarity}, score={analysis.overall_score}/100"
    )
    if platform_context:
        user_prompt += f"\n\nPlatform best practices:\n{platform_context}"

    response = await client.chat.completions.create(
        model=settings.openai_chat_model,
        messages=[
            {"role": "system", "content": _REC_SYSTEM},
            {"role": "user", "content": user_prompt},
        ],
        response_format={"type": "json_object"},
        max_completion_tokens=800,
    )

    data = json.loads(response.choices[0].message.content)
    recommendations = Recommendation(**data["recommendations"])
    optimized_copy = data.get("optimized_copy", "")
    return recommendations, optimized_copy
