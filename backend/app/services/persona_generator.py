import json
from app.services.openai_client import client
from app.core.config import settings
from app.models.schemas import CampaignInput, PersonaReaction

_PERSONA_SYSTEM_BASE = (
    "You are a consumer behavior simulation AI. "
    "Generate 3 realistic synthetic audience personas for the given campaign. "
    "Each persona must be distinct in age, mindset, platform behavior, and purchase motivation — "
    "do not make them variations of the same archetype.\n\n"
    "Return a JSON object with key 'personas' — an array of 3 objects, each with:\n"
    "- persona_name (string): a realistic first name\n"
    "- persona_type (string): a short archetype label (e.g. 'Budget-conscious millennial parent')\n"
    "- engagement_likelihood (Low/Medium/High)\n"
    "- emotional_reaction (string): how this persona emotionally responds to the ad\n"
    "- trust_level (Low/Medium/High)\n"
    "- conversion_likelihood (Low/Medium/High)\n"
    "- objections (array of 2-3 strings): specific objections this persona would have"
)

_PERSONA_SYSTEM_WITH_RESEARCH = (
    _PERSONA_SYSTEM_BASE
    + "\n\nIMPORTANT: Ground your personas in the audience research provided. "
    "Use real demographic data, behavioral patterns, and platform-specific insights "
    "from the research to make the personas realistic and specific to this campaign context."
)

_PERSONA_SYSTEM_FALLBACK = (
    _PERSONA_SYSTEM_BASE
    + "\n\nDefault archetypes to use if nothing more specific fits:\n"
    "- A younger, digitally native audience member\n"
    "- A professional or career-focused individual\n"
    "- A value-conscious, research-driven buyer"
)


async def generate_persona_reactions(
    campaign: CampaignInput,
    audience_research: str = "",
) -> list[PersonaReaction]:
    has_research = bool(audience_research and audience_research.strip())
    system_prompt = _PERSONA_SYSTEM_WITH_RESEARCH if has_research else _PERSONA_SYSTEM_FALLBACK

    user_prompt = (
        f"Campaign:\n"
        f"- Objective: {campaign.objective}\n"
        f"- Platform: {campaign.platform}\n"
        f"- Target Audience: {campaign.target_audience}\n"
        f"- Ad Copy: {campaign.ad_copy}"
    )

    if has_research:
        user_prompt += f"\n\nAudience Research (web-sourced, 2024-2025):\n{audience_research}"

    response = await client.chat.completions.create(
        model=settings.openai_chat_model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        response_format={"type": "json_object"},
        max_completion_tokens=700,
    )

    data = json.loads(response.choices[0].message.content)
    return [PersonaReaction(**p) for p in data["personas"]]
