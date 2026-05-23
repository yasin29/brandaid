import json
from app.services.openai_client import client
from app.core.config import settings
from app.models.schemas import CampaignInput, PersonaReaction

PERSONA_TEMPLATES = [
    {"name": "Alex", "type": "Gen Z Digital Native", "description": "18-26, highly online, trend-driven, values authenticity over polish"},
    {"name": "Morgan", "type": "Corporate Professional", "description": "30-45, ROI-focused, skeptical of hype, values credibility and proof"},
    {"name": "Casey", "type": "Value-Conscious Buyer", "description": "28-40, budget-aware, comparison shops, needs clear value proposition"},
]


async def generate_persona_reactions(campaign: CampaignInput) -> list[PersonaReaction]:
    prompt = (
        f"You are simulating how 3 audience personas react to a marketing campaign.\n\n"
        f"Campaign:\n"
        f"- Objective: {campaign.objective}\n"
        f"- Platform: {campaign.platform}\n"
        f"- Target Audience: {campaign.target_audience}\n"
        f"- Ad Copy: {campaign.ad_copy}\n\n"
        f"Personas:\n"
        + "\n".join([f"- {p['name']} ({p['type']}): {p['description']}" for p in PERSONA_TEMPLATES])
        + "\n\nReturn a JSON object with key 'personas' — an array of 3 objects, each with: "
        f"persona_name, persona_type, engagement_likelihood (Low/Medium/High), emotional_reaction (string), "
        f"trust_level (Low/Medium/High), conversion_likelihood (Low/Medium/High), objections (array of strings)."
    )

    response = await client.chat.completions.create(
        model=settings.openai_chat_model,
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
        max_completion_tokens=1000,
    )

    data = json.loads(response.choices[0].message.content)
    return [PersonaReaction(**p) for p in data["personas"]]
