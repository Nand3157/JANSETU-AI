"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, ShieldCheck, ArrowRight, AlertCircle, Info } from "lucide-react";
import { setMockRole, signInPortal, isFirebaseConfigured } from "@/lib/firebase";

export default function LoginClient() {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email,setEmail]=useState(""), [pass,setPass]=useState("");
  const [role, setRole] = useState<"citizen"|"government">("citizen");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setNotice("");
    // M-19 fix: phone regex allows spaces/dashes within number; strip spaces before test
    const cleaned = email.trim().replace(/[\s-]/g, "");
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    const isPhone = /^(\+91)?[6-9]\d{9}$/.test(cleaned);
    if (!isEmail && !isPhone) {
      setError("Enter a valid email or mobile number."); return;
    }
    if (pass.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      if (isFirebaseConfigured()) {
        const { role } = await signInPortal(email.trim(), pass);
        setNotice(`Welcome back — opening the ${role === "citizen" ? "Citizen Portal" : "Government Dashboard"}…`);
        router.push(role === "citizen" ? "/citizen" : "/government");
      } else {
        setMockRole(role);
        setNotice(`Signing you in as ${role === "citizen" ? "a citizen" : "a government user"}…`);
        setTimeout(()=> { setLoading(false); router.push(role==="citizen" ? "/citizen" : "/government"); }, 600);
        return;
      }
    } catch (err: any) {
      const code = String(err?.code || "");
      setError(
        code.includes("invalid-credential") || code.includes("wrong-password") || code.includes("user-not-found")
          ? "Incorrect email or password."
          : code.includes("too-many-requests")
          ? "Too many attempts — please wait a moment and try again."
          : "Sign-in failed. Please try again."
      );
    }
    setLoading(false);
  }

  return (
    <div className="min-h-[calc(100vh-64px)] grid lg:grid-cols-[1.05fr_0.95fr] overflow-x-hidden">
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
      <div className="flex items-center justify-center p-4 md:p-10 bg-[#F8FAFC]">
        <div className="w-full max-w-[420px] rounded-[24px] bg-white border border-[#E5E7EB] shadow-card p-5 md:p-8">
          <div className="flex rounded-full bg-[#F8FAFC] border border-[#E5E7EB] p-1 text-sm">
            <button type="button" onClick={()=> setRole("citizen")} aria-pressed={role==="citizen"} className={`flex-1 py-1.5 rounded-full font-medium transition ${role==="citizen" ? "bg-[#174EA6] text-white shadow-sm" : "text-[#5F6368] hover:text-[#172033]"}`}>Citizen</button>
            <button type="button" onClick={()=> setRole("government")} aria-pressed={role==="government"} className={`flex-1 py-1.5 rounded-full font-medium transition ${role==="government" ? "bg-[#174EA6] text-white shadow-sm" : "text-[#5F6368] hover:text-[#172033]"}`}>Government</button>
          </div>
          <p className="text-xs text-[#5F6368] text-center mt-2">{role==="citizen" ? "Citizen portal · voice, tracking, impact" : "Government dashboard · KPIs, maps, prioritization"}</p>
          <h1 className="text-2xl font-semibold tracking-tight mt-4">Welcome back</h1>
          <p className="text-sm text-[#78716C] mt-1">Sign in to continue to JANSETU AI</p>

          {error && (
            <div role="alert" aria-live="assertive" className="mt-4 flex items-start gap-2 rounded-2xl border border-[#FADBD8] bg-[#FCE8E6] px-4 py-3 text-sm text-[#C5221F]">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /> {error}
            </div>
          )}
          {notice && !error && (
            <div role="status" aria-live="polite" className="mt-4 flex items-start gap-2 rounded-2xl border border-[#D2E3FC] bg-[#E8F0FE] px-4 py-3 text-sm text-[#174EA6]">
              <Info className="h-4 w-4 mt-0.5 shrink-0" /> {notice}
            </div>
          )}

          <form onSubmit={submit} noValidate className="mt-6 space-y-4">
            <label className="block">
              <span className="text-sm font-medium">Email / Phone</span>
              <input value={email} onChange={e=>setEmail(e.target.value)} inputMode="email" autoComplete="username" placeholder="Enter email or phone" className="mt-1.5 w-full rounded-full border border-[#E7E5E4] bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black" />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Password</span>
              <div className="mt-1.5 relative">
                <input type={show?"text":"password"} value={pass} onChange={e=>setPass(e.target.value)} autoComplete="current-password" placeholder="Enter password" className="w-full rounded-full border border-[#E7E5E4] bg-white px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black" />
                <button type="button" onClick={()=> setShow(v=>!v)} aria-label={show?"Hide password":"Show password"} className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 w-8 grid place-items-center rounded-full hover:bg-[#F5F5F4]">{show?<EyeOff className="h-4 w-4" aria-hidden="true"/>:<Eye className="h-4 w-4" aria-hidden="true"/>}</button>
              </div>
            </label>
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2"><input type="checkbox" className="rounded border-[#E7E5E4]" /> Remember me</label>
              <Link href="/reset-password" className="font-medium underline decoration-[#E7E5E4] underline-offset-4 hover:text-black">Forgot password?</Link>
            </div>
            <Button type="submit" disabled={loading} className="w-full rounded-full h-11">
              {loading ? "Signing in…" : `Sign In as ${role==="citizen" ? "Citizen" : "Government"}`} <ArrowRight className="h-4 w-4 opacity-60" aria-hidden="true" />
            </Button>
            <div className="flex items-center gap-3 text-xs text-[#78716C]"><span className="h-px flex-1 bg-[#E7E5E4]" />OR<span className="h-px flex-1 bg-[#E7E5E4]" /></div>
            <button type="button" onClick={()=> setNotice("Google sign-in is not available in this demo build — use email sign-in.")} className="w-full h-11 rounded-full border border-[#E7E5E4] bg-white text-sm font-medium hover:bg-[#F5F5F4]">Continue with Google</button>
            <div className="text-sm text-center text-[#78716C]">Don&apos;t have an account? <Link href="/register" className="font-medium text-black underline decoration-[#E7E5E4] underline-offset-4">Create account</Link></div>
            <div className="pt-4 border-t border-[#E7E5E4] flex gap-4 text-xs text-[#78716C] justify-center">
              <Link href="/privacy" className="hover:text-black">Privacy Policy</Link><Link href="/terms" className="hover:text-black">Terms</Link><Link href="/accessibility" className="hover:text-black">Accessibility</Link>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#78716C] justify-center"><ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" /> Human-governed · Evidence-led</div>
          </form>
        </div>
      </div>
    </div>
  );
}
