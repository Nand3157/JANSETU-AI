import type { Metadata } from "next";
import Link from "next/link";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://jansetu-ai-web-sooty.vercel.app";

export const metadata: Metadata = {
  title: "JANSETU AI Developer Docs — API, OpenAPI, MCP, Auth",
  description:
    "JANSETU AI developer documentation: API reference, OpenAPI spec, authentication, webhooks, MCP server. Integrate civic intelligence into your dashboards.",
  alternates: { canonical: "/docs" },
  openGraph: {
    title: "JANSETU AI Developer Docs — API, OpenAPI, MCP, Auth",
    description: "Integrate JANSETU AI civic intelligence: API docs, OpenAPI, auth, webhooks, MCP.",
    url: `${SITE_URL}/docs`,
    type: "website",
    images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: "JANSETU AI Developer Docs" }],
  },
};

export default function DocsPage() {
  return (
    <div className="mx-auto max-w-[880px] px-4 md:px-6 py-12">
      <div className="inline-flex items-center gap-2 rounded-full bg-white border border-[#E5E7EB] px-3 py-1 text-xs font-medium">
        <span className="h-2 w-2 rounded-full bg-[#188038] animate-pulse" /> JANSETU AI Developer Resources
      </div>
      <h1 className="text-3xl font-semibold tracking-tight mt-4">JANSETU AI Developer Docs</h1>
      <p className="text-[#78716C] mt-3 leading-relaxed">
        Integrate <strong className="text-[#0B1F3A]">JANSETU AI</strong> civic intelligence into your apps. This Digital Public Good exposes every capability as a
        deterministic, auditable API — from Gujarati voice intake to BRICS-ready priority scoring. Start in minutes with our OpenAPI spec, then connect via the MCP
        server for Claude / ChatGPT native calls.
      </p>

      <div className="mt-8 grid md:grid-cols-2 gap-4">
        <Link href="/docs/api" className="rounded-[20px] bg-white border border-[#E7E5E4] p-6 hover-lift hover-border block">
          <div className="text-[11px] tracking-widest font-semibold text-[#174EA6]">API REFERENCE</div>
          <div className="font-semibold mt-1">JANSETU AI API Docs</div>
          <div className="text-sm text-[#5F6368] mt-1">Human-readable reference: requests, clusters, scoring, projects, copilot, analytics. With curl examples.</div>
          <div className="text-sm text-[#174EA6] mt-3 font-medium">/docs/api →</div>
        </Link>
        <a href="/openapi.json" className="rounded-[20px] bg-white border border-[#E7E5E4] p-6 hover-lift hover-border block">
          <div className="text-[11px] tracking-widest font-semibold text-[#188038]">MACHINE SPEC</div>
          <div className="font-semibold mt-1">OpenAPI 3.1 Spec</div>
          <div className="text-sm text-[#5F6368] mt-1">Import into Postman, code-gen SDKs, or feed to your AI agent. Predictable URL, CORS-ready.</div>
          <div className="text-sm text-[#188038] mt-3 font-medium">/openapi.json →</div>
        </a>
        <a href="/llms.txt" className="rounded-[20px] bg-white border border-[#E7E5E4] p-6 hover-lift hover-border block">
          <div className="text-[11px] tracking-widest font-semibold text-[#5F6368]">AGENT INSTRUCTIONS</div>
          <div className="font-semibold mt-1">llms.txt — When to use JANSETU AI</div>
          <div className="text-sm text-[#5F6368] mt-1">Tells agents best-fit use cases and how to call you. Lists all developer resources.</div>
          <div className="text-sm text-[#174EA6] mt-3 font-medium">/llms.txt →</div>
        </a>
        <a href="/.well-known/mcp" className="rounded-[20px] bg-[#0B1F3A] text-white border border-[#0B1F3A] p-6 hover-lift block">
          <div className="text-[11px] tracking-widest font-semibold text-white/60">MODEL CONTEXT PROTOCOL</div>
          <div className="font-semibold mt-1">MCP Server Manifest</div>
          <div className="text-sm text-white/70 mt-1">Claude, ChatGPT &amp; vercel MCP adapter. Streamable HTTP tools exposing the JANSETU AI API.</div>
          <div className="text-sm text-white mt-3 font-medium">/.well-known/mcp →</div>
        </a>
      </div>

      <div className="mt-8 rounded-[20px] bg-white border border-[#E7E5E4] p-6">
        <h2 className="font-semibold">Quickstart — JANSETU AI in 3 calls</h2>
        <div className="mt-4 space-y-4 text-sm leading-relaxed">
          <div>
            <div className="text-[11px] tracking-widest font-semibold text-[#5F6368]">1 — SUBMIT (GUJARATI)</div>
            <pre className="mt-2 overflow-auto rounded-xl bg-[#0B1F3A] text-[#E8F0FE] p-4 text-xs">
              {`curl -X POST ${SITE_URL}/api/requests \\
  -H "Content-Type: application/json" \\
  -H "x-role: citizen" \\
  -d '{"originalText":"અમારા ગામનો રસ્તો વરસાદમાં બંધ થઈ જાય છે. હોસ્પિટલ જવા માટે ખૂબ સમય લાગે છે.","sourceLanguage":"gu","latitude":22.3072,"longitude":73.1812}'`}
            </pre>
          </div>
          <div>
            <div className="text-[11px] tracking-widest font-semibold text-[#5F6368]">2 — ANALYZE → SCORE</div>
            <pre className="mt-2 overflow-auto rounded-xl bg-[#0B1F3A] text-[#E8F0FE] p-4 text-xs">
              {`curl -X POST ${SITE_URL}/api/requests/{requestId}/analyze
# → intake { category:"roads", translated_text, location }, cluster { clusterId:"cl_vadodara_roads_01" }, priority { priority_score:78.5, components }`}
            </pre>
          </div>
          <div>
            <div className="text-[11px] tracking-widest font-semibold text-[#5F6368]">3 — EXPLORE & DECIDE</div>
            <pre className="mt-2 overflow-auto rounded-xl bg-[#0B1F3A] text-[#E8F0FE] p-4 text-xs">
              {`curl ${SITE_URL}/api/analytics/hotspots
curl ${SITE_URL}/api/projects/recommended
curl -X POST ${SITE_URL}/api/copilot -d '{"question":"What fits within ₹10 Cr?"}'`}
            </pre>
          </div>
        </div>
      </div>

      <div className="mt-8 grid md:grid-cols-3 gap-4 text-sm">
        <div className="rounded-[20px] bg-white border border-[#E7E5E4] p-5">
          <div className="text-[11px] tracking-widest font-semibold text-[#5F6368]">AUTH</div>
          <div className="font-medium mt-1">Bearer + demo x-role</div>
          <p className="text-[#5F6368] mt-1 leading-relaxed">Firebase ID token via Bearer header; demo allows x-role: citizen/analyst/policymaker. CORS whitelist via CORS_ORIGINS.</p>
        </div>
        <div className="rounded-[20px] bg-white border border-[#E7E5E4] p-5">
          <div className="text-[11px] tracking-widest font-semibold text-[#5F6368]">WEBHOOKS</div>
          <div className="font-medium mt-1">Audit-logged reviews</div>
          <p className="text-[#5F6368] mt-1 leading-relaxed">Subscribe to project review events (approve/reject) — audit_logs collection drives webhooks. Contact us to enable.</p>
        </div>
        <div className="rounded-[20px] bg-white border border-[#E7E5E4] p-5">
          <div className="text-[11px] tracking-widest font-semibold text-[#5F6368]">RATE LIMITS</div>
          <div className="font-medium mt-1">300 general / 30 AI</div>
          <p className="text-[#5F6368] mt-1 leading-relaxed">Per-IP window (15 min). Body cap 100kb (uploads 5 MB). See env: RATE_MAX_GENERAL, RATE_MAX_AI.</p>
        </div>
      </div>

      <div className="mt-8 rounded-[20px] border border-[#E5E7EB] bg-[#F8FAFC] p-6 text-sm leading-relaxed text-[#172033]">
        <div className="text-[11px] tracking-widest font-semibold text-[#5F6368]">VERCEL</div>
        <p className="mt-2">
          Deploy on Vercel: the web app (Next.js 14) is at <code>{SITE_URL}</code>. The Express API (services/api) runs on Cloud Run at port 8080 — set{" "}
          <code>NEXT_PUBLIC_API_URL</code> to your API base. All <code>/api/*</code> calls are proxied server-side; browser never holds GEMINI_API_KEY or
          SUPABASE_SERVICE_ROLE_KEY.
        </p>
        <p className="mt-2">
          For AI agents: prefer <a href="/llms.txt" className="text-[#174EA6] underline">/llms.txt</a> then <a href="/openapi.json" className="text-[#174EA6] underline">/openapi.json</a> then{" "}
          <a href="/.well-known/mcp" className="text-[#174EA6] underline">MCP manifest</a>. For HTML vs markdown, send <code>Accept: text/markdown</code> and you will receive
          <code>Content-Type: text/markdown</code> with <code>Vary: Accept, Accept-Encoding</code>.
        </p>
      </div>

      <div className="mt-6 text-xs text-[#5F6368]">
        Brand: <strong className="text-[#172033]">JANSETU AI</strong> · Search {"\"JANSETU AI\" site:"}
        {new URL(SITE_URL).hostname} · Sitemap: <a href="/sitemap.xml" className="text-[#174EA6] underline">/sitemap.xml</a> · Contact:{" "}
        <a href="/contact" className="text-[#174EA6] underline">/contact</a>
      </div>
    </div>
  );
}
