export interface PurposeContext {
  // Awareness — New Brand
  brandPersonality?: string[]
  coreMessage?: string
  // Awareness — Repositioning
  currentPerception?: string
  desiredPerception?: string
  repositionReason?: string
  // Awareness — Product Launch
  productDescription?: string
  targetSegment?: string
  productHook?: string
  // Consideration — Lead Generation
  leadOffers?: string[]
  postLeadFlow?: string
  currentCplBaseline?: number | null
  // Consideration — Engagement & Education
  educationGap?: string
  existingContent?: string
  existingContentUrl?: string
  // Consideration — Traffic & Intent
  destinationUrl?: string
  onSiteAction?: string
  // Conversion — Direct Purchase
  productName?: string
  pricePoint?: number | null
  targetType?: string
  targetValue?: number | null
  offerTypes?: string[]
  // Conversion — Sign-up / Trial / Install
  signupType?: string
  paymentRequired?: string
  currentCpiBaseline?: number | null
  // Conversion — Flash Sale
  promoOffer?: string
  promoStrength?: string
  promoStart?: string
  promoEnd?: string
  urgencyVisible?: string
}

export interface CampaignInput {
  goal: string              // 'awareness' | 'consideration' | 'conversion'
  sub_purpose: string       // e.g. 'new-brand', 'direct-purchase', 'flash-sale'
  purpose_context: PurposeContext
  channels: string[]        // e.g. ['meta', 'tiktok', 'google_search']
  target_audience: string
  budget: string            // formatted, e.g. '৳200,000'
  ad_copy: string
  image?: File
  // Derived / backward-compat (auto-filled from goal + first channel)
  objective?: string
  platform?: string
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
  roas_range?: string
}

export interface QAFlag {
  section: string
  issue: string
  severity: 'low' | 'medium' | 'high'
}

export interface QAReview {
  verdict: 'Pass' | 'Partial Pass' | 'Needs Improvement'
  confidence_score: number
  flags: QAFlag[]
  reviewer_notes: string
  approved: boolean
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
  qa_review?: QAReview
}
