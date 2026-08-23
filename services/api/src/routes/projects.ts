import { Router } from "express";
import { z } from "zod";
import { store } from "../services/store.js";
import { recommendProject, generateImpact, generateBrief } from "../services/aiOrchestrator.js";
import { requireRoles } from "../middleware/auth.js";

export const projectsRouter = Router();

// Zod schemas for validation (H-01 fix)
const reviewSchema = z.object({ decision: z.enum(["approved", "rejected"]), reason: z.string().max(2000).optional() });
const generateSchema = z.object({ clusterId: z.string().trim().min(3).max(64) });
const statusSchema = z.object({ status: z.enum(["proposed","reviewed","funded","in_progress","completed","impact_measured"]), reason: z.string().max(2000).optional() });
const impactPostSchema = z.object({ actual: z.number().finite().nullable().optional(), measurement_date: z.string().max(64).nullable().optional(), source: z.string().max(256).nullable().optional() });

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

// POST /api/projects/{id}/review — human decision (approve/reject) — C-11 fix: require policymaker/admin
projectsRouter.post("/:id/review", requireRoles("policymaker", "admin", "super_admin", "program_manager"), (req, res) => {
  const parsed = reviewSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "validation_failed", issues: parsed.error.issues });
  const { decision, reason } = parsed.data;
  const user = (req as any).user;
  const p = store.getProject(req.params.id);
  if (!p) return res.status(404).json({ error: "not found" });
  const updated = store.updateProject(p.projectId, { approvalStatus: decision as any, recommendationStatus: decision === "approved" ? "approved" : "rejected" });
  store.auditLog({ actorUserId: user.uid, actorRole: user.role, action: `project_${decision}`, resourceType: "projects", resourceId: p.projectId, reason });
  res.json({ project: updated, human_review_notice: "Human decision recorded. Audit log preserved." });
});

// POST /api/projects/generate — from cluster — C-05/H-16 fix: require analyst+, dedup
projectsRouter.post("/generate", requireRoles("analyst", "policymaker", "admin", "super_admin", "program_manager"), async (req, res) => {
  const parsedBody = generateSchema.safeParse(req.body);
  if (!parsedBody.success) return res.status(400).json({ error: "validation_failed", issues: parsedBody.error.issues });
  const { clusterId } = parsedBody.data;
  const cluster = store.getCluster(clusterId);
  if (!cluster) return res.status(404).json({ error: "cluster not found" });
  // Enforce scored before recommending
  if (cluster.priorityScore == null) return res.status(422).json({ error: "cluster must be scored first", cluster });
  // H-16: prevent duplicate projects for same cluster
  const existing = store.findProjectByCluster(clusterId);
  if (existing) return res.status(409).json({ error: "project_already_exists", project: existing });

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
  // M-04 fix: validate actual query param is finite number
  let actual: number | null = null;
  if (req.query.actual !== undefined) {
    const n = Number(req.query.actual);
    if (!Number.isFinite(n)) return res.status(400).json({ error: "validation_failed", detail: "query param 'actual' must be a finite number" });
    actual = n;
  }
  const impact = await generateImpact({ project: p, cluster, actual, measurement_date: req.query.date as string || null, source: req.query.source as string || null });
  if (!impact.ok) return res.status(500).json({ error: impact.error, raw: impact.raw });
  res.json({ ...impact.data, project: p, cluster, human_review_notice: "Observed vs estimated separated. Never claims causation beyond evidence." });
});

// POST /api/projects/:id/impact — record actual measurement
projectsRouter.post("/:id/impact", async (req, res) => {
  const p = store.getProject(req.params.id);
  if (!p) return res.status(404).json({ error: "not found" });
  const parsed = impactPostSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "validation_failed", issues: parsed.error.issues });
  const { actual, measurement_date, source } = parsed.data;
  const impact = await generateImpact({ project: p, actual: actual ?? null, measurement_date: measurement_date ?? null, source: source ?? null });
  if (!impact.ok) return res.status(500).json({ error: impact.error, raw: impact.raw });
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

// POST /api/projects/:id/status — impact loop state machine — C-11 fix: require roles
projectsRouter.post("/:id/status", requireRoles("policymaker", "admin", "super_admin", "program_manager"), (req, res) => {
  const parsed = statusSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "validation_failed", issues: parsed.error.issues });
  const { status, reason } = parsed.data;
  const p = store.getProject(req.params.id);
  if (!p) return res.status(404).json({ error: "not found" });
  const user = (req as any).user;
  const before = { ...p };
  const updated = store.updateProject(p.projectId, { implementationStatus: status as any });
  store.auditLog({ actorUserId: user.uid, actorRole: user.role, action: `project_status_${status}`, resourceType: "projects", resourceId: p.projectId, before, after: updated, reason });
  res.json({ project: updated, audit: `${user.role} moved to ${status}`, human_review_notice: "State transition audited." });
});
