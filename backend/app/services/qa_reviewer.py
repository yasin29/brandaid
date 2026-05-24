"""
QA Reviewer Agent — Stage 7 of the simulation pipeline.

Uses OpenAI tool calling to:
  - verify_campaign_math: deterministic calculator that checks numeric consistency
    (ROAS × budget → implied revenue, ROI direction vs ROAS alignment)
  - Language-level quality review against 6 criteria

Two-pass flow:
  Pass 1: Model may call verify_campaign_math (tool call, free local execution)
  Pass 2: Model produces final JSON review, optionally grounded in math check results
"""

import json
import re
from app.services.openai_client import client
from app.core.config import settings
from app.models.schemas import (
    CampaignInput,
    SimulationResult,
    QAReview,
    QAFlag,
)

# ── Calculator tool definition ────────────────────────────────────────────────

_CALCULATOR_TOOL = {
    "type": "function",
    "function": {
        "name": "verify_campaign_math",
        "description": (
            "Verify that the campaign forecast numbers are mathematically consistent. "
            "Call this whenever you see numeric claims about CTR, ROAS, budget, or ROI direction "
            "that you want to cross-check."
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "budget_usd": {
                    "type": "number",
                    "description": "Campaign budget in USD (e.g. 2000 for $2,000)",
                },
                "ctr_low_pct": {
                    "type": "number",
                    "description": "Lower bound of CTR range as a percentage (e.g. 2.5 for 2.5%)",
                },
                "ctr_high_pct": {
                    "type": "number",
                    "description": "Upper bound of CTR range as a percentage (e.g. 3.8 for 3.8%)",
                },
                "roas_low": {
                    "type": "number",
                    "description": "Lower bound of ROAS (e.g. 3.2 for 3.2x). Omit if not provided.",
                },
                "roas_high": {
                    "type": "number",
                    "description": "Upper bound of ROAS (e.g. 8.9 for 8.9x). Omit if not provided.",
                },
                "roi_direction": {
                    "type": "string",
                    "enum": ["Positive", "Neutral", "Negative"],
                    "description": "The stated ROI direction from the simulation report.",
                },
            },
            "required": ["budget_usd", "ctr_low_pct", "ctr_high_pct", "roi_direction"],
        },
    },
}


def _run_calculator(args: dict) -> dict:
    """Pure Python math — no API call needed."""
    budget = float(args.get("budget_usd", 0))
    ctr_low = float(args.get("ctr_low_pct", 0))
    ctr_high = float(args.get("ctr_high_pct", 0))
    roas_low = args.get("roas_low")
    roas_high = args.get("roas_high")
    roi_direction = args.get("roi_direction", "")

    result: dict = {
        "budget_usd": budget,
        "ctr_range": f"{ctr_low}%–{ctr_high}%",
    }

    if roas_low is not None and roas_high is not None:
        roas_low, roas_high = float(roas_low), float(roas_high)
        avg_roas = (roas_low + roas_high) / 2
        result["estimated_revenue_low"] = round(budget * roas_low, 2)
        result["estimated_revenue_high"] = round(budget * roas_high, 2)
        result["estimated_revenue_range"] = (
            f"${result['estimated_revenue_low']:,.0f}–${result['estimated_revenue_high']:,.0f}"
        )
        result["avg_roas"] = round(avg_roas, 2)

        # Derive implied ROI direction from ROAS
        if avg_roas >= 1.3:
            implied = "Positive"
        elif avg_roas <= 0.85:
            implied = "Negative"
        else:
            implied = "Neutral"

        result["implied_roi_direction"] = implied
        result["roi_direction_consistent"] = implied == roi_direction

        if not result["roi_direction_consistent"]:
            result["inconsistency_note"] = (
                f"ROAS {roas_low:.1f}x–{roas_high:.1f}x (avg {avg_roas:.1f}x) implies "
                f"'{implied}' ROI, but report states '{roi_direction}'. This is a contradiction."
            )
        else:
            result["consistency_note"] = (
                f"ROI direction '{roi_direction}' is consistent with ROAS {roas_low:.1f}x–{roas_high:.1f}x."
            )
    else:
        result["roas_note"] = "ROAS not provided — cannot verify revenue estimates."

    return result


# ── Budget parser (reused from ml_forecast_service pattern) ──────────────────

def _parse_budget(budget_str: str) -> float:
    digits = re.sub(r"[^\d.]", "", budget_str.replace(",", ""))
    try:
        return float(digits)
    except ValueError:
        return 1000.0


# ── Simulation summary builder ────────────────────────────────────────────────

