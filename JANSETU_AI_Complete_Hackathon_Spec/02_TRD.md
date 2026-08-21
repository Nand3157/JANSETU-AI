# JANSETU AI — TECHNICAL REQUIREMENTS DOCUMENT

## Architecture
Frontend → Firebase/Cloud Run APIs → AI/Data Services → Firestore/BigQuery/Storage → Maps/Analytics → Dashboards

## Frontend
- Next.js
- TypeScript
- Tailwind CSS or Material UI
- Firebase Auth
- Firebase SDK
- Firebase AI Logic
- Google Maps JavaScript API

Frontend responsibilities:
- multilingual UI
- voice/text/photo
- location permission
- AI confirmation
- request status
- maps
- dashboards
- evidence visualization
- copilot
- budget simulation
- impact visualization

Frontend must not:
- hold privileged service-account credentials
- own authoritative scoring
- bypass authorization

## Backend
- Node.js + TypeScript
- Cloud Run
- Firebase Admin SDK
- Firestore
- BigQuery
- BigQuery GIS
- Cloud Storage
- Pub/Sub
- Secret Manager

Backend responsibilities:
- authentication/authorization
- validation
- AI orchestration
- normalization
- clustering
- enrichment
- deterministic priority
- recommendations
- analytics
- audit logs
- impact calculations

## AI
Firebase AI Logic + Gemini Developer API
Use strict JSON schemas and validate AI output server-side.

## Processing
1. validate request
2. save request
3. store media
4. analyze with AI
5. validate normalized output
6. resolve geography
7. cluster
8. enrich with datasets
9. calculate score
10. generate candidate project
11. human review
12. implementation
13. impact measurement

## Services
- API Service
- AI Orchestrator
- Civic Intelligence Service
- Cluster Service
- Ranking Service
- Recommendation Service
- Analytics Service
- Policy Copilot Service
- Impact Service

## API
POST /api/requests
GET /api/requests/{id}
POST /api/requests/{id}/analyze
GET /api/clusters
GET /api/clusters/{id}
GET /api/projects/recommended
GET /api/projects/{id}
POST /api/projects/{id}/review
POST /api/copilot
GET /api/analytics/hotspots
GET /api/analytics/investment-gaps
GET /api/projects/{id}/impact

## Security
Firebase Authentication, App Check, Firestore rules, IAM, least privilege, Secret Manager, HTTPS, audit logs, role-based access, minimal personal data.

## Roles
citizen, analyst, policymaker, program_manager, admin, super_admin

## Performance MVP targets
- page load target < 3 sec on normal broadband
- request acknowledgement < 2 sec
- AI analysis asynchronous
- normal dashboard filter < 3 sec

## Observability
Track processing latency, AI failures, API errors, clustering failures, score failures, policy workflow transitions and system health. Avoid unnecessary logging of citizen content.
