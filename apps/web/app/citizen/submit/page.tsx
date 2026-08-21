"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VoiceRecorder } from "@/components/civic/VoiceRecorder";
import { LocationPicker } from "@/components/civic/LocationPicker";
import { PhotoUploader } from "@/components/civic/PhotoUploader";
import { Send, Languages, AlertTriangle, CheckCircle2, Loader2, Edit3, ShieldCheck, Clock, MapPinned, FileText } from "lucide-react";
import { api } from "@/lib/api";
import { getCurrentUser, signInAnonymouslyMock } from "@/lib/firebase";

export default function SubmitPage() {
  const [text, setText] = useState("અમારા ગામનો રસ્તો વરસાદમાં બંધ થઈ જાય છે. હોસ્પિટલ જવા માટે ખૂબ સમય લાગે છે અને બાળકોને પણ સ્કૂલ જવામાં મુશ્કેલી પડે છે.");
  const [lang, setLang] = useState("gu");
  const [locText, setLocText] = useState("Village X, Vadodara District, Gujarat");
  const [coords, setCoords] = useState<{lat:number,lng:number}|null>({ lat: 22.3072, lng: 73.1812 });
  const [locSource, setLocSource] = useState<string>("user_text");
  const [photoFile, setPhotoFile] = useState<File|null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const user = getCurrentUser();

  async function handleSubmit() {
    setLoading(true); setError(null); setResult(null);
    try {
      if (!user) await signInAnonymouslyMock();
      // In prod: upload photoFile to Cloud Storage via signed URL → get photoUrl
      const photoUrl = photoFile ? `mock://storage/${photoFile.name}` : null;
      const created: any = await api("/api/requests", {
        method: "POST",
        body: JSON.stringify({
          originalText: text, sourceLanguage: lang,
          latitude: coords?.lat ?? 22.3072, longitude: coords?.lng ?? 73.1812,
          locationSource: locSource, photoUrl, audioUrl: null
        }),
        headers: { "x-role": "citizen", "x-country": "IN" }
      });
      const analyzed: any = await api(`/api/requests/${created.requestId}/analyze`, { method: "POST" });
      setResult(analyzed);
      setHistory(h=> [{ ...analyzed.request, analyzed }, ...h].slice(0,6));
      setEditing(false);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  const demoFill = () => {
    setText("અમારા ગામનો રસ્તો વરસાદમાં બંધ થઈ જાય છે. હોસ્પિટલ જવા માટે ખૂબ સમય લાગે છે અને બાળકોને પણ સ્કૂલ જવામાં મુશ્કેલી પડે છે.");
    setLang("gu"); setLocText("Village X, Vadodara District, Gujarat"); setCoords({ lat:22.3072,lng:73.1812}); setLocSource("user_text");
  };

  return (
    <div className="mx-auto max-w-[960px] px-4 md:px-6 py-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Submit a request</h1>
          <p className="text-sm text-muted">Multilingual · voice/text/photo · location confirmation · AI understanding confirmation before submit — per 03_UI_UX_DESIGN.md</p>
        </div>
        <span className="hidden md:inline-flex items-center gap-1.5 text-xs rounded-full bg-white border border-slate-200 px-3 py-1.5"><ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> {user? `Signed in · ${user.uid.slice(0,8)}` : "Anonymous · Firebase Auth"} </span>
      </div>

      <Card className="mt-6 space-y-5">
        {/* Language + Voice */}
        <div className="flex flex-wrap items-center gap-3">
          <select value={lang} onChange={e=> setLang(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
            <option value="auto">Auto-detect</option><option value="gu">ગુજરાતી (GU)</option><option value="hi">हिन्दी (HI)</option><option value="en">English (EN)</option>
          </select>
          <span className="inline-flex items-center gap-1.5 text-xs rounded-full bg-violet-50 text-violet-700 border border-violet-200 px-3 py-2"><Languages className="h-3.5 w-3.5" /> Gemini will detect & preserve intent — never change meaning</span>
          <button onClick={demoFill} className="ml-auto text-xs rounded-full bg-white border border-slate-200 px-3 py-1.5 hover:bg-slate-50">Fill Gujarati demo</button>
        </div>

        <div className="grid md:grid-cols-[1.15fr_0.85fr] gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Voice / Text <span className="text-muted font-normal">· choose one</span></label>
              <VoiceRecorder langHint={lang} onTranscript={(t,l)=> { setText(t); if(l) setLang(l); }} />
              <textarea value={text} onChange={e=> setText(e.target.value)} rows={5} className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-civic-500/20 focus:border-civic-300" placeholder="Describe the problem in your language..." />
              <div className="text-[11px] text-muted">Original text is immutable per spec. Translated_text is shown in confirmation but original is preserved.</div>
            </div>
            <PhotoUploader onFile={(f)=> setPhotoFile(f)} />
          </div>
          <div className="space-y-4">
            <LocationPicker value={locText} onChange={(v,lat,lng,src)=> { setLocText(v); if(lat&&lng) setCoords({lat,lng}); if(src) setLocSource(src); }} />
            {coords && <div className="rounded-xl bg-slate-50 border border-slate-200 p-2.5 flex items-center gap-2 text-xs"><MapPinned className="h-4 w-4 text-civic-700" /> {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)} · {locSource} {locSource==="device" ? "· precise not exposed publicly" : "· user_text, will geocode"}</div>}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 space-y-2 text-xs">
              <div className="font-semibold flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> What happens after you tap Submit?</div>
              <ol className="list-decimal pl-4 space-y-1 text-muted leading-relaxed">
                <li>validate → save → store media (Cloud Storage) → Pub/Sub</li>
                <li>Gemini intake → Zod validation → geography → cluster</li>
                <li>enrich (demographics/infra/investment) → deterministic score</li>
                <li>candidate project → <span className="font-medium text-ink">Human review required</span></li>
              </ol>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2 border-t border-slate-200">
          <Button onClick={handleSubmit} disabled={loading || !text.trim()} className="gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Submit & Analyze
          </Button>
          <span className="text-xs text-muted py-2">Creates request → Gemini → clustering → scoring. Never claims approval.</span>
        </div>

        {error && <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error} — Is the API running? `npm run dev:api` (8080).</div>}

        {result && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-4 animate-fade-in">
            <div className="flex items-center gap-2 text-sm font-semibold"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> AI Understanding — Confirm <Badge tone="ai">AI-assisted</Badge> <span className="text-xs font-normal text-muted">· not auto-submitted</span></div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-xl bg-white border border-slate-200 p-3 space-y-2">
                <div className="text-xs font-semibold text-muted">INTAKE (Gemini) — preserve meaning</div>
                <div className="text-xs">Source: <span className="font-medium">{result.intake.source_language}</span> {result.intake.translated_text && result.intake.source_language!=="en" ? `→ en: “${result.intake.translated_text.slice(0,80)}…”` : ""}</div>
                <div><span className="text-xs text-muted">Category:</span> <Badge tone="high">{result.intake.category} {result.intake.subcategory ? `· ${result.intake.subcategory}` : ""}</Badge></div>
                {editing ? (
                  <textarea value={text} onChange={e=> setText(e.target.value)} rows={3} className="w-full rounded-xl border border-amber-200 bg-amber-50 p-2 text-sm" />
                ) : (
                  <div className="text-sm"><span className="text-xs text-muted">Problem:</span> {result.intake.problem_statement}</div>
                )}
                <div className="text-sm"><span className="text-xs text-muted">Location:</span> {result.intake.location.district}, {result.intake.location.region} <span className="text-xs text-muted">({result.intake.location.location_source} · conf {Math.round(result.intake.location.location_confidence*100)}%)</span></div>
                <div className="flex gap-2"><Badge tone={result.intake.urgency.score>=4?"critical":"moderate"}>Urgency {result.intake.urgency.score}/5 — {result.intake.urgency.reason}</Badge><Badge tone="ai">conf {Math.round(result.intake.ai_confidence*100)}%</Badge></div>
                {result.intake.ambiguities?.length ? <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-2 flex gap-1.5"><AlertTriangle className="h-3.5 w-3.5 mt-0.5" /> {result.intake.ambiguities.join(" ")}</div> : null}
                <div className="text-xs text-muted">Services: {result.intake.affected_services.join(", ")||"—"} · Groups: {result.intake.affected_groups.join(", ")}</div>
                {result.intake.evidence_phrases?.length ? <div className="text-xs text-muted border-t border-slate-200 pt-2">Evidence: “{result.intake.evidence_phrases[0]}”</div> : null}
              </div>

              <div className="rounded-xl bg-white border border-slate-200 p-3 space-y-2">
                <div className="text-xs font-semibold text-muted">CLUSTER + PRIORITY (Backend · Deterministic v1)</div>
                <div className="text-sm"><span className="font-medium">{result.cluster.title}</span></div>
                <div className="text-xs text-muted">{result.cluster.summary}</div>
                <div className="flex flex-wrap gap-2"><Badge tone={result.cluster.priorityBand==="critical"?"critical":result.cluster.priorityBand==="high"?"high":"moderate"}>{result.cluster.priorityScore} · {result.cluster.priorityBand}</Badge><span className="text-xs px-2 py-1 rounded-full bg-slate-100 border border-slate-200">{result.cluster.requestCount} requests</span><span className="text-xs px-2 py-1 rounded-full bg-slate-100 border border-slate-200">pop {result.cluster.populationAffected}</span></div>
                <div className="text-xs text-muted">Evidence: {result.cluster.evidenceRefs?.join(", ")||"—"} · weightVersion {result.cluster.weightVersion}</div>
                {result.priority && (
                  <div className="grid grid-cols-3 gap-1.5 pt-2">
                    {Object.entries(result.priority.components).map(([k,v]: any)=> (
                      <div key={k} className="rounded-xl bg-slate-50 border border-slate-200 p-1.5 text-center"><div className="text-[11px] text-muted truncate">{k}</div><div className="font-bold text-ink text-sm">{String(v)}</div></div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button size="sm" className="gap-1.5" onClick={()=> { setEditing(false); alert(`Confirmed → status clustered. Request ${result.request.requestId} tracked.`); }}>Looks correct ✓</Button>
              <Button size="sm" variant="secondary" className="gap-1.5" onClick={()=> setEditing(v=> !v)}><Edit3 className="h-3.5 w-3.5" /> {editing?"Done editing":"Edit"}</Button>
              <span className="text-xs text-muted py-2 flex items-center gap-1"><FileText className="h-3.5 w-3.5" /> {result.request.requestId} · {result.request.status} → clustered → priority_analyzed</span>
            </div>
            <div className="text-[11px] text-muted border-t border-slate-200 pt-2">{result.human_review_notice}</div>
          </div>
        )}
      </Card>

      {/* My Requests — tracking */}
      <Card className="mt-6">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2"><Clock className="h-4 w-4" /> My Requests — Tracking</h3>
          <span className="text-xs text-muted">{history.length} recent</span>
        </div>
        {history.length===0 ? <div className="text-sm text-muted mt-2">No submissions yet. Fill the form above and tap Submit & Analyze.</div> : (
          <div className="mt-3 space-y-2">
            {history.map((h,i)=> (
              <div key={i} className="rounded-xl border border-slate-200 bg-white p-3 flex items-center gap-3">
                <span className="h-8 w-8 rounded-xl bg-civic-700 text-white grid place-items-center text-xs font-bold">{h.priorityScore ?? "—"}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{h.originalText.slice(0,80)}</div>
                  <div className="text-xs text-muted truncate">{h.districtId||"Vadodara"} · {h.category||"roads"} · {h.status} · {h.clusterId}</div>
                </div>
                <Badge tone={h.status==="clustered"?"high":"moderate"}>{h.status}</Badge>
              </div>
            ))}
          </div>
        )}
        <div className="mt-3 text-xs text-muted">States: Received → AI analyzed → Clustered → Priority analyzed → Government review → Project proposed → Implementation → Impact</div>
      </Card>
    </div>
  );
}
