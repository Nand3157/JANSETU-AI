"use client";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VoiceRecorder } from "@/components/civic/VoiceRecorder";
import { LocationPicker } from "@/components/civic/LocationPicker";
import { PhotoUploader } from "@/components/civic/PhotoUploader";
import { DotPattern } from "@/components/ui/dot-pattern";
import { SpotlightCard } from "@/components/ui/spotlight";
import { Send, Languages, AlertTriangle, CheckCircle2, Loader2, Edit3, ShieldCheck, Clock, MapPinned, FileText, Sparkles, Eye, ArrowRight, Globe } from "lucide-react";
import { getCurrentUser, signInAnonymouslyMock } from "@/lib/firebase";
import { saveDraft } from "@/lib/draft";
import { submitCitizenRequest } from "@/lib/submitRequest";
import { toast } from "@/components/ui/toast";

const categories = [
  { value: "water", label: "Water", hint: "Supply, leakage, drainage", emoji: "💧" },
  { value: "roads", label: "Roads", hint: "Roads, bridges, access", emoji: "🛣️" },
  { value: "electricity", label: "Electricity", hint: "Power or street lights", emoji: "💡" },
  { value: "healthcare", label: "Healthcare", hint: "Clinics, ambulances, access", emoji: "🏥" },
  { value: "sanitation", label: "Sanitation", hint: "Waste, toilets, cleanliness", emoji: "🧹" },
  { value: "education", label: "Education", hint: "Schools and learning", emoji: "🎓" },
  { value: "other", label: "Other", hint: "Anything else", emoji: "➕" },
];

const stepsMeta = [
  { n: "01", t: "Describe", d: "Voice or text" },
  { n: "02", t: "Locate", d: "Village / PIN / device" },
  { n: "03", t: "Confirm", d: "AI preview + submit" },
];

