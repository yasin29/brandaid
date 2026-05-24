"""
QA Reviewer Agent — Stage 7 of the simulation pipeline.

A second LLM pass that independently reviews the full simulation output against
concrete quality criteria. It cannot see the prompts that generated the output —
only the output itself — so it provides a genuinely independent assessment.

Checks:
  1. Forecast ↔ persona consistency
  2. Risk specificity (flags generic risks that apply to any campaign)
  3. Recommendation ↔ weakness alignment
  4. Persona differentiation (are the 3 personas actually distinct?)
  5. Optimized copy quality (meaningfully better, not just rewording)
  6. Overall narrative coherence
"""

import json
from app.services.openai_client import client
from app.core.config import settings
from app.models.schemas import (
    CampaignInput,
    SimulationResult,
    QAReview,
    QAFlag,
)


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


_QA_SYSTEM_PROMPT = """You are a senior marketing AI quality assurance agent.
Your job is to independently review a campaign simulation output and assess its quality and internal consistency.
You did not generate this simulation — you are reviewing it cold.

Evaluate against these specific criteria:

1. FORECAST-PERSONA CONSISTENCY
   If most personas show low engagement or trust, the forecast should not be optimistic.
   If personas are enthusiastic, a pessimistic forecast is suspicious.
   Flag contradictions.

2. RISK SPECIFICITY
   Risks like "market competition", "changing consumer preferences", or "economic uncertainty"
   are generic and apply to every campaign. Flag any risk that is not specific to this
   particular campaign's copy, audience, platform, or objective.

3. RECOMMENDATION-WEAKNESS ALIGNMENT
   The recommendations should directly address the weaknesses found in Stage 1 (analysis).
   If the analysis says CTA is weak but no recommendation targets the CTA specifically, flag it.

4. PERSONA DIFFERENTIATION
   Three personas should represent genuinely different audience segments with different reactions.
   If two personas have nearly identical engagement/trust/conversion levels and objections, flag it.

5. OPTIMIZED COPY QUALITY
   The optimized copy should address the specific weaknesses identified. If it is only a surface
   reword of the original without structural improvement, flag it.

6. NARRATIVE COHERENCE
   The full report should tell one consistent story. An "overall_score" of 80/100 should not
   come with an ROI direction of "Negative". A "High" confidence level should not accompany
   five severe risks.

Be specific in your flags. Reference the actual content, not abstract concerns.
Do not flag things that are fine — only genuine quality issues.
A clean simulation with no issues should return an empty flags array and verdict "Pass".
"""

_QA_USER_TEMPLATE = """Review the following campaign simulation output:

{simulation_summary}

Return a JSON object with:
- verdict: "Pass" | "Partial Pass" | "Needs Improvement"
  - "Pass": no significant issues, simulation is internally consistent and specific
  - "Partial Pass": 1-2 minor flags, simulation is usable but has some weaknesses
  - "Needs Improvement": 3+ flags or any high-severity issue
- confidence_score: integer 0-100 representing your confidence in the simulation's quality
  (90-100 = excellent, 70-89 = good, 50-69 = acceptable, below 50 = poor)
- flags: array of objects, each with:
  - section: which section has the issue (e.g. "Forecast", "Risks", "Personas", "Recommendations", "Optimized Copy")
  - issue: specific description of the problem, referencing the actual content
  - severity: "low" | "medium" | "high"
- reviewer_notes: 2-3 sentence summary of the overall quality assessment
- approved: true if verdict is "Pass" or "Partial Pass", false if "Needs Improvement"
"""


async def run_qa_review(
    campaign: CampaignInput,
    result: SimulationResult,
) -> QAReview:
    simulation_summary = _build_simulation_summary(campaign, result)
    user_prompt = _QA_USER_TEMPLATE.format(simulation_summary=simulation_summary)

    response = await client.chat.completions.create(
        model=settings.openai_chat_model,
        messages=[
            {"role": "system", "content": _QA_SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        response_format={"type": "json_object"},
        max_completion_tokens=800,
    )

    data = json.loads(response.choices[0].message.content)
    flags = [QAFlag(**f) for f in data.get("flags", [])]

    return QAReview(
        verdict=data["verdict"],
        confidence_score=int(data["confidence_score"]),
        flags=flags,
        reviewer_notes=data["reviewer_notes"],
        approved=bool(data["approved"]),
    )
