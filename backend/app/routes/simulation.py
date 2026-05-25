import json
import os
import uuid
import aiofiles
from fastapi import APIRouter, UploadFile, File, Form
from app.models.schemas import CampaignInput, SimulationResult
from app.services.simulation_orchestrator import run_simulation

router = APIRouter(prefix="/api/simulate", tags=["simulation"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

_OBJECTIVE_MAP: dict[str, str] = {
    "new-brand":            "Build brand awareness for a new brand",
    "repositioning":        "Reposition brand perception in the market",
    "product-launch":       "Drive awareness for a new product launch",
    "lead-generation":      "Generate qualified leads for the business",
    "engagement-education": "Drive engagement and educate the target audience",
    "traffic-intent":       "Drive high-intent traffic to website",
    "direct-purchase":      "Drive direct product purchases",
    "signup-trial":         "Drive sign-ups or free trial activations",
    "flash-sale":           "Maximize conversions during a time-limited promotion",
}


@router.post("/", response_model=SimulationResult)
async def simulate_campaign(
    # New structured wizard fields
    goal: str = Form(default=""),
    sub_purpose: str = Form(default=""),
    purpose_context: str = Form(default="{}"),
    channels: str = Form(default="[]"),
    # Common fields
    target_audience: str = Form(...),
    budget: str = Form(...),
    ad_copy: str = Form(...),
    # Derived / legacy fields — auto-computed if omitted
    objective: str = Form(default=""),
    platform: str = Form(default=""),
    image: UploadFile | None = File(default=None),
):
    parsed_channels: list[str] = json.loads(channels) if channels else []
    parsed_context: dict = json.loads(purpose_context) if purpose_context else {}

    # Auto-derive objective and platform from new fields when not supplied
    if not objective:
        objective = _OBJECTIVE_MAP.get(sub_purpose, f"{goal} campaign" if goal else "")
    if not platform:
        platform = parsed_channels[0] if parsed_channels else goal

    image_path = None
    if image and image.filename:
        ext = os.path.splitext(image.filename)[1]
        filename = f"{uuid.uuid4()}{ext}"
        image_path = os.path.join(UPLOAD_DIR, filename)
        async with aiofiles.open(image_path, "wb") as f:
            content = await image.read()
            await f.write(content)

    campaign = CampaignInput(
        goal=goal,
        sub_purpose=sub_purpose,
        purpose_context=parsed_context,
        channels=parsed_channels,
        objective=objective,
        platform=platform,
        target_audience=target_audience,
        budget=budget,
        ad_copy=ad_copy,
        image_path=image_path,
    )

    result = await run_simulation(campaign)
    return result
