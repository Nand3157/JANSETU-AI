import Link from "next/link";
import { ArrowRight, ShieldCheck, Target, TrendingUp, MapPin, Quote, CheckCircle2, Database, Users, Eye, Sparkles, BarChart3, Zap, Fingerprint, Search } from "lucide-react";
import Counter from "@/components/home/Counter";
import { FadeIn, StaggerCard } from "@/components/home/HomeMotion";
import { BlurLine } from "@/components/ui/blur-text";
import { AuroraText } from "@/components/ui/aurora-text";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { Marquee } from "@/components/ui/marquee";
import { DotPattern } from "@/components/ui/dot-pattern";
import { Accordion } from "@/components/ui/accordion";

export default function Home() {
  return (
    <div className="bg-[#F8FAFC] text-[#172033]">
      {/* HERO — light editorial, consistent */}
      <section className="relative overflow-hidden bg-[#F8FAFC] border-b border-[#E5E7EB]">
        <div className="absolute inset-0 aurora-soft opacity-40 pointer-events-none" aria-hidden="true" />
        <DotPattern className="opacity-[0.07] [mask-image:radial-gradient(820px_420px_at_22%_0%,black_40%,transparent_78%)]" dotColor="rgba(23,78,166,0.08)" />
        <div className="absolute inset-0 grid-pattern opacity-[0.12] pointer-events-none [mask-image:radial-gradient(900px_600px_at_18%_0%,black_40%,transparent_78%)]" aria-hidden="true" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#E5E7EB] to-transparent pointer-events-none" aria-hidden="true" />

        <div className="mx-auto max-w-[1280px] px-4 md:px-6 pt-8 md:pt-10 pb-10 md:pb-14 relative">
          <FadeIn className="flex flex-wrap items-center gap-3">
            <span className="kicker kicker-accent">Digital Public Good · India-first</span>
            <span className="hidden sm:inline-flex h-1 w-1 rounded-full bg-[#CBD5E1]" aria-hidden="true" />
            <span className="inline-flex items-center gap-2 rounded-full bg-white border border-[#E5E7EB] pl-1 pr-3 py-1 text-xs font-medium shadow-sm">
              <span className="h-6 px-3 grid place-items-center rounded-full bg-[#174EA6] text-white text-[11px] tracking-widest font-semibold">NEW</span>
              <span className="text-[#172033]">BRICS-ready · 5 countries</span>
              <span className="hidden sm:inline-flex h-1.5 w-1.5 rounded-full bg-[#188038] animate-pulse" aria-hidden="true" />
            </span>
            <span className="hidden md:inline-flex items-center gap-1.5 rounded-full bg-[#E6F4EA] text-[#0D652D] border border-[#CEE6D0] px-2.5 py-1 text-[11px] font-semibold ml-1"><span className="h-1.5 w-1.5 rounded-full bg-[#188038] animate-pulse" /> Gemini 2.0 Live</span>
          </FadeIn>

          <div className="mt-6 grid lg:grid-cols-[1.08fr_0.92fr] gap-8 lg:gap-10 items-start">
            {/* LEFT */}
            <FadeIn className="relative">
              <BlurLine delay={0.02}>
                <h1 className="text-[36px] sm:text-[42px] md:text-[52px] font-extrabold tracking-[-0.04em] leading-[0.88] text-[#0B1F3A] text-balance">
                  <span className="sr-only">JANSETU AI — </span>
                  Your voice
                  <br />
                  <AuroraText className="font-extrabold italic tracking-[-0.04em]">can shape</AuroraText>
                  <br />
                  your community.
                </h1>
              </BlurLine>
              <BlurLine delay={0.12}>
                <p className="mt-5 text-[15.5px] md:text-[16.5px] leading-[1.65] text-[#5F6368] max-w-[52ch]">
                  <strong className="font-semibold text-[#0B1F3A]">JANSETU AI</strong> turns citizen requests into{" "}
                  <span className="font-semibold text-[#0B1F3A]">evidence-backed development priorities</span> for governments.
                  <span className="hidden sm:inline"> Minimal. Trustworthy. Measurable.</span>
                  <br className="hidden md:block" />
                  <span className="text-[#5F6368]">Citizen voice → AI understanding → Evidence fusion → Transparent prioritization → Human decision → Impact.</span>
                </p>
              </BlurLine>

              <FadeIn delay={0.18}>
                <div className="mt-7 flex flex-wrap items-center gap-4">
                  <ShimmerButton href="/citizen/submit" className="h-[44px] px-7 text-[15px] min-h-[44px]">
                    Raise a Community Need <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </ShimmerButton>
                  <Link href="/how-it-works" className="inline-flex items-center gap-1.5 text-sm font-medium text-[#5F6368] hover:text-[#174EA6] underline underline-offset-4 decoration-[#E5E7EB] hover:decoration-[#174EA6] transition-colors min-h-[44px] px-2">
                    How it works <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </div>
                <p className="mt-2 text-xs text-[#5F6368]">Takes ~2 min · Gujarati, Hindi, English · No account to preview</p>
              </FadeIn>

              <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-[#5F6368]">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-[#E5E7EB] px-2.5 py-1.5 shadow-sm min-h-[32px]">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#188038]" aria-hidden="true" /> Privacy-preserving
                </span>
                <span className="inline-flex items-center gap-1.5 min-h-[32px]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#174EA6]/15 border border-[#174EA6]/20" aria-hidden="true" /> GU · HI · EN
                </span>
                <span className="h-3 w-px bg-[#E5E7EB] hidden sm:block" aria-hidden="true" />
                <span>Human-governed</span>
                <span className="h-1 w-1 rounded-full bg-[#E5E7EB]" aria-hidden="true" />
                <Link href="/privacy" className="underline-premium min-h-[44px] inline-flex items-center px-1">Privacy</Link>
                <span className="h-1 w-1 rounded-full bg-[#E5E7EB]" aria-hidden="true" />
                <Link href="/docs" className="underline-premium min-h-[44px] inline-flex items-center px-1">Docs</Link>
              </div>

              {/* submission preview — fixes Task & goal clarity, reduces cognitive load */}
              <div className="mt-6 max-w-[560px] rounded-[20px] bg-white border border-[#E5E7EB] p-3 shadow-sm">
                <div className="flex items-center gap-2 text-[11px] tracking-[0.14em] font-bold text-[#5F6368]"><Eye className="h-3.5 w-3.5 text-[#174EA6]" /> WHAT HAPPENS NEXT</div>
                <div className="mt-2.5 grid grid-cols-3 gap-2 text-center">
                  {[
                    { icon: Zap, label: "1. Speak", sub: "Voice / Text / Photo" },
                    { icon: Database, label: "2. AI understands", sub: "GU→EN, category" },
                    { icon: BarChart3, label: "3. Evidence + score", sub: "Priority 0–100" },
                  ].map((s) => (
                    <div key={s.label} className="rounded-[14px] bg-[#F8FAFC] border border-[#E5E7EB] p-2.5">
                      <s.icon className="h-4 w-4 text-[#174EA6] mx-auto" aria-hidden="true" />
                      <div className="text-xs font-semibold text-[#0B1F3A] mt-1 leading-none">{s.label}</div>
                      <div className="text-[11px] text-[#5F6368]">{s.sub}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-2.5 flex items-center justify-between text-xs">
                  <span className="text-[#5F6368]">Preview your submission before it’s clustered</span>
                  <Link href="/citizen/submit" className="font-medium text-[#174EA6] hover:underline min-h-[44px] inline-flex items-center">Try demo →</Link>
                </div>
              </div>

              {/* metrics — de-emphasized, lighter (fixes cognitive load, visual hierarchy) */}
              <div className="mt-4 max-w-[560px] rounded-[16px] bg-[#F8FAFC] border border-[#E5E7EB] px-3 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#174EA6]" /> <strong className="text-[#0B1F3A]">4,218</strong> requests clustered</span>
                <span className="h-3 w-px bg-[#E5E7EB] hidden sm:block" aria-hidden="true" />
                <span className="inline-flex items-center gap-1.5"><span className="h-6 w-6 rounded-full bg-white border border-[#E5E7EB] grid place-items-center text-[11px] font-bold text-[#174EA6]">94</span> priority · high · v1</span>
                <span className="h-3 w-px bg-[#E5E7EB] hidden sm:block" aria-hidden="true" />
                <span><strong className="text-[#0B1F3A]">12.4k</strong> people impacted</span>
              </div>
            </FadeIn>

            {/* RIGHT — de-emphasized dashboard preview (fixes visual hierarchy + cognitive load) */}
            <FadeIn delay={0.1} className="relative lg:sticky lg:top-[84px]">
              <div className="rounded-[20px] bg-white border border-[#E5E7EB] shadow-card overflow-hidden p-3 group relative">
                <div className="flex items-center justify-between px-1 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="h-7 w-7 rounded-lg bg-[#F8FAFC] border border-[#E5E7EB] text-[#174EA6] grid place-items-center">
                      <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                    <div className="leading-none">
                      <div className="text-xs font-semibold tracking-tight text-[#172033]">Demand preview</div>
                      <div className="text-[11px] text-[#5F6368]">Vadodara · sample · centroids only</div>
                    </div>
                  </div>
                  <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-[#F8FAFC] border border-[#E5E7EB] px-2 py-1 text-[11px] font-medium text-[#5F6368]">Sample</span>
                </div>

                <div className="relative h-[300px] md:h-[320px] rounded-[14px] bg-[#F8FAFC] border border-[#E5E7EB] overflow-hidden">
                  <div className="absolute inset-0 grid-pattern opacity-[0.06]" aria-hidden="true" />

                  <svg viewBox="0 0 360 360" className="absolute inset-0 w-full h-full" aria-hidden="true">
                    <path d="M118 62 L152 56 L183 70 L204 95 L212 132 L202 165 L192 194 L178 224 L152 250 L123 269 L98 240 L88 210 L91 168 L100 118 Z" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
                    <g>
                      <circle cx="150" cy="144" r="22" fill="#174EA6" opacity="0.08" />
                      <circle cx="150" cy="144" r="5" fill="#174EA6" stroke="white" strokeWidth="1.8" />
                      <circle cx="168" cy="186" r="14" fill="#0B1F3A" opacity="0.06" />
                      <circle cx="168" cy="186" r="3.5" fill="#5F6368" stroke="white" strokeWidth="1.2" />
                    </g>
                  </svg>

                  <div className="absolute left-3 top-3 rounded-xl bg-white border border-[#E5E7EB] px-3 py-2 shadow-sm">
                    <div className="text-[10px] tracking-[0.12em] font-bold text-[#5F6368]">CITIZEN REQUESTS</div>
                    <div className="text-sm font-bold text-[#0B1F3A]">4,218 clustered</div>
                  </div>
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-3 rounded-xl bg-white border border-[#E5E7EB] px-3 py-2 shadow-sm flex items-center gap-2 max-w-[90%]">
                    <span className="h-7 w-7 rounded-lg bg-[#174EA6] text-white grid place-items-center shrink-0"><BarChart3 className="h-3.5 w-3.5" /></span>
                    <div>
                      <div className="text-xs font-semibold text-[#0B1F3A]">Priority 94 · High</div>
                      <div className="text-[11px] text-[#5F6368]">Deterministic v1 · sample</div>
                    </div>
                  </div>
                </div>

                <div className="mt-2.5 flex items-center justify-between text-xs px-1">
                  <span className="text-[#5F6368] text-[11px]">Evidence-fused · human-governed</span>
                  <Link href="/government" className="font-medium text-[#5F6368] hover:text-[#174EA6] underline underline-offset-4 decoration-[#E5E7EB] min-h-[44px] inline-flex items-center text-[11px]">Open dashboard</Link>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS — tracing beam + spotlight */}
      <section id="how-it-works" className="mx-auto max-w-[1280px] px-4 md:px-6 py-12 md:py-14">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="max-w-[62ch]">
            <div className="kicker">Process · Six steps</div>
            <h2 className="mt-3 text-[22px] md:text-[26px] font-extrabold tracking-[-0.03em] text-[#0B1F3A]">Citizen voice → Public action</h2>
            <p className="text-sm leading-relaxed text-[#5F6368] mt-2">
              Not a complaint portal. A public intelligence layer that listens, understands, fuses evidence, and recommends — <span className="font-medium text-[#172033]">human always decides.</span>{" "}
              <Link href="/how-it-works" className="text-[#174EA6] underline-premium font-medium">Learn how it works</Link> ·{" "}
              <Link href="/docs" className="text-[#174EA6] underline-premium font-medium">Developer docs</Link>
            </p>
          </div>
          <Link href="/how-it-works" className="hidden md:inline-flex items-center gap-1.5 text-sm font-semibold text-[#172033] underline-premium">
            How it works <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-8 relative">
          <div className="hidden md:block absolute left-0 right-0 top-[20px] h-px bg-[#E5E7EB]" aria-hidden="true" />
          <div className="hidden md:block absolute left-0 right-0 top-[20px] h-[2px] bg-gradient-to-r from-transparent via-[#174EA6]/18 to-transparent blur-[0.5px]" aria-hidden="true" />
          {/* moving dot along beam (aceternity/ magicui inspired) */}
          <div className="hidden md:block absolute top-[16px] h-1.5 w-1.5 rounded-full bg-[#174EA6] shadow-sm animate-[marquee_8s_linear_infinite]" style={{ left: 0, animationName: "float", animationDuration: "6s" }} aria-hidden="true" />
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 md:gap-4">
            {[
              { n: "01", t: "Citizen Voice", d: "Speak / type / photo" },
              { n: "02", t: "AI Understanding", d: "Translate & structure" },
              { n: "03", t: "Data Fusion", d: "GIS + demographics" },
              { n: "04", t: "Priority Intelligence", d: "Deterministic score" },
              { n: "05", t: "Government Action", d: "Human review" },
              { n: "06", t: "Impact", d: "Measure change" },
            ].map((s) => (
              <div key={s.n} className="group rounded-[20px] bg-white border border-[#E5E7EB] p-4 hover:border-[#D2E3FC] hover:shadow-sm transition-[border-color,box-shadow] flex flex-col">
                <div className="h-9 w-9 rounded-full bg-[#0B1F3A] text-white grid place-items-center text-xs font-bold tracking-widest group-hover:bg-[#174EA6] transition-colors">
                  {s.n}
                </div>
                <div className="mt-3 font-semibold text-[13.5px] leading-tight group-hover:text-[#174EA6] transition-colors">{s.t}</div>
                <div className="text-xs leading-snug text-[#5F6368] mt-1">{s.d}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 grid md:grid-cols-4 gap-4">
          {[
            { k: "LISTEN", t: "Multilingual citizen voice", d: "Voice, text, photos — in Gujarati, Hindi, English. Preserve meaning, flag ambiguity.", icon: Quote },
            { k: "UNDERSTAND", t: "AI organizes feedback", d: "Gemini extracts category, urgency, location, affected groups — validated server-side.", icon: Sparkles },
            { k: "PRIORITIZE", t: "Evidence-backed priorities", d: "Deterministic score: demand 30% + gap 20% + pop 15% + vuln 15% + urgency 10% + feas 10%.", icon: Target },
            { k: "MEASURE", t: "Track real impact", d: "Baseline → Target → Actual with observed vs modeled, audit-logged.", icon: TrendingUp },
          ].map((c, i) => (
            <StaggerCard key={c.k} index={i}>
              <div className="card-premium rounded-[20px] p-5 h-full flex flex-col relative">
                <div className="h-9 w-9 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] grid place-items-center">
                  <c.icon className="h-4 w-4 text-[#0B1F3A]" aria-hidden="true" />
                </div>
                <div className="mt-3 text-[11px] tracking-[0.14em] font-extrabold text-[#5F6368]">{c.k}</div>
                <div className="text-[14.5px] font-bold mt-1 leading-tight tracking-tight text-[#0B1F3A]">{c.t}</div>
                <div className="text-[13.5px] leading-relaxed text-[#5F6368] mt-1.5 flex-1">{c.d}</div>
                <div className="mt-4 h-px bg-[#F1F5F9]" aria-hidden="true" />
                <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#174EA6] opacity-70">Evidence-led <ArrowRight className="h-3 w-3" /></div>
              </div>
            </StaggerCard>
          ))}
        </div>
      </section>

      <div className="mx-auto max-w-[1280px] px-4 md:px-6"><div className="hairline" aria-hidden="true" /></div>

      {/* IMPACT — light editorial, consistent */}
      <section className="mx-auto max-w-[1280px] px-4 md:px-6 py-10" aria-labelledby="impact-heading">
        <h2 id="impact-heading" className="sr-only">JANSETU AI Impact — Measurable outcomes</h2>
        <div className="rounded-[24px] p-6 md:p-8 bg-white border border-[#E5E7EB] shadow-card overflow-hidden relative">
          <div className="absolute inset-0 grid-pattern opacity-[0.06] pointer-events-none" aria-hidden="true" />
          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="kicker">Impact · Sample data</div>
              <h3 className="mt-2 text-[19px] md:text-[20px] font-extrabold tracking-tight text-[#0B1F3A]">Measure what changed — not what was promised.</h3>
              <p className="text-sm text-[#5F6368] mt-1 max-w-[52ch]">Baseline → Target → Actual with observed vs modeled, labeled clearly. No inflated claims.</p>
            </div>
            <span className="hidden md:inline-flex items-center gap-2 rounded-full bg-[#F8FAFC] border border-[#E5E7EB] px-3 py-1.5 text-xs text-[#5F6368]">
              <Eye className="h-3.5 w-3.5 text-[#174EA6]" /> Auditable · human-governed
            </span>
          </div>
          <div className="relative mt-6 grid md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[#E5E7EB] rounded-[16px] border border-[#E5E7EB] overflow-hidden bg-[#F8FAFC]">
            {[
              { v: 128000, s: "+", l: "Citizen Requests", sub: "last 12 months · sample", bars: [22, 38, 28, 52, 44, 62] },
              { v: 284, l: "Demand Hotspots", sub: "BigQuery GIS · sample", bars: [18, 32, 24, 48, 36, 54] },
              { v: 42, l: "Priority Projects", sub: "candidate · sample", bars: [30, 20, 42, 28, 50, 38] },
              { v: 1800000, s: "", l: "People Impacted", sub: "estimated · sample", bars: [12, 44, 32, 58, 40, 66] },
            ].map((x) => (
              <div key={x.l} className="py-5 px-6 md:py-6 first:pl-6 bg-white relative overflow-hidden group hover:bg-[#F8FAFC] transition-colors">
                <div className="relative">
                  <div className="text-[28px] md:text-[32px] font-extrabold tracking-[-0.03em] tabular-nums text-[#0B1F3A]">
                    <Counter value={x.v} suffix={x.s || ""} />
                  </div>
                  <div className="text-sm font-semibold text-[#172033] mt-0.5">{x.l}</div>
                  <div className="text-xs text-[#5F6368] mt-1">{x.sub}</div>
                  <div className="mt-3 flex items-end gap-1 h-[18px]">
                    {x.bars.map((h, bi) => (
                      <div key={bi} className="w-1.5 rounded-full bg-[#E8F0FE] overflow-hidden flex-1 max-w-[6px]">
                        <div className="bg-[#174EA6] w-full rounded-full animate-[scale-in_0.7s_both]" style={{ height: `${h}%`, transformOrigin: "bottom", animationDelay: `${0.15 + bi * 0.06}s` }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-2 text-xs">
            <Link href="/impact" className="inline-flex items-center gap-1.5 rounded-full bg-[#174EA6] text-white px-4 py-2 font-semibold hover:bg-[#0B1F3A] transition-colors">See measured impact <ArrowRight className="h-3.5 w-3.5" /></Link>
            <Link href="/government/impact" className="inline-flex items-center gap-1.5 rounded-full bg-white border border-[#E5E7EB] px-4 py-2 font-medium hover:border-[#D2E3FC] hover:text-[#174EA6] transition-colors">Government dashboard</Link>
            <Link href="/docs/api" className="inline-flex items-center gap-1.5 rounded-full bg-white border border-[#E5E7EB] px-4 py-2 font-medium hover:border-[#D2E3FC] hover:text-[#174EA6] transition-colors">API — baselines</Link>
          </div>
        </div>
      </section>

      {/* TRUST + METHODOLOGY — light, consistent */}
      <section className="mx-auto max-w-[1280px] px-4 md:px-6 py-10">
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="rounded-[24px] bg-white border border-[#E5E7EB] p-6 md:p-8 shadow-card">
            <div className="flex items-center gap-2 text-[11px] tracking-[0.14em] font-extrabold text-[#174EA6]"><ShieldCheck className="h-4 w-4" /> TRUST · GOVERNANCE</div>
            <h2 className="mt-2 text-[20px] font-extrabold tracking-tight text-[#0B1F3A]">Why JANSETU AI is trustworthy</h2>
            <p className="text-[13.5px] text-[#5F6368] mt-3 leading-relaxed">
              <strong className="text-[#0B1F3A]">Digital Public Good</strong> — privacy-preserving, fairness-constrained, human-governed. Frontend is untrusted: all validation, clustering, scoring, recommendations and audit live server-side. Gemini may understand, translate, classify and explain — it must not invent evidence, alter weights silently, approve funding, or override authoritative data. Every priority score persists every component plus weightVersion for reproducibility.
            </p>
            <ul className="mt-5 space-y-2.5 text-[13.5px] text-[#172033] leading-relaxed">
              {["Never uses religion, caste, or political affiliation in any scoring decision.", "Voice is transcribed to text; no biometric profiling, no sales, no ads. Location is opt-in — text locality works.", "Public analytics show cluster centroids and GeoJSON hotspots — never individual citizen positions."].map((t) => (
                <li key={t} className="flex gap-2.5"><CheckCircle2 className="h-4 w-4 text-[#188038] mt-0.5 shrink-0" aria-hidden="true" /><span>{t}</span></li>
              ))}
              <li className="flex gap-2.5"><CheckCircle2 className="h-4 w-4 text-[#188038] mt-0.5 shrink-0" aria-hidden="true" /><span>Fully audit-logged: <Link href="/government/admin/audit" className="text-[#174EA6] underline-premium font-medium">audit logs</Link> and <Link href="/government/admin/health" className="text-[#174EA6] underline-premium font-medium">system health</Link> are transparent.</span></li>
            </ul>
            <div className="mt-5 hairline" aria-hidden="true" />
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <Link href="/about" className="rounded-full border border-[#E5E7EB] px-3.5 py-2 font-medium hover:border-[#174EA6] hover:text-[#174EA6] transition-colors">About JANSETU →</Link>
              <Link href="/privacy" className="rounded-full border border-[#E5E7EB] px-3.5 py-2 font-medium hover:border-[#174EA6] hover:text-[#174EA6] transition-colors">Privacy →</Link>
              <Link href="/accessibility" className="rounded-full border border-[#E5E7EB] px-3.5 py-2 font-medium hover:border-[#174EA6] hover:text-[#174EA6] transition-colors">Accessibility →</Link>
              <Link href="/contact" className="rounded-full bg-[#174EA6] text-white px-4 py-2 font-medium hover:bg-[#0B1F3A] transition-colors">Contact →</Link>
            </div>
          </div>

          <div className="rounded-[24px] bg-white border border-[#E5E7EB] p-6 md:p-8 shadow-card">
            <div className="flex items-center gap-2 text-[11px] tracking-[0.14em] font-extrabold text-[#5F6368]"><Database className="h-4 w-4" /> METHOD · DETERMINISTIC V1</div>
            <h2 className="mt-2 text-[20px] font-extrabold tracking-tight text-[#0B1F3A]">Deterministic Priority Engine v1</h2>
            <p className="text-[13.5px] text-[#5F6368] mt-2 leading-relaxed">
              Priority = <span className="font-semibold text-[#0B1F3A]">demand 30% + infrastructure gap 20% + population 15% + vulnerability 15% + urgency 10% + feasibility 10%</span>. Weights are pinned and versioned — Gemini explains, never overrides.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
              {[
                ["Demand 30%", "4,218 requests clustered near Vadodara", "92"],
                ["Gap 20%", "Road index 38/100 vs target 70", "88"],
                ["Population 15%", "12.4k affected, density-aware", "80"],
                ["Vulnerability 15%", "SC/ST, women, children weighted", "82"],
                ["Urgency 10%", "Monsoon closure, 45→28 min", "90"],
                ["Feasibility 10%", "Terrain, cost, timeline", "64"],
              ].map(([k, d, score]) => (
                <div key={k} className="rounded-[16px] bg-[#F8FAFC] border border-[#E5E7EB] p-3.5 hover:bg-white hover:border-[#D2E3FC] hover:shadow-sm transition-colors">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-[#0B1F3A]">{k}</span>
                    <span className="text-[11px] font-bold rounded-full bg-white border border-[#E5E7EB] px-2 py-0.5 text-[#174EA6]">{score}</span>
                  </div>
                  <div className="text-[#5F6368] mt-1 leading-snug">{d}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#0B1F3A] text-white px-3.5 py-1.5 text-xs font-semibold">
              <Fingerprint className="h-3.5 w-3.5" /> Band: critical ≥80 · high 65–79 · moderate 45–64 · low &lt;45
            </div>
            <p className="mt-3 text-xs text-[#5F6368] leading-relaxed">
              See <Link href="/docs" className="text-[#174EA6] underline-premium font-medium">docs</Link> and <Link href="/docs/api" className="text-[#174EA6] underline-premium font-medium">API reference</Link> for full spec and <Link href="/openapi.json" className="text-[#174EA6] underline-premium font-medium">OpenAPI</Link>.
            </p>
          </div>
        </div>
      </section>

      {/* BRICS — marquee + grid with tilt */}
      <section className="mx-auto max-w-[1280px] px-4 md:px-6 py-10" aria-labelledby="brics-heading">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="max-w-[60ch]">
            <div className="kicker">Scale · BRICS-ready</div>
            <h2 id="brics-heading" className="mt-2 text-[20px] md:text-[22px] font-extrabold tracking-tight text-[#0B1F3A]">Built for diverse communities. Designed to scale across borders.</h2>
            <p className="text-[13.5px] text-[#5F6368] mt-2 leading-relaxed">
              India-first, BRICS-ready — languages, admin hierarchy, currency, datasets per country.{" "}
              <Link href="/brics" className="text-[#174EA6] underline-premium font-semibold">Explore BRICS configuration →</Link>
            </p>
          </div>
        </div>
        {/* marquee — subtle */}
        <div className="mt-6 rounded-[16px] border border-[#E5E7EB] bg-white py-2.5 overflow-hidden">
          <Marquee duration="32s">
            {[
              "🇧🇷 Brazil — Português",
              "🇷🇺 Russia — Русский",
              "🇮🇳 India — हिन्दी · ગુજરાતી · English",
              "🇨🇳 China — 中文",
              "🇿🇦 South Africa — 11 languages",
              "BRICS-ready · Deterministic core · Local evidence",
            ].map((t) => (
              <span key={t} className="inline-flex items-center gap-2 rounded-full bg-[#F8FAFC] border border-[#E5E7EB] px-3 py-1 text-xs font-medium text-[#172033] whitespace-nowrap">
                {t}
              </span>
            ))}
          </Marquee>
        </div>
        <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            { c: "Brazil", l: "Português", col: "#009739", flag: "BR" },
            { c: "Russia", l: "Русский", col: "#0039A6", flag: "RU" },
            { c: "India", l: "हिन्दी · ગુજરાતી", col: "#FF9933", flag: "IN", active: true },
            { c: "China", l: "中文", col: "#DE2910", flag: "CN" },
            { c: "South Africa", l: "11 languages", col: "#007A4D", flag: "ZA" },
          ].map((b) => (
            <div key={b.c} className={`rounded-[20px] bg-white border p-4 flex items-center gap-3 hover:border-[#D2E3FC] hover:shadow-sm transition-colors ${b.active ? "bg-[#FFFBF5] border-[#FF9933]/30" : "border-[#E5E7EB]"}`}>
              <span className="h-10 w-10 rounded-xl grid place-items-center text-white text-[11px] font-bold tracking-widest shadow-sm shrink-0" style={{ background: b.col }} aria-hidden="true">
                {b.flag}
              </span>
              <div className="min-w-0">
                <div className="text-sm font-bold leading-none tracking-tight flex items-center gap-1.5">{b.c} {b.active && <span className="h-1.5 w-1.5 rounded-full bg-[#188038] animate-pulse" aria-hidden="true" />}</div>
                <div className="text-xs text-[#5F6368] mt-0.5">{b.l}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ — light, consistent */}
      <section className="mx-auto max-w-[1280px] px-4 md:px-6 py-10">
        <div className="rounded-[24px] bg-white border border-[#E5E7EB] p-6 md:p-8 shadow-card relative overflow-hidden">
          <div className="relative">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="kicker">FAQ · Trust</div>
                <h2 className="mt-2 text-[20px] font-extrabold tracking-tight text-[#0B1F3A]">Frequently asked questions</h2>
                <p className="text-sm text-[#5F6368] mt-1">Evidence-led answers with audit trails. No auto-approval.</p>
              </div>
              <Link href="/docs" className="hidden md:inline-flex text-xs font-semibold rounded-full border border-[#E5E7EB] px-3 py-2 hover:border-[#174EA6] hover:text-[#174EA6]">Docs →</Link>
            </div>
            <div className="mt-6">
              <Accordion
                items={[
                  {
                    value: "complaint",
                    trigger: "Is JANSETU AI a government complaint portal?",
                    content: (
                      <>
                        No. It is a civic intelligence layer that clusters demand, fuses demographics and infrastructure gaps, and recommends candidate projects for human review. No auto-approval; every recommendation carries a <em>human_review_notice</em>.
                      </>
                    ),
                  },
                  {
                    value: "score",
                    trigger: "How is the priority score computed?",
                    content: (
                      <>
                        Deterministically: demand 30, gap 20, population 15, vulnerability 15, urgency 10, feasibility 10 — all components and weightVersion stored for audit. See <Link href="/how-it-works" className="text-[#174EA6] underline-premium">How it Works</Link>.
                      </>
                    ),
                  },
                  {
                    value: "gujarati",
                    trigger: "Does it work offline or in Gujarati?",
                    content: (
                      <>
                        Yes. Voice, text and photo intake in Gujarati, Hindi and English. Core flows are low-bandwidth and degrade gracefully on slow Android. <Link href="/accessibility" className="text-[#174EA6] underline-premium">Accessibility details</Link>.
                      </>
                    ),
                  },
                  {
                    value: "data",
                    trigger: "Where does the data come from?",
                    content: (
                      <>
                        Citizen voice plus BigQuery GIS, synthetic demographics, infrastructure indices and investment plans (clearly labeled). Swap <code className="bg-[#F8FAFC] border border-[#E5E7EB] rounded px-1.5 py-0.5 text-xs">store.ts</code> with Firebase + BigQuery for production. <Link href="/docs" className="text-[#174EA6] underline-premium ml-1">Integration docs →</Link>
                      </>
                    ),
                  },
                ]}
              />
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA — light, consistent */}
      <section className="mx-auto max-w-[1280px] px-4 md:px-6 pb-16">
        <div className="rounded-[28px] bg-white border border-[#E5E7EB] shadow-card overflow-hidden relative">
          <div className="p-6 md:p-10 relative">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="max-w-[56ch]">
                <div className="inline-flex items-center gap-2 rounded-full bg-[#F8FAFC] border border-[#E5E7EB] px-3 py-1 text-xs font-semibold text-[#5F6368]">
                  <Users className="h-3.5 w-3.5 text-[#174EA6]" /> Citizen PWA + Government dashboard · OPEN
                </div>
                <h2 className="mt-3 text-[22px] md:text-[26px] font-extrabold tracking-tight text-[#0B1F3A] leading-tight">Turn public voice into measurable action.</h2>
                <p className="text-[13.5px] text-[#5F6368] mt-2 leading-relaxed">
                  Evidence-led · Privacy-preserving · Human-governed.{" "}
                  <Link href="/about" className="text-[#174EA6] underline-premium font-medium">About JANSETU</Link> ·{" "}
                  <Link href="/privacy" className="text-[#174EA6] underline-premium font-medium">Privacy</Link> ·{" "}
                  <Link href="/terms" className="text-[#174EA6] underline-premium font-medium">Terms</Link>
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E8F0FE] border border-[#D2E3FC] px-2.5 py-1 text-[#174EA6] font-semibold"><Fingerprint className="h-3 w-3" /> Deterministic v1</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E6F4EA] border border-[#CEE6D0] px-2.5 py-1 text-[#0D652D] font-semibold"><Search className="h-3 w-3" /> Centroids only</span>
                </div>
              </div>
              <div className="flex flex-col gap-3 shrink-0 items-stretch sm:items-end">
                <ShimmerButton href="/citizen/submit" className="h-[44px] px-7 text-[15px] min-h-[44px] justify-center">
                  Raise a Community Need <ArrowRight className="h-4 w-4" />
                </ShimmerButton>
                <div className="flex gap-2 text-xs justify-center sm:justify-end">
                  <Link href="/register" className="min-h-[44px] inline-flex items-center px-3 font-medium text-[#5F6368] hover:text-[#172033] underline underline-offset-4 decoration-[#E5E7EB]">Create account</Link>
                  <span className="text-[#E5E7EB] py-3" aria-hidden="true">·</span>
                  <Link href="/login" className="min-h-[44px] inline-flex items-center px-3 font-medium text-[#5F6368] hover:text-[#172033] underline underline-offset-4 decoration-[#E5E7EB]">Log in</Link>
                </div>
              </div>
            </div>
            <div className="mt-6 hairline" aria-hidden="true" />
            <p className="text-xs text-[#5F6368] mt-4 text-center leading-relaxed">
              Explore: <Link href="/how-it-works" className="underline-premium">How It Works</Link> ·{" "}
              <Link href="/impact" className="underline-premium">Impact</Link> · <Link href="/brics" className="underline-premium">BRICS</Link> ·{" "}
              <Link href="/contact" className="underline-premium">Contact</Link> · <Link href="/docs/api" className="underline-premium">API</Link> ·{" "}
              <Link href="/sitemap.xml" className="underline-premium">Sitemap</Link>
            </p>
          </div>
        </div>
        <p className="text-center text-[11px] tracking-wide text-[#5F6368] mt-3">© {new Date().getFullYear()} JANSETU AI · Citizen-first · Evidence-first</p>
      </section>
    </div>
  );
}
