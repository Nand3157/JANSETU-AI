/**
 * JANSETU AI — Canonical Types
 * Firestore + BigQuery + API shared contracts
 * Never store only final priority score — store every component.
 */

// ── Enums ──────────────────────────────────────────────────────
export type Category =
  | "transport" | "roads" | "water" | "sanitation" | "electricity"
  | "healthcare" | "education" | "housing" | "public_safety"
  | "digital_connectivity" | "environment" | "flooding_drainage"
  | "waste_management" | "public_spaces" | "other";

export type LocationSource = "device" | "user_text" | "geocoded" | "inferred";
export type ClusterDecision = "MATCH_EXISTING" | "CREATE_NEW" | "UNCERTAIN";
export type RequestStatus =
  | "received" | "ai_analyzed" | "clustered" | "priority_analyzed"
  | "government_review" | "project_proposed" | "implementation" | "impact";
export type RecommendationStatus = "draft" | "pending_review" | "approved" | "rejected";
export type UserRole = "citizen" | "analyst" | "policymaker" | "program_manager" | "admin" | "super_admin";

// ── Citizen Request ────────────────────────────────────────────
export interface CitizenRequest {
  requestId: string;
  userId: string;
  sourceChannel: "web" | "voice" | "whatsapp" | "sms";
  sourceLanguage: string;
  originalText: string;
  translatedText: string | null;
  audioUrl?: string | null;
  photoUrl?: string | null;
  latitude: number | null;
  longitude: number | null;
  locationSource: LocationSource | null;
  countryId: string;
  regionId: string | null;
  districtId: string | null;
  localityId: string | null;
  category: Category | null;
  subcategory: string | null;
  problemStatement: string | null;
  affectedServices: string[];
  affectedGroups: string[];
  urgencyScore: number | null; // 1-5
  aiConfidence: number | null; // 0-1
  clusterId: string | null;
  priorityScore: number | null;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
}

// ── Intake AI Output ───────────────────────────────────────────
export interface CitizenIntakeOutput {
  source_language: string;
  original_text: string;
  translated_text: string | null;
  citizen_summary: string;
  category: Category;
  subcategory: string | null;
  problem_statement: string;
  location: {
    raw_reference: string | null;
    city: string | null;
    district: string | null;
    region: string | null;
    country: string | null;
    location_confidence: number; // 0-1
    location_source: LocationSource;
  };
  affected_services: string[];
  affected_groups: string[];
  urgency: { score: number; reason: string };
  evidence_phrases: string[];
  ambiguities: string[];
  ai_confidence: number;
}

// ── Normalization ──────────────────────────────────────────────
export interface NormalizedIssue {
  canonical_issue: string;
  category: Category;
  subcategory: string | null;
  service: string | null;
  geographic_scope: "locality" | "district" | "region" | "country";
  normalized_problem_statement: string;
  urgency: number;
  evidence: string[];
  keywords: string[];
  entities: string[];
  confidence: number;
  needs_human_review: boolean;
  review_reason: string | null;
}

// ── Cluster ────────────────────────────────────────────────────
export interface RequestCluster {
  clusterId: string;
  countryId: string;
  regionId: string | null;
  districtId: string | null;
  category: Category;
  subcategory: string | null;
  title: string;
  summary: string;
  centroid: { lat: number; lng: number } | null;
  requestCount: number;
  populationAffected: number | null;
  // ── Deterministic scores (0-100 each) ──
  demandScore: number | null;
  infrastructureGapScore: number | null;
  populationImpactScore: number | null;
  vulnerabilityScore: number | null;
  urgencyScore: number | null;
  feasibilityScore: number | null;
  investmentGapScore: number | null;
  priorityScore: number | null;
  priorityBand: "critical" | "high" | "moderate" | "low" | null;
  weightVersion: string; // e.g. "v1"
  confidence: number | null;
  evidenceRefs: string[];
  dataGapRefs: string[];
  status: "open" | "scored" | "recommended" | "reviewed";
  createdAt: string;
  updatedAt: string;
}

export interface PriorityComponents {
  demand: number;            // 0-100
  infrastructure_gap: number;// 0-100
  population_impact: number; // 0-100
  vulnerability: number;     // 0-100
  urgency: number;           // 0-100 (mapped from 1-5)
  feasibility: number;       // 0-100
}

export interface PriorityScoreResult {
  priority_score: number; // 0-100 weighted
  components: PriorityComponents;
  weights: typeof DEFAULT_WEIGHTS;
  weightVersion: string;
  band: "critical" | "high" | "moderate" | "low";
  top_drivers: string[];
  limiting_factors: string[];
}

// ── Project ────────────────────────────────────────────────────
export interface Project {
  projectId: string;
  clusterId: string;
  title: string;
  description: string;
  countryId: string;
  regionId: string | null;
  districtId: string | null;
  latitude: number | null;
  longitude: number | null;
  estimatedCost: number | null;
  currency: string;
  estimatedBeneficiaries: number | null;
  priorityScore: number | null;
  recommendationStatus: RecommendationStatus;
  approvalStatus: "pending" | "approved" | "rejected" | null;
  fundingStatus: "unfunded" | "partial" | "funded" | null;
  implementationStatus: "proposed" | "in_progress" | "completed" | null;
  startDate: string | null;
  targetDate: string | null;
  completedDate: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── Default Weights (v1) ───────────────────────────────────────
export const DEFAULT_WEIGHTS = {
  demand: 0.30,
  infrastructure_gap: 0.20,
  population_impact: 0.15,
  vulnerability: 0.15,
  urgency: 0.10,
  feasibility: 0.10,
} as const;

export const WEIGHT_VERSION = "v1";

// Lexicon for urgency normalization 1-5 → 0-100
export const URGENCY_MAP: Record<number, number> = { 1: 20, 2: 40, 3: 60, 4: 80, 5: 100 };
