import {
  LayoutDashboard, Map, Layers, Sparkles, Wallet, BarChart3, Database, Shield, Settings,
  Home, Mic, FileText, User, Bell, MapPinned, BookOpen, Code2, Compass, HelpCircle, Globe2,
  Languages, Scale, Mail, Accessibility, KeyRound, Users, Gauge, Calculator,
} from "lucide-react";

/**
 * The navigable surface of JANSETU AI, in one place.
 *
 * This is the index the command palette searches, so it doubles as the honest
 * map of the product: every entry is a real route, grouped by the portal it
 * belongs to.
 *
 * `keywords` carry the vocabulary a citizen or official would actually type,
 * including Gujarati and Hindi words for the everyday needs people report.
 * Searching "પાણી" or "सड़क" finds the right surface — the same three languages
 * the product accepts by voice.
 */
export type AppRouteGroup = "Citizen" | "Government" | "Reference" | "Account";

export type AppRoute = {
  href: string;
  label: string;
  group: AppRouteGroup;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
  /** What this surface is for — shown as the palette row's second line. */
  hint: string;
  keywords?: string[];
};

export const APP_ROUTES: AppRoute[] = [
  // ── Citizen ──────────────────────────────────────────────────────────────
  {
    href: "/citizen",
    label: "Citizen home",
    group: "Citizen",
    icon: Home,
    hint: "Your requests and what is happening with them",
    keywords: ["start", "portal", "my area", "ઘર", "होम"],
  },
  {
    href: "/citizen/submit",
    label: "Raise a community need",
    group: "Citizen",
    icon: Mic,
    hint: "Speak, type or photograph an issue",
    keywords: ["new", "report", "complaint", "voice", "photo", "ફરિયાદ", "શિકાયત", "शिकायत", "रिपोर्ट"],
  },
  {
    href: "/citizen/voice",
    label: "Record by voice",
    group: "Citizen",
    icon: Mic,
    hint: "Speak in Gujarati, Hindi or English",
    keywords: ["audio", "mic", "transcribe", "અવાજ", "બોલો", "आवाज़", "बोलिए"],
  },
  {
    href: "/citizen/requests",
    label: "My requests",
    group: "Citizen",
    icon: FileText,
    hint: "Track status, cluster and priority",
    keywords: ["status", "track", "history", "સ્થિતિ", "स्थिति"],
  },
  {
    href: "/citizen/community",
    label: "Community impact",
    group: "Citizen",
    icon: BarChart3,
    hint: "What your area asked for, and what changed",
    keywords: ["impact", "progress", "અસર", "प्रभाव"],
  },
  {
    href: "/citizen/location",
    label: "Set my location",
    group: "Citizen",
    icon: MapPinned,
    hint: "Village, PIN code or device GPS",
    keywords: ["gps", "pin", "village", "ગામ", "स्थान", "गाँव"],
  },
  {
    href: "/citizen/notifications",
    label: "Notifications",
    group: "Citizen",
    icon: Bell,
    hint: "Updates on your submissions",
    keywords: ["alerts", "સૂચના", "सूचना"],
  },
  {
    href: "/citizen/profile",
    label: "My profile",
    group: "Citizen",
    icon: User,
    hint: "Language, identity and consent",
    keywords: ["account", "language", "settings", "પ્રોફાઇલ", "प्रोफ़ाइल"],
  },

  // ── Government ───────────────────────────────────────────────────────────
  {
    href: "/government",
    label: "Overview",
    group: "Government",
    icon: LayoutDashboard,
    hint: "Demand, priority and investment at a glance",
    keywords: ["dashboard", "kpi", "summary", "ડેશબોર્ડ", "डैशबोर्ड"],
  },
  {
    href: "/government/map",
    label: "Demand map",
    group: "Government",
    icon: Map,
    hint: "Where the requests are concentrated",
    keywords: ["gis", "hotspot", "geojson", "heatmap", "નકશો", "नक्शा"],
  },
  {
    href: "/government/clusters",
    label: "Issue clusters",
    group: "Government",
    icon: Layers,
    hint: "Deduplicated citizen demand, scored",
    keywords: ["dedup", "group", "category", "water", "roads", "power", "પાણી", "पानी", "રસ્તો", "सड़क"],
  },
  {
    href: "/government/projects",
    label: "Priority projects",
    group: "Government",
    icon: Sparkles,
    hint: "Recommended interventions awaiting review",
    keywords: ["recommendation", "approve", "review", "project", "પ્રોજેક્ટ", "परियोजना"],
  },
  {
    href: "/government/investment",
    label: "Investment gaps",
    group: "Government",
    icon: Wallet,
    hint: "Required against allocated, by district",
    keywords: ["funding", "budget", "gap", "નાણું", "निधि"],
  },
  {
    href: "/government/copilot",
    label: "Policy Copilot",
    group: "Government",
    icon: Compass,
    hint: "Ask grounded questions, every answer cites sources",
    keywords: ["ask", "ai", "gemini", "question", "संवाद", "बातचीत"],
  },
  {
    href: "/government/budget",
    label: "Budget simulator",
    group: "Government",
    icon: Calculator,
    hint: "What fits within a given outlay",
    keywords: ["what if", "cr", "lakh", "portfolio", "બજેટ", "बजट"],
  },
  {
    href: "/government/impact",
    label: "Impact dashboard",
    group: "Government",
    icon: BarChart3,
    hint: "Baseline, target and observed outcomes",
    keywords: ["outcome", "measured", "અસર", "प्रभाव"],
  },
  {
    href: "/government/explorer",
    label: "Data explorer",
    group: "Government",
    icon: Database,
    hint: "Query requests, clusters and evidence",
    keywords: ["search", "table", "sql", "evidence", "ડેટા", "डेटा"],
  },
  {
    href: "/government/admin/weights",
    label: "Ranking weights",
    group: "Government",
    icon: Scale,
    hint: "The pinned, versioned priority formula",
    keywords: ["formula", "priority", "version", "weights", "वेट"],
  },
  {
    href: "/government/admin/audit",
    label: "Audit logs",
    group: "Government",
    icon: Shield,
    hint: "Who decided what, and when",
    keywords: ["trail", "compliance", "લોગ", "लॉग"],
  },
  {
    href: "/government/admin/users",
    label: "Users",
    group: "Government",
    icon: Users,
    hint: "Officials with portal access",
    keywords: ["team", "officials", "access"],
  },
  {
    href: "/government/admin/roles",
    label: "Roles",
    group: "Government",
    icon: Shield,
    hint: "Who may review, approve or publish",
    keywords: ["permissions", "rbac", "ભૂમિકા", "भूमिका"],
  },
  {
    href: "/government/admin/languages",
    label: "Languages",
    group: "Government",
    icon: Languages,
    hint: "Interface and intake languages",
    keywords: ["gujarati", "hindi", "english", "ગુજરાતી", "हिन्दी"],
  },
  {
    href: "/government/admin/health",
    label: "System health",
    group: "Government",
    icon: Gauge,
    hint: "API, Gemini, Firestore and storage status",
    keywords: ["status", "uptime", "debug", "diagnostics", "સ્થિતિ", "स्थिति"],
  },
  {
    href: "/government/admin",
    label: "Administration",
    group: "Government",
    icon: Settings,
    hint: "Configuration and governance controls",
    keywords: ["config", "setting", "સેટિંગ", "सेटिंग"],
  },

  // ── Reference ────────────────────────────────────────────────────────────
  {
    href: "/how-it-works",
    label: "How it works",
    group: "Reference",
    icon: Compass,
    hint: "Voice to action, in six steps",
    keywords: ["process", "pipeline", "કેવી રીતે", "कैसे"],
  },
  {
    href: "/impact",
    label: "Measured impact",
    group: "Reference",
    icon: BarChart3,
    hint: "What changed, with sources",
    keywords: ["results", "proof", "outcome"],
  },
  {
    href: "/docs",
    label: "Documentation",
    group: "Reference",
    icon: BookOpen,
    hint: "How the platform works end to end",
    keywords: ["guide", "manual", "reference", "દસ્તાવેજ", "दस्तावेज़"],
  },
  {
    href: "/docs/api",
    label: "API reference",
    group: "Reference",
    icon: Code2,
    hint: "Endpoints, schemas and examples",
    keywords: ["api", "endpoint", "openapi", "dev", "कोड"],
  },
  {
    href: "/brics",
    label: "BRICS configuration",
    group: "Reference",
    icon: Globe2,
    hint: "Languages, currency and datasets per country",
    keywords: ["countries", "global", "scale", "દેશ", "देश"],
  },
  {
    href: "/about",
    label: "About JANSETU AI",
    group: "Reference",
    icon: HelpCircle,
    hint: "Mission, governance and safeguards",
    keywords: ["mission", "team", "governance", "વિશે", "बारे"],
  },
  {
    href: "/accessibility",
    label: "Accessibility",
    group: "Reference",
    icon: Accessibility,
    hint: "Our commitments and known gaps",
    keywords: ["a11y", "screen reader", "keyboard", "સુલભતા"],
  },
  {
    href: "/contact",
    label: "Contact",
    group: "Reference",
    icon: Mail,
    hint: "Reach the team",
    keywords: ["email", "support", "help", "સંપર્ક", "संपर्क"],
  },

  // ── Account ──────────────────────────────────────────────────────────────
  {
    href: "/login",
    label: "Log in",
    group: "Account",
    icon: KeyRound,
    hint: "Citizen, official or admin",
    keywords: ["sign in", "portal", "પ્રવેશ", "लॉगिन"],
  },
  {
    href: "/register",
    label: "Create account",
    group: "Account",
    icon: User,
    hint: "Raise and track your own needs",
    keywords: ["sign up", "new", "નોંધણી", "रजिस्टर"],
  },
  {
    href: "/reset-password",
    label: "Reset password",
    group: "Account",
    icon: KeyRound,
    hint: "Recover access to your account",
    keywords: ["forgot", "password", "પાસવર્ડ"],
  },
];

