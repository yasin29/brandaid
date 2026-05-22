# Brand-AId

> AI-powered campaign simulation engine — test your campaign against a synthetic market before launch.

Built for **Infinity AI Buildfest 2026** · Branding & Marketing / MarTech track.

---

## What It Does

Marketers input a campaign (copy, image, objective, platform, audience, budget). The AI runs it through a 6-stage simulation pipeline:

1. **Campaign Analysis** — tone, CTA strength, clarity, trust signals
2. **Persona Generation** — 3 synthetic audience personas
3. **Audience Simulation** — each persona reacts with engagement, trust, objections
4. **Forecast Engine** — predicted CTR range, ROI direction, confidence level
5. **Recommendation Engine** — improved copy and strategy suggestions
6. **Re-Simulation** — AI rewrites the campaign and reruns the simulation for comparison

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite, TypeScript, TailwindCSS v4, shadcn/ui |
| Backend | FastAPI, Python 3.12 |
| AI | OpenAI (multimodal LLM + embeddings) |
| Vector DB | ChromaDB (RAG layer) |

---

## Running Locally

### Prerequisites
- Python 3.12+
- Node.js 20+ (22 recommended)
- OpenAI API key

### Setup

```bash
# Clone
git clone https://github.com/alviriseup/brand-AId.git
cd brand-AId

# Environment
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY

# Backend
cd backend
python3.12 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`

---

## Project Docs

See the [`docs/`](docs/) folder for full context:
- [Architecture](docs/architecture.md)
- [Current Status](docs/current_status.md)
- [Technical Decisions](docs/decisions.md)
- [Workflows](docs/workflows.md)
- [Backlog](docs/backlog.md)
- [Deployment](docs/deployment.md)
