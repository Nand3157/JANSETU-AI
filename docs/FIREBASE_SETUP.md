# JANSETU AI — Google Stack Setup (Firebase · Gemini · Maps)

All secret keys live **server-side only** (`services/api`). The browser gets only
Firebase's public web config and a domain-restricted Maps key. Follow these steps in order.

---

## 0. Protect your secrets first

1. `.gitignore` already excludes `.env*` — verify before committing:
   ```
   git check-ignore apps/web/.env.local services/api/.env
   ```
2. Copy the templates:
   - `cp .env.example apps/web/.env.local` → fill only `NEXT_PUBLIC_*` keys
   - `cp .env.example services/api/.env` → fill server keys
3. The API **validates config at startup** — missing Firebase/Gemini vars simply log
   "mock mode" and continue; production should run with all values set.

---

## 1. Create the Firebase project (database, auth, storage, AI proxy)

1. Go to https://console.firebase.google.com → **Add project** → name it `jansetu-ai`
   (or reuse an existing Google Cloud project).
2. Upgrade to **Blaze plan** (required for Cloud Storage + outbound AI calls).

### 1a. Web app config → `NEXT_PUBLIC_FIREBASE_CONFIG`

3. Project settings (⚙) → **General** → *Your apps* → **</> Web app** → register as `jansetu-web`.
4. Copy the `firebaseConfig` object, minify it to ONE line, paste into
   `apps/web/.env.local`:
   ```
   NEXT_PUBLIC_FIREBASE_CONFIG={"apiKey":"...","authDomain":"...","projectId":"...","storageBucket":"...","messagingSenderId":"...","appId":"..."}
   ```
   This value is safe to expose — it identifies your project but authorizes nothing;
   Firestore/Storage Security Rules are the enforcement layer.

### 1b. Authentication

5. Build → **Authentication** → Get started.
6. Enable **Email/Password** (and optionally **Google**, **Anonymous**).
7. Authorized domains: add `localhost` and your production domain.

### 1c. Firestore database (+ deploy rules)

8. Build → **Firestore Database** → Create database → **Production mode** → region
   `asia-south1` (Mumbai) for India-first latency.
9. Deploy the repo's rules (deny-by-default, role-based):
   ```bash
   npm i -g firebase-tools
   firebase login
   firebase use --add            # select jansetu-ai
   firebase deploy --only firestore:rules \
     --project jansetu-ai \
     # when prompted, rules file = data/firestore/firestore.rules
   ```

### 1d. Roles via custom claims (one-time)

10. Use the bundled helper (handles firebase-admin v14's new module layout):
    ```bash
    node scripts/set-role.mjs <USER_UID> policymaker
    ```
    Roles: `citizen`, `analyst`, `policymaker`, `program_manager`, `admin`, `super_admin`.
    The API middleware trusts **only** this verified claim — never client state.

### 1e. Service account → API env

11. Project settings → **Service accounts** → *Firebase Admin SDK* → **Generate new private key**
    → save as `services/api/service-account.json` (NEVER commit).
12. Either set in `services/api/.env`:
    - `GOOGLE_APPLICATION_CREDENTIALS=./service-account.json` + `FIREBASE_PROJECT_ID=jansetu-ai`
    - or paste the whole JSON on one line into `FIREBASE_SERVICE_ACCOUNT_JSON=`
13. Storage: Build → **Storage** → Get started → bucket name like `jansetu-ai.appspot.com`
    → set `FIREBASE_STORAGE_BUCKET=jansetu-ai.appspot.com`.
14. Deploy storage rules:
    ```bash
    firebase deploy --only storage --project jansetu-ai
    # rules file = data/firestore/storage.rules
    ```

### 1f. Seed demo data (optional)

15. ```bash
    cd data/firestore && npm i firebase-admin && FIREBASE_SERVICE_ACCOUNT_JSON="$(cat ../../services/api/service-account.json)" node seed.js
    ```

---

## 2. Gemini prompt processing (server-side only)

16. https://aistudio.google.com → **Get API key** → create key restricted to project.
17. Paste into `services/api/.env`:
    ```
    GEMINI_API_KEY=AIza...
    GEMINI_MODEL=gemini-2.0-flash
    GEMINI_DAILY_CAP=500
    ```
18. Prompt templates load automatically from `docs/prompts/01..08_*.txt|md`.
19. Spend protection already wired in code: per-IP rate limit on `/api/copilot`,
    `/analyze` + a hard daily call counter (`ai_usage/{date}` in Firestore).
    Also add a billing budget alert: Google Cloud Console → Billing → Budgets →
    alert at e.g. ₹1,000/month.

> Optional hardening later: enable **Firebase App Check** (reCAPTCHA Enterprise) so only
> your web app can reach the API, and swap the AI Studio key for Vertex AI via ADC
> (no static key at all).

---

## 3. Google Maps JS API (hotspot heatmaps)

20. https://console.cloud.google.com → APIs & Services → **Enable**: *Maps JavaScript API*
    (+ optionally *Places API*, *Geocoding API*).
21. Credentials → Create **API key** → **Restrict key**:
    - *Application restrictions* → HTTP referrers → add:
      `http://localhost:3000/*`, `https://your-domain.com/*`
    - *API restrictions* → Maps JavaScript API only.
22. Web env (`apps/web/.env.local`) — note the BROWSER suffix:
    ```
    NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY=AIza...
    ```
23. Billing caps: Cloud Console → Billing → Budgets & alerts; Maps shows usage under
    APIs & Services → Dashboard. The app degrades gracefully to the mock map without a key.

---

## 4. Run everything

```bash
npm install
# terminal 1
npm run dev:api        # Express :8080 — logs "✓ Firebase Admin initialized"
# terminal 2
npm run dev:web        # Next.js :3000
```

Startup checklist printed by the API:
- `✓ Firebase Admin initialized` → Firestore/Storage/ID-token verification live
- `Gemini daily cap reached` → mock fallback engaged until next UTC day
- `ALLOW_DEMO_AUTH=false` in prod → unsigned requests receive `401 unauthorized`

---

## Variable reference

| Variable | Where | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | web | API base URL |
| `NEXT_PUBLIC_FIREBASE_CONFIG` | web | Firebase web SDK init (public) |
| `NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY` | web | Maps JS (referrer-restricted) |
| `GEMINI_API_KEY` / `GEMINI_MODEL` / `GEMINI_DAILY_CAP` | api | Prompt processing + spend cap |
| `FIREBASE_SERVICE_ACCOUNT_JSON` or `GOOGLE_APPLICATION_CREDENTIALS` | api | Admin SDK (Firestore/Auth/Storage) |
| `FIREBASE_PROJECT_ID` / `FIREBASE_STORAGE_BUCKET` | api | Project + bucket targeting |
| `ALLOW_DEMO_AUTH` | api | Dev-only unauthenticated fallback |
| `CORS_ORIGINS` | api | Allowed browser origins |
| `RATE_MAX_*`, `MAX_BODY_BYTES`, `MAX_UPLOAD_BYTES` | api | Abuse caps |
