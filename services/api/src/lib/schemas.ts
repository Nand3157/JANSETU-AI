import { z } from "zod";

// Validates AI JSON before backend persists — never trust frontend/Gemini blindly
export const CitizenIntakeSchema = z.object({
  source_language: z.string().min(2),
  original_text: z.string().min(1),
  translated_text: z.string().nullable(),
  citizen_summary: z.string().min(1),
  category: z.enum([
    "transport","roads","water","sanitation","electricity","healthcare","education",
    "housing","public_safety","digital_connectivity","environment","flooding_drainage",
    "waste_management","public_spaces","other"
  ]),
  subcategory: z.string().nullable(),
  problem_statement: z.string().min(1),
  location: z.object({
    raw_reference: z.string().nullable(),
    city: z.string().nullable(),
    district: z.string().nullable(),
    region: z.string().nullable(),
    country: z.string().nullable(),
    location_confidence: z.number().min(0).max(1),
    location_source: z.enum(["device","user_text","geocoded","inferred"]),
  }),
  affected_services: z.array(z.string()),
  affected_groups: z.array(z.string()),
  urgency: z.object({ score: z.number().int().min(1).max(5), reason: z.string() }),
  evidence_phrases: z.array(z.string()),
  ambiguities: z.array(z.string()),
  ai_confidence: z.number().min(0).max(1),
});

export const PriorityComponentsSchema = z.object({
  demand: z.number().min(0).max(100),
  infrastructure_gap: z.number().min(0).max(100),
  population_impact: z.number().min(0).max(100),
  vulnerability: z.number().min(0).max(100),
  urgency: z.number().min(0).max(100),
  feasibility: z.number().min(0).max(100),
});

export const ClusterDecisionSchema = z.object({
  cluster_decision: z.enum(["MATCH_EXISTING","CREATE_NEW","UNCERTAIN"]),
  candidate_cluster_id: z.string().nullable(),
  match_score: z.number().min(0).max(1),
  reasons: z.array(z.string()),
  shared_problem_summary: z.string().nullable(),
  geographic_consistency: z.number().min(0).max(1),
  semantic_consistency: z.number().min(0).max(1),
  category_consistency: z.boolean(),
  needs_human_review: z.boolean(),
});

export const ProjectRecommendationSchema = z.object({
  project_title: z.string().min(1),
  problem: z.string().min(1),
  recommended_intervention: z.string().min(1),
  geographic_scope: z.string(),
  priority_score: z.number().nullable(),
  priority_band: z.string().nullable(),
  estimated_beneficiaries: z.number().nullable(),
  estimated_cost: z.number().nullable(),
  evidence: z.array(z.string()),
  expected_outcomes: z.array(z.string()),
  implementation_dependencies: z.array(z.string()),
  risks: z.array(z.string()),
  data_gaps: z.array(z.string()),
  ai_confidence: z.number().min(0).max(1),
  human_review_required: z.boolean(),
});

export const NormalizationSchema = z.object({
  canonical_issue: z.string().min(1),
  category: z.enum(["transport","roads","water","sanitation","electricity","healthcare","education","housing","public_safety","digital_connectivity","environment","flooding_drainage","waste_management","public_spaces","other"]),
  subcategory: z.string().nullable(),
  service: z.string().nullable(),
  geographic_scope: z.enum(["locality","district","region","country"]),
  normalized_problem_statement: z.string().min(1),
  urgency: z.number().int().min(1).max(5),
  evidence: z.array(z.string()),
  keywords: z.array(z.string()),
  entities: z.array(z.string()),
  confidence: z.number().min(0).max(1),
  needs_human_review: z.boolean(),
  review_reason: z.string().nullable(),
});

export const PriorityExplanationSchema = z.object({
  priority_score: z.number().min(0).max(100),
  priority_band: z.enum(["critical","high","moderate","low"]),
  top_drivers: z.array(z.string()),
  limiting_factors: z.array(z.string()),
  evidence_summary: z.array(z.string()),
  data_gaps: z.array(z.string()),
  confidence: z.enum(["high","medium","low"]),
  explanation: z.string(),
});

export const PolicyCopilotSchema = z.object({
  answer: z.string(),
  evidence: z.array(z.string()),
  data_gaps: z.array(z.string()),
  source: z.string(),
  confidence: z.number().min(0).max(1),
});

export const ImpactReportSchema = z.object({
  project_id: z.string(),
  summary: z.string(),
  baseline_metrics: z.array(z.object({ metric: z.string(), baseline: z.number().nullable(), unit: z.string(), source: z.string().nullable(), quality: z.string().optional() })),
  target_metrics: z.array(z.object({ metric: z.string(), target: z.number().nullable(), unit: z.string() })),
  actual_metrics: z.array(z.object({ metric: z.string(), actual: z.number().nullable(), unit: z.string(), measurement_date: z.string().nullable(), source: z.string().nullable(), quality: z.string().nullable() })),
  observed_changes: z.array(z.string()),
  estimated_impact: z.array(z.object({ metric: z.string(), estimated: z.number().nullable(), confidence: z.number().optional(), note: z.string().optional() })),
  limitations: z.array(z.string()),
  data_quality: z.string(),
  confidence: z.number().min(0).max(1),
});

export const PolicyBriefSchema = z.object({
  executive_summary: z.string(),
  problem: z.string(),
  citizen_demand: z.string(),
  geographic_evidence: z.string(),
  infrastructure_gap: z.string(),
  investment_context: z.string(),
  recommended_intervention: z.string(),
  expected_impact: z.string(),
  cost_resources: z.string(),
  risks: z.array(z.string()),
  data_gaps: z.array(z.string()),
  decision_required: z.string(),
  sources: z.array(z.string()),
  labels: z.object({ estimates: z.array(z.string()).optional() }).optional(),
});
