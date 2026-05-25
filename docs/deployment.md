# Deployment — Docker

> **Competition context:** Dockerized deployment for Infinity AI Buildfest 2026 demo.
> All data (ChromaDB, ML models, knowledge base) is baked inside the Docker image as required by management.

---

## Architecture

```
Internet → port 80
              │
           [nginx] (frontend container)
           ├── serves React SPA (static files)
           └── proxies /api/* and /health → backend:8000 (internal)

           [backend] (FastAPI container, internal only)
           ├── ChromaDB (data/chroma_db/ — re-indexes from knowledge_base/ on first start)
           ├── ML models (data/models/)
           └── knowledge base (data/knowledge_base/)
```

Single exposed port: **80**. The backend is never directly reachable from the internet.

---

## Prerequisites on the Server

- Docker Engine 24+
- Docker Compose v2 (`docker compose` not `docker-compose`)
- Git

```bash
# Install Docker (Ubuntu/Debian)
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER   # then re-login
```

---

## Deployment Steps

### 1. Clone the repo

```bash
git clone https://github.com/alviriseup/brand-AId.git
cd brand-AId
```

### 2. Create the `.env` file at the repo root

```bash
cp .env.example .env
nano .env           # fill in OPENAI_API_KEY and model names
```

Minimum required content:

```env
OPENAI_API_KEY=sk-...
OPENAI_CHAT_MODEL=gpt-4.1-mini
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
FRONTEND_URL=http://your-server-ip-or-domain
```

> The `.env` file at the repo root is read by docker-compose and injected as environment variables into the backend container. It is never baked into the image.

### 3. Build and start

```bash
docker compose up --build -d
```

First build takes 3–5 minutes (downloads base images, installs Python/Node deps). Subsequent starts are fast.

On first startup, the backend re-indexes the RAG knowledge base into ChromaDB (~5 seconds). The frontend container waits for the backend health check before starting nginx.

### 4. Verify

```bash
# Check containers are running
docker compose ps

# Stream logs
docker compose logs -f

# Hit the health endpoint
curl http://localhost/health
# → {"status":"ok"}
```

Open `http://your-server-ip` in a browser.

---

## Updating the App

```bash
git pull
docker compose up --build -d
```

Docker rebuilds only changed layers. If only Python code changed, the dep layer is cached — rebuild takes ~30 seconds.

---

## Useful Commands

```bash
# Stop everything
docker compose down

# Stop and remove volumes/images (full reset)
docker compose down --rmi all

# View backend logs only
docker compose logs -f backend

# Restart just the backend
docker compose restart backend

# Open a shell in the backend container
docker compose exec backend bash
```

---

## HTTPS (with a domain)

If you have a domain and want HTTPS, add a Caddy reverse proxy in front:

```bash
# Install Caddy
apt-get install -y caddy

# /etc/caddy/Caddyfile
yourdomain.com {
    reverse_proxy localhost:80
}

systemctl restart caddy
```

Caddy auto-provisions a Let's Encrypt certificate.

---

## Firewall

Only port 80 (and 443 if using HTTPS) needs to be open to the internet. Port 8000 (backend) should be internal only.

```bash
# UFW example
ufw allow 22      # SSH
ufw allow 80      # HTTP
ufw allow 443     # HTTPS (if using Caddy)
ufw enable
```

---

## Data Persistence Note

- **ChromaDB / ML models / knowledge base**: baked into the backend image. Persistent across restarts.
- **Uploaded campaign images** (`uploads/`): stored inside the container — lost on `docker compose down`. Acceptable for demo scope.
- **User simulation history**: stored in the browser's localStorage — no server persistence needed.

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | ✅ | OpenAI API key |
| `OPENAI_CHAT_MODEL` | ✅ | e.g. `gpt-4.1-mini` |
| `OPENAI_EMBEDDING_MODEL` | ✅ | e.g. `text-embedding-3-small` |
| `FRONTEND_URL` | optional | For reference only — CORS is `*` |
| `BRAVE_API_KEY` | optional | Enables Brave Search MCP for audience research; falls back to OpenAI web_search_preview if not set |
| `CHROMA_DB_PATH` | optional | Defaults to `data/chroma_db` |
| `CHROMA_COLLECTION_NAME` | optional | Defaults to `brand_aid_knowledge` |
