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
// M-03 fix: add district-specific values for seeded clusters
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
  "Ahmedabad": {
    populationAffected: 18500,
    roadIndex: 55,
    healthAccessIndex: 48,
    floodVulnerability: 45,
    existingInvestment: 25000000,
    requiredInvestment: 38000000,
    requestCountInCluster: 892,
  },
  "Surat": {
    populationAffected: 22000,
    roadIndex: 42,
    healthAccessIndex: 35,
    floodVulnerability: 90,
    existingInvestment: 18000000,
    requiredInvestment: 55000000,
    requestCountInCluster: 1240,
  },
  "Rajkot": {
    populationAffected: 9800,
    roadIndex: 62,
    healthAccessIndex: 58,
    floodVulnerability: 30,
    existingInvestment: 15000000,
    requiredInvestment: 28000000,
    requestCountInCluster: 543,
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
  const vulnerability = e.floodVulnerability;
  // c.urgencyScore may be stored as 1-5 or already 0-100 mapped — normalize
  const rawUrg = (c.urgencyScore as number) || 4;
  const urgency = rawUrg > 5 ? rawUrg : urgencyToScore(rawUrg); // 4→80, fallback 80
  // H-06 fix: compute feasibility from investment gap + infra gap (deterministic)
  // Lower gap = higher feasibility; flood vulnerability reduces feasibility slightly
  const gapFactor = Math.max(0, 100 - Math.round(((e.requiredInvestment - e.existingInvestment) / e.requiredInvestment) * 100));
  const infraFactor = Math.round((e.roadIndex + e.healthAccessIndex) / 2);
  const vulnPenalty = Math.round(vulnerability * 0.15);
  const feasibility = Math.min(100, Math.max(20, Math.round((gapFactor * 0.5 + infraFactor * 0.5) - vulnPenalty * 0.3 + 50)));

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
