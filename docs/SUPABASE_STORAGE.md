# Supabase Storage for JANSETU photos (free, no card)

Photos/evidence uploads go: browser → your API (`/api/upload`) → Supabase Storage.
The service key lives only in `services/api/.env` — the browser never sees it.

## Steps

1. **Create project** — supabase.com → Sign up (GitHub) → **New project**
   → name `jansetu` → set a DB password → region `Mumbai (ap-south-1)` → wait ~2 min.

2. **Create bucket** — left sidebar → **Storage** → **New bucket**
   → name: `citizen-media`
   → **Public bucket: OFF** (private; reads use expiring signed URLs) → Create.

3. **Lock the bucket with RLS policies** — SQL Editor → New query → paste → Run:

   ```sql
   -- Citizens may add files ONLY inside their own uid folder
   create policy "own folder insert" on storage.objects
   for insert to authenticated
   with check (
     bucket_id = 'citizen-media'
     and (storage.foldername(name))[1] = 'citizen-media'
     and (storage.foldername(name))[2] = auth.uid()::text
   );

   -- Signed reads only while logged in
   create policy "authenticated read" on storage.objects
   for select to authenticated
   using (bucket_id = 'citizen-media');
   ```
   (Your API uses the service-role key which bypasses RLS — these policies protect
   against any direct client access. Images ≤5 MB and MIME type are enforced by the API.)

4. **Get keys** — Project Settings (⚙) → **API**:
   - *Project URL* → `SUPABASE_URL`
   - *service_role* secret (click reveal) → `SUPABASE_SERVICE_ROLE_KEY`
   ⚠ Use **service_role**, not anon — and never put it in any `NEXT_PUBLIC_*` var.

5. **Add to `services/api/.env`**:
   ```
   SUPABASE_URL=https://xxxxxxxx.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
   SUPABASE_STORAGE_BUCKET=citizen-media
   ```

6. **Restart & verify**
   ```bash
   npm run dev:api      # then: curl http://localhost:8080/api/upload/health
   # → {"ok":true,"service":"storage","backend":"supabase"}
   ```
   Submit a request with a photo in the citizen portal → check Storage → Files →
   `citizen-media/<uid>/...jpg` appears.

## Troubleshooting

- `GET /api/upload/health` → `{"backend":"mock"}` means the API never saw the
  keys: check `services/api/.env` has `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`
  (run `npm run sync-env` after editing root `.env`) and restart the API.
  The API loads this file at boot via `src/lib/env.ts` — no other setup needed.
- Upload returns `backend: "mock"` with a `storageError` field: the keys loaded
  but Supabase rejected the call. Common causes:
  - `supabase unreachable / ENOTFOUND <ref>.supabase.co` — wrong project URL, or
    the project was deleted. Free projects also **pause after 1 week idle**:
    open the project in the Supabase dashboard to resume it, then retry.
  - `Bucket not found` — create the `citizen-media` bucket (step 2).
  - `401/403` — you pasted the `anon` key instead of `service_role` (step 4).

## Notes

- Priority order in code: **Supabase → Firebase Storage → mock URLs**, so you can run
  both or neither.
- Free tier is generous (1 GB storage / 2 GB bandwidth) — plenty for demos.
- Keep budget safety: Supabase free projects pause after 1 week of inactivity.
