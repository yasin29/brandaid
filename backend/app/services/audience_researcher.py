"""
Audience Researcher

Primary path: DuckDuckGo MCP server (duckduckgo-mcp-server, free, no API key)
— runs three targeted searches in parallel via the MCP stdio client.

Fallback: OpenAI's built-in web_search_preview (Responses API) if DDG MCP fails.

Output feeds into persona_generator.py to produce campaign-specific personas.
Runs in parallel with Stage 1 (campaign analysis) to hide search latency.
"""

from app.services.openai_client import client
from app.core.config import settings
from app.models.schemas import CampaignInput
from app.services.brave_search_mcp import brave_search_multi


def _extract_text(response) -> str:
    """Pull text content out of a Responses API response object."""
    parts = []
    for item in response.output:
        if hasattr(item, "content") and item.content:
            for block in item.content:
                if hasattr(block, "text") and block.text:
                    parts.append(block.text)
    return "\n\n".join(p.strip() for p in parts if p.strip())


async def _research_via_brave(campaign: CampaignInput) -> str:
    """Three parallel Brave Search MCP queries covering demographics, psychology, and performance."""
    queries = [
        f"{campaign.platform} user demographics age groups 2024 2025",
        f"{campaign.target_audience} consumer behavior purchase motivations trust signals",
        f"{campaign.objective} ads {campaign.platform} best performing formats creative strategies",
    ]
    results = await brave_search_multi(queries, count=5)
    combined = "\n\n---\n\n".join(r for r in results if r.strip())
    if combined:
        print(f"[AudienceResearcher] Brave Search MCP returned {len(combined)} chars")
    return combined


async def _research_via_openai(campaign: CampaignInput) -> str:
    """Fallback: single OpenAI Responses API call with built-in web_search_preview."""
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
    response = await client.responses.create(
        model=settings.openai_chat_model,
        tools=[{"type": "web_search_preview"}],
        input=[{"role": "user", "content": prompt}],
    )
    text = _extract_text(response)
    if text:
        print(f"[AudienceResearcher] OpenAI fallback returned {len(text)} chars")
    return text


async def research_audience(campaign: CampaignInput) -> str:
    """
    Research the target audience using web search.

    Uses Brave Search MCP when BRAVE_API_KEY is available; falls back to
    OpenAI web_search_preview otherwise. Returns empty string on any failure.
    """
    try:
        print("[AudienceResearcher] Using DuckDuckGo MCP")
        result = await _research_via_brave(campaign)
        if result:
            return result
        print("[AudienceResearcher] DDG returned empty, falling back to OpenAI")

        return await _research_via_openai(campaign)

    except Exception as e:
        print(f"[AudienceResearcher] Research failed, falling back to static personas: {e}")
        return ""
