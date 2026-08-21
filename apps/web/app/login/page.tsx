"use client";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, ShieldCheck, ArrowRight } from "lucide-react";
import { setMockRole } from "@/lib/firebase";

export default function LoginPage() {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email,setEmail]=useState(""), [pass,setPass]=useState("");
  const [role, setRole] = useState<"citizen"|"government">("citizen");

  return (
    <div className="min-h-[calc(100vh-64px)] grid lg:grid-cols-[1.05fr_0.95fr]">
      <div className="hidden lg:flex relative bg-[#0B1F3A] text-white overflow-hidden p-10 flex-col justify-between">
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage:"radial-gradient(600px 400px at 20% 20%, white, transparent), radial-gradient(500px 300px at 80% 80%, white, transparent)"}} />
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/10 px-3 py-1.5 text-xs">JANSETU AI · Civic Intelligence</div>
          <h2 className="mt-6 text-3xl font-semibold leading-tight">Where citizen voice<br /><span className="font-light italic">becomes public action.</span></h2>
          <p className="text-sm text-white/60 mt-3 max-w-[44ch]">Understand demand. Identify gaps. Prioritize action. Deterministic v1, human-governed.</p>
        </div>
        <div className="relative rounded-[20px] bg-white/10 backdrop-blur-xl border border-white/10 p-4">
          <div className="text-xs tracking-widest text-white/60">LIVE HOTSPOT</div>
          <div className="text-sm font-medium">Vadodara Rural · 94/100 priority</div>
          <div className="text-xs text-white/60">4,218 requests · 12.4k affected</div>
        </div>
      </div>
      <div className="flex items-center justify-center p-6 md:p-10 bg-[#F8FAFC]">
        <div className="w-full max-w-[420px] rounded-[24px] bg-white border border-[#E5E7EB] shadow-card p-6 md:p-8">
          <div className="flex rounded-full bg-[#F8FAFC] border border-[#E5E7EB] p-1 text-sm">
            <button onClick={()=> setRole("citizen")} className={`flex-1 py-1.5 rounded-full font-medium transition ${role==="citizen" ? "bg-[#174EA6] text-white shadow-sm" : "text-[#5F6368] hover:text-[#172033]"}`}>Citizen</button>
            <button onClick={()=> setRole("government")} className={`flex-1 py-1.5 rounded-full font-medium transition ${role==="government" ? "bg-[#174EA6] text-white shadow-sm" : "text-[#5F6368] hover:text-[#172033]"}`}>Government</button>
          </div>
          <p className="text-xs text-[#5F6368] text-center mt-2">{role==="citizen" ? "Citizen portal · voice, tracking, impact" : "Government dashboard · KPIs, maps, prioritization"}</p>
          <h1 className="text-2xl font-semibold tracking-tight mt-4">Welcome back</h1>
          <p className="text-sm text-[#78716C] mt-1">Sign in to continue to JANSETU AI</p>
          <div className="mt-6 space-y-4">
            <label className="block">
              <span className="text-sm font-medium">Email / Phone</span>
              <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Enter email or phone" className="mt-1.5 w-full rounded-full border border-[#E7E5E4] bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black" />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Password</span>
              <div className="mt-1.5 relative">
                <input type={show?"text":"password"} value={pass} onChange={e=>setPass(e.target.value)} placeholder="Enter password" className="w-full rounded-full border border-[#E7E5E4] bg-white px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black" />
                <button onClick={()=> setShow(v=>!v)} className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 w-8 grid place-items-center rounded-full hover:bg-[#F5F5F4]">{show?<EyeOff className="h-4 w-4"/>:<Eye className="h-4 w-4"/>}</button>
              </div>
            </label>
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2"><input type="checkbox" className="rounded border-[#E7E5E4]" /> Remember me</label>
              <Link href="#" className="font-medium underline decoration-[#E7E5E4] underline-offset-4 hover:text-black">Forgot password?</Link>
            </div>
            <Button onClick={()=> { setLoading(true); setMockRole(role); setTimeout(()=> { setLoading(false); location.href = role==="citizen" ? "/citizen" : "/government"; }, 600); }} disabled={loading || !email || !pass} className="w-full rounded-full">
              {loading ? "Signing in…" : `Sign In as ${role==="citizen" ? "Citizen" : "Government"}`} <ArrowRight className="h-4 w-4 opacity-60" />
            </Button>
            <div className="flex items-center gap-3 text-xs text-[#78716C]"><span className="h-px flex-1 bg-[#E7E5E4]" />OR<span className="h-px flex-1 bg-[#E7E5E4]" /></div>
            <button className="w-full h-11 rounded-full border border-[#E7E5E4] bg-white text-sm font-medium hover:bg-[#F5F5F4]">Continue with Google</button>
            <div className="text-sm text-center text-[#78716C]">Don&apos;t have an account? <Link href="/register" className="font-medium text-black underline decoration-[#E7E5E4] underline-offset-4">Create account</Link></div>
            <div className="pt-4 border-t border-[#E7E5E4] flex gap-4 text-xs text-[#78716C] justify-center">
              <Link href="#" className="hover:text-black">Privacy Policy</Link><Link href="#" className="hover:text-black">Terms</Link><Link href="#" className="hover:text-black">Accessibility</Link>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#78716C] justify-center"><ShieldCheck className="h-3.5 w-3.5" /> Human-governed · Evidence-led</div>
          </div>
        </div>
      </div>
    </div>
  );
}
