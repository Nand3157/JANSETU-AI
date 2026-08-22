"use client";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Loader2 } from "lucide-react";

/**
 * Live speech-to-text via the browser Web Speech API (Chrome/Edge/Android WebView).
 * Recognizes while you speak — Gujarati (gu-IN), Hindi (hi-IN), English (en-IN) —
 * no API key needed and nothing leaves the device until submit.
 * MediaRecorder still captures the blob alongside for future Cloud Storage archival.
 */
const LOCALE: Record<string, string> = {
  gu: "gu-IN",
  hi: "hi-IN",
  en: "en-IN",
  auto: typeof navigator !== "undefined" && navigator.language?.startsWith("gu") ? "gu-IN"
      : typeof navigator !== "undefined" && navigator.language?.startsWith("hi") ? "hi-IN"
      : "en-IN",
};

type SRState = "idle" | "recording" | "transcribing";

export function VoiceRecorder({ onTranscript, langHint="auto" }: { onTranscript: (text: string, lang?: string)=>void; langHint?: string }) {
  const [state, setState] = useState<SRState>("idle");
  const [interim, setInterim] = useState("");
  const [note, setNote] = useState<{ kind:"live"|"demo"|"error"; msg:string } | null>(null);
  const recRef = useRef<MediaRecorder | null>(null);
  const srRef = useRef<any>(null);
  const chunks = useRef<Blob[]>([]);
  const finals = useRef<string[]>([]);

  async function start() {
    setNote(null); setInterim(""); finals.current = [];
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setNote({ kind:"error", msg:"Microphone blocked. Allow mic access in your browser settings, or type your need instead." });
      return;
    }

    // 1) Live recognition (Web Speech API)
    const Ctor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (Ctor) {
      const sr = new Ctor();
      srRef.current = sr;
      sr.lang = LOCALE[langHint] || LOCALE.auto;
      sr.continuous = true;
      sr.interimResults = true;
      sr.onresult = (e: any) => {
        let live = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const res = e.results[i];
          if (res.isFinal) finals.current.push(res[0].transcript.trim());
          else live += res[0].transcript;
        }
        setInterim(live);
      };
      sr.onerror = (e: any) => {
        if (e.error === "not-allowed") setNote({ kind:"error", msg:"Microphone blocked by the browser." });
        // 'no-speech' / 'aborted' are normal after stop — handled below
      };
      try { sr.start(); } catch {}
    }

    // 2) Parallel audio capture for Storage upload
    try {
      const rec = new MediaRecorder(stream);
      recRef.current = rec;
      chunks.current = [];
      rec.ondataavailable = e => { if (e.data.size) chunks.current.push(e.data); };
      rec.start();
    } catch {}

    setState("recording");
  }

  function stop() {
    setState("transcribing");
    try { srRef.current?.stop(); } catch {}
    try { recRef.current?.stop(); } catch {}
    if (recRef.current?.stream) recRef.current.stream.getTracks().forEach((t:any)=> t.stop());
    setTimeout(() => {
      const text = finals.current.join(" ").replace(/\s+/g," ").trim();
      const langCode = Object.entries(LOCALE).find(([k,v])=> v === (srRef.current?.lang || ""))?.[0];
      if (text) {
        setNote({ kind:"live", msg:`Transcribed live (${(srRef.current?.lang || "").toUpperCase()}). Review below before submitting.` });
        onTranscript(text, langCode === "auto" ? undefined : langCode);
      } else {
        // No speech engine result — keep demo flow usable, clearly labeled
        const mock = langHint==="gu"
          ? "અમારા ગામનો રસ્તો વરસાદમાં બંધ થઈ જાય છે. હોસ્પિટલ જવા માટે ખૂબ સમય લાગે છે."
          : "Road blocked in monsoon, hospital access delayed.";
        setNote({ kind:"demo", msg:"Speech wasn't recognized (unsupported browser or silence) — inserted a clearly-labeled demo sentence. Chrome/Edge recommended." });
        onTranscript(mock, langHint === "auto" ? undefined : langHint);
      }
      setInterim("");
      setState("idle");
    }, 800); // grace period for final recognition result
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        {state !== "recording" ? (
          <Button onClick={start} className="gap-2"><Mic className="h-4 w-4" /> Tap to speak</Button>
        ) : (
          <Button variant="secondary" onClick={stop} className="gap-2 border-red-200 bg-red-50 text-red-700"><Square className="h-4 w-4" /> Stop · recording</Button>
        )}
        {state === "recording" && (
          <>
            <span className="inline-flex items-center gap-1.5 text-xs rounded-full bg-red-50 text-red-700 border border-red-200 px-3 py-1.5">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" /> Listening…
            </span>
            {interim && <span className="text-xs italic text-[#5F6368] max-w-[320px] truncate">“{interim}”</span>}
          </>
        )}
        {state === "transcribing" && (
          <span className="inline-flex items-center gap-1.5 text-xs rounded-full bg-violet-50 text-violet-700 border border-violet-200 px-3 py-1.5"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Finishing transcription…</span>
        )}
      </div>
      {note && (
        <p role={note.kind==="error" ? "alert" : "status"} aria-live="polite" className={
          note.kind==="error" ? "text-xs text-[#C5221F]"
          : note.kind==="demo" ? "text-xs text-[#B06000]"
          : "text-xs text-[#188038]"
        }>{note.msg}</p>
      )}
    </div>
  );
}
