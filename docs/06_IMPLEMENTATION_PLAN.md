# JANSETU AI — IMPLEMENTATION PLAN

## Phase 1 — Foundation
Set up:
- GitHub
- Google Cloud project
- Firebase
- Gemini API
- Maps
- Firestore
- BigQuery
- Cloud Storage
- Cloud Run

Repo:
apps/
services/
data/
docs/
packages/

## Phase 2 — Frontend
Build:
1. landing
2. language selection
3. citizen home
4. voice/text submission
5. AI confirmation
6. status
7. policymaker login
8. dashboard shell

## Phase 3 — Backend
Build:
- auth middleware
- request service
- AI service
- scoring service
- analytics service

## Phase 4 — Gemini
Integrate:
- main system prompt
- citizen intake
- normalization
- clustering
- recommendation
- copilot
- impact reporting

Use structured JSON and server-side validation.

## Phase 5 — Citizen Experience
Voice/text
→ transcript
→ AI understanding
→ confirmation
→ request ID
→ status

## Phase 6 — Demo Data
Create synthetic/illustrative datasets for:
- citizen requests
- demographics
- infrastructure
- investment
- projects

Clearly label demo data.

## Phase 7 — GIS
Implement:
- request points
- project points
- administrative boundaries
- heatmap
- hotspot clusters

## Phase 8 — Clustering
Use:
category + geographic proximity + semantic similarity.
Prefer precision to aggressive merging.

## Phase 9 — Priority Engine
Implement:
30% demand
20% infrastructure gap
15% population impact
15% vulnerability
10% urgency
10% feasibility

Persist all components.

## Phase 10 — Project Recommendation
For each high-priority cluster generate:
- project title
- intervention
- beneficiaries
- cost if evidence exists
- outcomes
- risks
- data gaps

Always mark human review required.

## Phase 11 — Government Dashboard
Build:
- overview
- hotspots
- priority queue
- project detail
- copilot
- impact

## Phase 12 — Policy Simulator
Budget input, objective, risk tolerance.
Return selected portfolio, cost, impact, unfunded projects and trade-offs.

## Phase 13 — Impact Loop
Proposed → Reviewed → Funded → In Progress → Completed → Impact Measured

## Phase 14 — Testing
Functional, multilingual, noisy voice, mixed language, ambiguous location, duplicates, irrelevant requests, security, malformed AI JSON.

## Phase 15 — Hackathon Demo
One story:
Gujarati citizen road request
→ Gemini
→ hotspot
→ evidence
→ score
→ candidate project
→ budget simulation
→ policy brief
→ impact

## Priority

MUST:
voice/text, Gemini, multilingual analysis, Firestore, BigQuery, Maps, priority engine, dashboard, recommendation

SHOULD:
copilot, budget simulator, impact tracking, multilingual response

NICE:
WhatsApp, SMS, advanced embeddings, live BRICS data

## Final acceptance criterion
A citizen submission must travel through the complete chain:
AI understanding → evidence enrichment → deterministic score → candidate project → human review state → impact record.
