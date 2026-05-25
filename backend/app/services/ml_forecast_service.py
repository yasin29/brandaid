"""
ML-backed CTR and ROAS forecast using a Random Forest trained on 1,800 real ad records
(Global Ads Performance dataset — Google, Meta, TikTok).

At inference:
  1. RF predicts base CTR from platform + budget_tier + campaign_type
  2. campaign_score (0-100 from AI analysis) maps to a percentile position in the
     platform's distribution, shifting the range up or down accordingly
  3. ROAS uses precomputed per-platform Q25/Q75 bands (model R²≈0, stats more reliable)
"""

import json
import os
import re

import joblib
import numpy as np

_MODEL_DIR = os.path.join(os.path.dirname(__file__), "../../data/models")

_ctr_model = None
_encoders: dict = {}
_dist_stats: dict = {}
_loaded = False


def _load_models() -> None:
    global _ctr_model, _encoders, _dist_stats, _loaded
    if _loaded:
        return
    _ctr_model = joblib.load(os.path.join(_MODEL_DIR, "ctr_model.joblib"))
    _encoders = joblib.load(os.path.join(_MODEL_DIR, "encoders.joblib"))
    with open(os.path.join(_MODEL_DIR, "dist_stats.json")) as f:
        _dist_stats = json.load(f)
    _loaded = True


# ── Platform mapping ──────────────────────────────────────────────────────────

_PLATFORM_MAP = {
    "instagram": "Meta Ads",
    "facebook": "Meta Ads",
    "meta": "Meta Ads",
    "tiktok": "TikTok Ads",
    "google": "Google Ads",
    "youtube": "Google Ads",
    "linkedin": "Meta Ads",  # ML model has no LinkedIn encoder; Meta is closest
    "twitter": "Meta Ads",   # same
    "x": "Meta Ads",
}

# Separate map for dist_stats lookup — LinkedIn and Twitter/X have their own benchmark stats
_DIST_STATS_MAP = {
    "instagram": "Meta Ads",
    "facebook": "Meta Ads",
    "meta": "Meta Ads",
    "tiktok": "TikTok Ads",
    "google": "Google Ads",
    "youtube": "Google Ads",
    "linkedin": "LinkedIn",
    "twitter": "Twitter/X",
    "x": "Twitter/X",
}

def _map_platform(platform: str) -> str:
    key = platform.lower().strip()
    for k, v in _PLATFORM_MAP.items():
        if k in key:
            return v
    return "Meta Ads"

def _map_dist_key(platform: str) -> str:
    key = platform.lower().strip()
    for k, v in _DIST_STATS_MAP.items():
        if k in key:
            return v
    return "Meta Ads"


# ── Campaign type mapping (from objective string) ─────────────────────────────

def _map_campaign_type(objective: str) -> str:
    obj = objective.lower()
    if any(w in obj for w in ["search", "lead", "traffic", "click"]):
        return "Search"
    if any(w in obj for w in ["video", "view", "awareness", "reach", "brand"]):
        return "Video"
    if any(w in obj for w in ["shop", "sale", "purchase", "convert", "ecomm"]):
        return "Shopping"
    return "Display"


# ── Budget parsing ────────────────────────────────────────────────────────────

def _parse_budget(budget: str) -> float:
    """Extract a numeric value from budget strings like '$5,000' or '5000/month'."""
    digits = re.sub(r"[^\d.]", "", budget.replace(",", ""))
    try:
        return float(digits)
    except ValueError:
        return 1000.0  # mid-tier default


def _budget_tier(amount: float) -> str:
    if amount < 500:
        return "low"
    if amount < 2000:
        return "mid"
    if amount < 8000:
        return "high"
    return "enterprise"


# ── Safe label encoding (handles unseen labels) ───────────────────────────────

def _safe_encode(encoder, value: str) -> int:
    classes = list(encoder.classes_)
    return classes.index(value) if value in classes else 0


# ── Range generation ──────────────────────────────────────────────────────────

