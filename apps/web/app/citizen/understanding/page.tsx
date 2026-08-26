"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Check, Languages, MapPin } from "lucide-react";
import { loadDraft, saveDraft } from "@/lib/draft";

export default function UnderstandingPage() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [lang, setLang] = useState("auto");
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const d = loadDraft();
    if (!d.text.trim()) { router.replace("/citizen/voice"); return; }
    setText(d.text);
    setLang(d.lang || "auto");
  }, [router]);

  function confirm() {
    if (!text.trim()) return;
    saveDraft({ text, lang });
    router.push("/citizen/location");
  }

  const detectedLang = lang === "auto" ? "auto-detect" : lang === "gu" ? "ગુજરાતી" : lang === "hi" ? "हिन्दी" : "English";
  const categoryHint = (()=> {
    const s = text.toLowerCase();
    if (/રસ્તો|road|सड़क|monsoon|વરસાદ/i.test(s)) return "roads · rural_road_access";
    if (/પાણી|पानी|water/i.test(s)) return "water · supply";
    if (/વીજળી|बिजली|electric/i.test(s)) return "electricity";
    return "other · will be classified by AI";
  })();

  return (
    <div className="min-h-[100vh] bg-[#F8FAFC] p-4 md:p-6">
      <div className="mx-auto max-w-[560px]">
        <h1 className="text-2xl font-semibold tracking-tight text-center">We understood</h1>
        <p className="text-sm text-[#5F6368] text-center">Is this correct? Tap Edit to fix. Nothing is submitted yet — you confirm location next.</p>
        <div className="mt-6 rounded-[20px] bg-white border border-[#E5E7EB] p-5 space-y-4">
          <div>
            <div className="text-xs font-semibold text-[#5F6368] flex items-center gap-1.5"><Languages className="h-3.5 w-3.5" /> Your words · {detectedLang}</div>
            {editing ? (
              <textarea value={text} onChange={e=> setText(e.target.value)} rows={4} autoFocus placeholder="Describe the issue…" className="mt-2 w-full rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-[16px] md:text-sm" />
            ) : (
              <div className="text-sm font-medium mt-1 leading-relaxed">“{text}”</div>
            )}
            <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
              <Badge tone="moderate">{categoryHint}</Badge>
              <Badge tone="ai">AI will translate & preserve meaning</Badge>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] p-3"><div className="text-xs text-[#5F6368] flex items-center gap-1"><MapPin className="h-3 w-3" /> Next</div><Badge tone="moderate" className="mt-1">Confirm location</Badge></div>
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-3"><div className="text-xs text-amber-900 font-medium">Status</div><div className="text-xs text-amber-800 mt-1">Not submitted — draft only</div></div>
          </div>
          <div className="flex gap-2 pt-2">
            <Link href="/citizen/voice" className="flex-1"><Button variant="secondary" className="w-full rounded-full gap-1.5 min-h-11"><Edit className="h-4 w-4" aria-hidden="true" /> Re-record</Button></Link>
            <Button className="flex-1 rounded-full gap-1.5 min-h-11" disabled={!text.trim()} onClick={()=> text.trim() && confirm()}>
              {editing ? <><Check className="h-4 w-4" aria-hidden="true" /> Save & continue</> : <><Check className="h-4 w-4" aria-hidden="true" /> Looks Correct</>}
            </Button>
          </div>
          <button type="button" className="text-xs text-[#174EA6] underline min-h-11 px-2" onClick={()=> setEditing(v=> !v)}>{editing ? "Cancel edit" : "Edit text"}</button>
          <div className="text-[11px] text-[#5F6368] text-center">AI-assisted · Human review required · Editable · <span className="font-medium">Location next → submit</span></div>
        </div>
      </div>
    </div>
  );
}
