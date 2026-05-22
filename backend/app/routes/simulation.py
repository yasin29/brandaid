import os
import uuid
import aiofiles
from fastapi import APIRouter, UploadFile, File, Form
from fastapi.responses import JSONResponse
from app.models.schemas import CampaignInput, SimulationResult
from app.services.simulation_orchestrator import run_simulation

router = APIRouter(prefix="/api/simulate", tags=["simulation"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/", response_model=SimulationResult)
async def simulate_campaign(
    objective: str = Form(...),
    platform: str = Form(...),
    target_audience: str = Form(...),
    budget: str = Form(...),
    ad_copy: str = Form(...),
    image: UploadFile | None = File(default=None),
):
    image_path = None

    if image and image.filename:
        ext = os.path.splitext(image.filename)[1]
        filename = f"{uuid.uuid4()}{ext}"
        image_path = os.path.join(UPLOAD_DIR, filename)
        async with aiofiles.open(image_path, "wb") as f:
            content = await image.read()
            await f.write(content)

    campaign = CampaignInput(
        objective=objective,
        platform=platform,
        target_audience=target_audience,
        budget=budget,
        ad_copy=ad_copy,
        image_path=image_path,
    )

    result = await run_simulation(campaign)
    return result
