/**
 * JANSETU AI — Deterministic Priority Engine
 * Official score: backend-owned, auditable, versioned.
 * Gemini may EXPLAIN but never silently alter weights.
 *
 * Formula (v1):
 *  priority_score = demand*0.30 + infrastructure_gap*0.20
 *                 + population_impact*0.15 + vulnerability*0.15
 *                 + urgency*0.10 + feasibility*0.10
 *
 * All components 0-100. Store every component + weightVersion.
 */

import { DEFAULT_WEIGHTS, WEIGHT_VERSION, type PriorityComponents, type PriorityScoreResult } from "./types.js";

export function calculatePriorityScore(
  components: PriorityComponents,
  weights = DEFAULT_WEIGHTS,
  weightVersion = WEIGHT_VERSION
): PriorityScoreResult {
  // Validate 0-100
  for (const [k, v] of Object.entries(components)) {
    if (v < 0 || v > 100 || Number.isNaN(v)) {
      throw new Error(`Component ${k} out of range 0-100: ${v}`);
    }
  }
  const wSum = Object.values(weights).reduce((a, b) => a + b, 0);
  if (Math.abs(wSum - 1) > 0.001) throw new Error(`Weights must sum to 1, got ${wSum}`);

  const raw =
    components.demand * weights.demand +
    components.infrastructure_gap * weights.infrastructure_gap +
    components.population_impact * weights.population_impact +
    components.vulnerability * weights.vulnerability +
    components.urgency * weights.urgency +
    components.feasibility * weights.feasibility;

  const priority_score = Math.round(raw * 10) / 10; // 1 decimal

  // Band thresholds — aligned with PRD examples
  let band: PriorityScoreResult["band"] = "low";
  if (priority_score >= 80) band = "critical";
  else if (priority_score >= 65) band = "high";
  else if (priority_score >= 45) band = "moderate";

  // Drivers / limiters — sorted by weighted contribution
  const contributions = Object.entries(components).map(([k, v]) => ({
    key: k,
    weighted: v * (weights as Record<string, number>)[k],
    raw: v,
  }));
  contributions.sort((a, b) => b.weighted - a.weighted);
  const top_drivers = contributions.slice(0, 2).map((c) => `${c.key} (${c.raw})`);
  const limiting_factors = [...contributions].reverse().slice(0, 2).map((c) => `${c.key} (${c.raw})`);

  return {
    priority_score,
    components,
    weights,
    weightVersion,
    band,
    top_drivers,
    limiting_factors,
  };
}

export function urgencyToScore(urgency1to5: number): number {
  const map: Record<number, number> = { 1: 20, 2: 40, 3: 60, 4: 80, 5: 100 };
  return map[urgency1to5] ?? 60;
}

export function explainPriorityScore(result: PriorityScoreResult): {
  explanation: string;
  evidence_summary: string[];
  data_gaps: string[];
  confidence: "high" | "medium" | "low";
} {
  const { priority_score, band, top_drivers, limiting_factors, components } = result;
  const explanation =
    `Priority ${priority_score}/100 (${band}) computed deterministically (v${result.weightVersion}). ` +
    `Top drivers: ${top_drivers.join(", ")}. Limiting: ${limiting_factors.join(", ")}. ` +
    `Formula: demand×0.30 + infra_gap×0.20 + pop_impact×0.15 + vulnerability×0.15 + urgency×0.10 + feasibility×0.10.`;
  const evidence_summary = [
    `Demand ${components.demand}/100 from clustered citizen requests`,
    `Infrastructure Gap ${components.infrastructure_gap}/100 from infrastructure_indices`,
    `Population Impact ${components.population_impact}/100 from demographics`,
  ];
  const data_gaps: string[] = [];
  if (components.feasibility < 30) data_gaps.push("Feasibility data limited — implementation cost/terrain not verified");
  if (components.vulnerability < 30) data_gaps.push("Vulnerability index missing granular poverty/income breakdown");

  const avg = Object.values(components).reduce((a, b) => a + b, 0) / 6;
  const confidence = avg > 70 ? "high" : avg > 45 ? "medium" : "low";
  return { explanation, evidence_summary, data_gaps, confidence };
}
