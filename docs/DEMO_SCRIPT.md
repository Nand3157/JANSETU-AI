# JANSETU AI — Hackathon Demo Script (One Story, Full Chain)

> **Gujarati citizen road request → Gemini → hotspot → evidence → score → candidate project → budget simulation → policy brief → impact**

This script satisfies the final acceptance criterion: *A citizen submission must travel through the complete chain: AI understanding → evidence enrichment → deterministic score → candidate project → human review state → impact record.*

---

### 0. Prereqs (2 min)
```bash
npm install
# Terminal 1 — API 8080
npm run dev:api   # services/api via tsx, seeded with 4 clusters
# Terminal 2 — Web 3000
npm run dev:web   # or npm run build && npm run start
open http://localhost:3000
open http://localhost:8080/health
```
Synthetic demo data labeled `source: Verified dataset — synthetic demo` — not real gov stats.

### 1. Citizen PWA — Multilingual Submission (2 min)
1. Go to **Citizen → Submit** (`/citizen/submit`)
2. Select **ગુજરાતી (GU)** — shows `Gemini will detect & preserve intent`
3. Tap `Fill Gujarati demo` — populates:
   ```
   અમારા ગામનો રસ્તો વરસાદમાં બંધ થઈ જાય છે. હોસ્પિટલ જવા માટે ખૂબ સમય લાગે છે અને બાળકોને પણ સ્કૂલ જવામાં મુશ્કેલી પડે છે.
   Location: Village X, Vadodara District, Gujarat
   ```
4. **Voice alternative**: Tap `Tap to speak` → `MediaRecorder` captures `audio/webm` (mock), transcript returns same Gujarati (Web Speech API fallback). Shows `Gemini transcribing…`.
5. **Location**: Tap `Use device` → `navigator.geolocation` → `22.3072,73.1812 · device` (precise not exposed). Or keep `user_text`.
6. **Photo**: `PhotoUploader` → select JPG → preview + `mock://storage/...` (prod: Cloud Storage signed URL + Pub/Sub).
7. Tap **Submit & Analyze** → creates `citizen_requests/{id}` (status `received`) → backend:

**Call via API for judges:**
```bash
curl -X POST http://localhost:8080/api/requests \
  -H "Content-Type: application/json" -H "x-role: citizen" \
  -d '{"originalText":"અમારા ગામનો રસ્તો...","sourceLanguage":"gu","latitude":22.3072,"longitude":73.1812,"locationSource":"user_text"}'
# → { requestId: "_M2f..." }

curl -X POST http://localhost:8080/api/requests/_M2f.../analyze
# → intake { source_language gu, translated_text en, category roads/rural_road_access, urgency 4/5, evidence_phrases, ambiguities, ai_confidence 0.84 }
# → cluster { cl_vadodara_roads_01, requestCount 4219 } + local TF-IDF score 0.87 (MATCH_EXISTING)
# → priority { 78.4 high, components {demand 100, gap 60, pop 62, vuln 82, urgency 80, feas 68}, weightVersion v1 }
```

**Show AI Confirmation card**: category, problem_statement, location (district/region + `location_source` + confidence 72%), urgency, services `transport/healthcare/education`, groups `children/patients`, ambiguities. Buttons: `Looks correct ✓` / `Edit` — **never auto-submits**.

### 2. Government Dashboard — Hotspots & Evidence (2 min)
1. Login as **policymaker** (`/government` — role header shows `App Check + RBAC`).
2. **Filters**: `IN → Gujarat → Vadodara → All sectors → Last 90 days` (per PRD).
3. **KPIs**: Requests 6, Hotspots 4, High-priority 4, Recommended 2, Investment gap `₹4.2 Cr`.
4. **Hotspot Map**: Google Maps JS API (or fallback gradient). Heatmap via `BigQuery GIS` — `ST_GEOGPOINT` centroids, `GeoJSON` from `GET /api/analytics/hotspots`. Click pin `78` Vadodara → detail.
5. **Priority Queue**: sorted by `priorityScore` deterministic. Click `Cl_vadodara_roads_01 — 78.4 high`.
6. **Hotspot Detail**: Shows `4219 requests`, `pop 12400`, `investment gap 71`, `evidenceRefs: demographics:Vadodara, infrastructure:Vadodara, investment:Vadodara`.
7. **Score Visualization**: 6 horizontal bars (demand 30%, gap 20%, pop 15%, vuln 15%, urgency 10%, feas 10%) animated via `framer-motion`. Explain via `GET /api/clusters/cl_vadodara_roads_01/explain` → top drivers `demand (100), vulnerability (82)`, limiting `feasibility (68)`.

