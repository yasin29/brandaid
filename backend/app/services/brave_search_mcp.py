"""
Web Search MCP Client (DuckDuckGo)

Connects to duckduckgo-mcp-server (PyPI: duckduckgo-mcp-server) via stdio
and calls its `search` tool — completely free, no API key, no credit card.

Falls back gracefully (returns empty string) if the server fails to start,
so audience_researcher.py can fall through to OpenAI web_search_preview.
"""

import os
import asyncio
import sys
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

# Use the duckduckgo-mcp-server installed in our own venv
_DDG_SERVER = os.path.join(os.path.dirname(sys.executable), "duckduckgo-mcp-server")


async def brave_search(query: str, count: int = 5) -> str:
    """
    Run a single web search via the DuckDuckGo MCP server.
    The `count` parameter maps to `max_results`.
    Returns the formatted result string, or empty string on failure.
    """
    server_params = StdioServerParameters(
        command=_DDG_SERVER,
        args=[],
        env={"PATH": os.environ.get("PATH", "")},
    )

    try:
        async with stdio_client(server_params) as (read, write):
            async with ClientSession(read, write) as session:
                await session.initialize()
                result = await session.call_tool(
                    "search",
                    {"query": query, "max_results": count},
                )
                if result.content:
                    return result.content[0].text or ""
    except Exception as e:
        print(f"[DDGSearchMCP] Search failed for '{query[:60]}': {e}")

    return ""


async def brave_search_multi(queries: list[str], count: int = 5) -> list[str]:
    """Run multiple DuckDuckGo searches in parallel. Returns a list of result strings."""
    return list(await asyncio.gather(*[brave_search(q, count) for q in queries]))
