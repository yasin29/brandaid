# Workflows

Common development tasks and how to do them.

---

## First-Time Setup (new machine)

```bash
git clone https://github.com/alviriseup/brand-AId.git
cd brand-AId

# 1. Copy env template and fill in your API key
cp .env.example .env
# Edit .env — set OPENAI_API_KEY

# 2. Backend
cd backend
python3.12 -m venv .venv
source .venv/bin/activate       # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cd ..

# 3. Frontend (requires Node 20+ — use nvm if needed)
# Check node version first:
node --version   # needs to be v20+ or v22+
# If not: nvm use 22.14.0  (or install via nvm)

cd frontend
npm install
cd ..
```

---

## Running Locally

Always run backend and frontend in separate terminals.

### Terminal 1 — Backend

```bash
cd backend
source .venv/bin/activate       # Windows: .venv\Scripts\activate
uvicorn main:app --reload --port 8000
```

Backend available at: `http://localhost:8000`
API docs (auto-generated): `http://localhost:8000/docs`
Health check: `http://localhost:8000/health`

### Terminal 2 — Frontend

```bash
# Make sure you're using Node 20+
# If using nvm:
export NVM_DIR="$HOME/.nvm" && source "$NVM_DIR/nvm.sh" && nvm use 22.14.0

cd frontend
npm run dev
```

Frontend available at: `http://localhost:5173`

---

## Node Version Management

The project requires Node 20+ (Vite 9 requirement). The dev machine has Node 22.14.0 available via nvm.

```bash
# One-time: set Node 22 as default (optional)
nvm alias default 22.14.0

# Per-session activation (if not default):
export NVM_DIR="$HOME/.nvm" && source "$NVM_DIR/nvm.sh" && nvm use 22.14.0
```

---

## Adding a New shadcn/ui Component

```bash
cd frontend
# Make sure Node 22 is active
npx shadcn@latest add <component-name>
# e.g. npx shadcn@latest add dialog
```

Components are added to `frontend/src/components/ui/`.

---

## Adding Python Dependencies

```bash
cd backend
source .venv/bin/activate
pip install <package>
pip freeze | grep <package> >> requirements.txt  # or manually add to requirements.txt
```

Always pin or at least record new dependencies in `requirements.txt`.

---

## Running a Type Check (Frontend)

```bash
cd frontend
npx tsc --noEmit
```

Should exit with no output (zero errors).

---

## Seeding the RAG Knowledge Base

*(Not yet implemented — see backlog.md)*

Place `.txt` or `.md` files in `backend/data/knowledge_base/`. The RAG service will read and embed them on startup. Commit the files so knowledge base syncs across devices.

---

## Git Workflow

This is a solo project. Work directly on `main`.

```bash
git add <files>
git commit -m "short description of what and why"
git push origin main
```

On another device:
```bash
git pull origin main
# Then run pip install -r requirements.txt and npm install if dependencies changed
```

---

## Updating `docs/current_status.md`

After completing a meaningful chunk of work, update `current_status.md`:
- Move completed items from "Not Done" to "Done"
- Update "Immediate Next Steps"
- Update the "Last updated" date at the top

This keeps context fresh for the next session on any device.

---

## Environment Variables Reference

| Variable                 | Purpose                                        | Default (from .env.example)  |
|--------------------------|------------------------------------------------|------------------------------|
| `OPENAI_API_KEY`         | OpenAI authentication                          | (required, no default)       |
| `OPENAI_CHAT_MODEL`      | Model used for all AI pipeline stages          | `gpt-5.4-mini`               |
| `OPENAI_EMBEDDING_MODEL` | Model used for RAG embeddings                  | `text-embedding-3-small`     |
| `FRONTEND_URL`           | Allowed CORS origin                            | `http://localhost:5173`      |
| `CHROMA_DB_PATH`         | Path to ChromaDB storage (relative to backend/)| `data/chroma_db`             |
| `CHROMA_COLLECTION_NAME` | ChromaDB collection name                       | `brand_aid_knowledge`        |
