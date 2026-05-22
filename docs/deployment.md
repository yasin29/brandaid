# Deployment

> **Competition context:** This is a 3-4 day sprint for Infinity AI Buildfest 2026. Deployment is for demo purposes — not production scale. Prioritize getting a working demo URL over infrastructure polish.

---

## Current State

Not deployed. Running locally only.

---

## Target: Demo Deployment (Competition)

The goal is a single shareable URL judges can access for the demo.

### Recommended Approach: Render (free tier)

**Why Render:** Free tier, simple FastAPI + static site support, no credit card required for basic usage, deploys from GitHub.

#### Backend (FastAPI on Render Web Service)

1. Go to [render.com](https://render.com) → New → Web Service
2. Connect `alviriseup/brand-AId` GitHub repo
3. Settings:
   - Root Directory: `backend`
   - Runtime: Python 3
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add environment variables (from `.env`):
   - `OPENAI_API_KEY`
   - `OPENAI_CHAT_MODEL`
   - `OPENAI_EMBEDDING_MODEL`
   - `FRONTEND_URL` → set to your frontend URL once known
5. Deploy

#### Frontend (React on Render Static Site)

1. New → Static Site
2. Same repo
3. Settings:
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
4. Add environment variable:
   - `VITE_API_URL` → backend Render URL (needs to be added to `lib/api.ts`)
5. Deploy

---

## Pre-Deployment Checklist

- [ ] `VITE_API_URL` env var wired into `frontend/src/lib/api.ts` (currently hardcoded to `localhost:8000`)
- [ ] CORS `FRONTEND_URL` in backend `.env` updated to production frontend URL
- [ ] Test full simulation flow on deployed URLs before presenting
- [ ] ChromaDB: decide if RAG data should be pre-seeded in deployment (currently empty)
- [ ] Uploaded images: `uploads/` won't persist across Render deploys (ephemeral filesystem) — acceptable for demo

---

## Alternative Deployment Options

| Option          | Backend           | Frontend        | Notes                                    |
|-----------------|-------------------|-----------------|------------------------------------------|
| Render          | Web Service       | Static Site     | Recommended. Free tier. Simple.          |
| Railway         | Service           | Static/Service  | Good DX, slightly more expensive         |
| Vercel + Fly.io | Fly.io (FastAPI)  | Vercel (React)  | More complex, Vercel great for frontend  |
| Local + ngrok   | localhost:8000    | localhost:5173  | Quick for demo — not reliable for judges |

---

## Production Considerations (Post-Competition)

If this moves beyond the competition:
- Move ChromaDB to a managed vector DB (Pinecone, Weaviate, etc.)
- Add auth (Clerk or Supabase Auth)
- Move image storage to S3 or similar
- Add rate limiting on the simulation endpoint
- Cache simulation results to reduce OpenAI spend
