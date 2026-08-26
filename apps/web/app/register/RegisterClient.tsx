"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { z } from "zod";
import { setMockRole, registerPortal, signInWithGoogle, isFirebaseConfigured } from "@/lib/firebase";

const schema = z.object({
  name: z.string().trim().min(2, "Enter your full name"),
  mobile: z.string().trim().transform(v => v.replace(/[\s-]/g, "")).pipe(z.string().regex(/^(\+91)?[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number")),
  email: z.string().trim().email("Enter a valid email address"),
  language: z.enum(["English", "हिन्दी", "ગુજરાતી"]),
  city: z.string().trim().min(2, "Enter your city or district"),
  password: z.string().min(8, "At least 8 characters").regex(/[A-Za-z]/, "Include at least one letter").regex(/\d/, "Include at least one number"),
  confirm: z.string(),
}).refine(d=> d.password === d.confirm, { path: ["confirm"], message: "Passwords do not match" });

type Fields = z.infer<typeof schema>;

const initial: Fields = { name:"", mobile:"", email:"", language:"English", city:"Vadodara, Gujarat", password:"", confirm:"" };

export default function RegisterClient() {
  const router = useRouter();
  const [f, setF] = useState<Fields>(initial);
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const set = (k: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setF(v=> ({ ...v, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    if (!consent) { setFormError("Please agree to the Privacy Policy to continue."); return; }
    const parsed = schema.safeParse(f);
    if (!parsed.success) {
      const map: Record<string,string> = {};
      for (const issue of parsed.error.issues) { const k = String(issue.path[0]); if (!map[k]) map[k] = issue.message; }
      setErrors(map);
      setFormError("Please fix the highlighted fields and try again.");
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      if (isFirebaseConfigured()) {
        await registerPortal({ name: f.name.trim(), email: f.email.trim(), mobile: f.mobile.trim(), language: f.language, city: f.city.trim(), password: f.password });
        setSuccess(true);
        setTimeout(()=> router.push("/citizen"), 1200);
      } else {
        setMockRole("citizen");
        setSuccess(true);
        setTimeout(()=> router.push("/citizen"), 900);
      }
    } catch (err: any) {
      const code = String(err?.code || "");
      setFormError(
        code.includes("email-already-in-use") ? "An account with this email already exists — try signing in."
        : code.includes("weak-password") ? "That password is too weak — use at least 8 characters with a letter and a number."
        : code.includes("invalid-email") ? "Enter a valid email address."
        : "Could not create your account right now. Please try again."
      );
      setLoading(false);
    }
  }

  const err = (k: keyof Fields) => errors[k];
  const inputCls = (k: keyof Fields) =>
    `mt-1.5 w-full rounded-full border bg-white text-[#172033] px-4 py-3 text-[16px] md:text-sm min-h-11 focus:outline-none focus:ring-2 focus:ring-[#174EA6]/15 ${err(k) ? "border-[#D93025] focus:border-[#D93025]" : "border-[#E5E7EB] focus:border-[#174EA6]"}`;

  return (
    <div className="min-h-[calc(100vh-64px)] grid place-items-center bg-[#F8FAFC] p-4 md:p-6 overflow-x-hidden">
      <div className="w-full max-w-[640px] rounded-[24px] bg-white border border-[#E5E7EB] shadow-card p-5 md:p-8">
        <h1 className="text-2xl font-semibold tracking-tight">Create your JANSETU account</h1>
        <p className="text-sm text-[#5F6368] mt-1">Join your community in shaping public action.</p>

        {success && (
          <div role="status" aria-live="polite" className="mt-4 flex items-start gap-2 rounded-2xl border border-[#CEE6D0] bg-[#E6F4EA] px-4 py-3 text-sm text-[#188038]">
            <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" aria-hidden="true" /> Account created! Taking you to your portal…
          </div>
        )}
        {formError && !success && (
          <div role="alert" aria-live="assertive" className="mt-4 flex items-start gap-2 rounded-2xl border border-[#FADBD8] bg-[#FCE8E6] px-4 py-3 text-sm text-[#C5221F]">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" aria-hidden="true" /> {formError}
          </div>
        )}

        <form onSubmit={submit} noValidate className="mt-6 grid md:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium">Full Name</span>
            <input value={f.name} onChange={set("name")} name="name" autoComplete="name" spellCheck={false} placeholder="Enter your full name…" className={inputCls("name")} aria-invalid={!!err("name")} aria-describedby={err("name") ? "err-name" : undefined} />
            {err("name") && <span id="err-name" className="mt-1 block text-xs text-[#C5221F]" role="alert">{err("name")}</span>}
          </label>
          <label className="block">
            <span className="text-sm font-medium">Mobile Number</span>
            <input value={f.mobile} onChange={set("mobile")} name="mobile" inputMode="tel" autoComplete="tel" spellCheck={false} placeholder="98XXXXXXXX…" className={inputCls("mobile")} aria-invalid={!!err("mobile")} aria-describedby={err("mobile") ? "err-mobile" : undefined} />
            {err("mobile") && <span id="err-mobile" className="mt-1 block text-xs text-[#C5221F]" role="alert">{err("mobile")}</span>}
          </label>
          <label className="block">
            <span className="text-sm font-medium">Email</span>
            <input value={f.email} onChange={set("email")} name="email" type="email" inputMode="email" autoComplete="email" spellCheck={false} placeholder="you@example.com…" className={inputCls("email")} aria-invalid={!!err("email")} aria-describedby={err("email") ? "err-email" : undefined} />
            {err("email") && <span id="err-email" className="mt-1 block text-xs text-[#C5221F]" role="alert">{err("email")}</span>}
          </label>
          <label className="block">
            <span className="text-sm font-medium">Preferred Language</span>
            <select value={f.language} onChange={set("language")} name="language" autoComplete="language" className={`${inputCls("language")} appearance-none min-h-11`}>
              <option>English</option><option>हिन्दी</option><option>ગુજરાતી</option>
            </select>
          </label>
          <label className="block md:col-span-1">
            <span className="text-sm font-medium">City / District</span>
            <input value={f.city} onChange={set("city")} name="city" autoComplete="address-level2" spellCheck={false} placeholder="Vadodara, Gujarat…" className={inputCls("city")} aria-invalid={!!err("city")} aria-describedby={err("city") ? "err-city" : undefined} />
            {err("city") && <span id="err-city" className="mt-1 block text-xs text-[#C5221F]" role="alert">{err("city")}</span>}
          </label>
          <label className="block">
            <span className="text-sm font-medium">Password</span>
            <input value={f.password} onChange={set("password")} name="newPassword" type="password" autoComplete="new-password" spellCheck={false} placeholder="Min 8 chars · letter + number…" className={inputCls("password")} aria-invalid={!!err("password")} aria-describedby={err("password") ? "err-password" : undefined} />
            {err("password") && <span id="err-password" className="mt-1 block text-xs text-[#C5221F]" role="alert">{err("password")}</span>}
          </label>
          <label className="block">
            <span className="text-sm font-medium">Confirm Password</span>
            <input value={f.confirm} onChange={set("confirm")} name="confirmPassword" type="password" autoComplete="new-password" spellCheck={false} placeholder="Re-enter password…" className={inputCls("confirm")} aria-invalid={!!err("confirm")} aria-describedby={err("confirm") ? "err-confirm" : undefined} />
            {err("confirm") && <span id="err-confirm" className="mt-1 block text-xs text-[#C5221F]" role="alert">{err("confirm")}</span>}
          </label>
          <label className="md:col-span-2 flex items-start gap-2 text-sm min-h-11 py-1 cursor-pointer">
            <input checked={consent} onChange={e=> setConsent(e.target.checked)} type="checkbox" name="consent" className="mt-0.5 rounded border-[#E5E7EB] h-5 w-5 accent-[#174EA6] shrink-0" />
            <span>I agree to the <Link href="/privacy" className="underline decoration-[#E5E7EB] underline-offset-4 hover:text-[#172033]">Privacy Policy</Link> and <Link href="/terms" className="underline decoration-[#E5E7EB] underline-offset-4 hover:text-[#172033]">Terms of Use</Link></span>
          </label>
          <Button type="submit" disabled={loading || success} aria-busy={loading} className="md:col-span-2 w-full rounded-full h-11 gap-2">
            <span>{loading ? "Creating account…" : success ? "Account Created" : "Create Account"}</span>{loading ? <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" /> : !success ? <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" /> : null}
          </Button>
          <div className="md:col-span-2 flex items-center gap-3 text-xs text-[#5F6368]"><span className="h-px flex-1 bg-[#E5E7EB]" />OR<span className="h-px flex-1 bg-[#E5E7EB]" /></div>
          <button
            type="button"
            disabled={googleLoading || loading || success}
            onClick={async () => {
              setFormError("");
              if (!isFirebaseConfigured()) {
                setMockRole("citizen");
                setSuccess(true);
                setTimeout(()=> router.push("/citizen"), 600);
                return;
              }
              setGoogleLoading(true);
              try {
                const res = await signInWithGoogle();
                setSuccess(true);
                setTimeout(()=> router.push(res.role === "citizen" ? "/citizen" : "/government"), 600);
              } catch (err: any) {
                const code = String(err?.code || "");
                if (code.includes("redirecting")) { setFormError("Redirecting to Google…"); return; }
                if (code.includes("operation-not-allowed")) setFormError("Google sign-in not enabled in Firebase Console → Authentication → Sign-in method → Google → Enable.");
                else if (code.includes("popup-closed") || code.includes("cancelled")) setFormError("Google sign-in was cancelled.");
                else if (code.includes("popup-blocked")) setFormError("Popup blocked — allow popups and try again.");
                else if (code.includes("unauthorized-domain")) setFormError("Domain not authorized for Google sign-in. Add it in Firebase Console → Auth → Settings → Authorized domains.");
                else setFormError(err?.message ? `Google sign-in failed: ${err.message}` : "Google sign-in failed. Try email instead.");
              } finally { setGoogleLoading(false); }
            }}
            className="md:col-span-2 w-full h-11 rounded-full border border-[#E5E7EB] bg-white text-sm font-medium hover:bg-[#F8FAFC] disabled:opacity-60 flex items-center justify-center gap-2"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            {googleLoading ? "Signing in with Google…" : "Continue with Google"}
          </button>
        </form>
        <div className="text-sm text-center text-[#5F6368] mt-4">Already have an account? <Link href="/login" className="font-medium text-[#172033] underline">Sign in</Link></div>
      </div>
    </div>
  );
}
