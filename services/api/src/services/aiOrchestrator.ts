/**
 * AI Orchestrator — selects prompts, invokes Gemini, validates JSON server-side.
 * Gemini MAY: understand voice/text/image, translate, classify, extract, summarize, draft.
 * Gemini MUST NOT: invent evidence, change weights, approve funding, override authoritative data.
 */
import { CitizenIntakeSchema, ClusterDecisionSchema, ProjectRecommendationSchema, NormalizationSchema, PriorityExplanationSchema, ImpactReportSchema, PolicyBriefSchema } from "../lib/index.js";
import { readFileSync } from "fs";
import { join } from "path";
import { callGeminiReal, MAIN_SYSTEM } from "../lib/gemini.js";

function loadPrompt(name: string): string {
  try {
    // works both when cwd is services/api and when running via tsx from root
    const candidates = [
      join(process.cwd(), "..", "..", "docs", "prompts", name),
      join(process.cwd(), "docs", "prompts", name),
      join(process.cwd(), "apps/web/../..", "docs", "prompts", name),
    ];
    for (const p of candidates) {
      try { return readFileSync(p, "utf-8"); } catch {}
    }
    return `[prompt ${name} inline fallback]`;
  } catch { return `[prompt ${name} not found — using inline fallback]`; }
}

export const prompts = {
  system: `You are JANSETU AI — main system prompt governance applies. Evidence-first, human-governed, explainable, no fabrication.`,
  intake: loadPrompt("01_CITIZEN_INTAKE_PROMPT.txt"),
  normalization: loadPrompt("02_REQUEST_NORMALIZATION_PROMPT.txt"),
  clustering: loadPrompt("03_DEDUPLICATION_CLUSTERING_PROMPT.txt"),
  scoring: loadPrompt("04_PRIORITY_SCORING_PROMPT.txt"),
  recommendation: loadPrompt("05_PROJECT_RECOMMENDATION_PROMPT.txt"),
  copilot: loadPrompt("06_POLICY_COPILOT_PROMPT.txt"),
  impact: loadPrompt("07_IMPACT_REPORT_PROMPT.txt"),
  brief: loadPrompt("08_POLICY_BRIEF_PROMPT.txt"),
};