export default function SubmitPage() {
  const [text, setText] = useState("");
  const [category, setCategory] = useState("roads");
  const [otherCategory, setOtherCategory] = useState("");
  const [lang, setLang] = useState("gu");
  const [locText, setLocText] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locSource, setLocSource] = useState<string>("user_text");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const user = getCurrentUser();

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      if (!text.trim()) {
        setError("Please describe the issue in your language first.");
        setLoading(false);
        return;
      }
      if (!user) await signInAnonymouslyMock();
      const analyzed: any = await submitCitizenRequest({
        text,
        category,
        lang,
        lat: coords?.lat ?? null,
        lng: coords?.lng ?? null,
        locSource,
        audioUrl,
        photoFile,
      });
      setResult(analyzed);
      setHistory((h) => [{ ...analyzed.request, analyzed }, ...h].slice(0, 6));
      setEditing(false);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const demoFill = () => {
    setText("અમારા ગામનો રસ્તો વરસાદમાં બંધ થઈ જાય છે. હોસ્પિટલ જવા માટે ખૂબ સમય લાગે છે અને બાળકોને પણ સ્કૂલ જવામાં મુશ્કેલી પડે છે.");
    setLang("gu");
    setLocText("Village X, Vadodara District, Gujarat");
    setCoords({ lat: 22.3072, lng: 73.1812 });
    setLocSource("user_text");
  };

  const hasText = text.trim().length > 8;
  const hasLocation = locText.trim().length > 3 || !!coords;
  const activeStep = !hasText ? 0 : !hasLocation ? 1 : 2;

  return (
    <div className="bg-[#F8FAFC] text-[#172033] min-h-screen">
      {/* editorial header — full-bleed breakout from CitizenLayoutClient max-w-[960px] */}
      <div className="overflow-hidden border-b border-[#E5E7EB] bg-white w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
        <div className="absolute inset-0 aurora-soft opacity-40 pointer-events-none" aria-hidden="true" />
        <DotPattern className="opacity-[0.045] [mask-image:radial-gradient(720px_360px_at_18%_0%,black_45%,transparent_78%)]" dotColor="rgba(23,78,166,0.08)" />
        <div className="absolute inset-0 grid-pattern opacity-[0.05] pointer-events-none [mask-image:radial-gradient(900px_520px_at_14%_0%,black_40%,transparent_78%)]" aria-hidden="true" />
        <div className="relative mx-auto max-w-[960px] px-4 md:px-6 pt-8 md:pt-10 pb-6 md:pb-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="kicker kicker-accent">Citizen Portal · Multilingual</span>
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-[#F8FAFC] border border-[#E5E7EB] px-2.5 py-1 text-xs font-medium text-[#5F6368]">
              <ShieldCheck className="h-3.5 w-3.5 text-[#188038]" /> Human review required
            </span>
          </div>
          <div className="mt-4 flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="min-w-0">
              <h1 className="text-[28px] md:text-[36px] font-extrabold tracking-[-0.04em] leading-[0.92] text-[#0B1F3A] text-balance">Raise a Community Need</h1>
              <p className="mt-2 text-[14px] md:text-[15px] leading-relaxed text-[#5F6368] max-w-[58ch]">
                Speak in Gujarati, Hindi or English — voice, text or photo. AI understands and clusters, <span className="font-semibold text-[#0B1F3A]">humans decide</span>.
                Original text is preserved verbatim.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[#5F6368]">
                <span className="inline-flex items-center gap-1"><Globe className="h-3.5 w-3.5 text-[#174EA6]" /> GU · HI · EN</span>
                <span className="h-1 w-1 rounded-full bg-[#E5E7EB]" aria-hidden="true" />
                <span>Anonymous ok · optional location</span>
                <span className="hidden sm:inline h-1 w-1 rounded-full bg-[#E5E7EB]" aria-hidden="true" />
                <span className="hidden sm:inline">2–3 min · no account to preview</span>
                {user && <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-[#E8F0FE] border border-[#D2E3FC] px-2.5 py-1 text-[#174EA6] font-medium">Signed in · {user.uid.slice(0, 6)}</span>}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button type="button" onClick={demoFill} className="h-11 rounded-full bg-white border border-[#E5E7EB] px-4 text-sm font-medium hover:border-[#174EA6] hover:text-[#174EA6] transition-colors min-h-[44px]">
                Fill Gujarati demo
              </button>
              <Link href="/how-it-works" className="hidden sm:inline-flex h-11 rounded-full bg-[#0B1F3A] text-white px-4 items-center text-sm font-semibold hover:bg-black transition-colors min-h-[44px]">
                How it works <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Link>
            </div>
          </div>

          {/* progress stepper — Blocks / OriginUI inspired, civic restrained */}
          <div className="mt-6 rounded-[16px] bg-[#F8FAFC] border border-[#E5E7EB] p-2.5 sm:p-3 flex items-center gap-1.5 sm:gap-3 overflow-x-auto">
            {stepsMeta.map((s, i) => {
              const done = i < activeStep;
              const active = i === activeStep;
              return (
                <div key={s.n} className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <div className={`h-8 w-8 sm:h-9 sm:w-9 rounded-full grid place-items-center text-xs font-bold shrink-0 border transition-colors ${active ? "bg-[#174EA6] text-white border-[#174EA6] shadow-sm" : done ? "bg-[#0B1F3A] text-white border-[#0B1F3A]" : "bg-white text-[#5F6368] border-[#E5E7EB]"}`}>
                    {done ? <CheckCircle2 className="h-4 w-4" /> : s.n}
                  </div>
                  <div className="min-w-0 hidden sm:block">
                    <div className={`text-xs font-bold leading-none ${active ? "text-[#0B1F3A]" : "text-[#172033]"}`}>{s.t}</div>
                    <div className="text-[11px] text-[#5F6368] leading-none mt-0.5">{s.d}</div>
                  </div>
                  <div className={`hidden sm:block text-[11px] font-medium sm:hidden ${active ? "text-[#0B1F3A]" : "text-[#5F6368]"}`}>{s.t}</div>
                  {i < stepsMeta.length - 1 && <div className={`hidden sm:block flex-1 h-px mx-1 ${done ? "bg-[#0B1F3A]" : "bg-[#E5E7EB]"}`} aria-hidden="true" />}
                  {i < stepsMeta.length - 1 && <div className="sm:hidden text-[#E5E7EB]">—</div>}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[960px] px-4 md:px-6 py-6 md:py-8">
        <div className="grid lg:grid-cols-[1.28fr_0.72fr] gap-6 items-start">
          {/* LEFT — form */}
          <div className="space-y-5 min-w-0">
            {/* Language + Intake */}
            <SpotlightCard className="rounded-[24px] bg-white border border-[#E5E7EB] shadow-card overflow-hidden">
              <div className="p-5 md:p-6 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-sm font-bold tracking-tight text-[#0B1F3A] flex items-center gap-2">
                    <span className="h-8 w-8 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] grid place-items-center"><Languages className="h-4 w-4 text-[#174EA6]" /></span>
                    Describe the issue
                    <span className="text-xs font-normal text-[#5F6368]">· verbatim preserved</span>
                  </h2>
                  <label className="inline-flex items-center gap-2 text-sm">
                    <span className="text-xs font-semibold tracking-widest text-[#5F6368] hidden sm:inline">INPUT LANGUAGE</span>
                    <select value={lang} onChange={(e) => setLang(e.target.value)} aria-label="Input language" name="language" autoComplete="language" className="rounded-full border border-[#E5E7EB] bg-[#F8FAFC] text-[#172033] px-3 py-2 text-sm min-h-[40px] focus:border-[#174EA6] focus:bg-white outline-none">
                      <option value="auto">Auto-detect</option>
                      <option value="gu">ગુજરાતી (GU)</option>
                      <option value="hi">हिन्दी (HI)</option>
                      <option value="en">English (EN)</option>
                    </select>
                  </label>
                </div>

                <div className="rounded-[16px] bg-[#F8FAFC] border border-[#E5E7EB] px-3 py-2.5 flex flex-wrap items-center gap-2 text-xs text-[#5F6368]">
                  <span className="inline-flex items-center gap-1.5 font-semibold text-[#174EA6]"><Sparkles className="h-3.5 w-3.5" /> Gemini will detect & preserve intent</span>
                  <span className="hidden sm:inline h-1 w-1 rounded-full bg-[#E5E7EB]" aria-hidden="true" />
                  <span>Never rewrites meaning · validated server-side via Zod</span>
                </div>

                {/* Categories — radiogroup */}
                <div className="space-y-3">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="text-xs font-bold tracking-[0.08em] text-[#5F6368]">CATEGORY</h3>
                    <span className="text-[11px] text-[#5F6368]">Choose closest · you can explain in your words</span>
                  </div>
                  <div role="radiogroup" aria-label="Issue category" className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {categories.map((item) => {
                      const active = category === item.value;
                      return (
                        <button
                          key={item.value}
                          type="button"
                          role="radio"
                          aria-checked={active}
                          onClick={() => setCategory(item.value)}
                          className={`group text-left rounded-[16px] border p-3.5 min-h-[84px] flex flex-col justify-between transition-[background-color,border-color,box-shadow,transform] ${active ? "bg-[#E8F0FE] border-[#174EA6] ring-1 ring-[#174EA6]/20 shadow-sm" : "bg-white border-[#E5E7EB] hover:border-[#CBD5E1] hover:shadow-sm hover:-translate-y-[1px]"}`}
                          style={{ touchAction: "manipulation" }}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-[15px]" aria-hidden="true">{item.emoji}</span>
                            {active && <CheckCircle2 className="h-4 w-4 text-[#174EA6] shrink-0" aria-hidden="true" />}
                          </div>
                          <div>
                            <div className={`text-[13px] font-bold leading-none ${active ? "text-[#0B1F3A]" : "text-[#172033]"}`}>{item.label}</div>
                            <div className="text-[11px] text-[#5F6368] leading-snug mt-1">{item.hint}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {category === "other" && (
                    <label className="block max-w-xl animate-[fade-in_0.3s_both]">
                      <span className="text-sm font-medium text-[#172033]">Tell us the category</span>
                      <input value={otherCategory} onChange={(e) => setOtherCategory(e.target.value)} name="otherCategory" autoComplete="off" spellCheck={true} className="mt-2 w-full rounded-xl border border-[#E5E7EB] bg-white text-[#172033] px-3 py-3 text-sm min-h-[44px] focus:border-[#174EA6] focus:ring-2 focus:ring-[#174EA6]/10 outline-none" placeholder="For example: public space, animal care…" />
                    </label>
                  )}
                </div>

                {/* Voice / Text */}
                <div className="space-y-3 pt-4 border-t border-[#E5E7EB]">
                  <label htmlFor="citizen-text" className="text-sm font-semibold text-[#0B1F3A] flex items-center gap-2">
                    Voice or text
                    <span className="text-xs font-normal text-[#5F6368]">· choose one</span>
                    {hasText && <span className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-[#188038]"><CheckCircle2 className="h-3.5 w-3.5" /> Ready</span>}
                  </label>
                  <VoiceRecorder langHint={lang} onTranscript={(t, l, media) => { setText(t); if (l) setLang(l); setAudioUrl(media?.audioUrl || null); saveDraft({ text: t, lang: l || lang, audioUrl: media?.audioUrl || null }); }} />
                  <div className="relative">
                    <textarea
                      id="citizen-text"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      rows={5}
                      aria-label="Describe the problem in your own words"
                      name="citizenText"
                      autoComplete="off"
                      spellCheck={true}
                      className="w-full rounded-[16px] border border-[#E5E7EB] bg-white text-[#172033] p-4 pr-12 text-[15px] md:text-sm leading-relaxed placeholder:text-[#9AA0A6] focus:border-[#174EA6] focus:ring-2 focus:ring-[#174EA6]/10 focus:bg-white outline-none resize-none"
                      placeholder="Describe the problem in your language… e.g. અમારા ગામનો રસ્તો…"
                      aria-describedby="citizen-text-help"
                      aria-invalid={!!error && !text.trim()}
                    />
                    <div className="pointer-events-none absolute right-3 bottom-3 text-[11px] text-[#9AA0A6] tabular-nums">{text.length}/2000</div>
                  </div>
                  <div id="citizen-text-help" className="flex items-center gap-1.5 text-[11px] text-[#5F6368]">
                    <Eye className="h-3 w-3 shrink-0" /> Original text is immutable & preserved verbatim. Translated preview shown only at confirmation.
                  </div>
                </div>

                <PhotoUploader onFile={(f) => setPhotoFile(f)} />
              </div>
            </SpotlightCard>

            {/* Location */}
            <div className="rounded-[24px] bg-white border border-[#E5E7EB] shadow-card p-5 md:p-6">
              <h2 className="text-sm font-bold text-[#0B1F3A] flex items-center gap-2">
                <span className="h-8 w-8 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] grid place-items-center"><MapPinned className="h-4 w-4 text-[#174EA6]" /></span>
                Where is this?
                <span className="text-xs font-normal text-[#5F6368]">· optional · centroids only for analytics</span>
                {hasLocation && <span className="ml-auto hidden sm:inline-flex items-center gap-1 rounded-full bg-[#E6F4EA] border border-[#CEE6D0] px-2.5 py-1 text-xs font-semibold text-[#0D652D]"><CheckCircle2 className="h-3.5 w-3.5" /> Location added</span>}
              </h2>
              <div className="mt-5">
                <LocationPicker value={locText} onChange={(v, lat, lng, src) => { setLocText(v); if (lat && lng) setCoords({ lat, lng }); if (src) setLocSource(src); }} />
              </div>
              {coords && (
                <div className="mt-3 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] px-3 py-2.5 flex items-center gap-2 text-xs text-[#172033]">
                  <span className="h-7 w-7 rounded-lg bg-white border border-[#E5E7EB] grid place-items-center shrink-0"><MapPinned className="h-3.5 w-3.5 text-[#174EA6]" /></span>
                  <span className="font-medium tabular-nums">{coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}</span>
                  <span className="text-[#5F6368] hidden sm:inline">· {locSource} · {locSource === "device" ? "precise — not exposed publicly" : locSource === "ip_approx" ? "approx. — please verify village name" : "user_text — will geocode"}</span>
                </div>
              )}
            </div>

            {/* Submit bar */}
            <div className="rounded-[20px] bg-white border border-[#E5E7EB] shadow-card p-4 flex flex-col sm:flex-row sm:items-center gap-3 sticky bottom-4 z-10">
              <Button onClick={handleSubmit} disabled={loading} aria-busy={loading} aria-describedby="submit-help" className="gap-2 min-h-[44px] px-6 text-[15px] shrink-0 w-full sm:w-auto justify-center">
                {loading ? <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden="true" /> : <Send className="h-4 w-4 shrink-0" aria-hidden="true" />} Submit & Analyze
              </Button>
              <div className="min-w-0 flex-1">
                <div id="submit-help" className="text-xs text-[#5F6368] leading-relaxed">Creates request → Gemini intake → clustering → deterministic score. <span className="font-medium text-[#172033]">Never claims approval.</span></div>
                {error && <span className="sr-only" role="alert">{error}</span>}
              </div>
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#5F6368] shrink-0">
                <ShieldCheck className="h-3.5 w-3.5 text-[#188038]" /> Human review required
              </div>
            </div>

            {error && (
              <div role="alert" aria-live="assertive" className="rounded-[16px] bg-[#FEF2F2] border border-[#FECACA] p-4 text-sm text-[#7F1D1D] flex gap-3 items-start">
                <AlertTriangle className="h-5 w-5 shrink-0 text-[#D93025] mt-0.5" aria-hidden="true" />
                <span>{error} — Is the API running? <code className="bg-white border border-[#FECACA] rounded px-1.5 py-0.5">npm run dev:api</code> (8080).</span>
              </div>
            )}

            {result && (
              <div className="rounded-[24px] border border-[#D2E3FC] bg-[#F8FAFE] p-5 md:p-6 space-y-5 animate-[fade-in_0.4s_both] shadow-card overflow-hidden">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-2 text-sm font-bold text-[#0B1F3A]"><CheckCircle2 className="h-5 w-5 text-[#188038]" /> AI Understanding — Confirm before it counts</span>
                  <Badge tone="ai">AI-assisted</Badge>
                  <span className="text-xs text-[#5F6368]">· not auto-submitted</span>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="rounded-[16px] bg-white border border-[#E5E7EB] p-4 space-y-3">
                    <div className="text-[11px] tracking-[0.1em] font-bold text-[#5F6368]">INTAKE — Gemini · preserve meaning</div>
                    <div className="text-xs text-[#172033]">Source: <span className="font-semibold">{result.intake.source_language}</span> {result.intake.translated_text && result.intake.source_language !== "en" ? `→ en: “${result.intake.translated_text.slice(0, 80)}…”` : ""}</div>
                    <div>
                      <span className="text-xs text-[#5F6368]">Category:</span> <Badge tone="high" className="ml-1">{result.intake.category} {result.intake.subcategory ? `· ${result.intake.subcategory}` : ""}</Badge>
                    </div>
                    {editing ? (
                      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} className="w-full rounded-xl border border-[#FDE68A] bg-[#FFFBEB] p-3 text-sm focus:border-[#F9AB00] outline-none" />
                    ) : (
                      <div className="text-sm leading-relaxed"><span className="text-xs text-[#5F6368]">Problem:</span> {result.intake.problem_statement}</div>
                    )}
                    <div className="text-sm"><span className="text-xs text-[#5F6368]">Location:</span> {result.intake.location.district}, {result.intake.location.region} <span className="text-xs text-[#5F6368]">({result.intake.location.location_source} · conf {Math.round(result.intake.location.location_confidence * 100)}%)</span></div>
                    <div className="flex flex-wrap gap-2">
                      <Badge tone={result.intake.urgency.score >= 4 ? "critical" : "moderate"}>Urgency {result.intake.urgency.score}/5 — {result.intake.urgency.reason}</Badge>
                      <Badge tone="ai">conf {Math.round(result.intake.ai_confidence * 100)}%</Badge>
                    </div>
                    {result.intake.ambiguities?.length ? <div className="text-xs text-[#92400E] bg-[#FFFBEB] border border-[#FDE68A] rounded-xl p-3 flex gap-2"><AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" /> <span>{result.intake.ambiguities.join(" ")}</span></div> : null}
                    <div className="text-xs text-[#5F6368]">Services: {result.intake.affected_services.join(", ") || "—"} · Groups: {result.intake.affected_groups.join(", ")}</div>
                    {result.intake.evidence_phrases?.length ? <div className="text-xs text-[#5F6368] border-t border-[#E5E7EB] pt-3">Evidence: “{result.intake.evidence_phrases[0]}”</div> : null}
                  </div>

                  <div className="rounded-[16px] bg-white border border-[#E5E7EB] p-4 space-y-3">
                    <div className="text-[11px] tracking-[0.1em] font-bold text-[#5F6368]">CLUSTER + PRIORITY · Deterministic v1</div>
                    <div className="text-sm font-bold text-[#0B1F3A]">{result.cluster.title}</div>
                    <div className="text-xs leading-relaxed text-[#5F6368]">{result.cluster.summary}</div>
                    <div className="flex flex-wrap gap-2">
                      <Badge tone={result.cluster.priorityBand === "critical" ? "critical" : result.cluster.priorityBand === "high" ? "high" : "moderate"}>{result.cluster.priorityScore} · {result.cluster.priorityBand}</Badge>
                      <span className="text-xs px-2.5 py-1 rounded-full bg-[#F8FAFC] border border-[#E5E7EB] font-medium">{result.cluster.requestCount} requests</span>
                      <span className="text-xs px-2.5 py-1 rounded-full bg-[#F8FAFC] border border-[#E5E7EB] font-medium">pop {result.cluster.populationAffected}</span>
                    </div>
                    <div className="text-xs text-[#5F6368]">Evidence: {result.cluster.evidenceRefs?.join(", ") || "—"} · weightVersion {result.cluster.weightVersion}</div>
                    {result.priority && (
                      <div className="grid grid-cols-3 gap-2 pt-2">
                        {Object.entries(result.priority.components).map(([k, v]: any) => (
                          <div key={k} className="rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] p-2 text-center">
                            <div className="text-[10px] tracking-wide text-[#5F6368] truncate">{k}</div>
                            <div className="font-bold text-[#0B1F3A] text-sm">{String(v)}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button size="sm" className="gap-1.5" onClick={() => { setEditing(false); toast(`Confirmed → status clustered. Request ${result.request.requestId} is now tracked.`, "success"); }}>Looks correct ✓</Button>
                  <Button size="sm" variant="secondary" className="gap-1.5" onClick={() => setEditing((v) => !v)}><Edit3 className="h-3.5 w-3.5" /> {editing ? "Done editing" : "Edit text"}</Button>
                  <span className="text-xs text-[#5F6368] py-2 flex items-center gap-1"><FileText className="h-3.5 w-3.5" /> {result.request.requestId} · {result.request.status} → clustered → priority_analyzed</span>
                </div>
                <div className="text-[11px] leading-relaxed text-[#5F6368] border-t border-[#E5E7EB] pt-3">{result.human_review_notice}</div>
              </div>
            )}
          </div>

          {/* RIGHT — guidance (sticky) */}
          <div className="space-y-4 lg:sticky lg:top-6">
            <div className="rounded-[24px] bg-white border border-[#E5E7EB] shadow-card p-5">
              <h3 className="text-sm font-bold text-[#0B1F3A] flex items-center gap-2"><Clock className="h-4 w-4 text-[#174EA6]" /> What happens after you tap Submit?</h3>
              <ol className="mt-4 relative space-y-4">
                <div className="absolute left-[15px] top-2 bottom-2 w-px bg-[#E5E7EB] hidden sm:block" aria-hidden="true" />
                {[
                  { t: "Validate & store", d: "Request saved → media to Cloud Storage → Pub/Sub queued.", done: hasText },
                  { t: "Gemini intake", d: "Translate & structure → Zod validation → geography → cluster.", done: false },
                  { t: "Evidence fusion", d: "Join demographics / infra / investment → deterministic score.", done: false },
                  { t: "Human review", d: "Candidate project drafted → policymaker approves or rejects with reason.", done: false, last: true },
                ].map((s) => (
                  <li key={s.t} className="flex gap-3">
                    <span className={`h-8 w-8 rounded-full grid place-items-center shrink-0 border text-xs font-bold ${s.done ? "bg-[#0B1F3A] text-white border-[#0B1F3A]" : "bg-white text-[#5F6368] border-[#E5E7EB]"}`}>{s.done ? "✓" : "•"}</span>
                    <div className="min-w-0 pb-1">
                      <div className="text-sm font-semibold text-[#172033] leading-none">{s.t}</div>
                      <div className="text-xs leading-relaxed text-[#5F6368] mt-1">{s.d}</div>
                    </div>
                  </li>
                ))}
              </ol>
              <div className="mt-4 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] px-3 py-2.5 flex items-center gap-2 text-xs text-[#5F6368]">
                <ShieldCheck className="h-4 w-4 text-[#188038] shrink-0" /> Frontend is untrusted — backend owns validation & audit.
              </div>
            </div>

            <div className="rounded-[24px] bg-[#0B1F3A] text-white p-6 border border-[#0B1F3A] relative overflow-hidden">
              <div className="absolute inset-0 aurora-soft opacity-15 pointer-events-none" aria-hidden="true" />
              <div className="relative">
                <div className="text-[11px] tracking-[0.14em] font-bold text-white/60">TRUST · GOVERNANCE</div>
                <h3 className="mt-2 font-bold leading-tight">Your voice is protected.</h3>
                <ul className="mt-3 space-y-2 text-sm leading-relaxed text-white/75">
                  <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" /> Voice is transcribed to text only — no biometrics.</li>
                  <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" /> Public maps show centroids only — never your exact point.</li>
                  <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" /> No religion, caste or political affiliation used in scoring.</li>
                </ul>
                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  <Link href="/privacy" className="rounded-full bg-white text-[#0B1F3A] px-3.5 py-2 font-semibold hover:bg-[#E8F0FE] transition-colors">Privacy</Link>
                  <Link href="/how-it-works" className="rounded-full bg-white/10 border border-white/15 text-white px-3.5 py-2 font-medium hover:bg-white/15 transition-colors">How scoring works</Link>
                </div>
              </div>
            </div>

            {/* My Requests — tracking */}
            <div className="rounded-[24px] bg-white border border-[#E5E7EB] shadow-card p-5">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-bold text-sm text-[#0B1F3A] flex items-center gap-2"><Clock className="h-4 w-4 text-[#5F6368]" /> My Requests — Tracking</h3>
                <span className="text-xs rounded-full bg-[#F8FAFC] border border-[#E5E7EB] px-2.5 py-1 text-[#5F6368] font-medium">{history.length} recent</span>
              </div>
              {history.length === 0 ? (
                <div className="mt-3 rounded-[16px] bg-[#F8FAFC] border border-dashed border-[#E5E7EB] p-4 text-center">
                  <div className="text-sm font-medium text-[#172033]">No submissions yet</div>
                  <div className="text-xs leading-relaxed text-[#5F6368] mt-1">Fill the form and tap Submit & Analyze to see tracking here.</div>
                  <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-[#5F6368]"><FileText className="h-3 w-3" /> States: Received → Clustered → Analyzed → Review</div>
                </div>
              ) : (
                <div className="mt-4 space-y-2.5">
                  {history.map((h, i) => (
                    <div key={i} className="rounded-[16px] border border-[#E5E7EB] bg-white p-3 flex items-center gap-3 hover:border-[#D2E3FC] hover:shadow-sm transition-colors">
                      <span className="h-9 w-9 rounded-xl bg-[#0B1F3A] text-white grid place-items-center text-xs font-bold shrink-0">{h.priorityScore ?? "—"}</span>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium truncate text-[#0B1F3A]">{h.originalText.slice(0, 80)}</div>
                        <div className="text-xs text-[#5F6368] truncate">{h.districtId || "Vadodara"} · {h.category || "roads"} · {h.status} · {h.clusterId}</div>
                      </div>
                      <Badge tone={h.status === "clustered" ? "high" : "moderate"}>{h.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-3 text-[11px] leading-relaxed text-[#5F6368] border-t border-[#E5E7EB] pt-3">Lifecycle: Received → AI analyzed → Clustered → Priority analyzed → Government review → Project → Implementation → Impact</div>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-[16px] bg-white border border-[#E5E7EB] px-4 py-3 flex flex-wrap items-center gap-2 text-xs text-[#5F6368]">
          <ShieldCheck className="h-4 w-4 text-[#188038]" /> <span className="font-medium text-[#172033]">Human-governed:</span> <span>Every recommendation carries a <code className="bg-[#F8FAFC] border border-[#E5E7EB] rounded px-1.5 py-0.5">human_review_notice</code> · AI recommends, humans decide.</span>
          <Link href="/government" className="ml-auto font-semibold text-[#174EA6] hover:underline underline-offset-4">See government queue →</Link>
        </div>
      </div>
    </div>
  );
}
