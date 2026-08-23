const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://jansetu-ai-web-sooty.vercel.app";
const API_URL = process.env.NEXT_PUBLIC_API_URL || SITE_URL;

// Tools exposed by JANSETU AI MCP server
const TOOLS = [
  {
    name: "submit_request",
    description: "Submit a JANSETU AI citizen request (Gujarati/Hindi/English voice/text/photo) and get requestId",
    inputSchema: {
      type: "object",
      properties: {
        originalText: { type: "string", description: "Citizen voice text (e.g., Gujarati)" },
        sourceLanguage: { type: "string", enum: ["gu", "hi", "en", "auto"], default: "auto" },
        latitude: { type: "number" },
        longitude: { type: "number" },
      },
      required: ["originalText"],
    },
  },
  {
    name: "analyze_request",
    description: "Run JANSETU AI intake → cluster → deterministic v1 priority score for a request. Core chain.",
    inputSchema: {
      type: "object",
      properties: { requestId: { type: "string" } },
      required: ["requestId"],
    },
  },
  {
    name: "list_clusters",
    description: "List JANSETU AI demand clusters",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "get_cluster",
    description: "Get JANSETU AI cluster detail + priority score + evidence",
    inputSchema: { type: "object", properties: { clusterId: { type: "string", example: "cl_vadodara_roads_01" } }, required: ["clusterId"] },
  },
  {
    name: "hotspots",
    description: "Get JANSETU AI hotspots as GeoJSON (BigQuery GIS)",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "recommend_projects",
    description: "List JANSETU AI candidate projects ordered by priority",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "generate_project",
    description: "Generate candidate project from cluster",
    inputSchema: { type: "object", properties: { clusterId: { type: "string" } }, required: ["clusterId"] },
  },
  {
    name: "copilot",
    description: "Policy co-pilot grounded in JANSETU AI evidence (e.g., which projects within ₹10 Cr?)",
    inputSchema: { type: "object", properties: { question: { type: "string" } }, required: ["question"] },
  },
  {
    name: "simulate_budget",
    description: "Budget simulator: portfolio selection under constraint",
    inputSchema: {
      type: "object",
      properties: { budget: { type: "number" }, objective: { type: "string", enum: ["max_beneficiaries", "max_coverage"] }, risk_tolerance: { type: "string", enum: ["low", "medium", "high"] } },
    },
  },
];

const SERVER_INFO = {
  name: "jansetu-ai-mcp",
  displayName: "JANSETU AI MCP Server",
  version: "1.0.0",
  description: "MCP server for JANSETU AI — civic intelligence: citizen voice → evidence → deterministic priority → human review → impact",
  url: `${SITE_URL}/.well-known/mcp`,
  publisher: "JANSETU AI",
  homepage: SITE_URL,
  docs: `${SITE_URL}/docs`,
  openapi: `${SITE_URL}/openapi.json`,
  llms: `${SITE_URL}/llms.txt`,
  sitemap: `${SITE_URL}/sitemap.xml`,
  apiBase: API_URL,
  protocolVersion: "2025-03-26",
  transport: "streamable-http",
  capabilities: { tools: {} },
  tools: TOOLS,
};

function corsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Accept, Authorization, Mcp-Session-Id",
    "Access-Control-Expose-Headers": "Mcp-Session-Id, Vary",
    Vary: "Accept, Accept-Encoding",
  };
}

export async function GET() {
  return new Response(JSON.stringify(SERVER_INFO, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
      ...corsHeaders(),
    },
  });
}

export async function POST(req: Request) {
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    // empty body on handshake probe
  }

  const id = body?.id ?? null;
  const method = body?.method ?? "";

  // MCP initialize handshake — spec: POST with {"jsonrpc":"2.0","id":1,"method":"initialize","params":{...}}
  if (method === "initialize") {
    const response = {
      jsonrpc: "2.0",
      id,
      result: {
        protocolVersion: "2025-03-26",
        capabilities: { tools: {} },
        serverInfo: { name: "jansetu-ai-mcp", version: "1.0.0", title: "JANSETU AI MCP Server" },
        instructions:
          "JANSETU AI MCP: Use when citizen voice → evidence → priority is needed. Tools: submit_request, analyze_request, list_clusters, get_cluster, hotspots, recommend_projects, generate_project, copilot, simulate_budget. All recommendations include human_review_notice.",
      },
    };
    return new Response(JSON.stringify(response), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        ...corsHeaders(),
      },
    });
  }

  if (method === "tools/list" || method === "tools/call" || method === "ping") {
    // tools/list
    if (method === "tools/list") {
      return new Response(JSON.stringify({ jsonrpc: "2.0", id, result: { tools: TOOLS } }), {
        headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders() },
      });
    }
    if (method === "ping") {
      return new Response(JSON.stringify({ jsonrpc: "2.0", id, result: {} }), {
        headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders() },
      });
    }
    // tools/call — proxy hint: advise to call REST API directly
    const toolName = body?.params?.name;
    return new Response(
      JSON.stringify({
        jsonrpc: "2.0",
        id,
        result: {
          content: [
            {
              type: "text",
              text: `JANSETU AI tool ${toolName} — call the REST API instead: ${API_URL}/api/* . See ${SITE_URL}/openapi.json and ${SITE_URL}/docs/api . Inputs: ${JSON.stringify(
                body?.params?.arguments || {},
                null,
                2
              )}`,
            },
          ],
          isError: false,
        },
      }),
      { headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders() } }
    );
  }

  // Default handshake: return server info for Streamable HTTP probing
  // Many checkers do GET or POST without body just to see 200 + json
  return new Response(JSON.stringify(SERVER_INFO, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...corsHeaders(),
    },
  });
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}
