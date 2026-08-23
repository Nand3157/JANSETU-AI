const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://jansetu-ai-web-sooty.vercel.app";
// M-12 fix: prefer SITE_URL for OpenAPI server if NEXT_PUBLIC_API_URL is localhost
function resolveApiUrl(): string {
  const api = process.env.NEXT_PUBLIC_API_URL;
  if (!api) return SITE_URL;
  // If api is localhost but site is production, use site
  if (api.includes("localhost") && !SITE_URL.includes("localhost")) return SITE_URL;
  return api;
}
const API_URL = resolveApiUrl();

const openApiSpec = {
  openapi: "3.1.0",
  info: {
    title: "JANSETU AI API",
    version: "1.0.0",
    description:
      "JANSETU AI — Digital Public Good for civic infrastructure intelligence. Citizen voice (GU/HI/EN voice-text-photo) → Gemini understanding → BigQuery GIS + demographics/infra/investment fusion → deterministic priority engine v1 (demand 30% + gap 20% + pop 15% + vuln 15% + urgency 10% + feasibility 10%, human-governed) → candidate projects → impact tracking. Brand: JANSETU AI. All recommendation responses include human_review_notice. See /docs, /llms.txt, /.well-known/mcp, /sitemap.xml.",
    contact: {
      name: "JANSETU AI",
      url: `${SITE_URL}/contact`,
      email: "support@jansetu.ai",
    },
    license: { name: "Demo — synthetic data" },
  },
  servers: [
    { url: API_URL, description: "JANSETU AI API (Cloud Run / Vercel)" },
    { url: SITE_URL, description: "JANSETU AI Web (Next.js, proxies /api)" },
  ],
  tags: [
    { name: "requests", description: "Citizen requests — submit, fetch, AI analyze" },
    { name: "clusters", description: "Demand clusters + deterministic scoring" },
    { name: "projects", description: "Candidate projects + human review + impact" },
    { name: "copilot", description: "Policy Q&A + budget simulator" },
    { name: "analytics", description: "Hotspots GeoJSON, investment gaps, KPIs" },
    { name: "health", description: "Service health" },
  ],
  paths: {
    "/health": {
      get: {
        tags: ["health"],
        summary: "Health check",
        responses: {
          "200": {
            description: "ok",
            content: { "application/json": { schema: { type: "object", properties: { ok: { type: "boolean" }, service: { type: "string" }, version: { type: "string" } } } } },
          },
        },
      },
    },
    "/api/requests": {
      post: {
        tags: ["requests"],
        summary: "Submit citizen request — JANSETU AI",
        description: "Submit originalText (Gujarati/Hindi/English), optional lat/lng, sourceLanguage. Returns requestId. Auth: x-role: citizen or Bearer token.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["originalText"],
                properties: {
                  originalText: { type: "string", example: "અમારા ગામનો રસ્તો વરસાદમાં બંધ થઈ જાય છે." },
                  sourceLanguage: { type: "string", enum: ["gu", "hi", "en", "auto"], default: "auto" },
                  latitude: { type: "number", example: 22.3072 },
                  longitude: { type: "number", example: 73.1812 },
                  locationSource: { type: "string", enum: ["user_text", "device", "geocoded"] },
                  districtId: { type: "string" },
                  regionId: { type: "string" },
                  countryId: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Created", content: { "application/json": { schema: { type: "object", properties: { requestId: { type: "string" } } } } } },
          "400": { description: "Bad request" },
          "429": { description: "Rate limited" },
        },
        security: [{ bearerAuth: [] }, { demoRole: [] }],
      },
    },
    "/api/requests/{id}": {
      get: {
        tags: ["requests"],
        summary: "Fetch request",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "request" }, "404": { description: "not found" } },
      },
    },
    "/api/requests/{id}/analyze": {
      post: {
        tags: ["requests"],
        summary: "AI intake → cluster → deterministic v1 score — JANSETU AI core chain",
        description: "Runs Gemini intake (category, urgency, translation, location), dedup clustering, evidence fusion, deterministic priority scoring. Never invents evidence; flags ambiguities.",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": {
            description: "intake + cluster + priority",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    intake: { type: "object" },
                    cluster: { type: "object" },
                    priority: { type: "object", properties: { priority_score: { type: "number" }, components: { type: "object" }, weightVersion: { type: "string" } } },
                    human_review_notice: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/clusters": {
      get: {
        tags: ["clusters"],
        summary: "List clusters",
        responses: { "200": { description: "clusters", content: { "application/json": { schema: { type: "object", properties: { clusters: { type: "array", items: { type: "object" } } } } } } } },
      },
    },
    "/api/clusters/{id}": {
      get: {
        tags: ["clusters"],
        summary: "Cluster detail",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "cluster" }, "404": { description: "not found" } },
      },
    },
    "/api/clusters/{id}/score": {
      post: {
        tags: ["clusters"],
        summary: "Re-score cluster deterministically",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "priority" } },
      },
    },
    "/api/clusters/{id}/explain": {
      get: {
        tags: ["clusters"],
        summary: "Explain priority drivers/limiters",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "explanation" } },
      },
    },
    "/api/projects/recommended": {
      get: {
        tags: ["projects"],
        summary: "Candidate projects",
        responses: { "200": { description: "projects" } },
      },
    },
    "/api/projects/generate": {
      post: {
        tags: ["projects"],
        summary: "Generate candidate project from cluster — JANSETU AI",
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["clusterId"], properties: { clusterId: { type: "string", example: "cl_vadodara_roads_01" } } } } } },
        responses: { "200": { description: "project" }, "404": { description: "cluster not found" } },
      },
    },
    "/api/projects/{id}/review": {
      post: {
        tags: ["projects"],
        summary: "Human approve/reject with audit log",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["decision"], properties: { decision: { type: "string", enum: ["approved", "rejected"] }, reason: { type: "string" } } } } } },
        responses: { "200": { description: "reviewed" }, "403": { description: "forbidden (citizen cannot review)" } },
      },
    },
    "/api/projects/{id}/impact": {
      get: {
        tags: ["projects"],
        summary: "Baseline → target → actual impact",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "impact" } },
      },
    },
    "/api/projects/{id}/brief": {
      get: {
        tags: ["projects"],
        summary: "Policy brief 12 sections",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "brief" } },
      },
    },
    "/api/copilot": {
      post: {
        tags: ["copilot"],
        summary: "Policy Q&A grounded in evidence — JANSETU AI",
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["question"], properties: { question: { type: "string", example: "Which projects should we prioritize within ₹10 Cr?" } } } } } },
        responses: { "200": { description: "answer" } },
      },
    },
    "/api/copilot/simulate": {
      post: {
        tags: ["copilot"],
        summary: "Budget simulator (structured)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { budget: { type: "number", example: 100000000 }, objective: { type: "string", enum: ["max_beneficiaries", "max_coverage"] }, risk_tolerance: { type: "string", enum: ["low", "medium", "high"] } },
              },
            },
          },
        },
        responses: { "200": { description: "simulation" } },
      },
    },
    "/api/analytics/hotspots": {
      get: {
        tags: ["analytics"],
        summary: "Hotspots GeoJSON",
        responses: { "200": { description: "geojson + hotspots" } },
      },
    },
    "/api/analytics/investment-gaps": {
      get: {
        tags: ["analytics"],
        summary: "Investment gaps",
        responses: { "200": { description: "gaps" } },
      },
    },
    "/api/analytics/kpis": {
      get: {
        tags: ["analytics"],
        summary: "KPIs + trend",
        responses: { "200": { description: "kpis" } },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT", description: "Firebase ID token" },
      demoRole: { type: "apiKey", in: "header", name: "x-role", description: "Demo only: citizen | analyst | policymaker when ALLOW_DEMO_AUTH=true" },
    },
  },
  externalDocs: {
    description: "JANSETU AI developer hub",
    url: `${SITE_URL}/docs`,
  },
};

export async function GET() {
  return new Response(JSON.stringify(openApiSpec, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
      Vary: "Accept, Accept-Encoding",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
