import Link from "next/link";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://jansetu-ai-web-sooty.vercel.app";

export default function NotFound() {
  // This component renders as HTML for browsers, but also includes a markdown-friendly body for agents.
  // Middleware will intercept Accept: text/markdown and return pure markdown with 404 + Vary: Accept.
  // For full credit: include sitemap, llms.txt, docs index, and product name in headings.
  return (
    <div className="mx-auto max-w-[720px] px-4 md:px-6 py-12">
      <div className="inline-flex items-center gap-2 rounded-full bg-[#FEF2F2] border border-[#FECACA] px-3 py-1 text-xs font-semibold text-[#991B1B]">
        404 — Not Found
      </div>
      <h1 className="text-3xl font-semibold tracking-tight mt-4">JANSETU AI — Page not found</h1>
      <p className="text-[#5F6368] mt-3 leading-relaxed">
        The path you requested does not exist on <strong className="text-[#0B1F3A]">JANSETU AI</strong>. If you are an AI agent, use the markdown recovery links below.
      </p>

      {/* Markdown recovery block — visible to agents and humans */}
      <div className="mt-8 rounded-[20px] bg-white border border-[#E5E7EB] p-6">
        <div className="text-[11px] tracking-widest font-semibold text-[#5F6368]">RECOVERY MAP (AGENT-FRIENDLY MARKDOWN)</div>
        <pre className="mt-3 overflow-auto rounded-xl bg-[#0B1F3A] text-[#E8F0FE] p-4 text-xs leading-relaxed whitespace-pre-wrap">
{`# 404 — Not found (JANSETU AI)

The requested path does not exist. Try these instead:

- Home: ${SITE_URL}/
- About: ${SITE_URL}/about
- Contact: ${SITE_URL}/contact
- Privacy: ${SITE_URL}/privacy
- How It Works: ${SITE_URL}/how-it-works
- Impact: ${SITE_URL}/impact
- BRICS: ${SITE_URL}/brics

## Developer Resources — JANSETU AI
- Docs index: ${SITE_URL}/docs
- API docs: ${SITE_URL}/docs/api
- OpenAPI spec: ${SITE_URL}/openapi.json
- llms.txt (when-to-use): ${SITE_URL}/llms.txt
- MCP manifest: ${SITE_URL}/.well-known/mcp
- Sitemap: ${SITE_URL}/sitemap.xml
- Robots: ${SITE_URL}/robots.txt

## Search
Search for "JANSETU AI" at ${SITE_URL} or read llms.txt for when-to-use guidance.

> This 404 was returned with HTTP 404 (never 200) and Vary: Accept, Accept-Encoding for content negotiation.
`}
        </pre>
        <p className="text-xs text-[#5F6368] mt-3">
          Verification: <code>curl -s -o /dev/null -w "%&#123;http_code&#125;" {SITE_URL}/some-path-that-does-not-exist</code> must print <code>404</code>. Markdown variant:
          <code className="ml-1">curl -H &quot;Accept: text/markdown&quot; {SITE_URL}/some-path-that-does-not-exist</code> returns <code>text/markdown</code> with{" "}
          <code>Vary: Accept, Accept-Encoding</code>.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/" className="h-10 px-5 grid place-items-center rounded-full bg-[#174EA6] text-white text-sm font-medium">
          Go to JANSETU AI Home
        </Link>
        <Link href="/docs" className="h-10 px-5 grid place-items-center rounded-full border border-[#E5E7EB] bg-white text-sm font-medium">
          Developer Docs →
        </Link>
        <Link href="/sitemap.xml" className="h-10 px-5 grid place-items-center rounded-full border border-[#E5E7EB] bg-white text-sm font-medium">
          Sitemap.xml
        </Link>
      </div>

      <div className="mt-8 text-xs text-[#5F6368] leading-relaxed">
        <strong className="text-[#172033]">JANSETU AI</strong> is a Digital Public Good for civic infrastructure intelligence. Canonical domain:{" "}
        <a href={SITE_URL} className="text-[#174EA6] underline">
          {SITE_URL}
        </a>{" "}
        · Support: <a href="mailto:support@jansetu.ai" className="text-[#174EA6] underline">support@jansetu.ai</a> ·{" "}
        <a href="/llms.txt" className="text-[#174EA6] underline">
          /llms.txt
        </a>
      </div>
    </div>
  );
}
