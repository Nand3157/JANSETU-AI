import { Router } from "express";
import { z } from "zod";
import { store } from "../services/store.js";
import { analyzeCitizenIntake, decideCluster } from "../services/aiOrchestrator.js";
import { scoreCluster } from "../services/ranking.js";
import { decide as decideLocal } from "../services/clusterService.js";

export const requestsRouter = Router();

const ANALYST_ROLES = ["analyst", "policymaker", "program_manager", "admin", "super_admin"];

// Server-side input validation (#8) + explicit field whitelist (#18)
const createRequestSchema = z.object({
  originalText: z.string().trim().min(3).max(5000),
  category: z.enum(["transport","roads","water","sanitation","electricity","healthcare","education","housing","public_safety","digital_connectivity","environment","flooding_drainage","waste_management","public_spaces","other"]).optional(),
  sourceLanguage: z.enum(["auto", "en", "hi", "gu"]).optional(),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  locationSource: z.enum(["device", "user_text", "geocoded", "inferred"]).nullable().optional(),
  audioUrl: z.string().url().max(2048).nullable().optional(),
  photoUrl: z.string().url().max(2048).nullable().optional(),
});

// GET /api/requests — citizen sees own requests; analysts see all — with pagination (M-10 fix)
requestsRouter.get("/", (req, res) => {
  const user = (req as any).user;
  const all = store.listRequests();
  const mine = ANALYST_ROLES.includes(user.role) ? all : all.filter(r => r.userId === user.uid);
  const sorted = mine.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  // Pagination: ?limit=20&offset=0 (defaults, max 100)
  const limit = Math.min(Math.max(Number(req.query.limit || 20), 1), 100);
  const offset = Math.max(Number(req.query.offset || 0), 0);
  const paged = sorted.slice(offset, offset + limit);
  res.json({ requests: paged, total: sorted.length, limit, offset });
});

// POST /api/requests — frontend submits voice/text/photo + location
requestsRouter.post("/", async (req, res) => {
  const parsed = createRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "validation_failed", issues: parsed.error.issues.map(i => ({ path: i.path.join("."), message: i.message })) });
  }
  const d = parsed.data;

  const user = (req as any).user;
  // Only whitelisted fields are persisted; userId/countryId come from the verified token, never the body
  const created = store.createRequest({
    userId: user.uid,
    originalText: d.originalText,
    category: d.category || null,
    sourceLanguage: d.sourceLanguage || "auto",
    latitude: d.latitude ?? null,
    longitude: d.longitude ?? null,
    locationSource: d.locationSource || null,
    audioUrl: d.audioUrl || null,
    photoUrl: d.photoUrl || null,
    countryId: user.countryId,
    status: "received",
  });
  store.auditLog({ actorUserId: user.uid, actorRole: user.role, action: "create_request", resourceType: "citizen_requests", resourceId: created.requestId });
  res.status(201).json(created);
});

// GET /api/requests/{id} — server-side ownership check (#4): citizens read only their own
requestsRouter.get("/:id", (req, res) => {
  const r = store.getRequest(req.params.id);
  if (!r) return res.status(404).json({ error: "not found" });
  const user = (req as any).user;
  if (r.userId !== user.uid && !ANALYST_ROLES.includes(user.role)) {
    return res.status(403).json({ error: "forbidden" });
  }
  res.json(r);
});

