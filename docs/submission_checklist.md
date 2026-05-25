# Submission Checklist — Infinity AI Buildfest 2026

**Due:** May 30, 2026, 11:59 PM
**Platform:** CloudCamp submission portal
**Team:** The Unbranded
**Event:** The Infinity AI Buildfest 2026

This doc maps every field in the submission form to what Brand-AId actually has,
so you can copy-paste or adapt the answers directly. Fields marked ✅ are done;
⚠️ means partial; ❌ means skip (not applicable).

---

## BASIC TAB — Required Fields (Blocking Submission)

These must be filled before the Submit button unlocks.

### Project Name
```
Brand-AId
```

### Elevator Pitch
```
Brand-AId simulates how real audiences react to your ad — before you spend a dollar.
```

### Public Summary
```
Brand-AId is an AI-powered campaign simulation engine for marketers. You upload an
ad (copy + image), pick your platform and target audience, and our 7-stage AI
pipeline generates synthetic personas, forecasts CTR and ROAS, critiques weaknesses,
rewrites the copy, and re-simulates — all in under 60 seconds. It's a pre-launch
gut-check that turns guesswork into data.
```

### Domain
Select: **Branding & Marketing / MarTech**

### Challenge
Select whichever matches best (MarTech / AI for Marketing)

### Problem Statement
```
Marketers spend billions on ad campaigns that fail — not because the product is bad,
but because copy, targeting, and creative are never stress-tested before launch.
A/B testing costs real money and takes weeks. Brand-AId solves this by running
AI-driven simulations against synthetic audience personas before a single dollar
is spent.
```

### Solution Description
```
Brand-AId runs submitted campaigns through a 7-stage AI pipeline:
1. Campaign Analyzer — multimodal LLM scores tone, CTA strength, clarity, trust signals
2. Audience Researcher — DuckDuckGo MCP runs 3 parallel web searches for real
   platform demographic and behavioral data
3. Persona Generator — 3 campaign-specific synthetic personas grounded in web research
4. Forecast Engine — ML model (Random Forest, trained on 1,800-row Kaggle ad dataset)
   anchors CTR/ROAS predictions; RAG retrieves 2024-2025 benchmarks from ChromaDB
5. Recommendation Engine — RAG-grounded copy improvements, CTA rewrites, platform strategy
6. Re-Simulation — AI rewrites the copy and runs stages 1–4 again for before/after comparison
7. QA Reviewer — independent LLM audit with OpenAI function calling (math verification tool)
   checks 7 criteria including numeric consistency, persona differentiation, risk specificity

The full pipeline returns in one API call. Results display as a radar chart, ranked
recommendation cards, SVG sparklines, and a dramatic before/after performance comparison.
```

---

## DATA LIFECYCLE & ENGINEERING TAB

### Section 1 — Data Sources

**Check these boxes:**
- [x] User Uploads / Bulk Import — campaign images uploaded via multipart form
- [x] External APIs (paid/free) — OpenAI API (chat + embeddings + Responses API)
- [x] Open Datasets (Kaggle, HF, gov) — "Global Ads Performance (Google, Meta, TikTok)" Kaggle dataset, 1,800 rows, used to train CTR Random Forest model
- [x] Synthetic / AI-generated Data — 3 synthetic personas generated per simulation

**List specific sources text field:**
```
OpenAI API (gpt-5.4-mini, text-embedding-3-small); Kaggle "Global Ads Performance"
dataset (1,800 rows, Google/Meta/TikTok ad metrics); user-submitted ad copy and
images; AI-generated synthetic audience personas; DuckDuckGo web search results
(via MCP server) for real-time platform demographic data.
```

---

### Section 2 — Acquisition Methods

**Check these boxes:**
- [x] MCP Servers for data access — DuckDuckGo MCP server (duckduckgo-mcp-server) for audience research
- [x] AI Extraction (LLM parsing of unstructured) — LLM extracts structured JSON from ad copy + image
- [x] API Pull / SDK Integrations — OpenAI Python SDK (AsyncOpenAI)

**Scrapers / crawlers used:**
```
DuckDuckGo MCP server (duckduckgo-mcp-server, PyPI) — 3 parallel searches per
simulation via Python MCP stdio client. No API key required.
```

**MCP servers for data access:**
```
duckduckgo-mcp-server — web search tool for audience research (platform demographics,
consumer behavior, campaign format performance). Connected via Python mcp library
stdio_client. Brand-AId MCP server (custom FastMCP) also exposes query_benchmarks
tool backed by ChromaDB RAG.
```

