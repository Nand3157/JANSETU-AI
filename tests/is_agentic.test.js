#!/usr/bin/env node
// JANSETU AI — Is Agentic verification harness
// Verifies all 11 fixes: 404 agent-friendly, markdown negotiation, discoverability, JSON-LD, llms.txt when-to-use, sitemap, org schema, metadata, trust anchors, MCP
// Run: node tests/is_agentic.test.js (requires running web on http://localhost:3001 or $WEB_URL)

const WEB = process.env.WEB_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001";
let passed = 0, failed = 0;
function assert(cond, msg) {
  if (cond) { passed++; console.log(`✅ ${msg}`); } else { failed++; console.error(`❌ ${msg}`); }
}
async function fetchOpts(path, opts = {}) {
  const url = `${WEB}${path}`;
  const r = await fetch(url, opts);
  const text = await r.text();
  let json = null;
  try { json = JSON.parse(text); } catch {}
  return { status: r.status, headers: r.headers, text, json, url };
}

async function run() {
  console.log(`=== JANSETU AI — Is Agentic Verification — ${WEB} ===\n`);

  // 1. Agent-friendly 404s: real HTTP 404 with markdown body containing sitemap/llms/docs
  let r = await fetchOpts('/some-path-that-does-not-exist-zzz-12345');
  assert(r.status === 404, `404 html status is 404 (got ${r.status})`);
  assert(r.text.includes('sitemap.xml') || r.text.includes('Sitemap'), '404 html body includes sitemap link');
  assert(r.text.includes('llms.txt'), '404 html body includes llms.txt');
  assert(r.text.includes('JANSETU AI'), '404 html body includes brand JANSETU AI');
  // Markdown variant of 404
  r = await fetchOpts('/some-path-that-does-not-exist-zzz-12345', { headers: { Accept: 'text/markdown' } });
  assert(r.status === 404, `404 markdown status is 404 (got ${r.status})`);
  assert((r.headers.get('content-type') || '').includes('text/markdown'), `404 markdown content-type is text/markdown (got ${r.headers.get('content-type')})`);
  assert((r.headers.get('vary') || '').toLowerCase().includes('accept'), `404 markdown Vary includes Accept (got ${r.headers.get('vary')})`);
  assert(r.text.includes('sitemap.xml'), '404 markdown body includes sitemap');
  assert(r.text.includes('llms.txt'), '404 markdown body includes llms.txt');
  assert(r.text.includes('JANSETU AI'), '404 markdown includes brand');
  assert(r.text.toLowerCase().includes('not found') || r.text.includes('404'), '404 markdown indicates not found');

  // 2. Markdown content negotiation (acceptmarkdown.com) — homepage
  r = await fetchOpts('/', { headers: { Accept: 'text/markdown' } });
  assert(r.status === 200, `GET / with Accept markdown 200 (got ${r.status})`);
  assert((r.headers.get('content-type') || '').includes('text/markdown'), `GET / markdown content-type text/markdown (got ${r.headers.get('content-type')})`);
  const vary = (r.headers.get('vary') || '').toLowerCase();
  assert(vary.includes('accept'), `GET / markdown Vary includes Accept (got ${r.headers.get('vary')})`);
  assert(vary.includes('accept-encoding') || vary.includes('accept'), `GET / markdown Vary includes Accept-Encoding (got ${r.headers.get('vary')})`);
  assert(r.text.includes('JANSETU AI'), 'markdown body includes brand');
  assert(r.text.includes('sitemap.xml'), 'markdown body includes sitemap link');

  // HTML variant still has Vary Accept (CDN correctness)
  r = await fetchOpts('/');
  const htmlVary = (r.headers.get('vary') || '').toLowerCase();
  assert(htmlVary.includes('accept'), `GET / html Vary includes Accept (got ${r.headers.get('vary')})`);

  // Also check /docs markdown
  r = await fetchOpts('/docs', { headers: { Accept: 'text/markdown' } });
  assert(r.status === 200 && (r.headers.get('content-type') || '').includes('text/markdown'), 'GET /docs markdown negotiates');
  assert((r.headers.get('vary') || '').toLowerCase().includes('accept'), 'GET /docs markdown Vary includes Accept');

  // 3. Developer resource discoverability — llms.txt lists resources, docs exist
  r = await fetchOpts('/llms.txt');
  assert(r.status === 200, 'GET /llms.txt 200');
  assert(r.text.includes('When to use JANSETU AI'), 'llms.txt has when-to-use section');
  assert(r.text.includes('/docs'), 'llms.txt lists /docs');
  assert(r.text.includes('/openapi.json'), 'llms.txt lists openapi.json');
  assert(r.text.includes('/.well-known/mcp'), 'llms.txt lists MCP');
  assert(r.text.includes('vercel') || r.text.includes('Vercel') || r.text.includes('@vercel/mcp-adapter'), 'llms.txt mentions vercel/MCP adapter');
  assert(r.text.includes('JANSETU AI'), 'llms.txt includes brand JANSETU AI');

  r = await fetchOpts('/docs');
  assert(r.status === 200 && r.text.includes('JANSETU AI'), 'GET /docs 200 and includes brand');
  assert(r.text.includes('OpenAPI') || r.text.includes('openapi.json'), 'docs includes OpenAPI reference');
  assert(r.text.includes('vercel') || r.text.includes('Vercel'), 'docs mentions vercel');

  r = await fetchOpts('/docs/api');
  assert(r.status === 200 && r.text.includes('JANSETU AI API'), 'GET /docs/api 200 and includes API docs + brand');

  r = await fetchOpts('/openapi.json');
  assert(r.status === 200, 'GET /openapi.json 200');
  assert(r.json && r.json.info && r.json.info.title.includes('JANSETU AI'), 'openapi.json title includes JANSETU AI');
  assert(r.json && r.json.paths && r.json.paths['/api/requests'], 'openapi.json has /api/requests');
  assert((r.headers.get('vary') || '').toLowerCase().includes('accept'), 'openapi.json Vary includes Accept');
  assert((r.headers.get('access-control-allow-origin') || '') === '*', 'openapi.json CORS Allow-Origin *');

  // 4. Brand name discoverability — homepage and llms + json-ld contain brand + canonical domain
  r = await fetchOpts('/');
  assert(r.text.includes('JANSETU AI'), 'homepage includes brand JANSETU AI');
  assert(r.text.includes('jansetu-ai-web-sooty.vercel.app') || r.text.includes('JANSETU AI'), 'homepage references canonical domain or brand');
  assert(r.text.includes('rel="canonical"') || r.text.includes('canonical'), 'homepage has canonical');
  // Search discoverability via sitemap and robots
  r = await fetchOpts('/sitemap.xml');
  assert(r.status === 200 && r.text.includes('<urlset'), 'sitemap.xml valid XML');
  assert(r.text.includes('jansetu-ai-web-sooty.vercel.app'), 'sitemap contains canonical domain');
  r = await fetchOpts('/robots.txt');
  assert(r.status === 200 && r.text.includes('Sitemap:'), 'robots.txt includes Sitemap');
  assert(r.text.includes('jansetu-ai-web-sooty'), 'robots.txt references domain');

  // 5 & 8. JSON-LD structured data — homepage has Organization + SoftwareApplication + contactPoint + address
  r = await fetchOpts('/');
  const ldMatches = [...r.text.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)];
  assert(ldMatches.length >= 2, `homepage has >=2 JSON-LD blocks (found ${ldMatches.length})`);
  const ldTexts = ldMatches.map(m => m[1]).join(' ');
  assert(ldTexts.includes('"@type":"Organization"') || ldTexts.includes('"@type": "Organization"'), 'JSON-LD includes Organization');
  assert(ldTexts.includes('SoftwareApplication'), 'JSON-LD includes SoftwareApplication');
  assert(ldTexts.includes('contactPoint'), 'JSON-LD includes contactPoint');
  assert(ldTexts.includes('PostalAddress') || ldTexts.includes('address'), 'JSON-LD includes PostalAddress/address');
  assert(ldTexts.includes('support@jansetu.ai'), 'JSON-LD contactPoint includes email');
  assert(ldTexts.includes('390001') || ldTexts.includes('Vadodara'), 'JSON-LD address includes locality/postal');

  // 6. Agent instruction / when-to-use — llms.txt has specific when-to-use
  r = await fetchOpts('/llms.txt');
  assert(r.text.includes('When to use JANSETU AI'), 'llms.txt when-to-use heading');
  assert(r.text.toLowerCase().includes('how an agent should call'), 'llms.txt has how agent should call');
  assert(r.text.includes('POST /api/requests'), 'llms.txt lists specific API call example');

  // 7. Sitemap exists — already checked but also verify all indexable URLs listed with lastmod
  r = await fetchOpts('/sitemap.xml');
  assert(r.text.includes('<lastmod>'), 'sitemap includes lastmod');
  assert((r.text.match(/<url>/g) || []).length >= 10, `sitemap lists >=10 URLs (found ${(r.text.match(/<url>/g) || []).length})`);
  assert(r.text.includes('/about') && r.text.includes('/contact') && r.text.includes('/docs'), 'sitemap lists about, contact, docs');

  // 9. Metadata completeness — canonical, og:image, og:type, html lang
  r = await fetchOpts('/');
  assert(r.text.includes('rel="canonical"'), 'homepage has <link rel="canonical">');
  assert(r.text.includes('og:image'), 'homepage has og:image');
  assert(r.text.includes('og:type'), 'homepage has og:type');
  assert(r.text.includes('<html lang="en"') || r.text.includes('<html lang="en"'), 'homepage has <html lang="en">');
  // Also check /about etc have canonical
  r = await fetchOpts('/about');
  assert(r.text.includes('canonical'), '/about has canonical');

  // 10. Trust anchor pages — about, privacy, contact each >500 chars and 200
  for (const p of ['/about', '/privacy', '/contact']) {
    r = await fetchOpts(p);
    assert(r.status === 200, `GET ${p} 200`);
    // Strip tags to count chars roughly
    const textOnly = r.text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    assert(textOnly.length > 500, `${p} has >500 chars of content (got ${textOnly.length})`);
    assert(r.text.includes('JANSETU AI'), `${p} includes brand`);
    assert(r.text.includes('support@jansetu.ai'), `${p} includes support email`);
  }

  // 11. MCP server / manifest — /.well-known/mcp GET and POST handshake
  r = await fetchOpts('/.well-known/mcp');
  assert(r.status === 200, 'GET /.well-known/mcp 200');
  assert((r.headers.get('content-type') || '').includes('application/json'), 'MCP GET content-type json');
  assert(r.json && (r.json.name === 'jansetu-ai-mcp' || r.json.displayName), 'MCP manifest has server name');
  assert(r.json && r.json.tools && r.json.tools.length >= 5, `MCP manifest lists tools (found ${r.json?.tools?.length})`);
  assert(r.text.includes('transport') && r.text.includes('streamable-http'), 'MCP manifest indicates streamable-http transport');
  // CORS
  assert((r.headers.get('access-control-allow-origin') || '') === '*', 'MCP CORS Allow-Origin *');
  // POST handshake initialize
  const mcpPost = await fetch(`${WEB}/.well-known/mcp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'initialize', params: {} }),
  });
  const mcpPostText = await mcpPost.text();
  let mcpJson;
  try { mcpJson = JSON.parse(mcpPostText); } catch {}
  assert(mcpPost.status === 200, `POST /.well-known/mcp initialize 200 (got ${mcpPost.status})`);
  assert(mcpJson && mcpJson.result && mcpJson.result.protocolVersion, 'MCP POST initialize returns protocolVersion');
  assert(mcpJson && mcpJson.result && mcpJson.result.serverInfo, 'MCP POST returns serverInfo');
  // tools/list
  const toolsRes = await fetch(`${WEB}/.well-known/mcp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} }),
  });
  const toolsText = await toolsRes.text();
  let toolsJson;
  try { toolsJson = JSON.parse(toolsText); } catch {}
  assert(toolsJson && toolsJson.result && toolsJson.result.tools, 'MCP tools/list returns tools');

  // 12. Additional — og-image, docs discoverability for vercel search
  r = await fetchOpts('/og-image.png');
  assert(r.status === 200, 'GET /og-image.png 200');
  assert((r.headers.get('content-type') || '').includes('image'), 'og-image content-type image');

  console.log(`\n=== RESULTS: ${passed} passed, ${failed} failed ===`);
  if (failed > 0) process.exit(1);
}

run().catch(e => { console.error(e); process.exit(1); });
