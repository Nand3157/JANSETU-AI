import { calculatePriorityScore, urgencyToScore, type PriorityComponents } from "../lib/index.js";
import { store } from "./store.js";

/**
 * Enrichment + Ranking Service
 * Joins citizen demand with BigQuery datasets (demographics, infra, investment)
 * then calculates deterministic priority via shared engine.
 */

interface Enrichment {
  populationAffected: number;
  roadIndex: number; // 0-100
  healthAccessIndex: number;
  floodVulnerability: number; // 0-100
  existingInvestment: number;
  requiredInvestment: number;
  requestCountInCluster: number;
}

// Demo enrichment table — in prod query BigQuery GIS
const demoEnrichment: Record<string, Enrichment> = {
  "Vadodara": {
    populationAffected: 12400,
    roadIndex: 38,
    healthAccessIndex: 42,
    floodVulnerability: 82,
    existingInvestment: 12000000,
    requiredInvestment: 42000000,
    requestCountInCluster: 4218,
  },
};

export function scoreCluster(clusterId: string) {
  const c = store.getCluster(clusterId);
  if (!c) throw new Error("cluster not found");

  const district = c.districtId || "Vadodara";
  const e = demoEnrichment[district] || demoEnrichment["Vadodara"];

  // Derive components 0-100
  const demand = Math.min(100, Math.round(30 + Math.log10(Math.max(1, c.requestCount)) * 22)); // e.g. 4218 → ~88
  const infrastructure_gap = Math.round(100 - ((e.roadIndex + e.healthAccessIndex) / 2)); // 38+42/2=40 → gap 60
  const population_impact = Math.min(100, Math.round((e.populationAffected / 20000) * 100)); // 12400→62
  const vulnerability = e.floodVulnerability; // 82
  // c.urgencyScore may be stored as 1-5 or already 0-100 mapped — normalize
  const rawUrg = (c.urgencyScore as number) || 4;
  const urgency = rawUrg > 5 ? rawUrg : urgencyToScore(rawUrg); // 4→80, fallback 80
  const feasibility = 68; // demo: moderate — TODO tie to investment gap + terrain

  const components: PriorityComponents = {
    demand, infrastructure_gap, population_impact, vulnerability, urgency, feasibility,
  };

  const result = calculatePriorityScore(components);
  const updated = store.updateCluster(clusterId, {
    demandScore: demand,
    infrastructureGapScore: infrastructure_gap,
    populationImpactScore: population_impact,
    vulnerabilityScore: vulnerability,
    urgencyScore: urgency,
    feasibilityScore: feasibility,
    populationAffected: e.populationAffected,
    investmentGapScore: Math.round(((e.requiredInvestment - e.existingInvestment) / e.requiredInvestment) * 100),
    priorityScore: result.priority_score,
    priorityBand: result.band,
    weightVersion: result.weightVersion,
    status: "scored",
    evidenceRefs: [`demographics:${district}`, `infrastructure:${district}`, `investment:${district}`],
  });

  // Also stamp priority onto member requests
  store.listRequests().filter(r => r.clusterId === clusterId).forEach(r => {
    store.updateRequest(r.requestId, { priorityScore: result.priority_score });
  });

  return { cluster: updated, result, enrichment: e };
}