---

### Section 3 — Parsing, Formats & Cleaning

**Check:** JSON, Images, CSV, Markdown

**Parsers used:**
```
OpenAI JSON mode (response_format=json_object) for all LLM outputs; Pydantic for
schema validation and parsing; aiofiles for image binary reads; Python csv/pandas
for Kaggle dataset ingestion during model training.
```

**Formatters / converters:**
```
Pydantic → JSON serialization for API responses; ChromaDB document chunking
(500-word chunks, 50-word overlap); markdown plaintext for knowledge base docs.
```

**Data cleaning & enrichment:**
```
Kaggle dataset: platform label normalization, budget tier binning (low/mid/high),
campaign type mapping for sklearn encoding. Knowledge base: manual curation of
2024-2025 benchmark data from WordStream, Triple Whale, First Page Sage, TikTok
for Business, Sprout Social.
```

**Schema validation:**
```
Pydantic v2 models for all request/response shapes (CampaignInput, SimulationResult,
CampaignAnalysis, PersonaReaction, ForecastMetrics, Recommendations, QAReview).
FastAPI validates at the API boundary automatically.
```

---

### Section 4 — Storage Targets

**Check:**
- [x] Vector DB (pgvector, Pinecone, Weaviate) — ChromaDB local persistent store

**Schema design text field:**
```
ChromaDB PersistentClient with cosine similarity HNSW index. 5 knowledge base
documents chunked into ~500-word overlapping segments (~40 total chunks). Collection:
brand_aid_knowledge. Embeddings: text-embedding-3-small. Committed to git for
multi-device sync (demo scope).
```

---

### Section 5 — Visualization

**Check:**
- [x] Chart.js — radar chart for 6 campaign dimension scores

**Visualization details:**
```
Chart.js radar chart (6 axes: emotional tone, CTA strength, audience fit, trust
signals, clarity, emotional appeal — each 0–10). SVG sparklines (custom pathFromValues
helper) for ROI trend. Animated count-up numbers for CTR/ROAS/confidence metrics.
Before/after comparison panel with delta highlighting.
```

---

### Section 6 — Insights — AI, ML & Non-AI

**Check:**
- [x] LLM Inference / RAG over data — core pipeline
- [x] Classical ML (scikit-learn, XGBoost, LightGBM) — Random Forest CTR model
- [x] Forecasting — CTR range, ROAS band, engagement estimate, ROI direction

**AI / ML details:**
```
Random Forest Regressor (sklearn) trained on 1,800-row Kaggle ad dataset. Features:
platform (84% importance), budget_tier, campaign_type. R²=0.49, MAE=0.97%.
ROAS uses precomputed per-platform percentile bands (Q10–Q90) from the same dataset
— regression model had R²≈0, so percentile lookup is more honest. ML predictions
injected into LLM prompt as hard constraints the model must respect verbatim.
```

**Non-AI analytics:**
```
Per-platform ROAS percentile bands (Q10/Q25/Q50/Q75/Q90) computed from Kaggle
dataset using pandas describe(). Campaign quality score (0–100 from analyzer)
selects the percentile band as a lookup table.
```

**How are insights delivered to users:**
```
In-app dashboard: radar chart, 4 metric cards (CTR range, engagement score, ROAS
range, confidence level), ranked recommendation cards, before/after re-simulation
comparison, QA verdict badge with expandable flag list.
```

---

### Section 7 — Pipelines & Orchestration

**Orchestration:**
```
Custom async orchestrator (simulation_orchestrator.py) using Python asyncio.gather()
for parallel stage execution. FastAPI lifespan for RAG initialization on startup.
```

**Scheduling / Triggers:**
```
HTTP-triggered (POST /api/simulate/). No scheduled jobs — simulation runs on demand.
```

---

### Section 8 — Outbound — APIs & Distribution

**Outbound APIs:**
```
FastAPI REST: POST /api/simulate/, POST /api/analyze/, POST /api/benchmarks/,
GET /health. Full OpenAPI docs auto-generated at /docs. JSON responses with
Pydantic-validated schemas.
```

**Embeddings / model serving:**
```
Brand-AId MCP server (custom FastMCP, mcp_server/server.py) exposes the simulation
pipeline as MCP tools — simulate_campaign, analyze_ad_copy, query_benchmarks — and
5 knowledge base resources (benchmarks://ctr, benchmarks://roas,
audiences://psychology, audiences://platforms, audiences://creative). Registered in
.claude/settings.json; any MCP client can consume Brand-AId's AI engine.
```

