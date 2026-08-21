# JANSETU AI — Digital Public Good

> Citizen Voice → AI Understanding → Evidence Fusion → Transparent Prioritization → Human Decision → Implementation → Impact

Gujarati citizen speaks about monsoon road closure → Gemini understands → clustering → demographic/infrastructure/investment join → deterministic priority score → candidate project → policymaker evidence → impact tracking.

## Architecture
```
Frontend (Next.js, Tailwind, Maps, PWA) → Cloud Run APIs (Express, Firebase Admin, Gemini, BigQuery GIS) → Firestore / BigQuery / Storage
```

**Frontend is untrusted.** Backend owns validation, auth, AI orchestration, clustering, deterministic scoring, recommendations, audit.

**AI Governance:** Gemini MAY understand/classify/translate/explain/draft; MUST NOT invent evidence, alter weights silently, approve funding, or override authoritative data.

## Deterministic Priority Engine v1
```
priority_score = demand×0.30 + infrastructure_gap×0.20 + population_impact×0.15 + vulnerability×0.15 + urgency×0.10 + feasibility×0.10
```
Every component + weightVersion persisted. Gemini explains, not overrides.

Band: critical ≥80 · high 65–79 · moderate 45–64 · low <45

## Stack
- **Frontend:** Next.js 14 · TypeScript · Tailwind · shadcn/ui · Magic UI · React Bits · Framer Motion · Google Maps Platform
- **Backend:** Node.js + TypeScript · Express · Firebase Admin · Firestore · BigQuery GIS · Pub/Sub · Secret Manager · Gemini Developer API
- **Data:** demo synthetic (clearly labeled) — see `data/demo/`

## Design Systems Used
- https://github.com/shadcn-ui/ui (base system, Card/Button/Badge/Tabs)
- https://github.com/magicuidesign/magicui (aurora, beam-border, shimmer, particles)
- https://github.com/DavidHDev/react-bits (BlurText, CountUp, Aurora, Glass cards)
- https://github.com/karthikmudunuri/eldoraui, indie-ui, hyperui, lndev-ui, fancy, coss, kokonutui, uiverse/galaxy

Visual: deep civic blue `#0F3557` + green `#0F9D58` + amber/red neutrals, glassmorphism, calm trustworthy civic tech.

## Repo Layout
```
apps/web              # Citizen PWA + Government dashboard
services/api          # Cloud Run API — requests, clusters, projects, copilot, analytics
packages/shared       # Types, priority engine, Zod schemas (shared determinism)
data/demo             # Synthetic demographics / infra / investment / requests
docs/                 # PRD, TRD, UI/UX, Backend Schema, prompts
```

## Quickstart
```bash
npm install
# Terminal 1 — API (port 8080)
npm run dev:api
# Terminal 2 — Web (port 3000)
npm run dev:web
# Open http://localhost:3000
# Citizen: /citizen/submit  → fill Gujarati demo → Submit & Analyze
# Government: /government   → Hotspots, Priority Queue, Copilot, Budget Simulator
```

### E2E Demo (Gujarati)
1. `POST /api/requests { originalText: "અમારા ગામ..." }` → 201 + requestId
2. `POST /api/requests/{id}/analyze` → intake (gu→en), clustering MATCH_EXISTING `cl_vadodara_roads_01`, scoring 78.5/high, evidence trace
3. Visit `/government` → hotspot 4218 req, pop 12,400, road index 38/100, vulnerability 82/100, investment gap 71
4. Policy copilot: “Which projects should we prioritize within ₹10 Cr?” → portfolio + trade-offs
5. Impact: `/api/projects/{id}/impact` → baseline→target→actual

## API
| Method | Path | Description |
|---|---|---|
| POST | /api/requests | Submit citizen request |
| GET | /api/requests/{id} | Fetch request |
| POST | /api/requests/{id}/analyze | AI intake → cluster → score (core chain) |
| GET | /api/clusters | List clusters |
| GET | /api/clusters/{id} | Cluster + members |
| POST | /api/clusters/{id}/score | Re-score deterministically |
| GET | /api/clusters/{id}/explain | Explain score (drivers/limiters) |
| GET | /api/projects/recommended | Candidate projects |
| POST | /api/projects/generate | Generate from cluster |
| POST | /api/projects/{id}/review | Human approve/reject (audit) |
| GET | /api/projects/{id}/impact | Baseline/target/actual |
| POST | /api/copilot | Policy Q&A (grounded) |
| GET | /api/analytics/hotspots | GeoJSON + hotspots |
| GET | /api/analytics/investment-gaps | Gaps |
| GET | /api/analytics/kpis | KPIs + trend |

All responses include `human_review_notice` where recommendation.

## Firestore Collections
`users`, `citizen_requests`, `request_clusters`, `projects`, `investment_plans`, `audit_logs` — see `docs/05_BACKEND_SCHEMA.md`.

Never store only final priority score; store every component + weightVersion.

---

Built for hackathon demo — synthetic data labeled as such. Swap `services/api/src/services/store.ts` with Firebase Admin SDK + BigQuery GIS for prod.