// POST /api/requests/{id}/analyze — triggers AI understanding → cluster → enrich → score
requestsRouter.post("/:id/analyze", async (req, res) => {
  const r = store.getRequest(req.params.id);
  if (!r) return res.status(404).json({ error: "not found" });
  const user = (req as any).user;
  if (r.userId !== user.uid && !ANALYST_ROLES.includes(user.role)) {
    return res.status(403).json({ error: "forbidden" });
  }

  // 1) AI intake — pass langHint to preserve gu detection even if encoding edge
  const intake = await analyzeCitizenIntake({ text: r.originalText, locationRaw: `${r.latitude},${r.longitude}`, langHint: r.sourceLanguage });
  if (!intake.ok) return res.status(422).json({ error: "ai intake failed", detail: intake.error, raw: intake.raw });

  const ai = intake.data!;
  // 2) Persist normalized fields — preserve originalText immutable per spec
  store.updateRequest(r.requestId, {
    sourceLanguage: ai.source_language,
    translatedText: ai.translated_text,
     category: (r.category || ai.category) as any,
    subcategory: ai.subcategory,
    problemStatement: ai.problem_statement,
    affectedServices: ai.affected_services,
    affectedGroups: ai.affected_groups,
    urgencyScore: ai.urgency.score,
    aiConfidence: ai.ai_confidence,
    districtId: ai.location.district || r.districtId,
    regionId: ai.location.region || r.regionId,
    status: "ai_analyzed",
  });

  // 3) Cluster decision (precision over aggressive merging) — AI + local TF-IDF + geo verification
  const candidates = store.listClusters().map(c=> ({ clusterId:c.clusterId, title:c.title, summary:c.summary, category:c.category!, centroid:c.centroid, requestCount:c.requestCount }));
  const local = decideLocal(candidates, ai.problem_statement, ai.category, r.latitude ?? null, r.longitude ?? null);
  const existingCluster = store.listClusters().find(c => c.districtId === ai.location.district && c.category === ai.category);
  const clusterDecision = await decideCluster({ candidateClusterId: existingCluster?.clusterId || local.candidateId || null });
  // Reconcile: prefer precision — if local says CREATE_NEW but AI says MATCH, flag uncertain
  let aiDecision = clusterDecision.data?.cluster_decision || "CREATE_NEW";
  if (local.decision==="CREATE_NEW" && aiDecision==="MATCH_EXISTING" && local.score<0.55) {
    aiDecision="UNCERTAIN" as any;
  }
  if (local.decision==="UNCERTAIN") aiDecision="UNCERTAIN" as any;

  let clusterId = (aiDecision==="MATCH_EXISTING" ? (clusterDecision.data?.candidate_cluster_id || local.candidateId || existingCluster?.clusterId) : null);
  // fallback to local best if AI candidate invalid
  if (aiDecision==="MATCH_EXISTING" && !store.getCluster(clusterId!)) clusterId = local.candidateId || existingCluster?.clusterId || null;

  if (!clusterId || aiDecision === "CREATE_NEW") {
    const newCluster = store.createCluster({
      countryId: ai.location.country || "IN",
      regionId: ai.location.region,
      districtId: ai.location.district,
      category: ai.category as any,
      subcategory: ai.subcategory,
      title: ai.citizen_summary,
      summary: ai.problem_statement,
      centroid: r.latitude && r.longitude ? { lat: r.latitude, lng: r.longitude } : null,
      requestCount: 1,
      urgencyScore: ai.urgency.score * 20,
      confidence: ai.ai_confidence,
      status: "open",
    });
    clusterId = newCluster.clusterId;
  } else if (aiDecision==="UNCERTAIN") {
    // create new but flag for human review
    const newCluster = store.createCluster({
      countryId: ai.location.country || "IN",
      regionId: ai.location.region,
      districtId: ai.location.district,
      category: ai.category as any,
      subcategory: ai.subcategory,
      title: ai.citizen_summary,
      summary: ai.problem_statement,
      centroid: r.latitude && r.longitude ? { lat: r.latitude, lng: r.longitude } : null,
      requestCount: 1,
      urgencyScore: ai.urgency.score * 20,
      confidence: ai.ai_confidence,
      status: "open",
    });
    // keep as separate but note shared review
    clusterId = newCluster.clusterId;
  } else {
    // H-04 fix: use atomic increment to avoid lost update on concurrent analyze
    store.incrementClusterRequestCount(clusterId!);
  }

  store.updateRequest(r.requestId, { clusterId, status: "clustered" });

  // 4) Score
  let scored: any = null;
  try { scored = scoreCluster(clusterId!); } catch (e: any) { /* insufficient evidence */ }

  const updatedReq = store.getRequest(r.requestId);
  res.json({
    request: updatedReq,
    intake: ai,
    clusterDecision: { ...(clusterDecision.data||{}), local, reconciled: aiDecision },
    cluster: scored?.cluster || store.getCluster(clusterId!),
    priority: scored?.result || null,
    data_gaps: scored ? [] : ["Scoring unavailable — missing enrichment"],
    human_review_notice: "This is an AI-assisted recommendation based on the available evidence. Final prioritization, funding, and implementation decisions remain with the authorized public authority.",
  });
});

