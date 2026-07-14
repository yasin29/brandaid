FROM python:3.12-slim

# System deps (curl for healthcheck)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python deps first (cached layer)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code and all data (knowledge base, ML models, ChromaDB)
# management requirement: all data inside the container
COPY . .

# Remove local venv if accidentally included in build context
RUN rm -rf .venv __pycache__ .env

EXPOSE 8000

# Render (and other PaaS hosts) inject $PORT and expect the app to bind to it.
# Falls back to 8000 for docker-compose / local runs where $PORT isn't set.
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
