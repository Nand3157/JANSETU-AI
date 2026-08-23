"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { z } from "zod";
import { setMockRole, registerPortal, isFirebaseConfigured } from "@/lib/firebase";

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
    `mt-1.5 w-full rounded-full border bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 ${err(k) ? "border-[#D93025] focus:border-[#D93025]" : "border-[#E7E5E4] focus:border-black"}`;

  return (
    <div className="min-h-[calc(100vh-64px)] grid place-items-center bg-[#FFFBF7] p-4 md:p-6 overflow-x-hidden">
      <div className="w-full max-w-[640px] rounded-[24px] bg-white border border-[#E7E5E4] shadow-card p-5 md:p-8">
        <h1 className="text-2xl font-semibold tracking-tight">Create your JANSETU account</h1>
        <p className="text-sm text-[#78716C] mt-1">Join your community in shaping public action.</p>

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
            <input value={f.name} onChange={set("name")} autoComplete="name" placeholder="Enter your name" className={inputCls("name")} />
            {err("name") && <span className="mt-1 block text-xs text-[#C5221F]">{err("name")}</span>}
          </label>
          <label className="block">
            <span className="text-sm font-medium">Mobile Number</span>
            <input value={f.mobile} onChange={set("mobile")} inputMode="tel" autoComplete="tel" placeholder="98XXXXXXXX" className={inputCls("mobile")} />
            {err("mobile") && <span className="mt-1 block text-xs text-[#C5221F]">{err("mobile")}</span>}
          </label>
          <label className="block">
            <span className="text-sm font-medium">Email</span>
            <input value={f.email} onChange={set("email")} type="email" inputMode="email" autoComplete="email" placeholder="you@example.com" className={inputCls("email")} />
            {err("email") && <span className="mt-1 block text-xs text-[#C5221F]">{err("email")}</span>}
          </label>
          <label className="block">
            <span className="text-sm font-medium">Preferred Language</span>
            <select value={f.language} onChange={set("language")} className={`${inputCls("language")} appearance-none`}>
              <option>English</option><option>हिन्दी</option><option>ગુજરાતી</option>
            </select>
          </label>
          <label className="block md:col-span-1">
            <span className="text-sm font-medium">City / District</span>
            <input value={f.city} onChange={set("city")} autoComplete="address-level2" placeholder="Vadodara, Gujarat" className={inputCls("city")} />
            {err("city") && <span className="mt-1 block text-xs text-[#C5221F]">{err("city")}</span>}
          </label>
          <label className="block">
            <span className="text-sm font-medium">Password</span>
            <input value={f.password} onChange={set("password")} type="password" autoComplete="new-password" placeholder="Min 8 chars · letter + number" className={inputCls("password")} />
            {err("password") && <span className="mt-1 block text-xs text-[#C5221F]">{err("password")}</span>}
          </label>
          <label className="block">
            <span className="text-sm font-medium">Confirm Password</span>
            <input value={f.confirm} onChange={set("confirm")} type="password" autoComplete="new-password" placeholder="Re-enter password" className={inputCls("confirm")} />
            {err("confirm") && <span className="mt-1 block text-xs text-[#C5221F]">{err("confirm")}</span>}
          </label>
          <label className="md:col-span-2 flex items-start gap-2 text-sm">
            <input checked={consent} onChange={e=> setConsent(e.target.checked)} type="checkbox" className="mt-0.5 rounded border-[#E7E5E4]" />
            <span>I agree to the <Link href="/privacy" className="underline decoration-[#E7E5E4] underline-offset-4 hover:text-black">Privacy Policy</Link> and <Link href="/terms" className="underline decoration-[#E7E5E4] underline-offset-4 hover:text-black">Terms of Use</Link></span>
          </label>
          <Button type="submit" disabled={loading || success} className="md:col-span-2 w-full rounded-full h-11">
            {loading ? "Creating…" : success ? "Account Created" : "Create Account"} {!success && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
          </Button>
        </form>
        <div className="text-sm text-center text-[#78716C] mt-4">Already have an account? <Link href="/login" className="font-medium text-black underline">Sign in</Link></div>
      </div>
    </div>
  );
}
