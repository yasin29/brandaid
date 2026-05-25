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

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
