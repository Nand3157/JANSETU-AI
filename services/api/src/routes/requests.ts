import { Router } from "express";
import { store } from "../services/store.js";
import { analyzeCitizenIntake, decideCluster } from "../services/aiOrchestrator.js";
import { scoreCluster } from "../services/ranking.js";
import { decide as decideLocal } from "../services/clusterService.js";

export const requestsRouter = Router();

// POST /api/requests — frontend submits voice/text/photo + location
requestsRouter.post("/", async (req, res) => {
  const { originalText, latitude, longitude, locationSource, audioUrl, photoUrl, sourceLanguage } = req.body;
  if (!originalText) return res.status(400).json({ error: "originalText required" });

  const user = (req as any).user;
  const created = store.createRequest({
    userId: user.uid,
    originalText,
    sourceLanguage: sourceLanguage || "auto",
    latitude: latitude ?? null,
    longitude: longitude ?? null,
    locationSource: locationSource || null,
    audioUrl: audioUrl || null,
    photoUrl: photoUrl || null,
    countryId: user.countryId,
    status: "received",
  });
  store.auditLog({ actorUserId: user.uid, actorRole: user.role, action: "create_request", resourceType: "citizen_requests", resourceId: created.requestId });
  res.status(201).json(created);
});

// GET /api/requests/{id}
requestsRouter.get("/:id", (req, res) => {
  const r = store.getRequest(req.params.id);
  if (!r) return res.status(404).json({ error: "not found" });
  res.json(r);
});

// POST /api/requests/{id}/analyze — triggers AI understanding → cluster → enrich → score
requestsRouter.post("/:id/analyze", async (req, res) => {
  const r = store.getRequest(req.params.id);
  if (!r) return res.status(404).json({ error: "not found" });

  // 1) AI intake — pass langHint to preserve gu detection even if encoding edge
  const intake = await analyzeCitizenIntake({ text: r.originalText, locationRaw: `${r.latitude},${r.longitude}`, langHint: r.sourceLanguage });
  if (!intake.ok) return res.status(422).json({ error: "ai intake failed", detail: intake.error, raw: intake.raw });

  const ai = intake.data!;
  // 2) Persist normalized fields — preserve originalText immutable per spec
  store.updateRequest(r.requestId, {
    sourceLanguage: ai.source_language,
    translatedText: ai.translated_text,
    category: ai.category as any,
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
    const target = store.getCluster(clusterId!);
    if (target) store.updateCluster(clusterId!, { requestCount: (target.requestCount || 0) + 1 });
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


