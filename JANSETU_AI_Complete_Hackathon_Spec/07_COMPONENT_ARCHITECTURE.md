# JANSETU AI — COMPONENT ARCHITECTURE

## Frontend
### Citizen Web App
- multilingual UI
- voice/text/photo
- location
- confirmation
- status
- updates

### Government Web App
- dashboards
- maps
- filters
- evidence
- recommendations
- policy copilot
- budget simulation
- impact

## Backend
### API Service
Receives frontend requests.

### AI Orchestrator
Selects prompts, invokes models, validates structured output.

### Civic Intelligence Service
Normalizes and enriches requests.

### Cluster Service
Groups related requests.

### Ranking Service
Calculates official priority score.

### Recommendation Service
Creates candidate projects.

### Policy Copilot Service
Answers questions using authorized structured data.

### Impact Service
Calculates outcome metrics.

## Data
Firestore = operational state
BigQuery = analytics/GIS
Cloud Storage = media/documents

## Google Integration
Firebase = auth/hosting/app integration
Gemini = AI understanding/explanation
Google Maps = geocoding/maps
BigQuery GIS = geospatial analytics
Cloud Run = backend
Pub/Sub = asynchronous processing

## Architecture Boundary
Frontend = experience
Backend = authority
Gemini = intelligence
Data = evidence
Deterministic engine = official score
Human policymaker = final decision
