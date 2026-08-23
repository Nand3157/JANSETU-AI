"use client";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

/**
 * Record audio, transcribe via Gemini (with live Web Speech as a preview/fallback),
 * and upload the clip so the request can store an audioUrl.
 */
function getLocaleMap(): Record<string, string> {
  let nav = "en-IN";
  try {
    if (typeof navigator !== "undefined" && navigator.language) {
      const l = navigator.language.toLowerCase();
      if (l.startsWith("gu")) nav = "gu-IN";
      else if (l.startsWith("hi")) nav = "hi-IN";
      else nav = "en-IN";
    }
  } catch {}
  return { gu: "gu-IN", hi: "hi-IN", en: "en-IN", auto: nav };
}

type SRState = "idle" | "recording" | "transcribing";
export type TranscriptMedia = { audioUrl?: string | null; source?: string };

export function VoiceRecorder({
  onTranscript,
  langHint = "auto",
}: {
  onTranscript: (text: string, lang?: string, media?: TranscriptMedia) => void;
  langHint?: string;
}) {
  const [state, setState] = useState<SRState>("idle");
  const [interim, setInterim] = useState("");
  const [note, setNote] = useState<{ kind: "live" | "demo" | "error"; msg: string } | null>(null);
  const recRef = useRef<MediaRecorder | null>(null);
  const srRef = useRef<any>(null);
  const chunks = useRef<Blob[]>([]);
  const finals = useRef<string[]>([]);

  function pickMime() {
    if (typeof MediaRecorder === "undefined") return "";
    for (const t of ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"]) {
      if (MediaRecorder.isTypeSupported(t)) return t;
    }
    return "";
  }

  async function start() {
    setNote(null); setInterim(""); finals.current = [];
    // Secure context check — localhost is secure, but http with IP is not
    if (typeof window !== "undefined" && window.isSecureContext === false) {
      setNote({ kind: "error", msg: "Voice requires HTTPS. Please use localhost or HTTPS, or type your need instead." });
      return;
    }
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setNote({ kind: "error", msg: "Voice not supported in this browser. Please type your need instead." });
      return;
    }
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (e: any) {
      const name = e?.name || "";
      if (name === "NotAllowedError" || name === "PermissionDeniedError") {
        setNote({ kind: "error", msg: "Microphone blocked. Allow mic access in your browser settings, or type your need instead." });
      } else if (name === "NotFoundError") {
        setNote({ kind: "error", msg: "No microphone found. Please type your need instead." });
      } else {
        setNote({ kind: "error", msg: "Cannot access microphone. Please type your need instead." });
      }
      return;
    }

    const LOCALE = getLocaleMap();
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
        if (e.error === "not-allowed") setNote({ kind: "error", msg: "Microphone blocked by the browser." });
        else if (e.error === "no-speech") setNote({ kind: "demo", msg: "No live preview — keep speaking. Your recording will be transcribed server-side when you stop." });
        else if (e.error === "network") setNote({ kind: "demo", msg: "Live preview unavailable — recording continues. We'll transcribe server-side when you stop." });
        else if (e.error === "audio-capture") setNote({ kind: "error", msg: "No microphone found. Please type your need instead." });
        else if (e.error === "aborted") { /* ignore — stop() aborted it */ }
      };
      try { sr.start(); } catch {}
    }

    try {
      const mime = pickMime();
      const rec = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      recRef.current = rec;
      chunks.current = [];
      rec.ondataavailable = e => { if (e.data.size) chunks.current.push(e.data); };
      rec.start();
    } catch {
      stream.getTracks().forEach(t => t.stop());
      setNote({ kind: "error", msg: "This browser cannot record audio. Type your need instead." });
      return;
    }

    setState("recording");
  }

  function collectBlob(rec: MediaRecorder | null): Promise<Blob | null> {
    if (!rec) return Promise.resolve(chunks.current.length ? new Blob(chunks.current) : null);
    if (rec.state === "inactive") {
      return Promise.resolve(chunks.current.length ? new Blob(chunks.current, { type: rec.mimeType || "audio/webm" }) : null);
    }
    return new Promise(resolve => {
      // Capture ondataavailable flush before resolving
      const origOnStop = rec.onstop;
      rec.onstop = () => {
        // Give a tick for final dataavailable to flush
        setTimeout(() => {
          resolve(new Blob(chunks.current, { type: rec.mimeType || "audio/webm" }));
          if (typeof origOnStop === "function") try { (origOnStop as any).call(rec); } catch {}
        }, 30);
      };
      rec.ondataavailable = e => { if (e.data && e.data.size) chunks.current.push(e.data); };
      try {
        // Request final data before stopping (ensures trailing chunk)
        try { rec.requestData(); } catch {}
        rec.stop();
      } catch {
        resolve(chunks.current.length ? new Blob(chunks.current, { type: rec.mimeType || "audio/webm" }) : null);
      }
    });
  }

  function blobToDataUrl(blob: Blob) {
    return new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result));
      r.onerror = () => reject(new Error("read failed"));
      r.readAsDataURL(blob);
    });
  }

  async function stop() {
    setState("transcribing");
    try { srRef.current?.stop(); } catch {}
    const rec = recRef.current;
    const blob = await collectBlob(rec);
    rec?.stream?.getTracks().forEach((t: any) => t.stop());
    recRef.current = null;

    const LOCALE = getLocaleMap();
    const speechText = finals.current.join(" ").replace(/\s+/g, " ").trim();
    const speechLang = Object.entries(LOCALE).find(([, v]) => v === (srRef.current?.lang || ""))?.[0];
    let text = speechText;
    let lang = speechLang === "auto" ? undefined : speechLang;
    let audioUrl: string | null = null;
    let source = speechText ? "browser-speech" : "none";

    // Lower threshold to 100 bytes to capture very short utterances; previously 1500/400 dropped valid clips
    // Always attempt server transcription for any non-empty blob — ensures mock fallback covers live-preview failures
    if (blob && blob.size > 100) {
      try {
        const dataUrl = await blobToDataUrl(blob);
        const tr: any = await api("/api/transcribe", {
          method: "POST",
          body: JSON.stringify({ dataUrl, langHint }),
          headers: { "x-role": "citizen" },
        });
        if (tr?.transcript?.trim()) {
          text = tr.transcript.trim();
          if (tr.language && tr.language !== "und") lang = tr.language;
          source = tr.source === "gemini" ? "gemini" : (speechText ? "browser-speech" : "mock");
        }
        try {
          const up: any = await api("/api/upload", {
            method: "POST",
            body: JSON.stringify({ dataUrl }),
            headers: { "x-role": "citizen" },
          });
          audioUrl = up.audioUrl || up.url || null;
        } catch {}
      } catch {
        // keep browser speech if Gemini is unavailable
      }
    }

    if (text) {
      const msg = source === "gemini"
        ? "Transcribed with Gemini. Review below before submitting."
        : source === "browser-speech"
          ? `Transcribed live (${(srRef.current?.lang || "").toUpperCase() || "browser"}). Review below before submitting.`
          : "Transcription used a fallback. Review carefully before submitting.";
      setNote({ kind: source === "gemini" || source === "browser-speech" ? "live" : "demo", msg });
      onTranscript(text, lang, { audioUrl, source });
    } else {
      setNote({ kind: "error", msg: "We couldn't hear that. Try again, or type your need in the box below." });
    }
    setInterim("");
    setState("idle");
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        {state !== "recording" ? (
          <Button onClick={start} disabled={state === "transcribing"} className="gap-2"><Mic className="h-4 w-4" /> Tap to speak</Button>
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
          <span className="inline-flex items-center gap-1.5 text-xs rounded-full bg-violet-50 text-violet-700 border border-violet-200 px-3 py-1.5"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Transcribing with Gemini…</span>
        )}
      </div>
      {note && (
        <p role={note.kind === "error" ? "alert" : "status"} aria-live="polite" className={
          note.kind === "error" ? "text-xs text-[#C5221F]"
          : note.kind === "demo" ? "text-xs text-[#B06000]"
          : "text-xs text-[#188038]"
        }>{note.msg}</p>
      )}
    </div>
  );
}
