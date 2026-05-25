from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.routes.simulation import router as simulation_router
from app.routes.analyze import router as analyze_router
from app.routes.benchmarks import router as benchmarks_router
from app.services.rag_service import initialize_rag


@asynccontextmanager
async def lifespan(app: FastAPI):
    initialize_rag()
    yield


app = FastAPI(
    title="Brand-AId API",
    description="AI-powered campaign simulation engine",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(simulation_router)
app.include_router(analyze_router)
app.include_router(benchmarks_router)


@app.get("/health")
async def health():
    return {"status": "ok"}
