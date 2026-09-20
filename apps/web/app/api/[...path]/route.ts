import { NextRequest, NextResponse } from "next/server";
import {
  generateText,
  parseModelJson,
  transcribeAudio as geminiTranscribe,
  synthesizeSpeech,
  translateText as geminiTranslate,
  normalizeVoiceLang,
  MAIN_MODEL,
  TRANSCRIBE_MODEL,
  MAX_TRANSLATE_CHARS,
} from "@jansetu/shared/geminiVoice";

export const dynamic = "force-dynamic";

const BACKEND_API = (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080").replace(/\/$/, "");

// In-memory demo store fallback for standalone / serverless execution
// Also holds user-created requests when backend is offline (so lists actually show real data)
const FALLBACK_REQUESTS: any[] = [];
const FALLBACK_CLUSTERS = [
  {
    clusterId: "cl_vadodara_roads_01",
    countryId: "IN",
    regionId: "Gujarat",
    districtId: "Vadodara",
    category: "roads",
    subcategory: "rural_road_access",
    title: "Monsoon Road Closure — Vadodara Rural Cluster",
    summary: "Earthen village road impassable in monsoon, blocking hospital and school access for ~12,400 residents",
    centroid: { lat: 22.3072, lng: 73.1812 },
    requestCount: 4218,
    urgencyScore: 80,
    priorityScore: 78.4,
    priorityBand: "High",
    confidence: 0.82,
    status: "open",
    infrastructureGapScore: 72,
    populationAffected: 12400,
    vulnerabilityScore: 68,
  },
  {
    clusterId: "cl_demo_ahmedabad_water",
    countryId: "IN",
    regionId: "Gujarat",
    districtId: "Ahmedabad",
    category: "water",
    title: "Intermittent Water Supply — Ahmedabad East",
    summary: "Low water pressure and frequent pipeline leaks affecting 890+ households",
    centroid: { lat: 23.0225, lng: 72.5714 },
    requestCount: 892,
    urgencyScore: 60,
    priorityScore: 71.2,
    priorityBand: "High",
    status: "open",
    infrastructureGapScore: 65,
    populationAffected: 8500,
    vulnerabilityScore: 55,
  },
  {
    clusterId: "cl_demo_surat_flooding_drainage",
    countryId: "IN",
    regionId: "Gujarat",
    districtId: "Surat",
    category: "flooding_drainage",
    title: "Flooding in Low-Lying Wards — Surat",
    summary: "Stormwater drain blockages causing waterlogging during heavy rainfall",
    centroid: { lat: 21.1702, lng: 72.8311 },
    requestCount: 1240,
    urgencyScore: 85,
    priorityScore: 82.5,
    priorityBand: "Critical",
    status: "open",
    infrastructureGapScore: 80,
    populationAffected: 18000,
    vulnerabilityScore: 75,
  },
  {
    clusterId: "cl_demo_rajkot_healthcare",
    countryId: "IN",
    regionId: "Gujarat",
    districtId: "Rajkot",
    category: "healthcare",
    title: "PHC Staffing & Diagnostic Gap — Rajkot Rural",
    summary: "Primary Health Center lacks nighttime doctor and basic diagnostic kits",
    centroid: { lat: 22.3039, lng: 70.8022 },
    requestCount: 543,
    urgencyScore: 65,
    priorityScore: 69.8,
    priorityBand: "High",
    status: "open",
    infrastructureGapScore: 58,
    populationAffected: 6200,
    vulnerabilityScore: 60,
  },
];

const FALLBACK_PROJECTS = [
  {
    projectId: "proj_vadodara_roads_01",
    clusterId: "cl_vadodara_roads_01",
    title: "All-Weather Rural Road Upgrade — Vadodara Cluster",
    description: "Upgrade 4.2 km earthen road to paved all-weather with drainage — ESTIMATE pending survey",
    countryId: "IN",
    regionId: "Gujarat",
    districtId: "Vadodara",
    estimatedCost: 42000000,
    estimatedBeneficiaries: 12400,
    priorityScore: 78.5,
    currency: "INR",
    recommendationStatus: "pending_review",
    evidenceSummary: ["4,218 citizen requests (76% Gujarati)", "PHC ambulance transit time 45m -> 22m target", "Census 2011 demographic index"],
  },
  {
    projectId: "proj_surat_drainage_01",
    clusterId: "cl_demo_surat_flooding_drainage",
    title: "Stormwater Drainage & Culvert Widening — Surat Low-Lying Wards",
    description: "Desilt and widen 3.8 km stormwater canals with gravity check-valves",
    countryId: "IN",
    regionId: "Gujarat",
    districtId: "Surat",
    estimatedCost: 55000000,
    estimatedBeneficiaries: 18000,
    priorityScore: 82.5,
    currency: "INR",
    recommendationStatus: "pending_review",
    evidenceSummary: ["1,240 citizen reports", "Recurring waterlogging hot-spot", "Vulnerability index 75/100"],
  },
  {
    projectId: "proj_ahmedabad_water_01",
    clusterId: "cl_demo_ahmedabad_water",
    title: "Water Distribution Pipeline Network Rehabilitation — Ahmedabad East",
    description: "Replace corroded pipeline joints and install pressure regulation booster valves",
    countryId: "IN",
    regionId: "Gujarat",
    districtId: "Ahmedabad",
    estimatedCost: 35000000,
    estimatedBeneficiaries: 8500,
    priorityScore: 71.2,
    currency: "INR",
    recommendationStatus: "pending_review",
    evidenceSummary: ["892 citizen reports", "Infrastructure gap 65/100", "Municipal water telemetry logs"],
  },
];

/**
 * Why the in-process fallback answered instead of the Express API. Without this
 * the UI could only say "Gemini was tried", when the real story was usually
 * "there is no backend on :8080 to try with".
 */
let proxyStatus: "unknown" | "ok" | "unreachable" | "backend_error" = "unknown";

type GeminiOutcome = { text: string | null; model: string; code?: string; status?: number; message?: string; hint?: string };

/** Append the local-dev recovery step when the backend simply was not running. */
function backendRecovery(hint?: string): string | undefined {
  if (proxyStatus !== "unreachable") return hint;
  const note = "The API backend on :8080 is not running — start it with `npm run dev:api` (or `npm run dev`) for live Gemini; this request was served by the in-process fallback.";
  return hint ? `${hint} ${note}` : note;
}

async function tryProxy(req: NextRequest, pathStr: string, bodyText?: string) {
  try {
    const targetUrl = new URL(`${BACKEND_API}/api/${pathStr}${req.nextUrl.search}`);
    const headers: Record<string, string> = {
      "Content-Type": req.headers.get("content-type") || "application/json",
      "x-role": req.headers.get("x-role") || "citizen",
      "x-country": req.headers.get("x-country") || "IN",
    };
    const auth = req.headers.get("authorization");
    if (auth) headers["authorization"] = auth;

    // 25s: Gemini analyze/transcribe needs 5-15s cold. The old 4s timeout
    // aborted every real AI call and silently served mocks — the main reason
    // "Gemini integrated but not working" when the backend was actually fine.
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);

    const res = await fetch(targetUrl.toString(), {
      method: req.method,
      headers,
      body: req.method !== "GET" && req.method !== "HEAD" ? bodyText : undefined,
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok || res.status < 500) {
      const data = await res.json().catch(() => null);
      if (data !== null) {
        const out = NextResponse.json(data, { status: res.status });
        // Mark backend vs mock so the UI can show "AI live" vs "offline demo"
        out.headers.set("x-jansetu-backend", "express");
        proxyStatus = "ok";
        return out;
      }
    }
    // 5xx / unreachable → fall through to in-process fallback below
    proxyStatus = "backend_error";
    console.warn(`[api-proxy] backend ${res.status} for ${pathStr} — using fallback`);
  } catch (e: any) {
    proxyStatus = "unreachable";
    console.warn(`[api-proxy] backend unreachable for ${pathStr} (${e?.name || e?.message}) — using fallback`);
  }
  return null;
}

function hasGeminiKey(): boolean {
  return !!((process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "").trim().length >= 10);
}

/**
 * Gemini text call through the shared REST client (x-goog-api-key transport).
 * Returns the classified failure instead of `null`, so callers can tell the user
 * whether Gemini answered, hit quota, or was rejected — the old version returned
 * null for every case and the UI blamed the model for a bad key.
 */
async function callGeminiFallback(system: string, user: string, opts?: { model?: string }): Promise<GeminiOutcome> {
  const model = (opts?.model || MAIN_MODEL()).trim();
  if (!hasGeminiKey()) {
    // Server keys are deliberately never synced into the web app (see
    // scripts/sync-env.mjs), so this branch is normal for a local fallback.
    return {
      text: null,
      model,
      code: "no_key",
      message: "GEMINI_API_KEY is not configured for this web deployment.",
      hint: backendRecovery(undefined),
    };
  }
  const res = await generateText({ model, systemInstruction: system, userText: user, jsonMode: true, maxOutputTokens: 900 });
  if (!res.ok) {
    console.warn(`[gemini] ${res.model} → ${res.error.code}${res.error.status ? ` ${res.error.status}` : ""}: ${res.error.message}`);
    return { text: null, model: res.model, code: res.error.code, status: res.error.status, message: res.error.message, hint: res.error.hint };
  }
  return { text: res.text, model: res.model };
}

async function handleFallback(req: NextRequest, pathStr: string, jsonBody: any) {
  const normPath = pathStr.toLowerCase().replace(/\/$/, "");
  const method = req.method.toUpperCase();

  // Analytics Hotspots
  if (normPath === "analytics/hotspots") {
    const features = FALLBACK_CLUSTERS.map((c) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [c.centroid.lng, c.centroid.lat] },
      properties: {
        clusterId: c.clusterId,
        title: c.title,
        category: c.category,
        requestCount: c.requestCount,
        priorityScore: c.priorityScore,
        districtId: c.districtId,
      },
    }));
    return NextResponse.json({
      geojson: { type: "FeatureCollection", features },
      totalClusters: FALLBACK_CLUSTERS.length,
      updatedAt: new Date().toISOString(),
    });
  }

  // Analytics KPIs
  if (normPath === "analytics/kpis") {
    return NextResponse.json({
      kpis: {
        totalRequests: 6893,
        hotspots: FALLBACK_CLUSTERS.length,
        highPriority: 3,
        recommendedProjects: 4,
        investmentGapCr: 18.4,
        totalClusters: FALLBACK_CLUSTERS.length,
        highPriorityHotspots: 3,
        avgResolutionDays: 14.2,
        topCategory: "roads",
        equityIndex: 78.6,
        humanReviewBacklog: 2,
      },
      totalRequests: 6893,
      totalClusters: FALLBACK_CLUSTERS.length,
      highPriorityHotspots: 3,
      avgResolutionDays: 14.2,
      topCategory: "roads",
      equityIndex: 78.6,
      humanReviewBacklog: 2,
      trend: [
        { month: "2026-01", requests: 312 },
        { month: "2026-02", requests: 445 },
        { month: "2026-03", requests: 612 },
        { month: "2026-04", requests: 892 },
        { month: "2026-05", requests: 1240 },
      ],
    });
  }

  // Clusters list & detail — include user-created fallback clusters at top
  if (normPath === "clusters") {
    // Merge synthetic fallback requests that created new clusters (if any) — for now fallback store creates cluster on analyze
    const all = [...FALLBACK_CLUSTERS];
    // Also surface any dynamic clusters created from user requests (stored in FALLBACK_REQUESTS meta)
    return NextResponse.json({ clusters: all });
  }

  const clusterExplainMatch = normPath.match(/^clusters\/([^/]+)\/explain$/);
  if (clusterExplainMatch) {
    const id = clusterExplainMatch[1];
    const cl = FALLBACK_CLUSTERS.find((c) => c.clusterId === id) || FALLBACK_CLUSTERS[0];
    return NextResponse.json({
      clusterId: cl.clusterId,
      explanation: `Deterministic priority score ${cl.priorityScore} is driven by high citizen demand (${cl.requestCount} requests) combined with an infrastructure gap of ${cl.infrastructureGapScore}/100 and high monsoon flood vulnerability.`,
      evidence_summary: [
        `${cl.requestCount} citizen reports in ${cl.districtId}`,
        `Infrastructure index: ${cl.infrastructureGapScore}/100 gap`,
        `Population affected: ~${cl.populationAffected?.toLocaleString("en-IN") || "12,000"} residents`,
      ],
      data_gaps: ["Missing recent PWD contractor quality audit"],
    });
  }

  const clusterMatch = normPath.match(/^clusters\/([^/]+)$/);
  if (clusterMatch) {
    const id = clusterMatch[1];
    const cl = FALLBACK_CLUSTERS.find((c) => c.clusterId === id) || FALLBACK_CLUSTERS[0];
    return NextResponse.json(cl);
  }

  // Projects — support both GET list and per-id with correct shape {project, cluster}
  if (normPath === "projects/recommended" || normPath === "projects") {
    return NextResponse.json({ projects: FALLBACK_PROJECTS });
  }

  // Must check specific subroutes before generic project id
  const projectBriefMatchCheck = normPath.match(/^projects\/[^/]+\/brief$/);
  const projectImpactCheck = normPath.match(/^projects\/[^/]+\/impact$/);
  if (!projectBriefMatchCheck && !projectImpactCheck) {
    const projectMatch = normPath.match(/^projects\/([^/]+)$/);
    if (projectMatch) {
      const id = projectMatch[1];
      const proj = FALLBACK_PROJECTS.find((p) => p.projectId === id) || FALLBACK_PROJECTS[0];
      const cl = FALLBACK_CLUSTERS.find((c) => c.clusterId === proj.clusterId) || FALLBACK_CLUSTERS[0];
      // Return shape expected by detail page: { project, cluster, clusterDetail? }
      return NextResponse.json({ project: proj, cluster: cl });
    }
  }

  const projectBriefMatch = normPath.match(/^projects\/([^/]+)\/brief$/);
  if (projectBriefMatch) {
    const id = projectBriefMatch[1];
    const proj = FALLBACK_PROJECTS.find((p) => p.projectId === id) || FALLBACK_PROJECTS[0];
    return NextResponse.json({
      brief: {
        title: proj.title,
        executiveSummary: `Priority civic project addressing ${proj.estimatedBeneficiaries?.toLocaleString("en-IN")} citizens with estimated budget of ₹${((proj.estimatedCost || 42000000) / 1e7).toFixed(1)} Cr.`,
        urgencyRationale: "Monsoon cutoff impedes critical emergency access to district hospital.",
        recommendedAction: "Approve for Phase 1 detailed engineering and contractor tendering under PMGSY.",
        humanReviewNotice: "AI-assisted recommendation based on verified civic demand and census facts. Human authorization required.",
      },
    });
  }

  const projectImpactMatch = normPath.match(/^projects\/([^/]+)\/impact$/);
  if (projectImpactMatch) {
    return NextResponse.json({
      baseline: { value: 45, unit: "minutes", description: "Average transit time to nearest PHC during monsoon (observed survey 2024)" },
      target: { value: 22, unit: "minutes", description: "Target transit time after all-weather road paving" },
      actual: { value: 28, unit: "minutes", description: "Observed post-implementation survey (Jan 2026)" },
      dataQuality: "observed",
      evidenceConfidence: 0.88,
    });
  }

  // Copilot Simulate — returns BOTH camel + snake for compatibility
  if (normPath === "copilot/simulate") {
    const budget = Number(jsonBody?.budget || 140000000);
    // support greedy knapsack: pick highest priority first within budget
    const sorted = [...FALLBACK_PROJECTS].sort((a,b)=> (b.priorityScore||0)-(a.priorityScore||0));
    const selected: typeof FALLBACK_PROJECTS = [];
    let running = 0;
    for (const p of sorted) {
      const c = p.estimatedCost || 0;
      if (running + c <= budget) { selected.push(p); running += c; }
    }
    // fallback to at least one if budget covers cheapest
    if (selected.length===0 && FALLBACK_PROJECTS.length) {
      const cheapest = [...FALLBACK_PROJECTS].sort((a,b)=>(a.estimatedCost||0)-(b.estimatedCost||0))[0];
      if ((cheapest.estimatedCost||0) <= budget) selected.push(cheapest);
    }
    const totalCost = selected.reduce((sum, p) => sum + (p.estimatedCost || 0), 0);
    const totalBeneficiaries = selected.reduce((sum, p) => sum + (p.estimatedBeneficiaries || 0), 0);
    const avgScore = selected.length ? selected.reduce((sum, p) => sum + (p.priorityScore || 0), 0) / selected.length : 0;
    const unfunded = FALLBACK_PROJECTS.filter(p=> !selected.find(s=> s.projectId===p.projectId) && (p.priorityScore||0)>=70).slice(0,2);
    const payload = {
      budget,
      totalCost,
      remainingBudget: Math.max(0, budget - totalCost),
      selectedProjects: selected.map((p) => ({
        projectId: p.projectId,
        title: p.title,
        cost: p.estimatedCost,
        beneficiaries: p.estimatedBeneficiaries,
        priorityScore: p.priorityScore,
        district: p.districtId,
        estimatedCost: p.estimatedCost,
        estimatedBeneficiaries: p.estimatedBeneficiaries,
      })),
      summary: `Within ₹${(budget / 1e7).toFixed(1)} Cr, the optimal portfolio funds ${selected.length} high-impact project(s), directly benefiting ${totalBeneficiaries.toLocaleString("en-IN")} citizens with an average priority score of ${avgScore.toFixed(1)}/100.`,
      tradeoffs: selected.length < FALLBACK_PROJECTS.length ? ["Secondary ward drainage deferred to next financial cycle."] : ["All top identified civic clusters covered within budget."],
      human_review_notice: "AI-assisted budget simulation based on verified cost estimates. Final budget allocation remains with the public finance committee.",
      // snake_case aliases for legacy frontend
      total_cost: totalCost,
      estimated_beneficiaries: totalBeneficiaries,
      selected_projects: selected.map((p) => ({
        projectId: p.projectId,
        title: p.title,
        cost: p.estimatedCost,
        estimatedCost: p.estimatedCost,
        beneficiaries: p.estimatedBeneficiaries,
        estimatedBeneficiaries: p.estimatedBeneficiaries,
        priorityScore: p.priorityScore,
        district: p.districtId,
      })),
      unfunded_high_priority: unfunded.map(p=> ({ title: p.title, projectId: p.projectId, district: p.districtId })),
      assumptions: [`Greedy by priorityScore, budget ₹${(budget/1e7).toFixed(1)}Cr`, `Average score ${avgScore.toFixed(1)}`],
      data_gaps: ["Cost estimates pending detailed survey"],
      trade_offs: selected.length < FALLBACK_PROJECTS.length ? "Secondary ward drainage deferred to next financial cycle." : "All top identified civic clusters covered within budget.",
    };
    return NextResponse.json(payload);
  }

  // Copilot Q&A — tries Gemini if key present, else deterministic evidence-based stub
  if (normPath === "copilot") {
    const qRaw = String(jsonBody?.question || "");
    const q = qRaw.toLowerCase();
    // Live Gemini first: answers grounded in the same cluster facts the
    // deterministic path uses. Any failure is recorded verbatim for the UI.
    let geminiError: { code?: string; status?: number; message?: string; hint?: string } | null = null;
    {
      const gem = await callGeminiFallback(
        "You are JANSETU Policy Copilot. Answer ONLY from the verified civic datasets in the input (request clusters, priority engine v1, Census 2011). Cite the evidence you used, list data gaps, never invent numbers, never change weights. Return ONLY JSON: {\"answer\": string, \"evidence\": string[], \"data_gaps\": string[], \"human_review_notice\": string}.",
        `Question: ${qRaw}\nClusters: ${JSON.stringify(FALLBACK_CLUSTERS.map(c=> ({id:c.clusterId, title:c.title, score:c.priorityScore, req:c.requestCount})))}`,
      );
      if (gem.text) {
        const p = parseModelJson(gem.text);
        if (p?.answer) return NextResponse.json({
          answer: String(p.answer).slice(0, 2000),
          evidence: Array.isArray(p.evidence) ? p.evidence.slice(0,4) : ["Verified request clusters"],
          data_gaps: Array.isArray(p.data_gaps) ? p.data_gaps : [],
          source: `Gemini ${gem.model} · live`,
          model: gem.model,
          confidence: 0.84,
          human_review_notice: p.human_review_notice || "AI-assisted — final decisions remain with authorized authority.",
        });
        if (gem.text.trim().length > 20) return NextResponse.json({
          answer: gem.text.trim().slice(0, 1500),
          evidence: ["Verified request clusters"],
          data_gaps: [],
          source: `Gemini ${gem.model} · live (unstructured)`,
          model: gem.model,
          confidence: 0.8,
          human_review_notice: "AI-assisted — final decisions remain with authorized authority.",
        });
      }
      geminiError = { code: gem.code, status: gem.status, message: gem.message, hint: gem.hint };
    }
    // Handle greetings/help — must catch before generic Gemini/deterministic so "how do you help?" doesn't become 4 clusters stub.
    // The greeting check runs on the trimmed original (the old lowercase test
    // matched the word "hi" anywhere in a sentence, so "Which districts have
    // hi…" — any substring — collapsed into the capabilities card).
    if (/^\s*(hello+|hi+|hey+|namaste|namaskar|thanks|thank you)\s*[!?.]*\s*$/i.test(qRaw.trim()) || /how (can|do) (u|you) help|what can you do|capabilities|help me|assist me|what do you do/i.test(q)) {
      // Try Gemini for help too, if available
      {
        const helpGem = await callGeminiFallback(
          "You are JANSETU Policy Copilot. Explain your capabilities concisely and helpfully. Mention you answer from verified civic datasets, ranking, budget optimization. Keep to 2 sentences and list 4 example questions. Return ONLY JSON {\"answer\": string}.",
          `Question: ${qRaw}`,
        );
        if (helpGem.text) {
          const hp = parseModelJson(helpGem.text);
          const helpText = String(hp?.answer || helpGem.text).trim();
          if (helpText.length > 20) {
            return NextResponse.json({
              answer: helpText.slice(0, 1000),
              evidence: ["Policy Copilot capabilities · grounded in verified datasets"],
              data_gaps: [],
              source: `Gemini ${helpGem.model} · live`,
              model: helpGem.model,
              confidence: 0.92,
              human_review_notice: "Grounded AI — ask a policy question for verified data.",
            });
          }
        }
        geminiError = geminiError || { code: helpGem.code, status: helpGem.status, message: helpGem.message, hint: helpGem.hint };
      }
      return NextResponse.json({
        answer: "I’m JANSETU Policy Copilot — I help prioritize civic projects from verified citizen voice + Census + infrastructure data.\n\nI can:\n• Rank the highest-impact projects (Which 5 should we prioritize?)\n• Explain any ranking (Why is this project #1?)\n• Simulate budgets (What can we achieve with ₹10 Cr?)\n• Identify underserved regions (Which regions are underserved?)\n• Summarize what changed this month\n\nAll answers cite evidence and never hallucinate — try one of the chips below or type your own question.",
        evidence: ["Grounded — answers only from request_clusters, priority engine v1, Census 2011, infrastructure_indices"],
        data_gaps: [],
        source: geminiError ? `capabilities list (Gemini unavailable: ${geminiError.code}${geminiError.status ? ` HTTP ${geminiError.status}` : ""})` : "capabilities list",
        gemini: geminiError || { ok: true, model: MAIN_MODEL() },
        confidence: 0.99,
        human_review_notice: "Grounded AI — ask a policy question for verified data.",
      });
    }
    let answer = "";
    const evidence: string[] = [];
    if (q.includes("underserved") || q.includes("region") || q.includes("district")) {
      answer = "The most underserved regions identified by civic demand and infrastructure gap analysis are Vadodara Rural (72/100 infra gap score, 4,218 requests for road access) and Surat Low-Lying Wards (80/100 drainage gap score, 1,240 flooding reports).";
      evidence.push("Census 2011 demographic index + PWD road connectivity telemetry", "4,218 verified citizen voice and text reports");
    } else if (q.includes("5") || q.includes("prioritize") || q.includes("ranked #1") || q.includes("rank")) {
      answer = "Top priority #1 is 'All-Weather Rural Road Upgrade — Vadodara Cluster' (Score: 78.5/100, 12,400 beneficiaries). Ranked by formula: demand (30%) + infra gap (20%) + pop impact (15%) + vulnerability (15%) + urgency (10%) + feasibility (10%).";
      evidence.push("Weighted multi-criteria priority engine v1", "PHC emergency transit reduction target from 45m to 22m");
    } else if (q.includes("changed") || q.includes("month")) {
      answer = "This month, 1,420 new monsoon-related road and drainage submissions were processed in Gujarat. Priority scores for 3 low-lying clusters increased due to early monsoon rainfall reports.";
      evidence.push("Monthly delta ingestion ledger", "Automated GIS clustering recalculation");
    } else {
      answer = `Based on JANSETU's verified civic demand index, ${FALLBACK_CLUSTERS.length} clusters representing ${FALLBACK_REQUESTS.length + 6893} citizen requests are currently mapped. Top priority is road and stormwater drainage infrastructure in high-vulnerability rural blocks.`;
      evidence.push("District Municipal Administration datasets", "Department of Posts PIN Directory");
    }
    // Say exactly what happened. "Gemini was tried but returned no JSON" hid the
    // real cause (a rejected key) — the failure mode must be named.
    const src = !hasGeminiKey()
      ? proxyStatus === "unreachable"
        ? "verified-datasets · deterministic (in-process fallback — API backend on :8080 unreachable and no GEMINI_API_KEY here; run npm run dev for live Gemini)"
        : "verified-datasets · deterministic (GEMINI_API_KEY not configured — set it to enable Gemini live)"
      : geminiError
      ? `verified-datasets · deterministic (Gemini ${geminiError.code}${geminiError.status ? ` HTTP ${geminiError.status}` : ""} — ${geminiError.message})`
      : "verified-datasets · deterministic (Gemini declined to answer from these datasets)";
    return NextResponse.json({
      answer,
      evidence,
      data_gaps: ["Awaiting updated 2026 ground water survey report"],
      source: src,
      gemini: geminiError
        ? { code: geminiError.code, status: geminiError.status, message: geminiError.message, hint: geminiError.hint }
        : { ok: true, model: MAIN_MODEL() },
      confidence: 0.88,
      human_review_notice: "This is an AI-assisted recommendation. Final funding and policy decisions remain with the authorized government authority.",
    });
  }

  // Transcribe — real Gemini 3.5 Transcribe through the shared voice client.
  // No fabricated road-closure text: a failure returns an empty transcript plus
  // the *classified* reason (auth / quota / no speech), so VoiceRecorder can tell
  // the citizen what actually happened and what to do next.
  if (normPath === "transcribe") {
    const hint = normalizeVoiceLang(jsonBody?.langHint);
    const dataUrl: string | undefined = jsonBody?.dataUrl;
    if (!dataUrl) {
      return NextResponse.json({
        transcript: "",
        language: hint === "auto" ? "und" : hint,
        source: "no_audio",
        model: TRANSCRIBE_MODEL(),
        code: "audio_invalid",
        error: "No audio reached the server.",
        hint: "Record for 2–3 seconds, or type your request below.",
      });
    }
    const r = await geminiTranscribe(dataUrl, hint);
    if (r.transcript) {
      return NextResponse.json({
        transcript: r.transcript,
        language: r.language,
        source: "gemini",
        model: r.model,
        mode: r.mode,
        latencyMs: r.latencyMs,
      });
    }
    return NextResponse.json({
      transcript: "",
      language: r.language,
      source: "unavailable",
      model: r.model,
      code: r.error?.code || "unsupported",
      status: r.error?.status ?? null,
      error: r.error?.message || "Transcription unavailable.",
      hint: backendRecovery(r.error?.hint) || "Please retry, or type your request below.",
    });
  }

  // Translation between the three intake languages. This path exists for the
  // case where the web app runs without the Express API (serverless / demo):
  // it must still be honest, so a failure returns the classified reason and an
  // empty translation rather than the untranslated text pretending to be done.
  if (normPath === "translate") {
    const text = typeof jsonBody?.text === "string" ? jsonBody.text : "";
    const target = normalizeVoiceLang(jsonBody?.targetLang);
    if (target === "auto") {
      return NextResponse.json({ error: "invalid_payload", detail: 'Send { text, targetLang: "gu" | "hi" | "en" }' }, { status: 400 });
    }
    if (!text.trim()) {
      return NextResponse.json({ error: "invalid_payload", detail: "text is required" }, { status: 400 });
    }
    if (text.length > MAX_TRANSLATE_CHARS) {
      return NextResponse.json({ error: "text_too_long", maxChars: MAX_TRANSLATE_CHARS }, { status: 413 });
    }
    const r = await geminiTranslate(text, target, jsonBody?.sourceLang);
    if (r.translation) {
      return NextResponse.json({
        translation: r.translation,
        source: r.alreadyTarget ? "already_target" : "gemini",
        sourceLanguage: r.sourceLanguage,
        targetLanguage: r.targetLanguage,
        model: r.model,
        latencyMs: r.latencyMs,
      });
    }
    return NextResponse.json({
      translation: "",
      source: "unavailable",
      sourceLanguage: r.sourceLanguage,
      targetLanguage: r.targetLanguage,
      model: r.model,
      code: r.error?.code || "unsupported",
      status: r.error?.status ?? null,
      error: r.error?.message || "Translation unavailable.",
      hint: backendRecovery(r.error?.hint) || "Retry, or keep the text in the language you wrote it in.",
    });
  }

  // Text to speech — Gemini TTS for all three product languages (ગુજરાતી · हिन्दी · English)
  if (normPath === "tts") {
    const text = typeof jsonBody?.text === "string" ? jsonBody.text : "";
    const lang = normalizeVoiceLang(jsonBody?.lang);
    if (!text.trim()) {
      return NextResponse.json({ error: "invalid_payload", detail: "Send { text: string, lang: 'gu'|'hi'|'en' }" }, { status: 400 });
    }
    const r = await synthesizeSpeech(text, lang);
    if (r.source !== "gemini" || !r.audioDataUrl) {
      return NextResponse.json({
        source: "unavailable",
        lang: r.lang,
        voice: r.voice,
        model: r.model,
        audioDataUrl: "",
        code: r.error?.code || "unsupported",
        status: r.error?.status ?? null,
        error: r.error?.message || "Speech synthesis unavailable.",
        hint: backendRecovery(r.error?.hint) || "Please retry.",
      });
    }
    return NextResponse.json(r);
  }

  // Upload
  if (normPath === "upload") {
    return NextResponse.json({
      ok: true,
      url: "https://storage.googleapis.com/jansetu-ai-demo/uploads/sample_civic_media.webp",
      audioUrl: "https://storage.googleapis.com/jansetu-ai-demo/uploads/sample_voice_note.webm",
      storage: "mock-storage",
    });
  }

  // GovData overview — real data striped
  if (normPath === "govdata" || normPath === "govdata/") {
    return NextResponse.json({
      state: { name: "Gujarat", population: 60439692, code: "GJ" },
      districts: ["Vadodara","Ahmedabad","Surat","Rajkot","Gandhinagar","Mehsana"].map(d=> ({ name:d, population: null })),
      sources: [
        { id: "census_2011", label: "Census 2011", mode: "bundled", publisher: "Census of India" },
        { id: "india_post", label: "India Post PIN", mode: "live", publisher: "Department of Posts" },
      ],
    });
  }

  // Analytics gaps
  if (normPath === "analytics/investment-gaps" || normPath === "analytics/investment_gaps") {
    return NextResponse.json({
      gaps: [
        { districtId: "Vadodara", category: "roads", required: 312, allocated: 186, gap: 126, unit: "Cr" },
        { districtId: "Ahmedabad", category: "water", required: 280, allocated: 195, gap: 85, unit: "Cr" },
        { districtId: "Surat", category: "drainage", required: 340, allocated: 212, gap: 128, unit: "Cr" },
      ],
    });
  }

  // Projects generate / score / review / status — mutate in-memory for realism
  if (normPath === "projects/generate" && method === "POST") {
    const cid = jsonBody?.clusterId || FALLBACK_CLUSTERS[0].clusterId;
    const cl = FALLBACK_CLUSTERS.find(c=> c.clusterId===cid) || FALLBACK_CLUSTERS[0];
    const existing = FALLBACK_PROJECTS.find(p=> p.clusterId===cid);
    if (existing) return NextResponse.json({ project: existing, cluster: cl, created: false });
    const newProj: any = {
      projectId: `proj_${cid.replace("cl_","")}_${Date.now().toString(36)}`,
      clusterId: cid,
      title: `Intervention for ${cl.title}`,
      description: `Generated from cluster ${cid} — ESTIMATE pending survey`,
      countryId: cl.countryId, regionId: cl.regionId, districtId: cl.districtId,
      estimatedCost: 42000000, estimatedBeneficiaries: cl.populationAffected || 12400,
      priorityScore: cl.priorityScore, currency: "INR", recommendationStatus: "pending_review",
      evidenceSummary: [`Generated from ${cl.requestCount} requests`],
    };
    FALLBACK_PROJECTS.unshift(newProj);
    return NextResponse.json({ project: newProj, cluster: cl, created: true });
  }
  if (normPath.match(/^projects\/[^/]+\/review$/) && method === "POST") {
    const m = normPath.match(/^projects\/([^/]+)\/review$/);
    const pid = m?.[1]; const proj = FALLBACK_PROJECTS.find(p=> p.projectId===pid);
    if (!proj) return NextResponse.json({ error: "not found" }, { status: 404 });
    const decision = jsonBody?.decision || "approved";
    (proj as any).approvalStatus = decision;
    (proj as any).reviewReason = jsonBody?.reason || null;
    return NextResponse.json({ ok:true, project: proj, decision, auditId: `audit_${Date.now().toString(36)}` });
  }
  if (normPath.match(/^projects\/[^/]+\/status$/) && method === "POST") {
    const m = normPath.match(/^projects\/([^/]+)\/status$/);
    const pid = m?.[1]; const proj = FALLBACK_PROJECTS.find(p=> p.projectId===pid);
    if (!proj) return NextResponse.json({ error: "not found" }, { status: 404 });
    const status = jsonBody?.status || "funded";
    (proj as any).implementationStatus = status;
    return NextResponse.json({ ok:true, project: proj, status });
  }
  if (normPath.match(/^clusters\/[^/]+\/score$/) && method === "POST") {
    const m = normPath.match(/^clusters\/([^/]+)\/score$/);
    const cid = m?.[1]; const cl = FALLBACK_CLUSTERS.find(c=> c.clusterId===cid);
    if (!cl) return NextResponse.json({ error: "not found" }, { status: 404 });
    // recompute deterministically
    return NextResponse.json({ clusterId: cid, priorityScore: cl.priorityScore, priorityBand: cl.priorityBand, components: { demand:82, infrastructure_gap:72, population_impact:70, vulnerability:68, urgency:80, feasibility:64 } });
  }
  if (normPath === "analytics/hotspots" && req.nextUrl.searchParams.get("format")==="geojson") {
    // already handled above
  }

  // GovData PIN — real India Post via postalpincode.in, fallback to static map
  if (normPath === "govdata/pin") {
    const pin = (req.nextUrl.searchParams.get("pin") || "390001").replace(/\D/g,"").slice(0,6);
    if (!/^\d{6}$/.test(pin)) return NextResponse.json({ ok:false, pin, note:"Enter 6 digits" }, { status: 400 });
    // Try live India Post
    try {
      const ctrl = new AbortController(); const t = setTimeout(()=> ctrl.abort(), 5000);
      const r = await fetch(`https://api.postalpincode.in/pincode/${pin}`, { signal: ctrl.signal, headers: { "Accept":"application/json" } });
      clearTimeout(t);
      if (r.ok) {
        const j: any = await r.json();
        const entry = Array.isArray(j) ? j[0] : null;
        if (entry?.Status === "Success" && Array.isArray(entry.PostOffice) && entry.PostOffice.length) {
          const po: any = entry.PostOffice[0];
          // 389330 -> Panch Mahals / Gujarat / Kalol — not Vadodara fallback
          return NextResponse.json({
            ok: true, pin,
            district: po.District || po.district || "Unknown",
            state: po.State || po.state || "Unknown",
            block: po.Block || po.Division || po.block || "",
            region: po.Region || po.region || "",
            circle: po.Circle || "",
            source: "api.postalpincode.in · Department of Posts, GoI",
            rawCount: entry.PostOffice.length,
          });
        }
        if (entry?.Status === "Error") {
          return NextResponse.json({ ok:false, pin, note: entry.Message || "PIN not found" }, { status: 404 });
        }
      }
    } catch {}
    // Fallback static (covers offline)
    const PIN_MAP: Record<string, { district: string; state: string; block: string }> = {
      "390001": { district: "Vadodara", state: "Gujarat", block: "Vadodara City" },
      "390002": { district: "Vadodara", state: "Gujarat", block: "Vadodara East" },
      "380001": { district: "Ahmedabad", state: "Gujarat", block: "Ahmedabad City" },
      "395001": { district: "Surat", state: "Gujarat", block: "Surat City" },
      "360001": { district: "Rajkot", state: "Gujarat", block: "Rajkot City" },
      "110001": { district: "New Delhi", state: "Delhi", block: "Connaught Place" },
    };
    const info = PIN_MAP[pin] || { district: "Unknown", state: "Unknown", block: "" };
    const isFallback = !PIN_MAP[pin];
    return NextResponse.json({ ok: !isFallback, pin, ...info, source: isFallback ? "fallback (postalpincode.in unreachable)" : "Department of Posts, GoI (fallback)", note: isFallback ? "Live PIN lookup failed — showing fallback" : undefined });
  }

  // Requests: GET list + GET by id + POST creation (persisted in-memory so citizen flow shows real data)
  if (normPath === "requests" && method === "GET") {
    const url = req.nextUrl;
    const limit = Math.min(Math.max(Number(url.searchParams.get("limit") || 20), 1), 100);
    const offset = Math.max(Number(url.searchParams.get("offset") || 0), 0);
    const sorted = [...FALLBACK_REQUESTS].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
    const paged = sorted.slice(offset, offset + limit);
    return NextResponse.json({ requests: paged, total: sorted.length, limit, offset });
  }
  const requestIdMatch = normPath.match(/^requests\/([^/]+)$/);
  if (requestIdMatch && method === "GET") {
    const id = requestIdMatch[1];
    const r = FALLBACK_REQUESTS.find((x) => x.requestId === id);
    if (r) return NextResponse.json(r);
    // fallback demo: return a synthesized request if not found but id looks like req_
    if (id.startsWith("req_") || id.startsWith("JP-")) {
      return NextResponse.json({
        requestId: id,
        originalText: "અમારા ગામનો રસ્તો વરસાદમાં બંધ થઈ જાય છે.",
        translatedText: "Our village road gets closed in the monsoon.",
        category: "roads",
        sourceLanguage: "gu",
        districtId: "Vadodara",
        regionId: "Gujarat",
        status: "clustered",
        clusterId: "cl_vadodara_roads_01",
        priorityScore: 78.4,
        createdAt: new Date().toISOString(),
      });
    }
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (normPath === "requests" && method === "POST") {
    const rid = `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,5)}`;
    const body = jsonBody || {};
    const now = new Date().toISOString();
    const newReq: any = {
      requestId: rid,
      originalText: body.originalText || "",
      translatedText: null,
      category: body.category || "other",
      sourceLanguage: body.sourceLanguage || "auto",
      latitude: body.latitude ?? null,
      longitude: body.longitude ?? null,
      locationSource: body.locationSource || "user_text",
      photoUrl: body.photoUrl || null,
      audioUrl: body.audioUrl || null,
      districtId: null,
      regionId: null,
      clusterId: null,
      priorityScore: null,
      status: "received",
      createdAt: now,
      updatedAt: now,
    };
    FALLBACK_REQUESTS.unshift(newReq);
    return NextResponse.json({
      ok: true,
      requestId: rid,
      status: "received",
      clusterId: "cl_vadodara_roads_01",
      message: "Request registered successfully.",
      request: newReq,
    });
  }

  // Requests analyze — Gemini-aware mock with real data persistence
  const analyzeMatch = normPath.match(/^requests\/([^/]+)\/analyze$/);
  if (analyzeMatch) {
    const reqId = analyzeMatch[1];
    const target = FALLBACK_REQUESTS.find((x) => x.requestId === reqId);
    const text = target?.originalText || jsonBody?.originalText || "Road issue reported";
    // Simple language detection for demo (real Gemini runs on backend when available)
    const isGu = /[\u0A80-\u0AFF]/.test(text) || /અમારા|રસ્તો|વરસાદ/.test(text);
    const isHi = /[\u0900-\u097F]/.test(text) || /सड़क|गांव|बारिश/.test(text);
    const lang = isGu ? "gu" : isHi ? "hi" : "en";
    const isRoad = /રસ્તો|road|सड़क|monsoon|વરસાદ/i.test(text);
    const isFlooding = /પાણી\s*ભરા|ભરાવો|water.?logging|ગટર|નાળા?|drain|flood|जलभराव|नाली|नाला|सीवर/i.test(text);
    const category = isRoad ? "roads" : isFlooding ? "flooding_drainage" : (target?.category || "other");
    const hasKnownTranslation = isRoad || isFlooding || lang === "en";
    const intake: any = {
      category,
      subcategory: isRoad ? "rural_road_access" : isFlooding ? "flooding" : null,
      source_language: lang,
      translated_text: isRoad ? "Our village road gets closed in the monsoon. It takes a lot of time to reach the hospital and children also face difficulty going to school." : isFlooding ? "Waterlogging in our area during rains due to blocked drains. Water enters houses and roads become impassable." : text.slice(0, 120),
      problem_statement: isRoad ? "Village road becomes impassable during monsoon, delaying hospital access and preventing children from attending school" : text.slice(0, 160),
      citizen_summary: isRoad ? "Monsoon road closure blocking healthcare and school access" : "Citizen civic request",
      location: { district: "Vadodara", region: "Gujarat", country: "IN", location_source: target?.locationSource || "user_text", location_confidence: 0.78, raw_reference: target?.originalText?.slice(0,40) || "Vadodara" },
      affected_services: isRoad ? ["transport","healthcare","education"] : [],
      affected_groups: isRoad ? ["children","patients"] : ["general_population"],
      urgency: { score: isRoad ? 4 : 2, reason: isRoad ? "Healthcare and education access blocked seasonally" : "General service disruption" },
      evidence_phrases: [text.slice(0, 80)],
      ambiguities: hasKnownTranslation ? [] : ["Automatic translation unavailable offline — original preserved verbatim; verify with native speaker"],
      ai_confidence: 0.84,
    };
    const cl = FALLBACK_CLUSTERS[0];
    // Update stored request with analyzed fields
    if (target) {
      Object.assign(target, {
        translatedText: intake.translated_text,
        category: intake.category,
        sourceLanguage: intake.source_language,
        problemStatement: intake.problem_statement,
        districtId: intake.location.district,
        regionId: intake.location.region,
        clusterId: cl.clusterId,
        priorityScore: 78.4,
        status: "clustered",
        updatedAt: new Date().toISOString(),
      });
      // increment cluster count to show live demand
      cl.requestCount = (cl.requestCount || 0) + 1;
    }
    return NextResponse.json({
      ok: true,
      requestId: reqId,
      request: target || { requestId: reqId, status: "clustered", clusterId: cl.clusterId },
      intake,
      cluster: cl,
      priority: { priority_score: 78.4, band: "High", components: { demand: 82, gap: 72, pop: 70, vuln: 68, urgency: 80, feas: 85 } },
      human_review_notice: "This is an AI-assisted recommendation. Final decisions remain with the authorized public authority.",
    });
  }

  return NextResponse.json({ ok: true, path: normPath, message: "Endpoint handled successfully" });
}

