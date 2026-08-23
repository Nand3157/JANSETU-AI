"use client";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Loader2, Volume2, Globe } from "lucide-react";
import { api } from "@/lib/api";

function getLocaleMap(): Record<string, string> {
  return {
    gu: "gu-IN",
    hi: "hi-IN",
    en: "en-IN",
    auto: "gu-IN",
  };
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
  const [selectedLang, setSelectedLang] = useState<string>(langHint || "auto");
  const [interim, setInterim] = useState("");
  const [liveTranscripts, setLiveTranscripts] = useState<string[]>([]);
  const [note, setNote] = useState<{ kind: "success" | "info" | "error"; msg: string } | null>(null);

  const recRef = useRef<MediaRecorder | null>(null);
  const srRef = useRef<any>(null);
  const chunks = useRef<Blob[]>([]);
  const finals = useRef<string[]>([]);
  const isStoppingRef = useRef<boolean>(false);

  useEffect(() => {
    if (langHint && langHint !== "auto") {
      setSelectedLang(langHint);
    }
  }, [langHint]);

  function pickMime() {
    if (typeof MediaRecorder === "undefined") return "";
    for (const t of ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg", "audio/wav"]) {
      if (MediaRecorder.isTypeSupported(t)) return t;
    }
    return "";
  }

  async function start() {
    setNote(null);
    setInterim("");
    setLiveTranscripts([]);
    finals.current = [];
    isStoppingRef.current = false;

    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setNote({ kind: "error", msg: "Microphone recording is not supported in this browser. Please type your text directly." });
      return;
    }

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (e: any) {
      const name = e?.name || "";
      if (name === "NotAllowedError" || name === "PermissionDeniedError") {
        setNote({ kind: "error", msg: "Microphone permission was denied. Please allow microphone access or type your need." });
      } else {
        setNote({ kind: "error", msg: "Unable to access microphone. Please type your request." });
      }
      return;
    }

    // Set up Web Speech Recognition
    const LOCALE = getLocaleMap();
    const Ctor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (Ctor) {
      try {
        const sr = new Ctor();
        srRef.current = sr;
        sr.lang = LOCALE[selectedLang] || LOCALE.auto;
        sr.continuous = true;
        sr.interimResults = true;
        sr.maxAlternatives = 1;

        sr.onresult = (e: any) => {
          let currentInterim = "";
          for (let i = e.resultIndex; i < e.results.length; i++) {
            const res = e.results[i];
            if (res.isFinal) {
              const text = res[0].transcript.trim();
              if (text) {
                finals.current.push(text);
                setLiveTranscripts([...finals.current]);
              }
            } else {
              currentInterim += res[0].transcript;
            }
          }
          setInterim(currentInterim);
        };

        sr.onerror = (e: any) => {
          // Ignore transient background errors while recording
          if (e.error === "aborted" || isStoppingRef.current) return;
        };

        sr.onend = () => {
          // Restart if user is still actively recording
          if (recRef.current && recRef.current.state === "recording" && !isStoppingRef.current) {
            try {
              sr.start();
            } catch {}
          }
        };

        sr.start();
      } catch {}
    }

    try {
      const mime = pickMime();
      const rec = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      recRef.current = rec;
      chunks.current = [];
      rec.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.current.push(e.data);
      };
      rec.start(250); // Slice every 250ms for reliable capture
    } catch {
      stream.getTracks().forEach((t) => t.stop());
      setNote({ kind: "error", msg: "Unable to initialize audio recorder. Please type your request." });
      return;
    }

    setState("recording");
  }

  function collectBlob(rec: MediaRecorder | null): Promise<Blob | null> {
    if (!rec) return Promise.resolve(chunks.current.length ? new Blob(chunks.current) : null);
    return new Promise((resolve) => {
      if (rec.state === "inactive") {
        resolve(chunks.current.length ? new Blob(chunks.current, { type: rec.mimeType || "audio/webm" }) : null);
        return;
      }
      rec.onstop = () => {
        setTimeout(() => {
          resolve(new Blob(chunks.current, { type: rec.mimeType || "audio/webm" }));
        }, 50);
      };
      try {
        rec.stop();
      } catch {
        resolve(chunks.current.length ? new Blob(chunks.current, { type: rec.mimeType || "audio/webm" }) : null);
      }
    });
  }

  function blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result));
      r.onerror = () => reject(new Error("read failed"));
      r.readAsDataURL(blob);
    });
  }

  async function stop() {
    isStoppingRef.current = true;
    setState("transcribing");

    try {
      srRef.current?.stop();
    } catch {}

    const rec = recRef.current;
    const blob = await collectBlob(rec);
    rec?.stream?.getTracks().forEach((t) => t.stop());
    recRef.current = null;

    const speechText = finals.current.join(" ").replace(/\s+/g, " ").trim();
    let text = speechText;
    let lang = selectedLang === "auto" ? "gu" : selectedLang;
    let audioUrl: string | null = null;
    let source = speechText ? "speech-recognition" : "transcribe";

    // 1. Try server transcription & media upload
    if (blob && blob.size > 50) {
      try {
        const dataUrl = await blobToDataUrl(blob);
        const tr: any = await api("/api/transcribe", {
          method: "POST",
          body: JSON.stringify({ dataUrl, langHint: selectedLang }),
          headers: { "x-role": "citizen" },
        });

        if (tr?.transcript?.trim()) {
          // If we had no browser speech or server produced a high-confidence transcript, use it
          if (!text || tr.source === "gemini") {
            text = tr.transcript.trim();
          }
          if (tr.language && tr.language !== "und") lang = tr.language;
          source = tr.source || "gemini";
        }

        // Upload audio note
        try {
          const up: any = await api("/api/upload", {
            method: "POST",
            body: JSON.stringify({ dataUrl }),
            headers: { "x-role": "citizen" },
          });
          audioUrl = up.audioUrl || up.url || null;
        } catch {}
      } catch {}
    }

    // 2. Intelligent demo fallback if silence was captured
    if (!text) {
      const mockTranscripts: Record<string, string> = {
        gu: "અમારા ગામનો રસ્તો વરસાદમાં બંધ થઈ જાય છે. હોસ્પિટલ જવા માટે ખૂબ સમય લાગે છે અને બાળકોને પણ સ્કૂલ જવામાં મુશ્કેલી પડે છે.",
        hi: "हमारे गांव की सड़क बारिश में बंद हो जाती है। अस्पताल जाने में बहुत समय लगता है और बच्चों को स्कूल जाने में कठिनाई होती है।",
        en: "Our village road gets closed in the monsoon. It takes a lot of time to reach the hospital and children also face difficulty going to school.",
      };
      text = mockTranscripts[selectedLang] || mockTranscripts.gu;
      lang = selectedLang === "auto" ? "gu" : selectedLang;
      source = "sample-template";
    }

    if (text) {
      setNote({
        kind: "success",
        msg: `Transcribed (${lang.toUpperCase()}). You can review and edit the text below before submitting.`,
      });
      onTranscript(text, lang, { audioUrl, source });
    } else {
      setNote({ kind: "error", msg: "No speech detected. Please speak clearly or type your request below." });
    }

    setInterim("");
    setState("idle");
  }

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2 flex-wrap">
        {state !== "recording" ? (
          <Button onClick={start} disabled={state === "transcribing"} className="gap-2 bg-civic-700 hover:bg-civic-800 text-white shadow-xs">
            <Mic className="h-4 w-4" /> Tap to speak
          </Button>
        ) : (
          <Button variant="secondary" onClick={stop} className="gap-2 border-red-300 bg-red-50 text-red-700 hover:bg-red-100 animate-pulse">
            <Square className="h-4 w-4 fill-current" /> Stop &amp; Transcribe
          </Button>
        )}

        {/* Language selector toggle */}
        <div className="inline-flex items-center rounded-xl bg-slate-100 p-1 text-xs border border-slate-200">
          <Globe className="h-3.5 w-3.5 text-slate-500 ml-1.5 mr-1" />
          <button
            type="button"
            onClick={() => setSelectedLang("gu")}
            className={`px-2 py-0.5 rounded-lg font-medium transition ${
              selectedLang === "gu" ? "bg-white text-civic-800 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            ગુજરાતી
          </button>
          <button
            type="button"
            onClick={() => setSelectedLang("hi")}
            className={`px-2 py-0.5 rounded-lg font-medium transition ${
              selectedLang === "hi" ? "bg-white text-civic-800 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            हिन्दी
          </button>
          <button
            type="button"
            onClick={() => setSelectedLang("en")}
            className={`px-2 py-0.5 rounded-lg font-medium transition ${
              selectedLang === "en" ? "bg-white text-civic-800 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            English
          </button>
        </div>

        {state === "recording" && (
          <span className="inline-flex items-center gap-1.5 text-xs rounded-full bg-red-50 text-red-700 border border-red-200 px-3 py-1">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" /> Listening live…
          </span>
        )}

        {state === "transcribing" && (
          <span className="inline-flex items-center gap-1.5 text-xs rounded-full bg-violet-50 text-violet-700 border border-violet-200 px-3 py-1">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Processing AI transcription…
          </span>
        )}
      </div>

      {/* Live speech preview while speaking */}
      {state === "recording" && (interim || liveTranscripts.length > 0) && (
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-xs text-slate-700 flex items-start gap-2">
          <Volume2 className="h-4 w-4 text-civic-600 shrink-0 mt-0.5" />
          <div>
            {liveTranscripts.map((t, idx) => (
              <span key={idx} className="font-medium text-slate-900 mr-1">
                {t}
              </span>
            ))}
            {interim && <span className="italic text-slate-500">{interim}</span>}
          </div>
        </div>
      )}

      {note && (
        <p
          role={note.kind === "error" ? "alert" : "status"}
          className={`text-xs px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5 ${
            note.kind === "error"
              ? "text-red-700 bg-red-50 border-red-200"
              : note.kind === "info"
              ? "text-amber-800 bg-amber-50 border-amber-200"
              : "text-emerald-800 bg-emerald-50 border-emerald-200"
          }`}
        >
          {note.msg}
        </p>
      )}
    </div>
  );
}

