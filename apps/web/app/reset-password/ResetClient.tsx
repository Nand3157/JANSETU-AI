"use client";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Mail, AlertCircle } from "lucide-react";

export default function ResetClient() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError("Enter a valid email address."); return; }
    setSent(true);
  }

  return (
    <div className="min-h-[calc(100vh-64px)] grid place-items-center bg-[#FFFBF7] p-4 md:p-6 overflow-x-hidden">
      <div className="w-full max-w-[440px] rounded-[24px] bg-white border border-[#E7E5E4] shadow-card p-5 md:p-8">
        <h1 className="text-2xl font-semibold tracking-tight">Reset your password</h1>
        <p className="text-sm text-[#78716C] mt-1">Enter the email on your account and we&apos;ll send a reset link.</p>

        {sent ? (
          <div role="status" aria-live="polite" className="mt-6 space-y-4">
            <div className="flex items-start gap-2 rounded-2xl border border-[#CEE6D0] bg-[#E6F4EA] px-4 py-3 text-sm text-[#188038]">
              <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" aria-hidden="true" /> If that email is registered, a reset link is on its way.
            </div>
            <p className="text-xs text-[#78716C]">Didn&apos;t get it? Contact <a href="mailto:support@jansetu.ai" className="text-[#174EA6] underline underline-offset-2 break-all">support@jansetu.ai</a></p>
            <Link href="/login" className="block"><Button variant="secondary" className="w-full rounded-full h-11">Back to Log In</Button></Link>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="mt-6 space-y-4">
            {error && (
              <div role="alert" aria-live="assertive" className="flex items-start gap-2 rounded-2xl border border-[#FADBD8] bg-[#FCE8E6] px-4 py-3 text-sm text-[#C5221F]">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" aria-hidden="true" /> {error}
              </div>
            )}
            <label className="block">
              <span className="text-sm font-medium">Email</span>
              <input value={email} onChange={e=> setEmail(e.target.value)} type="email" inputMode="email" autoComplete="email" placeholder="you@example.com" className="mt-1.5 w-full rounded-full border border-[#E7E5E4] bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black" />
            </label>
            <Button type="submit" className="w-full rounded-full h-11"><Mail className="h-4 w-4" aria-hidden="true" /> Send reset link</Button>
            <div className="text-sm text-center text-[#78716C]"><Link href="/login" className="font-medium underline decoration-[#E7E5E4] underline-offset-4 hover:text-black">Back to log in</Link></div>
          </form>
        )}
      </div>
    </div>
  );
}