---

### Section 9 — Open Source Stack

```
FastAPI — async REST API framework, auto OpenAPI docs
React 18 + Vite — frontend SPA
TailwindCSS v4 + shadcn/ui — design system
Chart.js — radar chart visualization
ChromaDB — local vector store for RAG
scikit-learn + pandas + joblib — ML forecast model (Random Forest)
FastMCP — Python framework for building the Brand-AId MCP server
mcp (Python) — MCP client library for connecting to DuckDuckGo MCP server
duckduckgo-mcp-server — free, no-API-key web search via MCP protocol
Pydantic v2 — schema validation throughout
httpx — async HTTP client for MCP server → FastAPI calls
```

---

### Section 10 — Quality, Governance & Observability

**Data quality:**
```
QA Reviewer agent (Stage 7): independent LLM pass auditing 7 criteria —
forecast/persona consistency, risk specificity, recommendation/weakness alignment,
persona differentiation, optimized copy quality, narrative coherence, numeric
consistency. Verdict: Pass / Partial Pass / Needs Improvement with confidence score.
```

**Cost & performance:**
```
asyncio.gather() parallelization cuts wall time ~40% vs sequential. max_completion_tokens
budgets on all LLM calls. RAG n_results trimmed to 2. Stable system prompt constants
enable OpenAI prompt caching.
```

---

## AI DETAIL USAGE TAB (Scored — drives AI Depth Score)

### Prompt Usage
```
Role prompting throughout (marketing strategist, audience researcher, QA reviewer).
Structured JSON output enforced via response_format=json_object on all chat calls.
Stable _SYSTEM_PROMPT constants extracted per service file — enables OpenAI prompt
caching (5-min TTL). Two-pass tool calling in QA reviewer: Pass 1 allows tool_choice="auto"
for calculator; Pass 2 forces JSON output. Prompts include hard numeric constraints
("use these ML-computed values verbatim") to prevent hallucination of CTR/ROAS figures.
```

### Token Optimization
```
asyncio.gather() parallelization: audience research + Stage 1 run simultaneously;
Stages 4+5 run simultaneously; re-sim stages 6a+6b run simultaneously. Stable system
prompts enable OpenAI prompt caching. max_completion_tokens budgets trimmed per stage
(600 for analysis, 800 for personas, etc.). RAG n_results=2 (trimmed from 4) to
reduce context size. JSON response_format eliminates verbose prose in LLM outputs.
```

### LLMs / Models Used

**Check:** ChatGPT (OpenAI)

**How & why:**
```
OpenAI exclusively (model configurable via .env, default gpt-5.4-mini). Used for:
multimodal campaign analysis (image + text), persona generation, audience simulation,
forecast narrative, recommendation writing, copy rewriting, QA review. Also uses
OpenAI Responses API (client.responses.create) with web_search_preview tool as
fallback for audience research. text-embedding-3-small for RAG embeddings.
Chose OpenAI for: multimodal support (GPT-4V for image analysis), Responses API
with built-in web search, reliable JSON mode, and AsyncOpenAI client for FastAPI.
```

### Retrieval & RAG

**Check:**
- [x] Naive RAG (chunk + embed + retrieve)
- [x] Vector Database — ChromaDB
- [x] Contextual RAG — retrieved chunks injected as context per LLM call

**RAG architecture details:**
```
5 knowledge base documents (platform CTR benchmarks, ROAS/conversion rates, audience
psychology profiles, platform best practices, campaign creative guidelines) — sourced
from WordStream, Triple Whale, First Page Sage, TikTok for Business, Sprout Social
(2024-2025 data). Chunked: 500 words, 50-word overlap (~40 chunks total). Embeddings:
text-embedding-3-small via OpenAI. Index: ChromaDB PersistentClient, cosine similarity
HNSW. Retrieval: n=2 chunks per query. Used in: Forecast Engine (CTR/ROAS benchmarks)
and Recommendation Engine (platform best practices).
```

### MCP (Model Context Protocol) Usage

**Check the checkbox: "We built and/or used MCP servers / clients in this build"**