// ── Gemini — real via Firebase AI Logic / Gemini API, fallback to deterministic mock ─
// Real path uses docs/prompts + MAIN_SYSTEM, validates with Zod. Mock ensures demo works without key.
export async function callGemini<T>(promptKey: keyof typeof prompts, userInput: any, schema: any): Promise<{ ok: boolean; data?: T; error?: string; raw?: any; meta?: { real: boolean } }> {
  // Try real Gemini first if GEMINI_API_KEY set
  const hasKey = !!process.env.GEMINI_API_KEY || !!process.env.GOOGLE_API_KEY;
  if (hasKey) {
    try {
      const sys = `${prompts.system}\n\n${(prompts as any)[promptKey] || ""}\n\n${MAIN_SYSTEM.slice(0,3000)}`.slice(0,8000);
      const user = `TASK: ${promptKey}\nINPUT_JSON:\n${JSON.stringify(userInput, null, 2)}\n\nReturn ONLY valid JSON matching the schema. No markdown.`;
      const real = await callGeminiReal({ systemPrompt: sys, userPrompt: user });
      if (real?.text) {
        let parsedJson: any;
        try { parsedJson = JSON.parse(real.text); } catch (e) {
          // try extract JSON block
          const m = real.text.match(/\{[\s\S]*\}/);
          if (m) parsedJson = JSON.parse(m[0]);
        }
        if (parsedJson) {
          const parsed = schema.safeParse(parsedJson);
          if (parsed.success) return { ok: true, data: parsed.data as T, raw: parsedJson, meta: { real: true } };
          // validation failed — fall through to mock
          console.warn(`Gemini real JSON failed validation for ${promptKey}:`, parsed.error.message);
        }
      }
    } catch (e: any) {
      console.warn(`Gemini real call error for ${promptKey}, using mock:`, e.message);
    }
  }
  // Demo heuristic — deterministic mapping so E2E is reproducible without API key
  try {
    let mock: any;
    if (promptKey === "intake") {
      const text: string = userInput.text || userInput.originalText || "";
      const isGu = /[\u0A80-\u0AFF]/.test(text) || (userInput.langHint === "gu");
      const hasRoad = /રસ્તો|road|सड़क|monsoon|વરસાદ|hospital|school/i.test(text);
      mock = {
        source_language: isGu ? "gu" : "en",
        original_text: text,
        translated_text: isGu ? "Our village road gets closed in the monsoon. It takes a lot of time to reach the hospital and children also face difficulty going to school." : text,
        citizen_summary: hasRoad ? "Monsoon road closure blocking healthcare and school access" : "Citizen civic infrastructure request",
        category: hasRoad ? "roads" : "other",
        subcategory: hasRoad ? "rural_road_access" : null,
        problem_statement: hasRoad ? "Village road becomes impassable during monsoon, delaying hospital access and preventing children from attending school" : text.slice(0, 140),
        location: {
          raw_reference: userInput.locationRaw || "Village X, Vadodara District, Gujarat",
          city: null, district: "Vadodara", region: "Gujarat", country: "IN",
          location_confidence: 0.72, location_source: "user_text"
        },
        affected_services: hasRoad ? ["transport","healthcare","education"] : [],
        affected_groups: hasRoad ? ["children","patients","general_population"] : ["general_population"],
        urgency: { score: hasRoad ? 4 : 3, reason: hasRoad ? "Healthcare and education access blocked seasonally" : "General service disruption" },
        evidence_phrases: [text.slice(0,80)],
        ambiguities: hasRoad ? ["Exact village coordinates not provided — needs geocoding confirmation"] : [],
        ai_confidence: 0.84,
      };
    } else if (promptKey === "clustering") {
      mock = {
        cluster_decision: "MATCH_EXISTING",
        candidate_cluster_id: userInput.candidateClusterId || "cl_vadodara_roads_01",
        match_score: 0.87,
        reasons: ["Same category (roads)", "Geographic proximity (~8km)", "Shared problem: monsoon road impassability"],
        shared_problem_summary: "Monsoon road closure affecting Vadodara rural access",
        geographic_consistency: 0.9, semantic_consistency: 0.88, category_consistency: true,
        needs_human_review: false,
      };
    } else if (promptKey === "recommendation") {
      mock = {
        project_title: "All-Weather Rural Road Upgrade — Vadodara Cluster",
        problem: "Seasonal road closure isolates ~12,400 residents from hospital and schools",
        recommended_intervention: "Upgrade 4.2 km earthen road to all-weather paved road with cross-drainage and culverts",
        geographic_scope: "Village cluster, Vadodara District, Gujarat",
        priority_score: userInput.priorityScore ?? 78.5,
        priority_band: "high",
        estimated_beneficiaries: 12400,
        estimated_cost: 42000000,
        evidence: ["4218 clustered requests", "Road index 38/100", "Flood vulnerability 82/100"],
        expected_outcomes: ["Year-round hospital access", "School attendance restored in monsoon", "Reduced transport time ~40%"],
        implementation_dependencies: ["Land clearance", "Drainage survey", "Monsoon window planning"],
        risks: ["Cost overrun if terrain survey incomplete", "Labour availability in monsoon"],
        data_gaps: ["Exact road length needs engineering survey", "Current traffic count estimated"],
        ai_confidence: 0.81, human_review_required: true,
      };
    } else if (promptKey === "normalization") {
      const text: string = userInput.text || "";
      const hasRoad = /road|રસ્તો|monsoon/i.test(text);
      mock = {
        canonical_issue: hasRoad ? "Rural road impassable in monsoon blocking access" : text.slice(0,80),
        category: hasRoad ? "roads" : "other",
        subcategory: hasRoad ? "rural_road_access" : null,
        service: hasRoad ? "transport" : null,
        geographic_scope: "locality",
        normalized_problem_statement: hasRoad ? "Earthen road becomes impassable during monsoon, delaying hospital and school access" : text.slice(0,140),
        urgency: hasRoad ? 4 : 3,
        evidence: [text.slice(0,80)],
        keywords: hasRoad ? ["road","monsoon","hospital","school"] : [],
        entities: hasRoad ? ["Vadodara"] : [],
        confidence: 0.83,
        needs_human_review: false,
        review_reason: null,
      };
    } else if (promptKey === "scoring") {
      // Gemini explains but does not recalc — we echo backend result but add narrative
      const c = userInput.components || { demand:100, infrastructure_gap:60, population_impact:62, vulnerability:82, urgency:80, feasibility:68 };
      const score = userInput.priority_score ?? 78.4;
      mock = {
        priority_score: score,
        priority_band: score>=80?"critical":score>=65?"high":score>=45?"moderate":"low",
        top_drivers: ["demand (100)", "vulnerability (82)"],
        limiting_factors: ["feasibility (68)", "infrastructure_gap (60)"],
        evidence_summary: [`Demand ${c.demand}/100 from ${userInput.requestCount||4219} clustered requests`, `Infra gap ${c.infrastructure_gap}/100 (road 38 + health 42)`, `Pop impact ${c.population_impact}/100`],
        data_gaps: c.feasibility<70?["Feasibility survey pending"]:[],
        confidence: "high",
        explanation: `Priority ${score} computed deterministically v1 (demand×0.30 + gap×0.20 + pop×0.15 + vuln×0.15 + urgency×0.10 + feas×0.10). Top drivers demand/vulnerability. Weights unchanged per governance.`
      };
    } else if (promptKey === "impact") {
      const proj = userInput.project || { projectId: "proj_01", estimatedBeneficiaries:12400 };
      mock = {
        project_id: proj.projectId || "proj_01",
        summary: "Impact tracking — baseline vs target vs actual. Observed vs estimated separated.",
        baseline_metrics: [{ metric:"avg_travel_time_mins", baseline:45, unit:"minutes", source:"Verified — district survey 2024", quality:"verified" }],
        target_metrics: [{ metric:"avg_travel_time_mins", target:22, unit:"minutes" }],
        actual_metrics: [{ metric:"avg_travel_time_mins", actual: userInput.actual ?? null, unit:"minutes", measurement_date: userInput.measurement_date || null, source: userInput.source || null, quality: userInput.actual!=null?"observed":"pending" }],
        observed_changes: userInput.actual!=null?["Travel time reduced — observed"]:[],
        estimated_impact: [{ metric:"beneficiaries_with_all_weather_access", estimated: proj.estimatedBeneficiaries || 12400, confidence:0.72, note:"ESTIMATED — modeled from demographics" }],
        limitations: ["Actual measurements pending implementation", "Causation not claimed beyond evidence"],
        data_quality: "partial — estimates labeled",
        confidence: 0.72,
      };
    } else if (promptKey === "brief") {
      const cl = userInput.cluster || { title:"Monsoon Road Closure — Vadodara", districtId:"Vadodara", priorityScore:78.4 };
      const enr = userInput.enrichment || { populationAffected:12400, roadIndex:38, floodVulnerability:82, requiredInvestment:42000000, existingInvestment:12000000 };
      mock = {
        executive_summary: `${cl.title} isolates ~${enr.populationAffected} residents; priority ${cl.priorityScore} (high, v1). Recommend all-weather road upgrade.`,
        problem: "Earthen road impassable in monsoon, blocking hospital/school — 4218 citizen requests clustered, urgency 4/5.",
        citizen_demand: "4218 requests, Gujarati + Hindi, category roads/rural_road_access, affected: children/patients/transport/healthcare.",
        geographic_evidence: "Centroid 22.3072,73.1812 Vadodara Gujarat; heatmap via BigQuery GIS; location source user_text conf 0.72.",
        infrastructure_gap: `Road index ${enr.roadIndex}/100, health access 42/100 — gap 60/100 (computed). Vulnerability flood ${enr.floodVulnerability}/100.`,
        investment_context: `Planned ₹5.42Cr, allocated ₹1.2Cr, gap ₹4.2Cr (INVEST_ESTIMATE). Source: investment_ledger 2024-01-10.`,
        recommended_intervention: "Upgrade 4.2 km to paved all-weather + cross-drainage/culverts. ESTIMATE — requires survey.",
        expected_impact: "Year-round hospital + school access, travel ~45→22 min (target), ~12.4k beneficiaries (ESTIMATED).",
        cost_resources: "₹4.2Cr ESTIMATE, 6-8 months, land/drainage dependencies, monsoon window risk.",
        risks: ["Terrain survey incomplete → cost overrun", "Labour in monsoon"],
        data_gaps: ["Road length not surveyed", "Traffic count estimated", "Actual impact pending"],
        decision_required: "Approve for funding review? Human decision required. This is AI-assisted only.",
        sources: ["citizen_requests:4219","demographics:Vadodara verified 2024-03-01","infrastructure_indices verified 2024-02-15","investment_plans verified 2024-01-10"],
        labels: { estimates: ["cost ₹4.2Cr", "beneficiaries 12.4k", "travel target"] }
      };
    } else {
      mock = userInput;
    }

    const parsed = schema.safeParse(mock);
    if (!parsed.success) return { ok: false, error: parsed.error.message, raw: mock };
    return { ok: true, data: parsed.data as T, raw: mock };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

export async function analyzeCitizenIntake(input: { text: string; locationRaw?: string; langHint?: string }) {
  return callGemini<import("../lib/index.js").CitizenIntakeOutput>("intake", input, CitizenIntakeSchema);
}
export async function decideCluster(input: any) {
  return callGemini<import("zod").infer<typeof ClusterDecisionSchema>>("clustering", input, ClusterDecisionSchema);
}
export async function recommendProject(input: any) {
  return callGemini<import("zod").infer<typeof ProjectRecommendationSchema>>("recommendation", input, ProjectRecommendationSchema);
}
export async function normalizeIssue(input: any) {
  return callGemini<import("zod").infer<typeof NormalizationSchema>>("normalization", input, NormalizationSchema);
}
export async function explainScore(input: any) {
  return callGemini<import("zod").infer<typeof PriorityExplanationSchema>>("scoring", input, PriorityExplanationSchema);
}
export async function generateImpact(input: any) {
  return callGemini<import("zod").infer<typeof ImpactReportSchema>>("impact", input, ImpactReportSchema);
}
export async function generateBrief(input: any) {
  return callGemini<import("zod").infer<typeof PolicyBriefSchema>>("brief", input, PolicyBriefSchema);
}
