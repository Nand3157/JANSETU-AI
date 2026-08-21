"use client";
import { User, MapPin, Languages, ShieldCheck, LogOut } from "lucide-react";
import { getCurrentUser, signOutMock } from "@/lib/firebase";
import { useState } from "react";

export default function ProfilePage() {
  const user = getCurrentUser();
  const [lang, setLang] = useState("EN");
  return (
    <div className="p-4 md:p-6 space-y-4 max-w-[640px] mx-auto">
      <h1 className="text-xl font-semibold tracking-tight">Profile</h1>
      <div className="rounded-[20px] bg-white border border-[#E5E7EB] p-5 flex items-center gap-4">
        <span className="h-14 w-14 rounded-full bg-[#174EA6] text-white grid place-items-center text-lg font-semibold">{user?.displayName?.[0] || "D"}</span>
        <div>
          <div className="font-semibold">{user?.displayName || "Demo Citizen"}</div>
          <div className="text-xs text-[#5F6368]">{user?.uid} · {user?.role}</div>
          <div className="text-xs text-[#5F6368] flex items-center gap-1"><MapPin className="h-3 w-3" /> Vadodara, Gujarat</div>
        </div>
        <button onClick={()=> signOutMock().then(()=> location.href="/")} className="ml-auto h-9 px-3 rounded-full border border-[#E5E7EB] text-sm flex items-center gap-1.5"><LogOut className="h-3.5 w-3.5" /> Sign out</button>
      </div>
      <div className="rounded-[20px] bg-white border border-[#E5E7EB] p-5 space-y-4">
        <label className="block">
          <span className="text-sm font-medium flex items-center gap-1.5"><Languages className="h-4 w-4" /> Preferred Language</span>
          <select value={lang} onChange={e=> setLang(e.target.value)} className="mt-1.5 w-full rounded-full border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm">
            <option>EN</option><option>HI</option><option>GU</option>
          </select>
          <span className="text-xs text-[#5F6368]">We preserve meaning across languages, never change intent.</span>
        </label>
        <label className="block">
          <span className="text-sm font-medium flex items-center gap-1.5"><User className="h-4 w-4" /> Display Name</span>
          <input defaultValue={user?.displayName} placeholder="Your name" className="mt-1.5 w-full rounded-full border border-[#E5E7EB] px-4 py-2.5 text-sm" />
        </label>
        <div className="rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] p-3 flex gap-2 text-xs text-[#5F6368]">
          <ShieldCheck className="h-4 w-4 text-[#188038] shrink-0" /> Privacy-preserving · No religion/caste/politics used for prioritization · Location minimized
        </div>
      </div>
    </div>
  );
}
