"""
Train Random Forest model to predict CTR from campaign attributes.

Dataset: Global Ads Performance (Google, Meta, TikTok) — 1,800 rows
Key findings from EDA:
  - Platform is the dominant signal for CTR (Google ~4%, Meta ~2.5%, TikTok ~5.5%)
  - Budget tier is the second signal (low ~2.8%, enterprise ~4.8%)
  - Campaign type and industry add minimal predictive power in this dataset
  - ROAS is too noisy to model reliably (R²≈0) — use per-platform percentile bands instead

Strategy:
  - RF learns base CTR from platform + budget_tier
  - At inference, AI campaign_score shifts the prediction within the platform distribution
  - ROAS uses precomputed per-platform Q25/median/Q75 bands

Run from backend/ directory:
    python scripts/train_forecast_model.py
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import mean_absolute_error, r2_score

DATASET_PATH = "/home/alvi105/Projects/ai-buildfest/kaggle-datasets/Global Ads Performance (Google, Meta, TikTok)/global_ads_performance_dataset.csv"
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "../data/models")

BUDGET_BINS = [0, 500, 2000, 8000, float("inf")]
BUDGET_LABELS = ["low", "mid", "high", "enterprise"]


def load_and_engineer(path: str) -> pd.DataFrame:
    df = pd.read_csv(path)
    df["ctr_pct"] = df["CTR"] * 100
    df["budget_tier"] = pd.cut(df["ad_spend"], bins=BUDGET_BINS, labels=BUDGET_LABELS)
    df = df.dropna(subset=["budget_tier"])
    return df


def encode(df: pd.DataFrame, cols: list[str]) -> tuple[pd.DataFrame, dict]:
    encoders = {}
    for col in cols:
        le = LabelEncoder()
        df[col + "_enc"] = le.fit_transform(df[col].astype(str))
        encoders[col] = le
    return df, encoders


def train_ctr_model(df: pd.DataFrame, encoders: dict) -> RandomForestRegressor:
    feature_cols = ["platform_enc", "budget_tier_enc", "campaign_type_enc"]
    X = df[feature_cols]
    y = df["ctr_pct"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    model = RandomForestRegressor(
        n_estimators=300,
        max_depth=8,
        min_samples_leaf=5,
        n_jobs=-1,
        random_state=42,
    )
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    cv = cross_val_score(model, X, y, cv=5, scoring="r2")

    print(f"\n[CTR model — platform + budget_tier + campaign_type]")
    print(f"  MAE:             {mae:.3f}%")
    print(f"  R² (test):       {r2:.4f}")
    print(f"  R² (5-fold cv):  {cv.mean():.4f} ± {cv.std():.4f}")
    print(f"  Feature importances:")
    for feat, imp in sorted(zip(feature_cols, model.feature_importances_), key=lambda x: -x[1]):
        print(f"    {feat:<25} {imp:.4f}")

    return model


def compute_distribution_stats(df: pd.DataFrame) -> dict:
    """
    Precompute per-platform CTR and ROAS percentile bands.
    Used at inference to generate realistic ranges around the RF prediction.
    """
    stats = {}

    for platform in df["platform"].unique():
        pf = df[df["platform"] == platform]
        stats[platform] = {
            "ctr": {
                "q10": float(pf["ctr_pct"].quantile(0.10)),
                "q25": float(pf["ctr_pct"].quantile(0.25)),
                "q50": float(pf["ctr_pct"].quantile(0.50)),
                "q75": float(pf["ctr_pct"].quantile(0.75)),
                "q90": float(pf["ctr_pct"].quantile(0.90)),
                "std": float(pf["ctr_pct"].std()),
            },
            "roas": {
                "q10": float(pf["ROAS"].quantile(0.10)),
                "q25": float(pf["ROAS"].quantile(0.25)),
                "q50": float(pf["ROAS"].quantile(0.50)),
                "q75": float(pf["ROAS"].quantile(0.75)),
                "q90": float(pf["ROAS"].quantile(0.90)),
                "std": float(pf["ROAS"].std()),
            },
        }

    print("\n[Distribution stats per platform]")
    for platform, s in stats.items():
        print(f"  {platform}:")
        print(f"    CTR  Q25={s['ctr']['q25']:.2f}% Q50={s['ctr']['q50']:.2f}% Q75={s['ctr']['q75']:.2f}%")
        print(f"    ROAS Q25={s['roas']['q25']:.2f}x Q50={s['roas']['q50']:.2f}x Q75={s['roas']['q75']:.2f}x")

    return stats


def main():
    print("Loading dataset...")
    df = load_and_engineer(DATASET_PATH)
    print(f"Rows after cleaning: {len(df)}")

    cat_cols = ["platform", "budget_tier", "campaign_type"]
    df, encoders = encode(df, cat_cols)

    ctr_model = train_ctr_model(df, encoders)
    dist_stats = compute_distribution_stats(df)

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    joblib.dump(ctr_model, os.path.join(OUTPUT_DIR, "ctr_model.joblib"))
    joblib.dump(encoders, os.path.join(OUTPUT_DIR, "encoders.joblib"))
    with open(os.path.join(OUTPUT_DIR, "dist_stats.json"), "w") as f:
        json.dump(dist_stats, f, indent=2)

    print(f"\nSaved to {OUTPUT_DIR}/")
    print("  ctr_model.joblib")
    print("  encoders.joblib")
    print("  dist_stats.json")


if __name__ == "__main__":
    main()
