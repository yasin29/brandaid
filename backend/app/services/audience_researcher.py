"""
Audience Researcher — uses OpenAI's built-in web_search_preview tool (Responses API).

The model autonomously decides what to search and synthesizes findings into
a structured audience profile. This runs in parallel with Stage 1 (campaign analysis)
so the web search latency is hidden.

Output feeds into persona_generator.py to produce campaign-specific personas
instead of static templates.
"""

from app.services.openai_client import client
from app.core.config import settings
from app.models.schemas import CampaignInput


def _extract_text(response) -> str:
    """Pull text content out of a Responses API response object."""
    parts = []
    for item in response.output:
        # Each output item is either a web_search_call or a message
        if hasattr(item, "content") and item.content:
            for block in item.content:
                if hasattr(block, "text") and block.text:
                    parts.append(block.text)
    return "\n\n".join(p.strip() for p in parts if p.strip())


async def research_audience(campaign: CampaignInput) -> str:
    """
    Use web search to gather real, current data about the campaign's target audience.
    Returns a research summary string (300-500 words), or empty string on failure.
    """
    prompt = (
        f"You are an audience intelligence researcher for a marketing team. "
        f"Use web search to find current (2024-2025) data about the target audience for this campaign.\n\n"
        f"Campaign:\n"
        f"- Platform: {campaign.platform}\n"
        f"- Objective: {campaign.objective}\n"
        f"- Target audience: {campaign.target_audience}\n\n"
        f"Search for and summarize:\n"
        f"1. Who actually uses {campaign.platform} today — age groups, demographics, usage behavior\n"
        f"2. How '{campaign.target_audience}' behaves as consumers — what motivates purchases, "
        f"common objections, trust signals that matter to them\n"
        f"3. What {campaign.objective} campaigns perform best with this audience on {campaign.platform} "
        f"— formats, tones, messaging that resonate\n\n"
        f"Write a concise research brief (3-4 paragraphs). Be specific with data points where found. "
        f"This will be used to generate realistic synthetic audience personas for campaign simulation."
    )

    try:
        response = await client.responses.create(
            model=settings.openai_chat_model,
            tools=[{"type": "web_search_preview"}],
            input=[{"role": "user", "content": prompt}],
        )
        text = _extract_text(response)
        if text:
            print(f"[AudienceResearcher] Research complete ({len(text)} chars)")
        else:
            print("[AudienceResearcher] No text extracted from response")
        return text
    except Exception as e:
        # Graceful fallback — persona generator works without research too
        print(f"[AudienceResearcher] Web search failed, falling back to static personas: {e}")
        return ""
