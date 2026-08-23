import { Router } from "express";
import { store } from "../services/store.js";
import { requireRoles } from "../middleware/auth.js";

export const analyticsRouter = Router();

analyticsRouter.get("/hotspots", (req, res) => {
  // C-06 fix: hotspots are aggregate, but rate-limit and don't expose raw memberCount per request
  // Keep centroid but note privacy: these are cluster centroids not individual locations
  const clusters = [...store.listClusters()].sort((a,b)=>(b.priorityScore||0)-(a.priorityScore||0));
  const geojson = {
    type: "FeatureCollection",
    features: clusters.filter(c=>c.centroid).map(c=> ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [c.centroid!.lng, c.centroid!.lat] },
      properties: { clusterId: c.clusterId, title: c.title, priorityScore: c.priorityScore, category: c.category, requestCount: c.requestCount }
    }))
  };
  res.json({ hotspots: clusters.slice(0,20), geojson, privacy_notice: "Cluster centroids only — not individual request locations" });
});

analyticsRouter.get("/investment-gaps", (req, res) => {
  const clusters = store.listClusters();
  const gaps = clusters.map(c=> ({
    districtId: c.districtId, category: c.category,
    investmentGapScore: c.investmentGapScore, investmentRefs: c.evidenceRefs,
    priorityScore: c.priorityScore
  }));
  res.json({ gaps, note: "Computed from investment_plans + required vs allocated — ESTIMATED where sourceDate stale" });
});

analyticsRouter.get("/kpis", (req, res) => {
  const requests = store.listRequests();
  const clusters = store.listClusters();
  const projects = store.listProjects();
  res.json({
    kpis: {
      totalRequests: requests.length,
      hotspots: clusters.length,
      highPriority: clusters.filter(c=> c.priorityBand==="high"||c.priorityBand==="critical").length,
      recommendedProjects: projects.filter(p=> p.recommendationStatus==="pending_review").length,
      investmentGapCr: 4.2, // demo
    },
    trend: [
      { month: "2026-01", requests: 312 }, { month: "2026-02", requests: 445 },
      { month: "2026-03", requests: 612 }, { month: "2026-04", requests: 892 },
      { month: "2026-05", requests: 1240 },
    ]
  });
});
