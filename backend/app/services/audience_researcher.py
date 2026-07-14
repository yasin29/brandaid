"""
Audience Researcher

Search path: DuckDuckGo MCP server (duckduckgo-mcp-server, free, no API key)
— runs three targeted searches in parallel via the MCP stdio client.
On failure, degrades to static personas (empty research brief).

Note: the old fallback via OpenAI's proprietary web_search_preview (Responses API)
was removed when the backend moved to Gemini's OpenAI-compatible endpoint,
which doesn't support it.

Output feeds into persona_generator.py to produce campaign-specific personas.
Runs in parallel with Stage 1 (campaign analysis) to hide search latency.
"""

from app.models.schemas import CampaignInput
from app.services.brave_search_mcp import brave_search_multi


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


async def research_audience(campaign: CampaignInput) -> str:
    """
    Research the target audience using DuckDuckGo MCP web search.

    Returns empty string on any failure, which makes persona generation
    fall back to static (non-research-informed) personas.
    """
    try:
        print("[AudienceResearcher] Using DuckDuckGo MCP")
        result = await _research_via_brave(campaign)
        if result:
            return result
        print("[AudienceResearcher] DDG returned empty, using static personas")
        return ""

    except Exception as e:
        print(f"[AudienceResearcher] Research failed, falling back to static personas: {e}")
        return ""
