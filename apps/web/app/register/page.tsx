"use client";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const [loading, setLoading]=useState(false);
  return (
    <div className="min-h-[calc(100vh-64px)] grid place-items-center bg-[#FFFBF7] p-6">
      <div className="w-full max-w-[640px] rounded-[24px] bg-white border border-[#E7E5E4] shadow-card p-6 md:p-8">
        <h1 className="text-2xl font-semibold tracking-tight">Create your JANSETU account</h1>
        <p className="text-sm text-[#78716C] mt-1">Join your community in shaping public action.</p>
        <div className="mt-6 grid md:grid-cols-2 gap-4">
          {[
            ["Full Name","Enter your name"],
            ["Mobile Number","Enter mobile"],
            ["Email","Enter email"],
            ["Preferred Language","EN / HI / GU"],
            ["City / District","Vadodara, Gujarat"],
            ["Password","Create password"],
          ].map(([label,ph])=> (
            <label key={label} className="block">
              <span className="text-sm font-medium">{label}</span>
              <input placeholder={ph} type={label.includes("Password")?"password":"text"} className="mt-1.5 w-full rounded-full border border-[#E7E5E4] bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black" />
            </label>
          ))}
          <label className="block">
            <span className="text-sm font-medium">Confirm Password</span>
            <input placeholder="Confirm password" type="password" className="mt-1.5 w-full rounded-full border border-[#E7E5E4] bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black" />
          </label>
        </div>
        <label className="mt-4 flex items-center gap-2 text-sm"><input type="checkbox" className="rounded border-[#E7E5E4]" /> I agree to the <Link href="#" className="underline decoration-[#E7E5E4] underline-offset-4">Privacy Policy</Link></label>
        <Button onClick={()=> { setLoading(true); setTimeout(()=> { setLoading(false); location.href="/citizen"; }, 800); }} disabled={loading} className="mt-6 w-full rounded-full">{loading?"Creating…":"Create Account"} <ArrowRight className="h-4 w-4" /></Button>
        <div className="text-sm text-center text-[#78716C] mt-4">Already have an account? <Link href="/login" className="font-medium text-black underline">Sign in</Link></div>
      </div>
    </div>
  );
}
