export interface CampaignInput {
  objective: string
  platform: string
  target_audience: string
  budget: string
  ad_copy: string
  image?: File
}

export interface PersonaReaction {
  persona_name: string
  persona_type: string
  engagement_likelihood: 'Low' | 'Medium' | 'High'
  emotional_reaction: string
  trust_level: 'Low' | 'Medium' | 'High'
  conversion_likelihood: 'Low' | 'Medium' | 'High'
  objections: string[]
}

export interface ForecastMetrics {
  ctr_range: string
  engagement_estimate: string
  conversion_trend: string
  confidence_level: 'Low' | 'Medium' | 'High'
  roi_direction: 'Negative' | 'Neutral' | 'Positive'
}

export interface DimensionScores {
  emotional_tone: number
  cta_strength: number
  audience_fit: number
  trust_signals: number
  clarity: number
  emotional_appeal: number
}

export interface CampaignAnalysis {
  emotional_tone: string
  cta_strength: string
  audience_fit: string
  trust_signals: string
  clarity: string
  emotional_appeal: string
  overall_score: number
  dimension_scores: DimensionScores
}

export interface Recommendation {
  improved_cta: string
  stronger_messaging: string
  audience_refinement: string
  platform_strategy: string
  optimization_tips: string[]
}

export interface SimulationResult {
  campaign_analysis: CampaignAnalysis
  personas: PersonaReaction[]
  forecast: ForecastMetrics
  risks: string[]
  recommendations: Recommendation
  optimized_copy?: string
  optimized_forecast?: ForecastMetrics
}
