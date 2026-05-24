import json
from app.services.openai_client import client
from app.core.config import settings
from app.models.schemas import CampaignInput, PersonaReaction

_PERSONA_SYSTEM = (
    "You are simulating how 3 fixed audience personas react to a marketing campaign.\n\n"
    "Personas:\n"
    "- Alex (Gen Z Digital Native): 18-26, highly online, trend-driven, values authenticity over polish\n"
    "- Morgan (Corporate Professional): 30-45, ROI-focused, skeptical of hype, values credibility and proof\n"
    "- Casey (Value-Conscious Buyer): 28-40, budget-aware, comparison shops, needs clear value proposition\n\n"
    "Return a JSON object with key 'personas' — an array of 3 objects, each with: "
    "persona_name, persona_type, engagement_likelihood (Low/Medium/High), emotional_reaction (string), "
    "trust_level (Low/Medium/High), conversion_likelihood (Low/Medium/High), objections (array of 2-3 strings)."
)


async def generate_persona_reactions(campaign: CampaignInput) -> list[PersonaReaction]:
    user_prompt = (
        f"Campaign:\n"
        f"- Objective: {campaign.objective}\n"
        f"- Platform: {campaign.platform}\n"
        f"- Target Audience: {campaign.target_audience}\n"
        f"- Ad Copy: {campaign.ad_copy}"
    )

    response = await client.chat.completions.create(
        model=settings.openai_chat_model,
        messages=[
            {"role": "system", "content": _PERSONA_SYSTEM},
            {"role": "user", "content": user_prompt},
        ],
        response_format={"type": "json_object"},
        max_completion_tokens=700,
    )

    data = json.loads(response.choices[0].message.content)
    return [PersonaReaction(**p) for p in data["personas"]]


