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

## Auto Deploy — Vercel

This repo is **auto-deploy enabled** for Vercel. Every `git push` to `main` deploys `apps/web` to production.

### How it works
- **Root `vercel.json`**: `buildCommand: npm run build --workspace=apps/web`, `outputDirectory: apps/web/.next`, `regions: bom1`, `github.autoAlias/autoJobCancelation: true`
- **Web `apps/web/vercel.json`**: Next.js framework, security headers (`Vary`, `X-Frame-Options`, `HSTS`), `/api/:path*` rewrites → API
- **`services/api/vercel.json`**: Express → `@vercel/node` (`dist/index.js`) if you deploy API to Vercel; Cloud Run remains an option
- **`.github/workflows/vercel-deploy.yml`**: GitHub Action — on `push: main` → typecheck + build → `amondnet/vercel-action@v25 --prod`; on `pull_request` → preview deploy. Triggers are native Vercel Git integration plus this workflow for CI guard.
- **`.github/workflows/ci.yml`**: CI only (no deploy) — typecheck + build matrix for PRs

### One-time Vercel setup (2 min)
1. **Import to Vercel**: https://vercel.com/new → Import `Nand3157/JANSETU-AI` → set **Root Directory** `apps/web` (or keep root and Vercel reads root `vercel.json`)
   - Framework Preset: `Next.js` — Build Command auto-detected as above
   - Install Command: `npm install`
2. **Connect GitHub**: Vercel → Project → Settings → Git → connected to `main` (auto-deploy on push now active)
3. **Add Env Vars** (Vercel → Settings → Environment Variables — **never commit**):
   ```
   NEXT_PUBLIC_API_URL=https://<your-api>.vercel.app  (or Cloud Run URL)
   NEXT_PUBLIC_SITE_URL=https://<your-web>.vercel.app
   NEXT_PUBLIC_FIREBASE_CONFIG={"apiKey":"...","projectId":"..."}  # safe, protected by Rules
   NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY=AIza...  # restrict to your domains in GCP Console
   ```
   API env (Vercel or Cloud Run Secrets — **server-only**, never `NEXT_PUBLIC_`):
   ```
   GEMINI_API_KEY=...
   GEMINI_MODEL=gemini-2.0-flash
   FIREBASE_SERVICE_ACCOUNT_JSON={"project_id":"...","private_key":"..."}
   FIREBASE_PROJECT_ID=jansetu-ai-ed677
   SUPABASE_URL=https://...supabase.co
   SUPABASE_SERVICE_ROLE_KEY=...  # rotate if previously in .env
   CORS_ORIGINS=https://<your-web>.vercel.app
   ALLOW_DEMO_AUTH=false
   SHOW_ERRORS=false
   NODE_ENV=production
   ```
4. **GitHub Action secrets** (for workflow deploy via `vercel-action` — optional if using native Vercel Git integration only):
   - `vercel.com` → Account → Tokens → create `VERCEL_TOKEN`
   - Run locally: `npx vercel link` (inside `apps/web` then root) → generates `.vercel/project.json` → copy `orgId` → `VERCEL_ORG_ID`, `projectId` → `VERCEL_PROJECT_ID`; API pair → `VERCEL_API_PROJECT_ID`
   - GitHub → `Nand3157/JANSETU-AI` → Settings → Secrets → Actions → add those + `NEXT_PUBLIC_API_URL` vars

### Verify auto deploy
```bash
git commit --allow-empty -m "chore: test vercel auto deploy"
git push origin main
# Vercel → Deployments → shows Building → Ready
# GitHub → Actions → Vercel Auto Deploy → green check
```

`ignoreCommand` avoids redundant web deploys when only docs/tests change. `bom1` (Mumbai) keeps latency low for India-first users.

---

Built for hackathon demo — synthetic data labeled as such. Swap `services/api/src/services/store.ts` with Firebase Admin SDK + BigQuery GIS for prod.
