import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://jansetu-ai-web-sooty.vercel.app";

export const metadata: Metadata = {
  title: "JANSETU AI API Docs — OpenAPI, Auth, Examples",
  description:
    "Complete JANSETU AI API documentation: citizen requests, AI analyze, clusters, deterministic scoring, projects, copilot, analytics, auth, rate limits, webhooks, MCP.",
  alternates: { canonical: "/docs/api" },
  openGraph: {
    title: "JANSETU AI API Docs — OpenAPI, Auth, Examples",
    description: "JANSETU AI API: citizen requests → AI → evidence → priority → human review → impact.",
    url: `${SITE_URL}/docs/api`,
    type: "website",
    images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: "JANSETU AI API Docs" }],
  },
};

const endpoints = [
  { method: "POST", path: "/api/requests", desc: "Submit citizen request (GU/HI/EN voice/text/photo)", auth: "x-role: citizen or Bearer", body: '{ originalText, sourceLanguage, latitude?, longitude?, locationSource? } → 201 { requestId }' },
  { method: "GET", path: "/api/requests/{id}", desc: "Fetch request by ID", auth: "any", body: "→ request object" },
  { method: "POST", path: "/api/requests/{id}/analyze", desc: "AI intake → cluster → deterministic v1 score (core chain)", auth: "any", body: "→ intake, cluster, priority { priority_score, components, weightVersion }, evidenceRefs, human_review_notice" },
  { method: "GET", path: "/api/clusters", desc: "List clusters (demand groups)", auth: "any", body: "→ { clusters: [...] }" },
  { method: "GET", path: "/api/clusters/{id}", desc: "Cluster detail + members + score explain", auth: "any", body: "→ cluster + requests" },
  { method: "POST", path: "/api/clusters/{id}/score", desc: "Re-score deterministically (no AI)", auth: "analyst/policymaker", body: "→ priority" },
  { method: "GET", path: "/api/clusters/{id}/explain", desc: "Score drivers/limiters explanation", auth: "any", body: "→ explain" },
  { method: "GET", path: "/api/projects/recommended", desc: "Candidate projects ordered by priority", auth: "any", body: "→ projects" },
  { method: "POST", path: "/api/projects/generate", desc: "Generate candidate project from cluster", auth: "analyst", body: '{ clusterId } → project' },
  { method: "POST", path: "/api/projects/{id}/review", desc: "Human approve/reject with audit log", auth: "policymaker", body: '{ decision: "approved"|"rejected", reason }' },
  { method: "GET", path: "/api/projects/{id}/impact", desc: "Baseline → target → actual (observed vs modeled)", auth: "any", body: "→ baseline_metrics, estimated_impact, data_quality" },
  { method: "GET", path: "/api/projects/{id}/brief", desc: "Policy brief 12 sections + human_review_notice", auth: "analyst", body: "→ brief" },
  { method: "POST", path: "/api/copilot", desc: "Policy Q&A grounded in evidence", auth: "analyst", body: '{ question: "Which projects within ₹10 Cr?" }' },
  { method: "POST", path: "/api/copilot/simulate", desc: "Budget simulator (structured)", auth: "analyst", body: '{ budget, objective, risk_tolerance } → selected_projects, trade_offs' },
  { method: "GET", path: "/api/analytics/hotspots", desc: "GeoJSON + hotspots (centroids, not PII)", auth: "any", body: "→ geojson { features }" },
  { method: "GET", path: "/api/analytics/investment-gaps", desc: "Investment gaps by district", auth: "any", body: "→ gaps" },
  { method: "GET", path: "/api/analytics/kpis", desc: "KPIs + trend", auth: "any", body: "→ kpis, trend" },
  { method: "POST", path: "/api/upload", desc: "Photo upload (5 MB cap, base64 ≤6.7MB wire)", auth: "citizen", body: "multipart / json → url" },
  { method: "POST", path: "/api/transcribe", desc: "Voice transcription via Gemini", auth: "citizen", body: "{ audio } → text" },
];

