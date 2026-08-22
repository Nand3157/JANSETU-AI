import express from "express";
import cors from "cors";
import { authMiddleware } from "./middleware/auth.js";
import { requestsRouter } from "./routes/requests.js";
import { clustersRouter } from "./routes/clusters.js";
import { projectsRouter } from "./routes/projects.js";
import { copilotRouter } from "./routes/copilot.js";
import { analyticsRouter } from "./routes/analytics.js";
import { uploadRouter } from "./routes/upload.js";
import { store } from "./services/store.js";
import { scoreCluster } from "./services/ranking.js";

// ── Demo seeding (Gujarati sample + synthetic) ───────────────────────────────
function seed() {
  // Main demo cluster — mirrors 09_SAMPLE_END_TO_END_INPUT.txt
  const cl = store.createCluster({
    clusterId: "cl_vadodara_roads_01",
    countryId: "IN", regionId: "Gujarat", districtId: "Vadodara",
    category: "roads", subcategory: "rural_road_access",
    title: "Monsoon Road Closure — Vadodara Rural Cluster",
    summary: "Earthen village road impassable in monsoon, blocking hospital and school access for ~12,400 residents",
    centroid: { lat: 22.3072, lng: 73.1812 },
    requestCount: 4218,
    urgencyScore: 80, // 4/5 mapped
    confidence: 0.82,
    status: "open",
  });
  // Score it deterministically
  try { scoreCluster(cl.clusterId); } catch (e) { console.warn("seed score failed", e); }

  // Additional demo clusters for map
  [
    { districtId: "Ahmedabad", category: "water", requestCount: 892, title: "Intermittent Water Supply — Ahmedabad East" },
    { districtId: "Surat", category: "flooding_drainage", requestCount: 1240, title: "Flooding in Low-Lying Wards — Surat" },
    { districtId: "Rajkot", category: "healthcare", requestCount: 543, title: "PHC Staffing Gap — Rajkot Rural" },
  ].forEach(d => {
    const c = store.createCluster({
      countryId: "IN", regionId: "Gujarat", districtId: d.districtId,
      category: d.category as any, title: d.title, summary: d.title,
      centroid: { lat: 21.5 + Math.random()*2, lng: 71.5 + Math.random()*2 },
      requestCount: d.requestCount, status: "open", urgencyScore: 60,
    });
    try { scoreCluster(c.clusterId); } catch {}
  });

  // Synthetic requests for cluster
  for (let i=0;i<5;i++) {
    store.createRequest({
      originalText: i===0 ? "અમારા ગામનો રસ્તો વરસાદમાં બંધ થઈ જાય છે. હોસ્પિટલ જવા માટે ખૂબ સમય લાગે છે અને બાળકોને પણ સ્કૂલ જવામાં મુશ્કેલી પડે છે." : `Road blocked in monsoon near village ${i}, children cannot reach school`,
      sourceLanguage: i===0? "gu":"en",
      districtId: "Vadodara", regionId: "Gujarat", countryId: "IN",
      clusterId: cl.clusterId, category: "roads" as any, status: "clustered",
      latitude: 22.30 + Math.random()*0.05, longitude: 73.18 + Math.random()*0.05,
    });
  }

  // Demo project for budget simulator
  store.createProject({
    clusterId: cl.clusterId, title: "All-Weather Rural Road Upgrade — Vadodara Cluster",
    description: "Upgrade 4.2 km earthen road to paved all-weather with drainage — ESTIMATE pending survey",
    countryId: "IN", regionId: "Gujarat", districtId: "Vadodara",
    estimatedCost: 42000000, estimatedBeneficiaries: 12400, priorityScore: 78.5, currency: "INR",
    recommendationStatus: "pending_review"
  });
}

const app = express();
app.set("trust proxy", 1); // Cloud Run / App Router terminates TLS

// ── Security headers (directive #15) ────────────────────────────────────────
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'");
  if (process.env.NODE_ENV === "production") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains"); // behind managed TLS
    res.removeHeader("X-Powered-By");
  }
  next();
});

// ── CORS whitelist (directive #13) — no wildcard with credentials/sensitive data
const allowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",").map(s => s.trim()).filter(Boolean);
app.use(cors({
  origin(origin, cb) {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    if (!allowedOrigins.length && process.env.NODE_ENV !== "production") return cb(null, true); // dev convenience only
    cb(new Error("origin_not_allowed"));
  },
  methods: ["GET", "POST"],
  credentials: false, // auth is Bearer ID tokens, never cookies
}));

app.use(authMiddleware);

// ── Rate limits (directive #6): general + stricter AI budget ────────────────
import { rateLimit } from "./lib/rateLimit.js";
const generalLimiter = rateLimit({ scope: "general", max: Number(process.env.RATE_MAX_GENERAL || 300) });
const aiLimiter = rateLimit({ scope: "ai", max: Number(process.env.RATE_MAX_AI || 30) });
app.use("/api", generalLimiter);

// Uploads mount FIRST with their own larger JSON cap (base64 photos ≤ ~6.7MB wire size)
app.use("/api/upload", generalLimiter, uploadRouter);

// Everything else gets the tight default cap
app.use(express.json({ limit: process.env.MAX_BODY_BYTES || "100kb" }));

// Health
app.get("/health", (_req, res) => res.json({ ok: true, service: "jansetu-api", version: "1.0.0", chain: "Citizen → AI → Evidence → Prioritization → Human → Impact" }));

// API
app.use("/api/requests", requestsRouter);
app.use("/api/clusters", aiLimiter, clustersRouter);
app.use("/api/projects", projectsRouter);
app.use("/api/copilot", aiLimiter, copilotRouter);
app.use("/api/analytics", analyticsRouter);

// Seed on boot (skip when seeded externally via data/firestore/seed.js)
if (process.env.SKIP_SEED !== "true") seed();

// 404
app.use((req,res)=> res.status(404).json({ error: "not found", path: req.path }));

// Errors — never leak stack traces or DB errors to clients in production (#17)
app.use((err:any,_req:any,res:any,_next:any)=> {
  console.error(err);
  const expose = process.env.SHOW_ERRORS === "true" || process.env.NODE_ENV !== "production";
  if (err?.message === "origin_not_allowed") return res.status(403).json({ error: "forbidden" });
  res.status(500).json({ error: "internal_error", ...(expose ? { detail: err?.message } : {}) });
});

const port = Number(process.env.PORT || 8080);
app.listen(port, () => {
  console.log(`JANSETU API listening on :${port}`);
  console.log(`Demo: POST http://localhost:${port}/api/requests  then POST /api/requests/{id}/analyze`);
});
