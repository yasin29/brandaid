import json
import base64
from pathlib import Path
from app.services.openai_client import client
from app.core.config import settings
from app.models.schemas import CampaignInput, CampaignAnalysis


_SYSTEM_PROMPT = (
    "You are a marketing strategist AI. Analyze the campaign provided by the user "
    "and return a JSON object with exactly these keys:\n"
    "- emotional_tone, cta_strength, audience_fit, trust_signals, clarity, emotional_appeal: "
    "each a short descriptive string (1-2 sentences)\n"
    "- overall_score: integer 1-100\n"
    "- dimension_scores: a nested object with the same 6 keys, each an integer 0-10 "
    "(0 = very weak, 10 = excellent)\n\n"
    "Tailor your analysis to the campaign's funnel stage and specific purpose. "
    "For Awareness campaigns emphasize emotional resonance and brand recall. "
    "For Consideration campaigns focus on trust signals and engagement depth. "
    "For Conversion campaigns prioritize CTA strength, urgency, and friction reduction."
)


async def analyze_campaign(campaign: CampaignInput) -> CampaignAnalysis:
    messages = [
        {"role": "system", "content": _SYSTEM_PROMPT},
        {"role": "user", "content": _build_content(campaign)},
    ]

    response = await client.chat.completions.create(
        model=settings.openai_chat_model,
        messages=messages,
        response_format={"type": "json_object"},
        max_completion_tokens=600,
    )

    data = json.loads(response.choices[0].message.content)
    return CampaignAnalysis(**data)


def _format_purpose_context(ctx: dict, sub_purpose: str) -> str:
    if not ctx:
        return ""
    lines = []
    for k, v in ctx.items():
        if v is None or v == "" or v == [] or v == {}:
            continue
        key_label = k.replace("_", " ").title()
        lines.append(f"  {key_label}: {v}")
    return "\n".join(lines)


def _build_content(campaign: CampaignInput) -> list:
    ctx_text = _format_purpose_context(campaign.purpose_context, campaign.sub_purpose)
    channels_text = ", ".join(campaign.channels) if campaign.channels else campaign.platform

    text_parts = [
        f"Funnel Stage: {campaign.goal.title()} — {campaign.sub_purpose}",
        f"Campaign Objective: {campaign.objective}",
        f"Channels: {channels_text}",
        f"Target Audience: {campaign.target_audience}",
        f"Budget: {campaign.budget}",
    ]
    if ctx_text:
        text_parts.append(f"Purpose Details:\n{ctx_text}")
    text_parts.append(f"Ad Copy:\n{campaign.ad_copy}")

    text_block = {
        "type": "text",
        "text": "\n".join(text_parts),
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
