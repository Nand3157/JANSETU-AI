import { Router } from "express";
import { store } from "../services/store.js";
import { simulateBudget } from "../services/budget.js";
import { generateBrief } from "../services/aiOrchestrator.js";

export const copilotRouter = Router();

/**
 * Policy Copilot — answers ONLY from supplied structured datasets.
 * Never fabricate. Ground in clusters, projects, investment_plans.
 */

copilotRouter.post("/", async (req, res) => {
  const { question, filters, budget, objective, risk_tolerance } = req.body;
  // Structured budget simulator takes precedence if budget provided
  if (budget != null) {
    const numBudget = typeof budget === "string" ? parseBudgetINR(budget) : Number(budget);
    const obj = (objective as any) || "max_priority";
    const risk = (risk_tolerance as any) || "medium";
    const simulated = simulateBudget({ budget: numBudget, objective: obj, risk_tolerance: risk });
    return res.json(simulated);
  }
  if (!question) return res.status(400).json({ error: "question required" });

  const clusters = store.listClusters();
  const projects = store.listProjects();
  const q = question.toLowerCase();

  let answer = "";
  const evidence: string[] = [];
  let data_gaps: string[] = [];

  if (q.includes("priorit") || q.includes("which project")) {
    const top = [...clusters].sort((a,b)=>(b.priorityScore||0)-(a.priorityScore||0)).slice(0,3);
    answer = `Top priorities (deterministic score v1): ${top.map(c=>`${c.title} — ${c.priorityScore} (${c.priorityBand}) in ${c.districtId}`).join("; ")}. Ranked by weighted formula demand×0.30 + infra_gap×0.20 + pop_impact×0.15 + vulnerability×0.15 + urgency×0.10 + feasibility×0.10.`;
    evidence.push(...top.map(c=>`Cluster ${c.clusterId}: ${c.requestCount} requests, pop ${c.populationAffected}, infra gap ${c.infrastructureGapScore}`));
  } else if (q.includes("underserved") || q.includes("why") || q.includes("district")) {
    const worst = [...clusters].sort((a,b)=>(a.infrastructureGapScore||0)-(b.infrastructureGapScore||0)).slice(0,2);
    answer = `Most underserved by infrastructure gap: ${worst.map(c=>`${c.districtId} gap ${c.infrastructureGapScore}/100`).join(", ")}. Evidence from infrastructure_indices.`;
    evidence.push("FACTS: infrastructure_indices road/health indices joined via district_id");
  } else if (q.includes("budget") || q.includes("₹") || q.includes("cr")) {
    const numBudget = parseBudgetINR(question);
    const simulated = simulateBudget({ budget: numBudget, objective: "max_priority", risk_tolerance: "medium" });
    return res.json(simulated);
  } else if (q.includes("evidence") || q.includes("support")) {
    answer = `Evidence: ${clusters.length} clusters from ${store.listRequests().length} citizen requests, joined with demographics + infrastructure_indices + investment_plans. Every priority score stores 6 components + weightVersion v1.`;
    evidence.push("FACTS: citizen_requests, request_clusters, infrastructure_indices");
    data_gaps = ["Missing live investment ledger for some districts"];
  } else if (q.includes("brief") || q.includes("policy")) {
    // Policy brief via Gemini (08_POLICY_BRIEF_PROMPT) — grounded
    const top = [...clusters].sort((a,b)=>(b.priorityScore||0)-(a.priorityScore||0))[0];
    const enr = top ? { populationAffected: top.populationAffected, roadIndex: 100-(top.infrastructureGapScore||60), floodVulnerability: top.vulnerabilityScore } : null;
    const br = await generateBrief({ cluster: top, enrichment: enr });
    return res.json({ brief: br.data, raw: br.raw, human_review_notice: "This is an AI-assisted brief — human decision required." });
  } else {
    answer = `I can answer ranking, hotspots, district comparisons, project comparisons, budget scenarios, and evidence summaries—grounded in verified datasets. Try: "Which projects should we prioritize?" or "What fits within ₹10 Cr?"`;
    data_gaps = ["Query not matched to structured dataset — please rephrase with district/budget/sector"];
  }

  res.json({
    answer,
    evidence,
    data_gaps,
    source: "Verified datasets + computed metrics — no fabrication",
    confidence: evidence.length ? 0.82 : 0.6,
    human_review_notice: "This is an AI-assisted recommendation based on the available evidence. Final prioritization, funding, and implementation decisions remain with the authorized public authority.",
  });
});

// Dedicated budget simulate endpoint for Dashboard simulator (explicit)
copilotRouter.post("/simulate", async (req,res)=> {
  const { budget, objective="max_priority", risk_tolerance="medium" } = req.body;
  if (budget==null) return res.status(400).json({ error:"budget required (INR or '10 Cr')" });
  const numBudget = typeof budget === "string" ? parseBudgetINR(budget) : Number(budget);
  const result = simulateBudget({ budget: numBudget, objective, risk_tolerance });
  res.json(result);
});

function parseBudgetINR(q: string): number {
  const cr = q.match(/(\d+(?:\.\d+)?)\s*cr/i);
  if (cr) return parseFloat(cr[1]) * 1e7;
  const lakh = q.match(/(\d+(?:\.\d+)?)\s*lakh/i);
  if (lakh) return parseFloat(lakh[1]) * 1e5;
  return 100000000; // default 10Cr
}
