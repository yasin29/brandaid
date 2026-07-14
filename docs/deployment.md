# Deployment — Docker

> Dockerized deployment. All data (ChromaDB, ML models, knowledge base) is baked inside the Docker image.

## Live URL

**`https://brandaid.rultest4.com/`** — deployed 2026-05-30

- Server: `89.147.102.48` (accessed via JumpServer at `172.16.1.250:2222`)
- Frontend container: port `8024` on host, reverse-proxied by system nginx to port 80/443
- Backend container: internal only (port 8000), healthchecked before frontend starts
- Restart policy: `unless-stopped` — containers survive server reboots automatically

---

## Architecture

```
Internet → https://brandaid.rultest4.com (port 443/80)
              │
         [system nginx on host] — reverse proxy vhost
              │
           port 8024
              │
           [nginx container] (brand-aid-frontend)
           ├── serves React SPA (static files from dist/)
           └── proxies /api/* and /health → backend:8000 (internal Docker network)
              │
           [uvicorn container] (brand-aid-backend, internal only)
           ├── ChromaDB (data/chroma_db/ — baked into image)
           ├── ML models (data/models/ — baked into image)
           └── knowledge base (data/knowledge_base/ — baked into image)
```

The backend is never directly reachable from the internet. `.env` (with API key) lives only on the server at `/tmp/brand-aid.env` — never baked into any image.

---

## Prerequisites on the Server

- Docker Engine 24+ (`docker` — already installed on `89.147.102.48`)
- `docker-compose` v1.29+ (already installed at `/usr/bin/docker-compose`)
- System nginx (already running, handles domain routing)
- Access via JumpServer SSH (see Server Access below)

---

## Server Access

The deployment server is behind a JumpServer (PAM bastion). Connect via VPN first, then SSH through the JumpServer gateway.

**VPN:** L2TP/IPSec to `118.179.119.250` — see `deploy/setup_vpn.sh` (gitignored, local only).

**SSH:**
```
Host: 172.16.1.250
Port: 2222
User: alvi.riseuplabs#root#61e95afd-2f18-4c36-8e8e-b65338c3ce0d
```

The JumpServer username format is `<js-user>#<asset>#<system-user-uuid>`. This connects you as `root` on `rultest4` (89.147.102.48).

---

## Deploy / Re-deploy Steps

The server's filesystem is ephemeral for non-Docker paths (overlay FS). The workflow is: **build locally → pipe images to server → write config to `/tmp` → run**.

### 1. Build images locally

```bash
sudo docker build -t brand-aid-backend ./backend
sudo docker build --build-arg VITE_API_BASE="" -t brand-aid-frontend ./frontend
```

### 2. Pipe images to server

```bash
sudo docker save brand-aid-backend brand-aid-frontend | \
  sshpass -p '<password>' ssh -p 2222 \
    'alvi.riseuplabs#root#61e95afd-2f18-4c36-8e8e-b65338c3ce0d'@172.16.1.250 \
    'docker load'
```

Docker image storage on the server IS persistent (managed by Docker daemon, not the overlay FS).

### 3. Write `.env` and `docker-compose.yml` on server, then start

SSH to the server and run:

```bash
cat > /tmp/brand-aid.env << 'EOF'
OPENAI_API_KEY=sk-...
OPENAI_CHAT_MODEL=gpt-5.4-mini
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
FRONTEND_URL=https://brandaid.rultest4.com
CHROMA_DB_PATH=data/chroma_db
CHROMA_COLLECTION_NAME=brand_aid_knowledge
EOF
chmod 600 /tmp/brand-aid.env

cat > /tmp/brand-aid-compose.yml << 'EOF'
services:
  backend:
    image: brand-aid-backend:latest
    expose: ["8000"]
    env_file: [/tmp/brand-aid.env]
    restart: unless-stopped
    healthcheck:
      test: ["CMD","curl","-f","http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 20s
  frontend:
    image: brand-aid-frontend:latest
    ports: ["8024:80"]
    depends_on:
      backend:
        condition: service_healthy
    restart: unless-stopped
EOF

docker-compose -f /tmp/brand-aid-compose.yml down 2>/dev/null || true
docker-compose -f /tmp/brand-aid-compose.yml up -d
```

> **Note:** `/tmp` is cleared on reboot but containers with `restart: unless-stopped` restart automatically. If the server reboots AND Docker itself cold-starts, re-run step 3 only (images are already loaded from step 2).

### 4. Verify

```bash
curl -s http://localhost:8024/           # → HTML 200
curl -s http://localhost:8000/health     # → {"status":"ok"}
```

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
