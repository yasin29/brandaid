from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.routes.simulation import router as simulation_router

app = FastAPI(
    title="Brand-AId API",
    description="AI-powered campaign simulation engine",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(simulation_router)


@app.get("/health")
async def health():
    return {"status": "ok"}