### 3. Candidate Project (1 min)
1. In Hotspot Detail tap **Generate candidate project** → `POST /api/projects/generate {clusterId}`:
```json
{
  "project": { "title": "All-Weather Rural Road Upgrade — Vadodara Cluster", "estimatedCost": 42000000, "estimatedBeneficiaries": 12400 },
  "recommendation": { "evidence": ["4218 requests","Road index 38/100"], "risks": [...], "data_gaps": ["Road length not surveyed"] },
  "labels": { "estimated_cost": "ESTIMATE — requires engineering survey" },
  "human_review_required": true
}
```
2. Project appears in **Recommended** KPI + status `pending_review`, `implementationStatus: proposed`.

### 4. Policy Copilot + Budget Simulator (1.5 min)
**Copilot prompts** (grounded only):
- `Which projects should we prioritize?` → ranked deterministic, evidence.
- `Why is Vadodara underserved?` → `infrastructure_gap 60`.
- `What fits within ₹10 Cr?` → structured portfolio.

**Budget Simulator**:
1. Set **Budget ₹10 Cr**, **Objective max_priority**, **Risk medium (feas ≥55)** → **Simulate Portfolio** → `POST /api/copilot/simulate`:
```json
{ "budget": 100000000, "objective":"max_priority", "risk_tolerance":"medium",
  "selected_projects": [...], "total_cost": 42000000, "estimated_beneficiaries": 12400,
  "unfunded_high_priority": [...], "trade_offs": "...", "human_review_notice": "..."
}
```
2. Show **equity** objective (vuln-weighted) and **low** risk (excludes low-feas) — demonstrates `feasibility` proxy.

### 5. Human Review & Impact Loop (1.5 min)
1. In Hotspot Detail → **Approve (human)** → `POST /api/projects/{id}/review {decision: approved}` → audit logged, `approvalStatus: approved`.
2. Transition **Proposed → Reviewed → Funded → In Progress → Completed → Impact** via `POST /api/projects/{id}/status {status}` buttons — each writes to `audit_logs`.
3. **Impact Dashboard**: `Baseline 45 min → Target 22 min → Actual —` (pending). Tap **Load Impact** → `GET /api/projects/{id}/impact` → observed vs estimated split, `data_quality: partial — estimates labeled`. Tap **Record Actual 28min** → `POST /api/projects/{id}/impact {actual:28, source: Observed — survey}` → `observed_changes: ["Travel time reduced — observed"]`.
4. **Policy Brief**: Tap **Generate Policy Brief** → `GET /api/projects/{id}/brief` → 12 sections (Executive Summary … Decision Required) via `08_POLICY_BRIEF_PROMPT`, all estimates labeled, sources listed, never claims funding unless in `investment_plans`.

### 6. Citizen Update (30 sec)
Back to **Citizen → My Requests — Tracking**: shows `clustered → priority_analyzed → government review` timeline. In production, would push update via `Pub/Sub → FCM`.

### 7. Governance Recap (30 sec)
- Trust Labels: `AI-assisted` `Verified dataset` `Estimated` `Human review required`
- Architecture boundary: Frontend experience, Backend authority, Gemini intelligence, Data evidence, Deterministic engine official score, Human decision
- Privacy: precise location minimized, aggregate analysis locality/district/region, no religion/caste/politics

**Stop condition:** All 32 tests in `tests/e2e_harness.js` pass — run `node tests/e2e_harness.js` live.

**Total demo:** ~9 min.
