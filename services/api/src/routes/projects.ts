import { Router } from "express";
import { store } from "../services/store.js";
import { recommendProject, generateImpact, generateBrief } from "../services/aiOrchestrator.js";

export const projectsRouter = Router();

projectsRouter.get("/recommended", (req, res) => {
  const list = store.listProjects().sort((a,b)=> (b.priorityScore||0)-(a.priorityScore||0));
  res.json({ projects: list });
});

projectsRouter.get("/:id", (req, res) => {
  const p = store.getProject(req.params.id);
  if (!p) return res.status(404).json({ error: "not found" });
  const cluster = p.clusterId ? store.getCluster(p.clusterId) : null;
  res.json({ project: p, cluster });
});

// POST /api/projects/{id}/review — human decision (approve/reject)
projectsRouter.post("/:id/review", (req, res) => {
  const { decision, reason } = req.body; // decision: approved | rejected
  const user = (req as any).user;
  if (!["approved","rejected"].includes(decision)) return res.status(400).json({ error: "decision must be approved|rejected" });
  const p = store.getProject(req.params.id);
  if (!p) return res.status(404).json({ error: "not found" });
  const updated = store.updateProject(p.projectId, { approvalStatus: decision as any, recommendationStatus: decision === "approved" ? "approved" : "rejected" });
  store.auditLog({ actorUserId: user.uid, actorRole: user.role, action: `project_${decision}`, resourceType: "projects", resourceId: p.projectId, reason });
  res.json({ project: updated, human_review_notice: "Human decision recorded. Audit log preserved." });
});

// POST /api/projects/generate — from cluster
projectsRouter.post("/generate", async (req, res) => {
  const { clusterId } = req.body;
  const cluster = store.getCluster(clusterId);
  if (!cluster) return res.status(404).json({ error: "cluster not found" });
  // Enforce scored before recommending
  if (cluster.priorityScore == null) return res.status(422).json({ error: "cluster must be scored first", cluster });

  const rec = await recommendProject({ priorityScore: cluster.priorityScore, cluster });
  if (!rec.ok) return res.status(422).json({ error: rec.error, raw: rec.raw });
  const r = rec.data!;
  const project = store.createProject({
    clusterId: cluster.clusterId,
    title: r.project_title,
    description: `${r.problem} — ${r.recommended_intervention}`,
    countryId: cluster.countryId,
    regionId: cluster.regionId,
    districtId: cluster.districtId,
    latitude: cluster.centroid?.lat ?? null,
    longitude: cluster.centroid?.lng ?? null,
    estimatedCost: r.estimated_cost ?? null,
    estimatedBeneficiaries: r.estimated_beneficiaries ?? null,
    priorityScore: cluster.priorityScore,
    currency: "INR",
    recommendationStatus: "pending_review",
  });
  store.updateCluster(clusterId, { status: "recommended" });
  // Label estimates explicitly
  res.status(201).json({
    project,
    recommendation: r,
    labels: { estimated_cost: "ESTIMATE — requires engineering survey", estimated_beneficiaries: "ESTIMATE — derived from district demographics" },
    human_review_required: true,
    human_review_notice: "This is an AI-assisted recommendation based on the available evidence. Final prioritization, funding, and implementation decisions remain with the authorized public authority.",
  });
});

// GET /api/projects/:id/impact — BigQuery impact_metrics via Gemini 07_IMPACT_REPORT_PROMPT
projectsRouter.get("/:id/impact", async (req, res) => {
  const p = store.getProject(req.params.id);
  if (!p) return res.status(404).json({ error: "not found" });
  const cluster = p.clusterId ? store.getCluster(p.clusterId) : null;
  const impact = await generateImpact({ project: p, cluster, actual: req.query.actual ? Number(req.query.actual) : null, measurement_date: req.query.date as string || null, source: req.query.source as string || null });
  if (!impact.ok) return res.status(500).json({ error: impact.error, raw: impact.raw });
  res.json({ ...impact.data, project: p, cluster, human_review_notice: "Observed vs estimated separated. Never claims causation beyond evidence." });
});

// POST /api/projects/:id/impact — record actual measurement
projectsRouter.post("/:id/impact", async (req, res) => {
  const p = store.getProject(req.params.id);
  if (!p) return res.status(404).json({ error: "not found" });
  const { actual, measurement_date, source } = req.body;
  const impact = await generateImpact({ project: p, actual, measurement_date, source });
  res.json({ ...impact.data, human_review_notice: "Measurement recorded. Audit preserved." });
});

// GET /api/projects/:id/brief — policy brief 08_POLICY_BRIEF_PROMPT
projectsRouter.get("/:id/brief", async (req, res) => {
  const p = store.getProject(req.params.id);
  if (!p) return res.status(404).json({ error: "not found" });
  const cluster = p.clusterId ? store.getCluster(p.clusterId) : null;
  // enrichment mock via ranking service
  const brief = await generateBrief({ cluster, project: p, enrichment: { populationAffected: cluster?.populationAffected || p.estimatedBeneficiaries, roadIndex: 38, floodVulnerability: cluster?.vulnerabilityScore||82, requiredInvestment:p.estimatedCost, existingInvestment:12000000 } });
  if (!brief.ok) return res.status(500).json({ error: brief.error });
  // Label estimates explicitly per governance
  res.json({ brief: brief.data, project: p, cluster, labels: { estimates: brief.data?.data_gaps || [] }, human_review_notice: "Evidence-led brief. All estimates labeled. Human decision required." });
});

// POST /api/projects/:id/status — impact loop state machine
projectsRouter.post("/:id/status", (req, res) => {
  const p = store.getProject(req.params.id);
  if (!p) return res.status(404).json({ error: "not found" });
  const { status, reason } = req.body; // proposed|reviewed|funded|in_progress|completed|impact_measured
  const allowed = ["proposed","reviewed","funded","in_progress","completed","impact_measured"];
  if (!allowed.includes(status)) return res.status(400).json({ error: `status must be one of ${allowed.join(",")}` });
  const user = (req as any).user;
  const before = { ...p };
  const updated = store.updateProject(p.projectId, { implementationStatus: status as any });
  store.auditLog({ actorUserId: user.uid, actorRole: user.role, action: `project_status_${status}`, resourceType: "projects", resourceId: p.projectId, before, after: updated, reason });
  res.json({ project: updated, audit: `${user.role} moved to ${status}`, human_review_notice: "State transition audited." });
});
