# Technical Decisions

A record of key decisions made during development, with rationale. Read this before making architectural changes.

---

## AI & Models

### Decision: Model names read from `.env`, never hardcoded
**Why:** OpenAI releases models frequently and pricing varies significantly (e.g. gpt-5.5 vs gpt-5.4-mini). Hardcoding creates brittleness. The `.env.example` provides sensible defaults with comments explaining the tradeoff.

### Decision: Use `AsyncOpenAI` throughout
**Why:** FastAPI is async-native. Using the sync client would block the event loop. All service functions are `async def` and `await` the OpenAI calls.

### Decision: `response_format={"type": "json_object"}` on all AI calls
**Why:** Ensures structured, parseable output from the LLM. All prompts instruct the model to return specific JSON keys that map directly to Pydantic models.

### Decision: Re-simulation (Stage 6) runs inline in the orchestrator
**Why:** Simplest path for the demo. The full `SimulationResult` (including optimized copy and re-sim forecast) is returned in one API call. This avoids a second round-trip from the frontend and keeps the loading screen simple. Can be split into two endpoints later if needed.

---

## Backend

### Decision: FastAPI over Flask/Django
**Why:** Async-first, automatic OpenAPI docs, native Pydantic integration, fast to set up. Matches the async AI call pattern.

### Decision: Single `/api/simulate/` endpoint (multipart form)
**Why:** Keeps the API surface minimal for MVP. Image upload via multipart is standard and avoids base64 encoding overhead in the request body.

### Decision: Images stored in `backend/uploads/` and committed to git
**Why:** Solo developer, multi-device workflow. Git acts as the sync mechanism. Not suitable for production scale but fine for demo/competition scope.

### Decision: ChromaDB local (committed to git)
**Why:** Same reason as uploads — multi-device sync. ChromaDB's local storage is a folder, easy to commit. Avoids needing a cloud vector DB account for a 3-4 day sprint.

### Decision: Persona templates are static (MVP)
**Why:** Speed. Three archetypal personas (Gen Z, Corporate, Value-Conscious) cover the demo well. The AI still generates dynamic reactions per persona per campaign. Dynamic persona generation is in the backlog.

---

## Frontend

### Decision: React state machine in `App.tsx` (no router)
**Why:** Only 3 screens (input → processing → results), linear flow. React Router would be overkill and add complexity. Simple `useState<Screen>` is transparent and fast to build.

### Decision: TailwindCSS v4 + shadcn/ui
**Why:** Tailwind v4 is the current stable release with Vite plugin support. shadcn/ui gives high-quality, composable components without a heavy design system. Both are what judges expect from a modern AI product.

### Decision: Dark theme forced (`<div className="dark">` in App.tsx)
**Why:** The product vision is "futuristic and AI-native." Dark mode fits. Light mode is not a priority for the competition demo.

### Decision: Path alias `@/` → `src/`
**Why:** Avoids `../../../` import chains as the component tree grows. Configured in both `vite.config.ts` (runtime) and `tsconfig.app.json` (type checking). Note: `baseUrl` was removed to avoid TypeScript 6 deprecation errors — `paths` alone works with `moduleResolution: bundler`.

---

## Infrastructure

### Decision: API-first, no GPU, cloud AI only
**Why:** No GPU available. OpenAI API covers multimodal (image analysis) and text generation. This is the correct architecture for a competition judged on AI-first design.

### Decision: No authentication for MVP
**Why:** Time constraint (3-4 days). Auth adds no demo value for a single-judge evaluation. Can be added post-competition if the product moves forward.

### Decision: Node 22 required (not Node 18)
**Why:** Vite 9+ requires Node >= 20.19.0 or >= 22.12.0. Node 18 (the system default on the dev machine) fails. Use `nvm use 22.14.0` or ensure Node 22 is the default.
