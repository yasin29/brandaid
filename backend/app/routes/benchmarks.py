from fastapi import APIRouter
from pydantic import BaseModel
from app.services.rag_service import retrieve

router = APIRouter(prefix="/api", tags=["benchmarks"])


class BenchmarkRequest(BaseModel):
    query: str
    platform: str = ""


@router.post("/benchmarks/")
async def query_benchmarks(req: BenchmarkRequest):
    """Query the RAG knowledge base for CTR, ROAS, and marketing best-practice data."""
    combined_query = f"{req.query} {req.platform}".strip()
    context = retrieve(combined_query, n_results=3)
    return {"context": context, "query": combined_query}