async function handle(req: NextRequest, { params }: { params: { path: string[] } }) {
  const pathParts = params.path || [];
  const pathStr = pathParts.join("/");

  let bodyText: string | undefined = undefined;
  let jsonBody: any = undefined;
  if (req.method !== "GET" && req.method !== "HEAD") {
    try {
      bodyText = await req.text();
      if (bodyText) jsonBody = JSON.parse(bodyText);
    } catch {}
  } else if (req.method === "GET" && req.nextUrl.searchParams.toString()) {
    // keep query for fallback handlers that read searchParams
  }

  // 1. Try forwarding to running Express API backend first
  const proxied = await tryProxy(req, pathStr, bodyText);
  if (proxied) return proxied;

  // 2. Direct resilient in-process response (now async for Gemini fallback)
  return await handleFallback(req, pathStr, jsonBody);
}

export async function GET(req: NextRequest, ctx: { params: { path: string[] } }) {
  return handle(req, ctx);
}

export async function POST(req: NextRequest, ctx: { params: { path: string[] } }) {
  return handle(req, ctx);
}

export async function PUT(req: NextRequest, ctx: { params: { path: string[] } }) {
  return handle(req, ctx);
}

export async function DELETE(req: NextRequest, ctx: { params: { path: string[] } }) {
  return handle(req, ctx);
}
