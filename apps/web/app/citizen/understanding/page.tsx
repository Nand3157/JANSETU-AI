"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Check } from "lucide-react";
import { loadDraft, saveDraft } from "@/lib/draft";

export default function UnderstandingPage() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const d = loadDraft();
    if (!d.text.trim()) { router.replace("/citizen/voice"); return; }
    setText(d.text);
  }, [router]);

  function confirm() {
    saveDraft({ text });
    router.push("/citizen/location");
  }

  return (
    <div className="min-h-[100vh] bg-[#F8FAFC] p-4 md:p-6">
      <div className="mx-auto max-w-[560px]">
        <h1 className="text-2xl font-semibold tracking-tight text-center">We understood</h1>
        <p className="text-sm text-[#5F6368] text-center">Is this correct? Tap Edit to fix. Nothing is submitted yet.</p>
        <div className="mt-6 rounded-[20px] bg-white border border-[#E5E7EB] p-5 space-y-4">
          <div>
            <div className="text-xs font-semibold text-[#5F6368]">Your words</div>
            {editing ? (
              <textarea value={text} onChange={e=> setText(e.target.value)} rows={4} className="mt-2 w-full rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm" />
            ) : (
              <div className="text-sm font-medium mt-1">“{text}”</div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><div className="text-xs text-[#5F6368]">Next</div><Badge tone="moderate" className="mt-1">Confirm location</Badge></div>
            <div><div className="text-xs text-[#5F6368]">Status</div><Badge tone="ai" className="mt-1">Not submitted</Badge></div>
          </div>
          <div className="flex gap-2 pt-2">
            <Link href="/citizen/voice" className="flex-1"><Button variant="secondary" className="w-full rounded-full gap-1.5"><Edit className="h-4 w-4" /> Re-record</Button></Link>
            <Button className="flex-1 rounded-full gap-1.5" onClick={()=> text.trim() && confirm()}>
              {editing ? <><Check className="h-4 w-4" /> Save & continue</> : <><Check className="h-4 w-4" /> Looks Correct</>}
            </Button>
          </div>
          <button className="text-xs text-[#174EA6] underline" onClick={()=> setEditing(v=> !v)}>{editing ? "Cancel edit" : "Edit text"}</button>
          <div className="text-[11px] text-[#5F6368] text-center">AI-assisted · Human review required · Editable</div>
        </div>
      </div>
    </div>
  );
}
