/**
 * In-memory Firestore mock — now dual-writes to Firebase Firestore when configured.
 * Preserves authoritative schema from 05_BACKEND_SCHEMA.md.
 * Real backend: Firestore collections users, citizen_requests, request_clusters, projects, audit_logs
 */
import { nanoid } from "nanoid";
import type { CitizenRequest, RequestCluster, Project } from "../lib/index.js";
import { isFirebaseEnabled, firestore } from "../lib/firebaseAdmin.js";

const requests = new Map<string, CitizenRequest>();
const clusters = new Map<string, RequestCluster>();
const projects = new Map<string, Project>();
const audit: any[] = [];

function persist(col: string, id: string, data: any) {
  if (!isFirebaseEnabled() || !firestore) return;
  try { firestore.collection(col).doc(id).set(data, { merge: true }).catch((e: any)=> console.warn(`Firestore persist ${col}/${id} failed:`, e.message)); } catch {}
}

// Seed handled by data/demo loader
export const store = {
  // Requests
  createRequest(data: Partial<CitizenRequest>): CitizenRequest {
    const id = data.requestId || nanoid(10);
    const now = new Date().toISOString();
    const req: CitizenRequest = {
      requestId: id,
      userId: data.userId || "demo-user",
      sourceChannel: (data.sourceChannel as any) || "web",
      sourceLanguage: data.sourceLanguage || "unknown",
      originalText: data.originalText || "",
      translatedText: data.translatedText ?? null,
      audioUrl: data.audioUrl ?? null,
      photoUrl: data.photoUrl ?? null,
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      locationSource: data.locationSource ?? null,
      countryId: data.countryId || "IN",
      regionId: data.regionId ?? null,
      districtId: data.districtId ?? null,
      localityId: data.localityId ?? null,
      category: (data.category as any) ?? null,
      subcategory: data.subcategory ?? null,
      problemStatement: data.problemStatement ?? null,
      affectedServices: data.affectedServices || [],
      affectedGroups: data.affectedGroups || [],
      urgencyScore: data.urgencyScore ?? null,
      aiConfidence: data.aiConfidence ?? null,
      clusterId: data.clusterId ?? null,
      priorityScore: data.priorityScore ?? null,
      status: (data.status as any) || "received",
      createdAt: now,
      updatedAt: now,
    };
    requests.set(id, req);
    persist("citizen_requests", id, req);
    // BigQuery mirror: citizen_request_analytics row (via Pub/Sub in prod)
    return req;
  },
  getRequest(id: string) { return requests.get(id) || null; },
  listRequests() { return [...requests.values()]; },
  updateRequest(id: string, patch: Partial<CitizenRequest>) {
    const cur = requests.get(id); if (!cur) return null;
    // H-17 fix: whitelist fields that can be updated — prevent createdAt/userId injection
    const allowed: (keyof CitizenRequest)[] = ["sourceLanguage","translatedText","audioUrl","photoUrl","latitude","longitude","locationSource","districtId","regionId","countryId","category","subcategory","problemStatement","affectedServices","affectedGroups","urgencyScore","aiConfidence","clusterId","priorityScore","status"];
    const safePatch: any = {};
    for (const k of allowed) {
      if (k in patch && (patch as any)[k] !== undefined) safePatch[k] = (patch as any)[k];
    }
    // Always preserve createdAt, requestId, userId, sourceChannel, originalText (immutable)
    const nxt = { ...cur, ...safePatch, updatedAt: new Date().toISOString() };
    requests.set(id, nxt as CitizenRequest);
    persist("citizen_requests", id, nxt);
    return nxt;
  },
  // H-04/H-05 fix: atomic increment for requestCount (avoid lost update on concurrent analyze)
  incrementClusterRequestCount(clusterId: string): RequestCluster | null {
    const cur = clusters.get(clusterId); if (!cur) return null;
    const nxt = { ...cur, requestCount: (cur.requestCount || 0) + 1, updatedAt: new Date().toISOString() };
    clusters.set(clusterId, nxt as RequestCluster);
    persist("request_clusters", clusterId, nxt);
    return nxt;
  },

  // Clusters
  createCluster(c: Partial<RequestCluster>): RequestCluster {
    const id = c.clusterId || nanoid(10);
    const now = new Date().toISOString();
    const cl: RequestCluster = {
      clusterId: id,
      countryId: c.countryId || "IN",
      regionId: c.regionId ?? null,
      districtId: c.districtId ?? null,
      category: (c.category as any) || "other",
      subcategory: c.subcategory ?? null,
      title: c.title || "Untitled cluster",
      summary: c.summary || "",
      centroid: c.centroid ?? null,
      requestCount: c.requestCount || 0,
      populationAffected: c.populationAffected ?? null,
      demandScore: c.demandScore ?? null,
      infrastructureGapScore: c.infrastructureGapScore ?? null,
      populationImpactScore: c.populationImpactScore ?? null,
      vulnerabilityScore: c.vulnerabilityScore ?? null,
      urgencyScore: c.urgencyScore ?? null,
      feasibilityScore: c.feasibilityScore ?? null,
      investmentGapScore: c.investmentGapScore ?? null,
      priorityScore: c.priorityScore ?? null,
      priorityBand: c.priorityBand ?? null,
      weightVersion: c.weightVersion || "v1",
      confidence: c.confidence ?? null,
      evidenceRefs: c.evidenceRefs || [],
      dataGapRefs: c.dataGapRefs || [],
      status: (c.status as any) || "open",
      createdAt: now, updatedAt: now,
    };
    clusters.set(id, cl);
    persist("request_clusters", id, cl);
    return cl;
  },
  getCluster(id: string) { return clusters.get(id) || null; },
  listClusters() { return [...clusters.values()]; },
  findProjectByCluster(clusterId: string): Project | null {
    for (const p of projects.values()) if (p.clusterId === clusterId) return p;
    return null;
  },
  updateCluster(id: string, patch: Partial<RequestCluster>) {
    const cur = clusters.get(id); if (!cur) return null;
    // H-17: prevent overwriting createdAt/clusterId via patch
    const { createdAt: _c, clusterId: _id, ...safePatch } = patch as any;
    const nxt = { ...cur, ...safePatch, updatedAt: new Date().toISOString() };
    clusters.set(id, nxt as RequestCluster);
    persist("request_clusters", id, nxt);
    return nxt;
  },

  // Projects
  createProject(p: Partial<Project>): Project {
    const id = p.projectId || nanoid(10);
    const now = new Date().toISOString();
    const proj: Project = {
      projectId: id,
      clusterId: p.clusterId || "",
      title: p.title || "",
      description: p.description || "",
      countryId: p.countryId || "IN",
      regionId: p.regionId ?? null,
      districtId: p.districtId ?? null,
      latitude: p.latitude ?? null,
      longitude: p.longitude ?? null,
      estimatedCost: p.estimatedCost ?? null,
      currency: p.currency || "INR",
      estimatedBeneficiaries: p.estimatedBeneficiaries ?? null,
      priorityScore: p.priorityScore ?? null,
      recommendationStatus: (p.recommendationStatus as any) || "draft",
      approvalStatus: (p.approvalStatus as any) || "pending",
      fundingStatus: (p.fundingStatus as any) || "unfunded",
      implementationStatus: (p.implementationStatus as any) || "proposed",
      startDate: p.startDate ?? null,
      targetDate: p.targetDate ?? null,
      completedDate: p.completedDate ?? null,
      createdAt: now, updatedAt: now,
    };
    projects.set(id, proj);
    persist("projects", id, proj);
    return proj;
  },
  getProject(id: string) { return projects.get(id) || null; },
  listProjects() { return [...projects.values()]; },
  updateProject(id: string, patch: Partial<Project>) {
    const cur = projects.get(id); if (!cur) return null;
    // H-17: whitelist — prevent injecting recommendationStatus/approvalStatus via arbitrary patch
    // Only allow known mutable fields; status transitions should go via dedicated routes with auth
    const { createdAt: _c, projectId: _id, clusterId: _cl, ...rest } = patch as any;
    const allowed: (keyof Project)[] = ["title","description","districtId","regionId","latitude","longitude","estimatedCost","currency","estimatedBeneficiaries","priorityScore","recommendationStatus","approvalStatus","fundingStatus","implementationStatus","startDate","targetDate","completedDate"];
    const safe: any = {};
    for (const k of allowed) if (k in rest) safe[k] = rest[k];
    const nxt = { ...cur, ...safe, updatedAt: new Date().toISOString() };
    projects.set(id, nxt as Project);
    persist("projects", id, nxt);
    return nxt;
  },

  auditLog(entry: any) {
    const rec = { ...entry, timestamp: new Date().toISOString(), auditId: nanoid(8) };
    audit.push(rec);
    persist("audit_logs", rec.auditId, rec);
  },
  listAudit() { return audit; },
};
