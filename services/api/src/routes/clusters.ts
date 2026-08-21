import { Router } from "express";
import { store } from "../services/store.js";
import { scoreCluster } from "../services/ranking.js";
import { explainPriorityScore } from "../lib/index.js";

export const clustersRouter = Router();

clustersRouter.get("/", (req, res) => {
  const { district, category } = req.query;
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

clustersRouter.post("/:id/score", (req, res) => {
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
  // reconstruct explanation from stored components
  const components = {
    demand: c.demandScore!, infrastructure_gap: c.infrastructureGapScore!,
    population_impact: c.populationImpactScore!, vulnerability: c.vulnerabilityScore!,
    urgency: c.urgencyScore!, feasibility: c.feasibilityScore!,
  };
  // use engine's explain
  const result: any = { priority_score: c.priorityScore, components, weights: { demand:0.3,infrastructure_gap:0.2,population_impact:0.15,vulnerability:0.15,urgency:0.1,feasibility:0.1 }, weightVersion: c.weightVersion, band: c.priorityBand, top_drivers: [], limiting_factors: [] };
  // compute drivers quickly
  const sorted = Object.entries(components).sort((a,b)=> (b[1]*0.2)-(a[1]*0.2));
  result.top_drivers = sorted.slice(0,2).map(([k,v])=>`${k} (${v})`);
  result.limiting_factors = [...sorted].reverse().slice(0,2).map(([k,v])=>`${k} (${v})`);
  const explained = explainPriorityScore(result);
  res.json({ clusterId: c.clusterId, priority_score: c.priorityScore, priority_band: c.priorityBand, weightVersion: c.weightVersion, components, ...explained });
});
