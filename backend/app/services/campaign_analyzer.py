import json
import base64
from pathlib import Path
from app.services.openai_client import client
from app.core.config import settings
from app.models.schemas import CampaignInput, CampaignAnalysis


async def analyze_campaign(campaign: CampaignInput) -> CampaignAnalysis:
    messages = [
        {
            "role": "user",
            "content": _build_content(campaign),
        }
    ]

    response = await client.chat.completions.create(
        model=settings.openai_chat_model,
        messages=messages,
        response_format={"type": "json_object"},
        max_tokens=800,
    )

    data = json.loads(response.choices[0].message.content)
    return CampaignAnalysis(**data)


def _build_content(campaign: CampaignInput) -> list:
    text_block = {
        "type": "text",
        "text": (
            f"You are a marketing strategist AI. Analyze this campaign and return a JSON object "
            f"with exactly these keys: emotional_tone, cta_strength, audience_fit, trust_signals, "
            f"clarity, emotional_appeal (each a short string), and overall_score (integer 1-100).\n\n"
            f"Campaign Objective: {campaign.objective}\n"
            f"Platform: {campaign.platform}\n"
            f"Target Audience: {campaign.target_audience}\n"
            f"Budget: {campaign.budget}\n"
            f"Ad Copy:\n{campaign.ad_copy}"
        ),
    }

    content = [text_block]

    if campaign.image_path and Path(campaign.image_path).exists():
        image_data = base64.b64encode(Path(campaign.image_path).read_bytes()).decode()
        suffix = Path(campaign.image_path).suffix.lower().lstrip(".")
        mime = f"image/{suffix}" if suffix in ("jpg", "jpeg", "png", "webp", "gif") else "image/jpeg"
        content.append({
            "type": "image_url",
            "image_url": {"url": f"data:{mime};base64,{image_data}"},
        })

    return content