def _build_simulation_summary(campaign: CampaignInput, result: SimulationResult) -> str:
    persona_lines = "\n".join([
        f"  - {p.persona_name} ({p.persona_type}): engagement={p.engagement_likelihood}, "
        f"trust={p.trust_level}, conversion={p.conversion_likelihood}, "
        f"objections={p.objections}"
        for p in result.personas
    ])

    rec = result.recommendations
    opt_copy_snippet = (result.optimized_copy or "")[:300]

    return f"""
CAMPAIGN INPUT
  Objective: {campaign.objective}
  Platform: {campaign.platform}
  Target audience: {campaign.target_audience}
  Budget: {campaign.budget}
  Ad copy: {campaign.ad_copy[:400]}

STAGE 1 — CAMPAIGN ANALYSIS
  Overall score: {result.campaign_analysis.overall_score}/100
  Emotional tone: {result.campaign_analysis.emotional_tone}
  CTA strength: {result.campaign_analysis.cta_strength}
  Audience fit: {result.campaign_analysis.audience_fit}
  Trust signals: {result.campaign_analysis.trust_signals}
  Clarity: {result.campaign_analysis.clarity}

STAGE 2/3 — PERSONA REACTIONS
{persona_lines}

STAGE 4 — FORECAST
  CTR range: {result.forecast.ctr_range}
  ROAS range: {result.forecast.roas_range or 'not provided'}
  Confidence level: {result.forecast.confidence_level}
  ROI direction: {result.forecast.roi_direction}
  Engagement estimate: {result.forecast.engagement_estimate}
  Conversion trend: {result.forecast.conversion_trend}

RISKS IDENTIFIED
{chr(10).join(f'  {i+1}. {r}' for i, r in enumerate(result.risks))}

STAGE 5 — RECOMMENDATIONS
  Improved CTA: {rec.improved_cta}
  Stronger messaging: {rec.stronger_messaging}
  Audience refinement: {rec.audience_refinement}
  Platform strategy: {rec.platform_strategy}
  Optimization tips: {rec.optimization_tips}

STAGE 6 — OPTIMIZED COPY (first 300 chars)
  {opt_copy_snippet}
""".strip()


# ── Prompts ───────────────────────────────────────────────────────────────────

_QA_SYSTEM_PROMPT = """You are a senior marketing AI quality assurance agent.
You have access to a calculator tool (verify_campaign_math) to check numeric consistency.
Use it when you see budget, CTR, ROAS, or ROI direction values that you want to verify.

Review the simulation against these criteria:

1. FORECAST-PERSONA CONSISTENCY — if most personas show low engagement/trust, the forecast should not be optimistic.
2. RISK SPECIFICITY — generic risks ("market competition", "economic uncertainty") that apply to any campaign should be flagged.
3. RECOMMENDATION-WEAKNESS ALIGNMENT — recommendations must address the actual weaknesses from Stage 1.
4. PERSONA DIFFERENTIATION — 3 personas must be genuinely distinct in behavior, motivation, and reaction.
5. OPTIMIZED COPY QUALITY — must structurally improve on the original, not just rephrase.
6. NARRATIVE COHERENCE — score, forecast, confidence, and ROI direction must tell a consistent story.
7. NUMERIC CONSISTENCY — use verify_campaign_math to check that ROAS and ROI direction align.

Only flag genuine issues. A clean simulation returns an empty flags array and verdict "Pass"."""

_QA_REVIEW_INSTRUCTION = """Based on your review (and any calculator results above), return a JSON object with:
- verdict: "Pass" | "Partial Pass" | "Needs Improvement"
  ("Pass" = no significant issues; "Partial Pass" = 1-2 minor flags; "Needs Improvement" = 3+ flags or any high-severity)
- confidence_score: integer 0-100 (90-100 excellent, 70-89 good, 50-69 acceptable, <50 poor)
- flags: array of {section, issue, severity ("low"|"medium"|"high")} — empty if none
- reviewer_notes: 2-3 sentence summary
- approved: true if Pass or Partial Pass, false otherwise"""


# ── Main reviewer ─────────────────────────────────────────────────────────────

async def run_qa_review(
    campaign: CampaignInput,
    result: SimulationResult,
) -> QAReview:
    simulation_summary = _build_simulation_summary(campaign, result)
    budget_usd = _parse_budget(campaign.budget)

    system_msg = {"role": "system", "content": _QA_SYSTEM_PROMPT}
    user_msg = {
        "role": "user",
        "content": (
            f"Review this simulation. Budget is ${budget_usd:,.0f}. "
            f"Use verify_campaign_math if you want to check numeric consistency.\n\n"
            f"{simulation_summary}"
        ),
    }
    messages = [system_msg, user_msg]

    # Pass 1 — model may call the calculator tool
    pass1 = await client.chat.completions.create(
        model=settings.openai_chat_model,
        messages=messages,
        tools=[_CALCULATOR_TOOL],
        tool_choice="auto",
        max_completion_tokens=300,
    )

    assistant_msg = pass1.choices[0].message
    messages.append(assistant_msg)

    if assistant_msg.tool_calls:
        for tc in assistant_msg.tool_calls:
            args = json.loads(tc.function.arguments)
            calc_result = _run_calculator(args)
            messages.append({
                "role": "tool",
                "tool_call_id": tc.id,
                "content": json.dumps(calc_result),
            })

    # Pass 2 — final JSON review (always runs, with or without tool results)
    messages.append({"role": "user", "content": _QA_REVIEW_INSTRUCTION})
    pass2 = await client.chat.completions.create(
        model=settings.openai_chat_model,
        messages=messages,
        response_format={"type": "json_object"},
        max_completion_tokens=800,
    )

    data = json.loads(pass2.choices[0].message.content)
    flags = [QAFlag(**f) for f in data.get("flags", [])]

    return QAReview(
        verdict=data["verdict"],
        confidence_score=int(data["confidence_score"]),
        flags=flags,
        reviewer_notes=data["reviewer_notes"],
        approved=bool(data["approved"]),
    )