**MCP servers text field:**
```
BUILT — Brand-AId MCP Server (mcp_server/server.py):
  Framework: FastMCP (Python)
  Transport: stdio
  Tools (3): simulate_campaign, analyze_ad_copy, query_benchmarks
  Resources (5): benchmarks://ctr, benchmarks://roas, audiences://psychology,
                 audiences://platforms, audiences://creative
  Registered in .claude/settings.json — usable from Claude Code, Claude Desktop,
  or any MCP client. Tools call the FastAPI backend via httpx.

USED — DuckDuckGo MCP Server (duckduckgo-mcp-server, PyPI):
  Transport: stdio (spawned as subprocess)
  Client: Python mcp library (stdio_client + ClientSession)
  Tool called: search (max_results=5)
  Usage: 3 parallel searches per simulation in audience_researcher.py —
         platform demographics, consumer psychology, campaign format performance.
  No API key required. Falls back to OpenAI web_search_preview if unavailable.
```

### Open Source Tools & Libraries
```
FastAPI — async REST framework; auto OpenAPI docs; dependency injection
React 18 + Vite — SPA frontend; hot reload dev experience
TailwindCSS v4 + shadcn/ui (Radix) — component library; design system
Chart.js — radar chart for dimension scores
ChromaDB — local vector DB; persistent HNSW index; cosine similarity search
scikit-learn — Random Forest Regressor for CTR prediction; label encoders
pandas — Kaggle dataset processing; ROAS percentile band computation
FastMCP — high-level MCP server framework; tool + resource decorators
mcp (Python SDK) — stdio_client for connecting to DuckDuckGo MCP server
duckduckgo-mcp-server — free MCP web search; no API key; used for audience research
httpx — async HTTP client; MCP server → FastAPI communication
Pydantic v2 — full request/response schema validation
joblib — ML model serialization (Random Forest + encoders)
```

### Agent Frameworks & Orchestration
```
Custom 7-stage async orchestrator (simulation_orchestrator.py) using Python asyncio.
No LangGraph/CrewAI — intentional: the pipeline has a fixed DAG, not a dynamic agent
loop. Stage parallelism via asyncio.gather(). Tool calling in QA Reviewer (Stage 7):
OpenAI function calling with verify_campaign_math tool — deterministic Python function
checks ROAS × budget arithmetic and catches ROI direction contradictions. Two-pass
flow: Pass 1 allows tool call, Pass 2 forces JSON review output.
```

### Fine-tuning / Adaptation
```
Not applicable. API-only project (OpenAI). No fine-tuning performed.
```

### Evaluation & Quality Measurement
```
QA Reviewer Agent (Stage 7): independent LLM audit of the full simulation output
against 7 criteria. Uses OpenAI function calling (verify_campaign_math) for
deterministic numeric sanity checks — catches cases where ROI direction contradicts
the ROAS value. Verdict: Pass / Partial Pass / Needs Improvement. Confidence score
0–100. Expandable flag list with severity tags (critical / warning / info).
```

### Guardrails, Safety & Privacy
```
QA Reviewer catches hallucinated or inconsistent numeric outputs (ROAS × budget math,
ROI direction alignment). No PII collection — users submit only ad copy and images.
No user accounts, no stored personal data. Not applicable for GDPR/PII handling at
demo scope.
```

### Frontend AI / Visual App Builders
**Check:** Claude Artifacts (built with Claude Code throughout the project)

```
Entire codebase built with Claude Code (claude-sonnet-4-6). UI components, API
integration, Pydantic schemas, ML training scripts, and MCP server all developed
via Claude Code CLI. ~100% of code AI-assisted.
```

### Workflow Automation
❌ Skip — not applicable. Orchestration is Python asyncio, not n8n/Zapier/Make/Temporal.

### Local / On-device LLMs
❌ Skip — cloud-only (OpenAI API). No local LLM runtime used.

---

## /docs MODULE (Live Documentation Page)

The form has a checkbox: *"Yes — we will run the /docs module prompt and ship a live documentation page"*
This is described as a live pitch deck + technical whiteboard + system dashboard.

**Status:** Planned — to be built after current UI work is complete.
**What it needs:** A `/docs` route in the React frontend showing architecture, pipeline
walkthrough, tech stack, live benchmark data, and MCP integration details.

---

## SUBMISSION DEADLINE REMINDER

**May 30, 2026, 11:59 PM**

Minimum required to unlock Submit button (per the warning at form bottom):
- Project Name ✅ ready
- Elevator Pitch ✅ ready
- Public Summary ✅ ready
- Problem Statement ✅ ready
- Solution Description ✅ ready
- Data & AI Provenance — fill from this doc ✅
- Tooling & IDE — mention Claude Code ✅