/** Cheapest possible match: does the query look like a sub-phrase typed in order? */
function subsequenceScore(text: string, query: string): number {
  let ti = 0;
  let gapPenalty = 0;
  let lastHit = -1;
  for (const ch of query) {
    const found = text.indexOf(ch, ti);
    if (found === -1) return 0;
    if (lastHit !== -1 && found - lastHit > 1) gapPenalty += found - lastHit - 1;
    lastHit = found;
    ti = found + 1;
  }
  return Math.max(1, 10 - gapPenalty);
}

/**
 * Rank routes for a query. Label hits beat hint hits beat keyword hits, and
 * nothing is returned unless every token matched something — an empty result
 * is honest, a fuzzy half-match is not.
 */
export function searchRoutes(query: string, routes: AppRoute[] = APP_ROUTES): AppRoute[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const tokens = q.split(/\s+/).filter(Boolean);
  const scored: { route: AppRoute; score: number }[] = [];

  for (const route of routes) {
    const label = route.label.toLowerCase();
    const hint = route.hint.toLowerCase();
    const keys = (route.keywords || []).join(" ").toLowerCase();
    const group = route.group.toLowerCase();
    let total = 0;
    let matchedAll = true;

    for (const t of tokens) {
      let tokenScore = 0;
      if (label.startsWith(t)) tokenScore += 60;
      else if (label.includes(t)) tokenScore += 40;
      if (hint.includes(t)) tokenScore += 18;
      if (keys.includes(t)) tokenScore += 26;
      if (group.includes(t)) tokenScore += 10;
      if (!tokenScore) {
        const sub = Math.max(subsequenceScore(label, t), subsequenceScore(keys, t) - 4);
        if (sub) tokenScore += sub;
      }
      if (!tokenScore) {
        matchedAll = false;
        break;
      }
      total += tokenScore;
    }
    if (matchedAll && total > 0) scored.push({ route, score: total });
  }

  return scored.sort((a, b) => b.score - a.score).map((s) => s.route);
}
