import { Router } from "express";
import { z } from "zod";
import { districtFact, listDistrictFacts, GUJARAT_STATE_CENSUS_2011, lookupPin, fetchOgdResource, OGD_DATASETS, govSourcesStatus } from "../services/govData.js";

export const govDataRouter = Router();

/**
 * Real Government of India data endpoints.
 * Transparency-first: every response labels source + mode (live vs bundled) + verify URL.
 */

govDataRouter.get("/", (_req, res)=> {
  res.json({
    state: GUJARAT_STATE_CENSUS_2011,
    districts: listDistrictFacts(),
    sources: govSourcesStatus(),
    datasets_registry: OGD_DATASETS,
    note: "Bundled = Census of India 2011 (public domain). Live sources used automatically when configured. No synthetic figures are ever labeled as government data.",
  });
});

govDataRouter.get("/district/:name", (req, res)=> {
  const f = districtFact(req.params.name);
  if (!f) return res.status(404).json({ error: "district_not_in_verified_set", detail: "Only Census 2011 verified districts are served — we never estimate silently." });
  res.json({ fact: f });
});

const pinQuery = z.object({ pin: z.string().trim().regex(/^\d{6}$/, "pin must be 6 digits") });

// Live India Post PIN verification — keyless official directory
govDataRouter.get("/pin", async (req, res)=> {
  const parsed = pinQuery.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: "validation_failed", issues: parsed.error.issues });
  const r = await lookupPin(parsed.data.pin);
  if (!r.ok) return res.status(404).json({ ...r, note: "PIN not found in India Post directory — please check the code." });
  res.json(r);
});

// Optional live layer: data.gov.in resource passthrough (requires DATA_GOV_IN_API_KEY)
govDataRouter.get("/ogd", async (req, res)=> {
  const schema = z.object({ resource: z.string().trim().min(8).max(80), limit: z.coerce.number().int().min(1).max(500).optional() });
  const parsed = schema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: "validation_failed", issues: parsed.error.issues });
  const r = await fetchOgdResource(parsed.data.resource, { limit: parsed.data.limit });
  if (!r.ok) {
    if (r.reason === "no_api_key") return res.status(409).json({ error: "ogd_not_configured", detail: "Set DATA_GOV_IN_API_KEY (free key from https://data.gov.in/user/register) to enable live dataset fetches." });
    return res.status(502).json({ error: "ogd_upstream_error", detail: r.detail });
  }
  res.json({ ok: true, cached: r.cached, source: "data.gov.in — Open Government Data Platform India", data: r.data });
});
