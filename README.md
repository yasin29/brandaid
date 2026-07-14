# Brand-AId

> AI-powered campaign simulation engine — test your ad against a synthetic market before you spend a dollar.

Build by **Yasin Billah**

---

## What It Does

Marketers submit a campaign (copy + image + funnel context) through a 7-step wizard. Brand-AId runs it through a 7-stage AI pipeline and returns a full simulation in under 60 seconds:

| Stage | What it does |
|-------|-------------|
| 1 · Campaign Analyzer | Multimodal LLM scores 6 dimensions (tone, CTA, clarity, trust signals, etc.) — 0–10 each |
| 2 · Audience Researcher | DuckDuckGo MCP runs 3 parallel web searches for real 2024-2025 audience data |
| 3 · Persona Generator | 3 campaign-specific synthetic personas built from live research (not static templates) |
| 4 · Forecast Engine | Random Forest ML (1,800-row Kaggle dataset) anchors CTR + ROAS · RAG retrieves benchmarks |
| 5 · Recommendation Engine | RAG-grounded copy improvements, CTA rewrites, multi-channel platform strategy |
| 6 · Re-Simulation | AI rewrites the copy, reruns Stages 1–4, produces before/after comparison |
| 7 · QA Reviewer | Independent LLM audit with OpenAI function calling — catches math errors and inconsistencies |

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite, TypeScript, TailwindCSS v4, shadcn/ui, Chart.js |
| Backend | FastAPI (async), Python 3.12, Pydantic v2 |
| AI | OpenAI (multimodal chat + embeddings + Responses API) |
| Vector DB | ChromaDB (local persistent, cosine similarity) |
| ML | scikit-learn Random Forest, pandas, joblib |
| MCP (built) | FastMCP server — 3 tools, 5 resources |
| MCP (used) | duckduckgo-mcp-server (PyPI) — web search, no API key |

---

## Project Structure

```
brand-AId/
├── backend/
│   ├── app/
│   │   ├── routes/        # simulate, analyze, benchmarks
│   │   ├── services/      # 7 pipeline stages + orchestrator + RAG + ML
│   │   ├── models/        # Pydantic schemas
│   │   └── core/          # Config (pydantic-settings)
│   ├── data/
│   │   ├── knowledge_base/  # 5 RAG documents (.txt)
│   │   ├── chroma_db/       # ChromaDB vector index (committed)
│   │   └── models/          # Random Forest + encoders (joblib)
│   ├── mcp_server/          # FastMCP Brand-AId server
│   ├── uploads/             # Campaign images
│   └── main.py
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── app/         # Dashboard, NewCampaign, History, Docs
    │   │   ├── LandingPage, LoginPage, PricingPage
    │   │   └── StandaloneDocsPage (public /docs route)
    │   ├── layouts/         # AppLayout (sidebar)
    │   ├── lib/             # api.ts, auth.ts, history.ts
    │   └── types/           # Shared TypeScript types
    └── ...
```

---

## Running Locally

### Prerequisites
- Python 3.12+
- Node.js 22 (`nvm use 22` — Node 18 is incompatible with Vite 9)
- OpenAI API key

### Backend

```bash
cd backend
python3.12 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env               # fill in OPENAI_API_KEY and model names
uvicorn main:app --reload --port 8000
```

The FastAPI server starts at `http://localhost:8000`. On first start it initializes the ChromaDB index from the knowledge base (~5 seconds).

### Frontend

```bash
cd frontend
npm install
npm run dev                        # http://localhost:5173
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in:

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | Your OpenAI API key |
| `OPENAI_CHAT_MODEL` | Chat model (e.g. `gpt-4.1-mini`) |
| `OPENAI_EMBEDDING_MODEL` | Embedding model (`text-embedding-3-small`) |
| `BRAVE_API_KEY` | Optional — enables Brave Search MCP for audience research |

---

## Key Routes

| URL | Description |
|-----|-------------|
| `/` | Landing page |
| `/docs` | **Live documentation page** (public, no login required) |
| `/login` | Demo login |
| `/app/dashboard` | Campaign history dashboard |
| `/app/new` | New campaign wizard (7-step) |
| `/app/history` | All previous simulations |
| `/app/docs` | In-app documentation |

### API Endpoints

| Endpoint | Description |
|----------|-------------|
| `POST /api/simulate/` | Full 7-stage simulation (multipart form) |
| `POST /api/analyze/` | Stage 1 only — quick campaign analysis |
| `POST /api/benchmarks/` | RAG knowledge base query |
| `GET /health` | Health check |

---

## Campaign Input Wizard

The 7-step input wizard branches at Step 2 into 9 contextual purpose sub-forms:

| Goal | Sub-purpose | Key context collected |
|------|-------------|----------------------|
| Awareness | New Brand | Brand personality, core message |
| Awareness | Repositioning | Current/desired perception, reason |
| Awareness | Product Launch | Description, target segment, hook |
| Consideration | Lead Generation | Offer types, post-lead flow, CPL baseline |
| Consideration | Engagement & Education | Education gap, existing content |
| Consideration | Traffic & Intent | Destination URL, on-site action |
| Conversion | Direct Purchase | Product, price, target ROAS/CPA, offers |
| Conversion | Sign-up / Trial / Install | Signup type, payment required, CPI |
| Conversion | Flash Sale | Promo offer, dates, urgency visibility |

---

## MCP Integration

**Built — Brand-AId MCP Server** (`mcp_server/server.py`):
- Framework: FastMCP
- Tools: `simulate_campaign`, `analyze_ad_copy`, `query_benchmarks`
- Resources: `benchmarks://ctr`, `benchmarks://roas`, `audiences://psychology`, `audiences://platforms`, `audiences://creative`
- Registered in `.claude/settings.json` — usable from Claude Code, Claude Desktop, or any MCP client

**Used — DuckDuckGo MCP Server**:
- Package: `duckduckgo-mcp-server` (PyPI)
- 3 parallel searches per simulation for audience research (no API key required)

---

## Project Docs

See the [`docs/`](docs/) folder for full context:

| File | Contents |
|------|----------|
| [architecture.md](docs/architecture.md) | System diagram, API contract, directory map |
| [current_status.md](docs/current_status.md) | What's done, what's not, next steps |
| [decisions.md](docs/decisions.md) | Why things were built the way they were |
| [workflows.md](docs/workflows.md) | How to run locally, env vars, git workflow |
| [backlog.md](docs/backlog.md) | Prioritized remaining work + known bugs |
| [deployment.md](docs/deployment.md) | Deployment guide for demo day |

---

## Credits

**Built by:** Yasin Billah  
**Repository:** [github.com/yasin29/brandaid](https://github.com/yasin29/brandaid)
