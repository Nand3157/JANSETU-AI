"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { VoiceRecorder } from "@/components/civic/VoiceRecorder";
import { saveDraft } from "@/lib/draft";
import { getCurrentUser, signInAnonymouslyMock } from "@/lib/firebase";

export default function VoicePage() {
  const router = useRouter();
  const [lang, setLang] = useState("auto");
  const [text, setText] = useState("");

  async function onTranscript(t: string, l?: string, media?: { audioUrl?: string | null }) {
    const nextLang = l || lang;
    setText(t);
    if (l) setLang(l);
    if (!getCurrentUser()) await signInAnonymouslyMock();
    saveDraft({ text: t, lang: nextLang, audioUrl: media?.audioUrl || null });
    router.push("/citizen/understanding");
  }

  return (
    <div className="min-h-[100vh] bg-[#F8FAFC] flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Tell us what your community needs.</h1>
        <p className="text-sm text-[#5F6368] mt-2 max-w-[420px]">Speak in Gujarati, Hindi, or English. Gemini transcribes and preserves your meaning — you confirm before anything is submitted.</p>
        <div className="mt-8 w-full max-w-[520px] rounded-[20px] bg-white border border-[#E5E7EB] p-5 text-left">
          <label className="block mb-4">
            <span className="sr-only">Speech language</span>
            <select value={lang} onChange={e=> setLang(e.target.value)} aria-label="Speech language" name="speechLanguage" autoComplete="language" className="rounded-xl border border-slate-200 bg-white text-[#172033] px-3 py-2.5 text-[16px] md:text-sm min-h-11 w-full">
              <option value="auto">Auto-detect</option><option value="gu">ગુજરાતી</option><option value="hi">हिन्दी</option><option value="en">English</option>
            </select>
          </label>
          <VoiceRecorder langHint={lang} onTranscript={onTranscript} />
          {text && <p className="mt-4 text-sm leading-relaxed text-[#172033]">“{text}”</p>}
        </div>
        <button type="button" onClick={()=> router.push("/citizen/submit")} className="mt-6 text-xs text-[#5F6368] underline min-h-11 px-4 inline-flex items-center justify-center touch-manipulation">Prefer to type instead</button>
      </div>
    </div>
  );
}
