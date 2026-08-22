"use client";
import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Sparkles, ShieldCheck, Layers, Target, TrendingUp, MapPin, Activity, Quote } from "lucide-react";

// Animated counter — react-bits inspired, low JS
function Counter({ value, suffix="" }: { value: number; suffix?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [n, setN] = useState(0);
  useEffect(()=> {
    if (!inView) return;
    let raf=0, start=performance.now(), dur=1100;
    const step = (t:number) => {
      const p = Math.min(1, (t-start)/dur);
      const eased = 1 - Math.pow(1-p, 3);
      setN(Math.round(value*eased));
      if (p<1) raf=requestAnimationFrame(step);
    };
    raf=requestAnimationFrame(step);
    return ()=> cancelAnimationFrame(raf);
  }, [inView, value]);
  return <span ref={ref}>{n.toLocaleString("en-IN")}{suffix}</span>;
}

export default function Home() {
  return (
    <div className="bg-[#FFFBF7] text-[#0C0A09]">
      {/* HERO — CLEAN + VIVID — galaxy + blue glow, high visibility */}
      <section className="relative overflow-hidden bg-[#F8FAFC] border-b border-[#E5E7EB]">
        <div className="absolute inset-0 pointer-events-none" style={{ background:"radial-gradient(900px 500px at 12% 8%, rgba(23,78,166,0.09), transparent 60%), radial-gradient(700px 500px at 85% 15%, rgba(24,128,56,0.06), transparent 60%), radial-gradient(600px 400px at 50% 100%, rgba(245,245,244,0.9), transparent 60%)"}} />
        <div className="mx-auto max-w-[1280px] px-4 md:px-6 pt-10 md:pt-[64px] pb-12 md:pb-16 relative">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-8 items-center">
            <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5, ease:"easeOut" }} className="relative">
              <div className="inline-flex items-center gap-2 rounded-full bg-white border border-[#E5E7EB] pl-1 pr-3 py-1 text-xs font-medium shadow-sm">
                <span className="h-6 px-3 grid place-items-center rounded-full bg-[#174EA6] text-white text-[11px] tracking-widest font-semibold">NEW</span>
                <span className="text-[#172033]">India-first · BRICS-ready</span>
                <span className="hidden sm:inline-flex h-1.5 w-1.5 rounded-full bg-[#188038] animate-pulse" />
              </div>
              <h1 className="mt-5 text-[34px] md:text-[48px] font-bold tracking-[-0.03em] leading-[0.9] text-[#0B1F3A]">
                Your voice<br />
                <span className="font-light italic tracking-[-0.04em] text-[#174EA6]">can shape</span><br />
                your community.
              </h1>
              <p className="mt-4 text-[15px] md:text-[16px] leading-relaxed text-[#5F6368] max-w-[52ch]">
                JANSETU AI turns citizen requests into <span className="font-semibold text-[#0B1F3A]">evidence-backed development priorities</span> for governments. Minimal. Trustworthy. Measurable.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/citizen/submit"><Button size="lg" className="gap-2 rounded-full shadow-sm">🎤 Raise a Community Need <ArrowRight className="h-4 w-4" /></Button></Link>
                <Link href="/how-it-works"><Button variant="secondary" size="lg" className="rounded-full gap-2">Explore the Platform <Layers className="h-4 w-4" /></Button></Link>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-[#5F6368]">
                <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-[#188038]" /> Privacy-preserving</span>
                <span className="h-1 w-1 rounded-full bg-[#E5E7EB]" />
                <span>GU · HI · EN</span>
                <span className="h-1 w-1 rounded-full bg-[#E5E7EB]" />
                <span>Human-governed</span>
              </div>
              <div className="mt-8 grid grid-cols-3 gap-3 max-w-[520px]">
                {[
                  { k:"4,218", l:"requests clustered", sub:"Vadodara" },
                  { k:"94/100", l:"priority score", sub:"high · v1" },
                  { k:"12.4k", l:"people impacted", sub:"estimated" },
                ].map(c=> (
                  <div key={c.k} className="rounded-2xl bg-white border border-[#E5E7EB] p-3 shadow-sm hover-lift hover-glow hover-border cursor-default">
                    <div className="text-[11px] tracking-widest font-semibold text-[#5F6368]">{c.l.toUpperCase()}</div>
                    <div className="text-lg font-bold mt-1 text-[#0B1F3A]">{c.k}</div>
                    <div className="text-xs text-[#5F6368]">{c.sub}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Map visualization — VIVID blue glow */}
            <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6, delay:0.08 }} className="relative lg:h-[520px]">
              <div className="absolute -inset-4 -z-10 rounded-[28px] opacity-60" style={{ background:"radial-gradient(520px 320px at 30% 20%, rgba(23,78,166,0.14), transparent 70%), radial-gradient(480px 300px at 80% 80%, rgba(24,128,56,0.08), transparent 70%)"}} />
              <div className="relative h-full rounded-[28px] bg-white border border-[#E5E7EB] shadow-card overflow-hidden p-4 md:p-5">
                <div className="relative h-[360px] md:h-[400px] rounded-[20px] bg-gradient-to-br from-[#F8FAFC] to-[#EFF3FF] border border-[#E5E7EB] overflow-hidden">
                  <svg viewBox="0 0 360 420" className="absolute inset-0 w-full h-full" aria-hidden>
                    <path d="M120 60 L155 55 L185 70 L205 95 L210 135 L200 165 L190 195 L175 225 L150 250 L120 270 L95 240 L85 210 L90 170 L100 120 Z" fill="#FFFFFF" stroke="#174EA6" strokeOpacity="0.18" strokeWidth="1.2" />
                    <g>
                      <circle cx="150" cy="145" r="26" fill="#174EA6" opacity="0.14" className="hotspot-pulse" />
                      <circle cx="150" cy="145" r="14" fill="#174EA6" opacity="0.10" />
                      <circle cx="150" cy="145" r="6" fill="#174EA6" stroke="white" strokeWidth="2" />
                      <circle cx="165" cy="185" r="16" fill="#174EA6" opacity="0.10" />
                      <circle cx="165" cy="185" r="4.5" fill="#0B1F3A" stroke="white" strokeWidth="1.5" />
                      <circle cx="132" cy="205" r="12" fill="#188038" opacity="0.12" />
                      <circle cx="132" cy="205" r="3.2" fill="#188038" stroke="white" strokeWidth="1.5" />
                    </g>
                  </svg>
                  <motion.div initial={{ y:6, opacity:0 }} animate={{ y:0, opacity:1 }} transition={{ delay:0.4 }} className="absolute left-3 top-3 rounded-2xl bg-white border border-[#E5E7EB] px-3 py-2.5 shadow-card">
                    <div className="text-[11px] tracking-widest font-semibold text-[#174EA6]">CITIZEN REQUESTS</div>
                    <div className="text-sm font-bold">4,218 clustered</div>
                    <div className="text-xs text-[#5F6368]">↓ 1 major hotspot</div>
                  </motion.div>
                  <motion.div initial={{ y:6, opacity:0 }} animate={{ y:0, opacity:1 }} transition={{ delay:0.55 }} className="absolute right-3 top-12 rounded-2xl bg-[#0B1F3A] text-white px-4 py-3 shadow-lg border border-[#0B1F3A]">
                    <div className="text-[11px] tracking-widest opacity-60">PRIORITY</div>
                    <div className="text-xl font-bold leading-none">94<span className="text-sm font-normal opacity-60">/100</span></div>
                    <div className="text-xs opacity-80">High · Deterministic</div>
                  </motion.div>
                  <motion.div initial={{ y:6, opacity:0 }} animate={{ y:0, opacity:1 }} transition={{ delay:0.7 }} className="absolute left-1/2 -translate-x-1/2 bottom-3 rounded-2xl bg-white border border-[#E5E7EB] px-3 py-2.5 shadow-card flex items-center gap-2.5">
                    <span className="h-8 w-8 rounded-xl bg-[#174EA6] text-white grid place-items-center"><MapPin className="h-4 w-4" /></span>
                    <div>
                      <div className="text-xs font-bold">Recommended Project</div>
                      <div className="text-xs text-[#5F6368]">Rural connectivity · ₹4.2 Cr · 12.4k</div>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-[#174EA6]" />
                  </motion.div>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="font-medium text-[#0B1F3A]">Vadodara · Gujarat · Priority Engine v1</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E8F0FE] text-[#174EA6] border border-[#D2E3FC] px-2.5 py-1 text-xs font-medium"><Activity className="h-3 w-3" /> Live</span>
                </div>
              </div>
              <div className="hidden lg:flex absolute -bottom-2 -right-2 items-center gap-2 rounded-full bg-[#0B1F3A] text-white border border-[#0B1F3A] px-3 py-1.5 text-xs shadow-card">
                <span className="h-2 w-2 rounded-full bg-[#188038] animate-pulse" /> 284 hotspots · 42 projects
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS — 6-step timeline + 4 pillars */}
      <section id="how-it-works" className="mx-auto max-w-[1280px] px-4 md:px-6 py-12">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-[22px] font-semibold tracking-tight">Citizen voice → Public action</h2>
            <p className="text-sm text-[#78716C] mt-2">Not a complaint portal. A public intelligence layer.</p>
          </div>
          <Link href="/how-it-works" className="hidden md:inline-flex text-sm font-medium underline decoration-[#E7E5E4] underline-offset-4 hover:text-black">How it works →</Link>
        </div>
        <div className="mt-8 relative">
          <div className="hidden md:block absolute left-0 right-0 top-[18px] h-px bg-[#E7E5E4]" />
          <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
            {[
              { n:"01", t:"Citizen Voice", d:"Speak / type / photo" },
              { n:"02", t:"AI Understanding", d:"Translate & structure" },
              { n:"03", t:"Data Fusion", d:"GIS + demographics" },
              { n:"04", t:"Priority Intelligence", d:"Deterministic score" },
              { n:"05", t:"Government Action", d:"Human review" },
              { n:"06", t:"Impact", d:"Measure change" },
            ].map(s=> (
              <div key={s.n} className="relative bg-white rounded-[20px] border border-[#E5E7EB] p-4 hover-lift hover-border cursor-pointer group">
                <div className="h-9 w-9 rounded-full bg-black text-white grid place-items-center text-xs font-semibold group-hover:bg-[#174EA6] group-hover:scale-105 transition-all">{s.n}</div>
                <div className="mt-3 font-medium text-sm leading-tight group-hover:text-[#174EA6] transition-colors">{s.t}</div>
                <div className="text-xs text-[#78716C]">{s.d}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-10 grid md:grid-cols-4 gap-4">
          {[
            { k:"LISTEN", t:"Multilingual citizen voice", d:"Voice, text, photos — in Gujarati, Hindi, English. Preserve meaning, flag ambiguity.", icon: Quote },
            { k:"UNDERSTAND", t:"AI organizes feedback", d:"Gemini extracts category, urgency, location, affected groups — validated server-side.", icon: Sparkles },
            { k:"PRIORITIZE", t:"Evidence-backed priorities", d:"Deterministic score: demand 30% + gap 20% + pop 15% + vuln 15% + urgency 10% + feas 10%.", icon: Target },
            { k:"MEASURE", t:"Track real impact", d:"Baseline → Target → Actual with observed vs modeled, audit-logged.", icon: TrendingUp },
          ].map((c,i)=> (
            <motion.div key={c.k} initial={{ opacity:0, y:8 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:i*0.06 }} whileHover={{ y:-3 }} className="card-premium rounded-[20px] p-5 shimmer-border hover-lift cursor-pointer">
              <div className="h-9 w-9 rounded-xl bg-[#F5F5F4] border border-[#E5E7EB] grid place-items-center"><c.icon className="h-4 w-4 text-[#0C0A09]" /></div>
              <div className="mt-3 text-[11px] tracking-[0.12em] font-semibold text-[#78716C]">{c.k}</div>
              <div className="text-[15px] font-semibold mt-1 leading-tight">{c.t}</div>
              <div className="text-sm leading-relaxed text-[#78716C] mt-1.5">{c.d}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* IMPACT — animated counters — hyperui + react-bits */}
      <section className="mx-auto max-w-[1280px] px-4 md:px-6 py-10">
        <div className="rounded-[24px] p-6 md:p-8 bg-[#0C0A09] text-white overflow-hidden relative border border-[#0C0A09]">
          <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{ backgroundImage:"radial-gradient(600px 300px at 20% 0%, white, transparent)"}} />
          <div className="relative grid md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-white/10">
            {[
              { v:128000, s:"+", l:"Citizen Requests", sub:"last 12 months" },
              { v:284, l:"Demand Hotspots", sub:"BigQuery GIS" },
              { v:42, l:"Priority Projects", sub:"candidate" },
              { v:1800000, s:"", l:"People Potentially Impacted", sub:"estimated" },
            ].map(x=> (
              <div key={x.l} className="py-4 md:py-0 md:px-6 first:pl-0">
                <div className="text-3xl font-semibold tracking-tight"><Counter value={x.v} suffix={x.s||""} /></div>
                <div className="text-sm font-medium text-white/90">{x.l}</div>
                <div className="text-xs text-white/60">{x.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BRICS — minimal country cards — magicui border beam subtle */}
      <section className="mx-auto max-w-[1280px] px-4 md:px-6 py-10">
        <div className="max-w-[640px]">
          <h2 className="text-xl font-semibold tracking-tight">Built for diverse communities. Designed to scale across borders.</h2>
          <p className="text-sm text-[#78716C] mt-2">India-first, BRICS-ready — languages, admin hierarchy, currency, datasets per country.</p>
        </div>
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { c:"Brazil", l:"Português", col:"#009739" },
            { c:"Russia", l:"Русский", col:"#0039A6" },
            { c:"India", l:"हिन्दी · ગુજરાતી", col:"#FF9933" },
            { c:"China", l:"中文", col:"#DE2910" },
            { c:"South Africa", l:"11 languages", col:"#007A4D" },
          ].map(b=> (
            <div key={b.c} className="rounded-[20px] bg-white border border-[#E5E7EB] p-4 flex items-center gap-3 shimmer-border hover-lift hover-glow cursor-pointer">
              <span className="h-9 w-9 rounded-xl grid place-items-center text-white text-xs font-bold hover-scale" style={{ background:b.col }}>{b.c[0]}</span>
              <div><div className="text-sm font-medium leading-none">{b.c}</div><div className="text-xs text-[#78716C]">{b.l}</div></div>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA — minimal, not gradient spam */}
      <section className="mx-auto max-w-[1280px] px-4 md:px-6 pb-16">
        <div className="rounded-[28px] bg-white border border-[#E7E5E4] p-6 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Turn public voice into measurable action.</h2>
            <p className="text-sm text-[#78716C] mt-1">Citizen PWA + Government dashboard · Evidence-led · Human-governed.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/citizen/submit"><Button size="lg" className="rounded-full">Raise a Community Need</Button></Link>
            <Link href="/register"><Button variant="secondary" size="lg" className="rounded-full">Create Account</Button></Link>
            <Link href="/login"><Button variant="ghost" size="lg" className="rounded-full">Log In</Button></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
