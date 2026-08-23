import { Router } from "express";
import { z } from "zod";
import { store } from "../services/store.js";
import { scoreCluster } from "../services/ranking.js";
import { explainPriorityScore } from "../lib/index.js";
import { requireRoles } from "../middleware/auth.js";

export const clustersRouter = Router();

// H-01/M-04 fix: query validation
const listQuerySchema = z.object({
  district: z.string().trim().max(64).optional(),
  category: z.enum(["transport","roads","water","sanitation","electricity","healthcare","education","housing","public_safety","digital_connectivity","environment","flooding_drainage","waste_management","public_spaces","other"]).optional(),
});

clustersRouter.get("/", (req, res) => {
  const parsed = listQuerySchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: "validation_failed", issues: parsed.error.issues });
  const { district, category } = parsed.data;
  let list = store.listClusters();
  if (district) list = list.filter(c => c.districtId === district);
  if (category) list = list.filter(c => c.category === category);
  // Default sort by priority
  list.sort((a,b) => (b.priorityScore||0)-(a.priorityScore||0));
  res.json({ clusters: list });
});

clustersRouter.get("/:id", (req, res) => {
  const c = store.getCluster(req.params.id);
  if (!c) return res.status(404).json({ error: "not found" });
  const requests = store.listRequests().filter(r => r.clusterId === c.clusterId);
  res.json({ cluster: c, requests, memberCount: requests.length });
});

clustersRouter.post("/:id/score", requireRoles("analyst", "policymaker", "admin", "super_admin", "program_manager"), (req, res) => {
  try {
    const { cluster, result, enrichment } = scoreCluster(req.params.id);
    const explained = explainPriorityScore(result);
    res.json({ cluster, priority: result, enrichment, explanation: explained,
      human_review_notice: "This is an AI-assisted recommendation based on the available evidence. Final prioritization, funding, and implementation decisions remain with the authorized public authority.",
    });
  } catch (e: any) { res.status(404).json({ error: e.message }); }
});

clustersRouter.get("/:id/explain", (req, res) => {
  const c = store.getCluster(req.params.id);
  if (!c || c.priorityScore == null) return res.status(404).json({ error: "cluster not scored" });
  // H-15 fix: check for null scores before reconstructing, and use real weights
  const missing = ["demandScore","infrastructureGapScore","populationImpactScore","vulnerabilityScore","urgencyScore","feasibilityScore"].filter(k => (c as any)[k] == null);
  if (missing.length) return res.status(500).json({ error: "cluster scoring incomplete", missing });
  // reconstruct explanation from stored components
  const components = {
    demand: c.demandScore!, infrastructure_gap: c.infrastructureGapScore!,
    population_impact: c.populationImpactScore!, vulnerability: c.vulnerabilityScore!,
    urgency: c.urgencyScore!, feasibility: c.feasibilityScore!,
  };
  const weights = { demand:0.3,infrastructure_gap:0.2,population_impact:0.15,vulnerability:0.15,urgency:0.1,feasibility:0.1 } as const;
  // use engine's explain
  const result: any = { priority_score: c.priorityScore, components, weights, weightVersion: c.weightVersion, band: c.priorityBand, top_drivers: [], limiting_factors: [] };
  // H-15 fix: sort by actual weighted contribution
  const weighted = Object.entries(components).map(([k,v]) => [k, v * (weights as any)[k]] as const);
  const sorted = weighted.sort((a,b)=> b[1]-a[1]);
  result.top_drivers = sorted.slice(0,2).map(([k,v])=>`${k} (${components[k as keyof typeof components]})`);
  result.limiting_factors = [...sorted].reverse().slice(0,2).map(([k,v])=>`${k} (${components[k as keyof typeof components]})`);
  const explained = explainPriorityScore(result);
  res.json({ clusterId: c.clusterId, priority_score: c.priorityScore, priority_band: c.priorityBand, weightVersion: c.weightVersion, components, ...explained });
});