export default function ApiDocsPage() {
  return (
    <div className="mx-auto max-w-[980px] px-4 md:px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">JANSETU AI API Docs</h1>
      <p className="text-[#5F6368] mt-2 leading-relaxed">
        Base URL: <code className="bg-[#F8FAFC] border border-[#E5E7EB] rounded px-1.5 py-0.5 text-xs">{SITE_URL}</code> (web) and{" "}
        <code className="bg-[#F8FAFC] border border-[#E5E7EB] rounded px-1.5 py-0.5 text-xs">https://api.jansetu.ai</code> (or{" "}
        <code>NEXT_PUBLIC_API_URL</code>). Prefer <a href="/openapi.json" className="text-[#174EA6] underline">/openapi.json</a> for code-gen. For agents, start at{" "}
        <a href="/llms.txt" className="text-[#174EA6] underline">/llms.txt</a> and <a href="/.well-known/mcp" className="text-[#174EA6] underline">/.well-known/mcp</a>.
      </p>

      <div className="mt-6 flex flex-wrap gap-2 text-xs">
        <a href="/openapi.json" className="rounded-full bg-[#174EA6] text-white px-4 py-2 font-medium">OpenAPI JSON →</a>
        <a href="/llms.txt" className="rounded-full border border-[#E5E7EB] bg-white px-4 py-2 font-medium">llms.txt</a>
        <a href="/sitemap.xml" className="rounded-full border border-[#E5E7EB] bg-white px-4 py-2 font-medium">sitemap.xml</a>
        <a href="/.well-known/mcp" className="rounded-full border border-[#E5E7EB] bg-white px-4 py-2 font-medium">MCP manifest</a>
      </div>

      <div className="mt-8 rounded-[20px] bg-white border border-[#E5E7EB] p-6">
        <h2 className="font-semibold">Authentication — JANSETU AI</h2>
        <p className="text-sm text-[#5F6368] mt-2 leading-relaxed">
          Production: Firebase ID token via <code>Authorization: Bearer &lt;idToken&gt;</code>. Demo: allow <code>x-role: citizen | analyst | policymaker</code> header when{" "}
          <code>ALLOW_DEMO_AUTH=true</code>. CORS whitelist via <code>CORS_ORIGINS</code>. Never send GEMINI_API_KEY or SUPABASE_SERVICE_ROLE_KEY from browser — all
          secret-key calls are proxied via the API.
        </p>
        <pre className="mt-3 overflow-auto rounded-xl bg-[#0B1F3A] text-[#E8F0FE] p-4 text-xs">{`curl ${SITE_URL}/api/analytics/hotspots -H "x-role: analyst"
curl ${SITE_URL}/api/projects/recommended -H "Authorization: Bearer <FIREBASE_ID_TOKEN>"`}</pre>
      </div>

      <div className="mt-6 rounded-[20px] bg-white border border-[#E5E7EB] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
          <h2 className="font-semibold">Endpoints — JANSETU AI</h2>
          <span className="text-xs text-[#5F6368]">Deterministic scoring, audit-logged decisions</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F8FAFC] text-[11px] tracking-widest font-semibold text-[#5F6368]">
              <tr>
                <th className="text-left px-4 py-3">Method</th>
                <th className="text-left px-4 py-3">Path</th>
                <th className="text-left px-4 py-3">Description</th>
                <th className="text-left px-4 py-3">Auth / Body</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {endpoints.map((e) => (
                <tr key={e.method + e.path} className="hover:bg-[#F8FAFC]">
                  <td className="px-4 py-3 font-mono text-xs font-semibold whitespace-nowrap">{e.method}</td>
                  <td className="px-4 py-3 font-mono text-xs whitespace-nowrap">{e.path}</td>
                  <td className="px-4 py-3 text-[#172033]">{e.desc}</td>
                  <td className="px-4 py-3 text-xs text-[#5F6368] max-w-[280px] break-words">{e.auth} · {e.body}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 grid md:grid-cols-2 gap-4">
        <div className="rounded-[20px] bg-white border border-[#E5E7EB] p-6">
          <div className="text-[11px] tracking-widest font-semibold text-[#5F6368]">PRIORITY ENGINE V1</div>
          <div className="font-mono text-xs mt-2 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl p-3">
            priority = demand×0.30 + gap×0.20 + pop×0.15 + vuln×0.15 + urgency×0.10 + feas×0.10
          </div>
          <p className="text-xs text-[#5F6368] mt-2 leading-relaxed">Every component + weightVersion persisted. Band: critical ≥80 · high 65–79 · moderate 45–64 · low &lt;45. Gemini explains, not overrides.</p>
        </div>
        <div className="rounded-[20px] bg-white border border-[#E5E7EB] p-6">
          <div className="text-[11px] tracking-widest font-semibold text-[#5F6368]">WEBHOOKS & MCP</div>
          <p className="text-sm text-[#5F6368] mt-2 leading-relaxed">
            Webhooks fire on project review (approved/rejected) with audit_logs payload. MCP server exposes all API routes as tools via Streamable HTTP at{" "}
            <a href="/.well-known/mcp" className="text-[#174EA6] underline">/.well-known/mcp</a> (also npm @vercel/mcp-adapter). Vercel score 42902.
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-[20px] bg-[#0B1F3A] text-white p-6 border border-[#0B1F3A]">
        <div className="text-[11px] tracking-widest font-semibold text-white/60">CURL — FULL FLOW</div>
        <pre className="mt-3 overflow-auto rounded-xl bg-white/10 border border-white/10 p-4 text-xs leading-relaxed">{`# JANSETU AI — Gujarati voice to impact
GU="અમારા ગામનો રસ્તો વરસાદમાં બંધ થઈ જાય છે. હોસ્પિટલ જવા માટે ખૂબ સમય લાગે છે."
RID=$(curl -s -X POST ${SITE_URL}/api/requests -H "Content-Type: application/json" -H "x-role: citizen" -d "{\\"originalText\\":\\"$GU\\",\\"sourceLanguage\\":\\"gu\\"}" | jq -r .requestId)
curl -s -X POST ${SITE_URL}/api/requests/$RID/analyze | jq
curl -s ${SITE_URL}/api/analytics/hotspots | jq .geojson.features[0]
curl -s -X POST ${SITE_URL}/api/copilot -H "Content-Type: application/json" -d '{"question":"Which projects fit within ₹10 Cr?"}' | jq`}</pre>
      </div>

      <div className="mt-6 text-xs text-[#5F6368]">
        See <a href="/docs" className="text-[#174EA6] underline">/docs</a> · <a href="/openapi.json" className="text-[#174EA6] underline">openapi.json</a> ·{" "}
        <a href="/llms.txt" className="text-[#174EA6] underline">llms.txt</a> · <a href="/sitemap.xml" className="text-[#174EA6] underline">sitemap.xml</a> ·{" "}
        <a href="/contact" className="text-[#174EA6] underline">contact</a> · Support <a href="mailto:support@jansetu.ai" className="text-[#174EA6] underline">support@jansetu.ai</a>
      </div>
    </div>
  );
}
