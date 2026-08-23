import { Router } from "express";
import { z } from "zod";
import { store } from "../services/store.js";
import { simulateBudget } from "../services/budget.js";
import { generateBrief } from "../services/aiOrchestrator.js";
import { districtFact, govSourcesStatus } from "../services/govData.js";

export const copilotRouter = Router();

const copilotSchema = z.object({
  question: z.string().trim().max(2000).optional(),
  filters: z.record(z.any()).optional(),
  budget: z.union([z.string().max(64), z.number().finite()]).optional(),
  objective: z.enum(["max_priority", "max_beneficiaries", "equity", "infra_gap", "balanced"]).optional(),
  risk_tolerance: z.enum(["low", "medium", "high"]).optional(),
});
const simulateSchema = z.object({
  budget: z.union([z.string().max(64), z.number().finite()]),
  objective: z.enum(["max_priority", "max_beneficiaries", "equity", "infra_gap", "balanced"]).optional().default("max_priority"),
  risk_tolerance: z.enum(["low", "medium", "high"]).optional().default("medium"),
});

/**
 * Policy Copilot — answers ONLY from supplied structured datasets.
 * Never fabricate. Ground in clusters, projects, investment_plans.
 */

copilotRouter.post("/", async (req, res) => {
  const parsed = copilotSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "validation_failed", issues: parsed.error.issues });
  const { question, filters, budget, objective, risk_tolerance } = parsed.data;
  // Structured budget simulator takes precedence if budget provided
  if (budget != null) {
    const parseRes = parseBudgetINR(typeof budget === "string" ? budget : String(budget));
    if (parseRes.error) return res.status(400).json({ error: "validation_failed", detail: parseRes.error });
    const numBudget = parseRes.value!;
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
    for (const w of worst) {
      const f = districtFact(w.districtId);
      if (f) evidence.push(`REAL: Census of India 2011 · ${f.district} pop ${f.population.toLocaleString("en-IN")} — ${f.verifyUrl}`);
    }
  } else if (q.includes("budget") || q.includes("₹") || q.includes("cr")) {
    const parseRes = parseBudgetINR(question);
    if (parseRes.error) {
      return res.json({ answer: `Could not parse budget from question — ${parseRes.error}. Please specify like "₹10 Cr" or "25 lakh".`, evidence: [], data_gaps: ["Budget amount not recognized"], source: "Verified datasets — no fabrication", confidence: 0.5, human_review_notice: "This is an AI-assisted recommendation based on the available evidence. Final prioritization, funding, and implementation decisions remain with the authorized public authority." });
    }
    const numBudget = parseRes.value!;
    const simulated = simulateBudget({ budget: numBudget, objective: "max_priority", risk_tolerance: "medium" });
    return res.json(simulated);
  } else if (q.includes("evidence") || q.includes("support")) {
    const sources = govSourcesStatus();
    answer = `Evidence: ${clusters.length} clusters from ${store.listRequests().length} citizen requests, joined with demographics + infrastructure_indices + investment_plans. Every priority score stores 6 components + weightVersion v1. Real GoI sources: ${sources.filter(s=> s.mode!=="not_configured").map(s=> s.label).join(" · ")}.`;
    evidence.push("FACTS: citizen_requests, request_clusters, infrastructure_indices");
    evidence.push(...sources.filter(s=> s.mode!=="not_configured").map(s=> `REAL: ${s.label} (${s.publisher})`));
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
  const parsed = simulateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error:"validation_failed", issues: parsed.error.issues });
  const { budget, objective, risk_tolerance } = parsed.data;
  let numBudget: number;
  if (typeof budget === "string") {
    const pr = parseBudgetINR(budget);
    if (pr.error) return res.status(400).json({ error: "validation_failed", detail: pr.error });
    numBudget = pr.value!;
  } else {
    numBudget = Number(budget);
    if (!Number.isFinite(numBudget) || numBudget <= 0) return res.status(400).json({ error: "validation_failed", detail: "budget must be a positive finite number" });
  }
  const result = simulateBudget({ budget: numBudget, objective, risk_tolerance });
  res.json(result);
});

// H-07 fix: strict parsing — return error instead of silent 10Cr default
function parseBudgetINR(q: string): { value: number | null; error: string | null } {
  const cr = q.match(/(\d+(?:\.\d+)?)\s*cr/i);
  if (cr) {
    const v = parseFloat(cr[1]);
    if (!Number.isFinite(v) || v <= 0) return { value: null, error: "budget Cr value must be positive" };
    return { value: v * 1e7, error: null };
  }
  const lakh = q.match(/(\d+(?:\.\d+)?)\s*lakh/i);
  if (lakh) {
    const v = parseFloat(lakh[1]);
    if (!Number.isFinite(v) || v <= 0) return { value: null, error: "budget lakh value must be positive" };
    return { value: v * 1e5, error: null };
  }
  // If question contains rupee symbol/numbers but no unit, try plain number
  const plain = q.match(/₹\s*(\d+(?:,\d+)*(?:\.\d+)?)/);
  if (plain) {
    const v = parseFloat(plain[1].replace(/,/g, ""));
    if (Number.isFinite(v) && v > 0) return { value: v, error: null };
  }
  // No recognizable budget — return error instead of silent default
  // Check if caller expected a budget parse (question mentions budget/cr/lakh/rupee)
  const hasBudgetIntent = /budget|₹|cr|lakh|rupee/i.test(q);
  if (hasBudgetIntent) return { value: null, error: `Could not parse budget amount from "${q.slice(0,80)}" — use format like "10 Cr", "25 lakh", or "₹10000000"` };
  return { value: null, error: `No budget amount found in "${q.slice(0,80)}"` };
}