def _ctr_range(base_ctr: float, platform_key: str, campaign_score: int) -> tuple[float, float]:
    """
    Build a CTR range by blending the RF prediction with the platform distribution.
    campaign_score (0-100) determines where in the distribution we expect to land:
      - 0-40  → bottom quartile  (Q10–Q50)
      - 40-70 → middle           (Q25–Q75)
      - 70-100 → upper quartile  (Q50–Q90)
    """
    pf = _dist_stats.get(platform_key, {}).get("ctr", {})
    if not pf:
        spread = base_ctr * 0.35
        return round(max(0.1, base_ctr - spread), 2), round(base_ctr + spread, 2)

    if campaign_score >= 70:
        lo = (pf["q50"] + base_ctr) / 2
        hi = pf["q90"]
    elif campaign_score >= 40:
        lo = (pf["q25"] + base_ctr) / 2
        hi = (pf["q75"] + base_ctr) / 2
    else:
        lo = pf["q10"]
        hi = (pf["q50"] + base_ctr) / 2

    return round(max(0.1, lo), 2), round(hi, 2)


def _roas_range(platform_key: str, campaign_score: int) -> tuple[float, float]:
    """Platform Q-band for ROAS, shifted by campaign_score."""
    pf = _dist_stats.get(platform_key, {}).get("roas", {})
    if not pf:
        return 2.0, 5.0

    if campaign_score >= 70:
        return round(pf["q50"], 2), round(pf["q90"], 2)
    elif campaign_score >= 40:
        return round(pf["q25"], 2), round(pf["q75"], 2)
    else:
        return round(pf["q10"], 2), round(pf["q50"], 2)


# ── Public API ────────────────────────────────────────────────────────────────

class MLForecast:
    ctr_low: float
    ctr_high: float
    roas_low: float
    roas_high: float
    platform_used: str
    budget_tier: str

    def __init__(self, ctr_low, ctr_high, roas_low, roas_high, platform_used, budget_tier):
        self.ctr_low = ctr_low
        self.ctr_high = ctr_high
        self.roas_low = roas_low
        self.roas_high = roas_high
        self.platform_used = platform_used
        self.budget_tier = budget_tier

    @property
    def ctr_range_str(self) -> str:
        return f"{self.ctr_low:.1f}%–{self.ctr_high:.1f}%"

    @property
    def roas_range_str(self) -> str:
        return f"{self.roas_low:.1f}x–{self.roas_high:.1f}x"

    @property
    def roi_direction(self) -> str:
        """
        Derive ROI direction from ML-predicted ROAS midpoint.
        Thresholds reflect typical margin requirements:
          <2.0x  → Negative  (most business models lose money below 2x ROAS)
          2.0–4.0x → Neutral  (breakeven to marginally profitable)
          >4.0x  → Positive
        """
        mid = (self.roas_low + self.roas_high) / 2
        if mid < 2.0:
            return "Negative"
        if mid < 4.0:
            return "Neutral"
        return "Positive"


def predict(platform: str, objective: str, budget: str, campaign_score: int) -> MLForecast:
    _load_models()

    platform_key = _map_platform(platform)   # for ML model encoding
    dist_key = _map_dist_key(platform)       # for dist_stats lookup (LinkedIn/Twitter have own stats)
    campaign_type = _map_campaign_type(objective)
    budget_amount = _parse_budget(budget)
    tier = _budget_tier(budget_amount)

    platform_enc = _safe_encode(_encoders["platform"], platform_key)
    budget_enc = _safe_encode(_encoders["budget_tier"], tier)
    campaign_type_enc = _safe_encode(_encoders["campaign_type"], campaign_type)

    import pandas as pd
    X = pd.DataFrame(
        [[platform_enc, budget_enc, campaign_type_enc]],
        columns=["platform_enc", "budget_tier_enc", "campaign_type_enc"],
    )
    base_ctr = float(_ctr_model.predict(X)[0])

    ctr_lo, ctr_hi = _ctr_range(base_ctr, dist_key, campaign_score)
    roas_lo, roas_hi = _roas_range(dist_key, campaign_score)

    return MLForecast(
        ctr_low=ctr_lo,
        ctr_high=ctr_hi,
        roas_low=roas_lo,
        roas_high=roas_hi,
        platform_used=dist_key,
        budget_tier=tier,
    )
