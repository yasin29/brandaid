"""
Brand-AId MCP Server

Exposes Brand-AId's AI campaign simulation pipeline as MCP tools and resources,
so any MCP client (Claude Code, Claude Desktop, custom agents) can run simulations
directly without touching the REST API.

Requires the FastAPI backend to be running at http://localhost:8000.

Tools:
  simulate_campaign   — run the full 7-stage AI pipeline
  analyze_ad_copy     — Stage 1 only (quick creative analysis)
  query_benchmarks    — query the RAG knowledge base

Resources:
  benchmarks://ctr        — platform CTR benchmarks (2024-2025)
  benchmarks://roas       — ROAS & conversion rate data
  audiences://psychology  — audience psychology profiles
  audiences://platforms   — platform best practices
"""

import os
import json
import httpx
from pathlib import Path
from fastmcp import FastMCP

BACKEND_URL = os.getenv("BRAND_AID_BACKEND_URL", "http://localhost:8000")
KB_DIR = Path(__file__).parent.parent / "backend" / "data" / "knowledge_base"

mcp = FastMCP(
    name="Brand-AId",
    instructions=(
        "Brand-AId is an AI campaign simulation engine. "
        "Use simulate_campaign to forecast performance before spending real money. "
        "Use analyze_ad_copy for quick creative feedback. "
        "Use query_benchmarks to retrieve industry CTR/ROAS data. "
        "The backend must be running at " + BACKEND_URL
    ),
)


# ---------------------------------------------------------------------------
# Tools
# ---------------------------------------------------------------------------


@mcp.tool()
async def simulate_campaign(
    objective: str,
    platform: str,
    target_audience: str,
    budget: str,
    ad_copy: str,
) -> str:
    """
    Run a full Brand-AId campaign simulation (7-stage AI pipeline).

    Stages: campaign analysis → persona generation → audience simulation →
    forecast → recommendations → re-simulation with optimized copy → QA review.

    Returns a JSON string with the complete SimulationResult.

    Args:
        objective: Campaign goal, e.g. 'awareness', 'conversions', 'lead_generation'
        platform: Target platform, e.g. 'instagram', 'facebook', 'tiktok', 'google'
        target_audience: Description of the intended audience, e.g. 'fitness enthusiasts aged 25-35'
        budget: Campaign budget as a string, e.g. '$5000' or '5000'
        ad_copy: The ad text / copy to simulate
    """
    async with httpx.AsyncClient(timeout=180.0) as client:
        resp = await client.post(
            f"{BACKEND_URL}/api/simulate/",
            data={
                "objective": objective,
                "platform": platform,
                "target_audience": target_audience,
                "budget": budget,
                "ad_copy": ad_copy,
            },
        )
        resp.raise_for_status()
        return json.dumps(resp.json(), indent=2)


@mcp.tool()
async def analyze_ad_copy(ad_copy: str, platform: str, objective: str) -> str:
    """
    Quickly analyze ad copy quality using Brand-AId's Stage 1 campaign analyzer.

    Returns scores and descriptions for: emotional tone, CTA strength, audience fit,
    trust signals, clarity, emotional appeal, and an overall score (0-100).

    Args:
        ad_copy: The ad text to analyze
        platform: Target platform, e.g. 'instagram', 'facebook', 'tiktok'
        objective: Campaign goal, e.g. 'awareness', 'conversions'
    """
    async with httpx.AsyncClient(timeout=60.0) as client:
        resp = await client.post(
            f"{BACKEND_URL}/api/analyze/",
            json={"ad_copy": ad_copy, "platform": platform, "objective": objective},
        )
        resp.raise_for_status()
        return json.dumps(resp.json(), indent=2)


@mcp.tool()
async def query_benchmarks(query: str, platform: str = "") -> str:
    """
    Query Brand-AId's RAG knowledge base for marketing benchmarks and best practices.

    The knowledge base contains 2024-2025 data on CTR by platform, ROAS by industry,
    conversion rates, audience psychology profiles, and platform creative guidelines.

    Args:
        query: Natural language query, e.g. 'CTR benchmarks for Instagram ads'
        platform: Optional platform filter, e.g. 'instagram', 'tiktok'
    """
    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(
            f"{BACKEND_URL}/api/benchmarks/",
            json={"query": query, "platform": platform},
        )
        resp.raise_for_status()
        return resp.json()["context"]


# ---------------------------------------------------------------------------
# Resources — knowledge base docs exposed directly (no backend required)
# ---------------------------------------------------------------------------


def _read_kb(filename: str) -> str:
    path = KB_DIR / filename
    if path.exists():
        return path.read_text(encoding="utf-8")
    return f"Knowledge base file not found: {filename}"


@mcp.resource("benchmarks://ctr")
def ctr_benchmarks() -> str:
    """Platform CTR benchmarks by channel (2024-2025 sourced data)."""
    return _read_kb("platform_ctr_benchmarks.txt")


@mcp.resource("benchmarks://roas")
def roas_benchmarks() -> str:
    """ROAS, conversion rates, and CPA benchmarks by industry and platform."""
    return _read_kb("roas_conversion_benchmarks.txt")


@mcp.resource("audiences://psychology")
def audience_psychology() -> str:
    """Gen Z, Millennial, Gen X, and Boomer consumer psychology profiles and trust signals."""
    return _read_kb("audience_psychology.txt")


@mcp.resource("audiences://platforms")
def platform_best_practices() -> str:
    """Creative and targeting best practices per platform (Instagram, TikTok, Meta, Google, etc.)."""
    return _read_kb("platform_best_practices.txt")


@mcp.resource("audiences://creative")
def creative_guidelines() -> str:
    """Ad copy effectiveness, visual signals, emotional tone, and trust integration guidelines."""
    return _read_kb("campaign_creative_guidelines.txt")


if __name__ == "__main__":
    mcp.run()
