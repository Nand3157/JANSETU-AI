"use client";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Loader2, Volume2, Globe } from "lucide-react";
import { api } from "@/lib/api";
import { prefersReducedMotion } from "@/lib/motion";
import { LANG_BCP47, LANG_NAME, langName } from "@/lib/languages";

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
  onLangChange,
}: {
  onTranscript: (text: string, lang?: string, media?: TranscriptMedia) => void;
  langHint?: string;
  /**
   * The citizen picked a language. The parent owns the written text, so it — not
   * this recorder — decides whether that text should be rendered in the newly
   * chosen language.
   */
  onLangChange?: (lang: string) => void;
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
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number>(0);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      try {
        audioCtxRef.current?.close();
      } catch {}
    };
  }, []);

  /** Recording clock — real elapsed time, not a progress guess. */
  useEffect(() => {
    if (state !== "recording") return;
    setSeconds(0);
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [state]);

  const clock = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

  // The meter needs the canvas, and the canvas only exists once recording has
  // started — so the meter attaches on state change, not inside start().
  useEffect(() => {
    if (state !== "recording" || !streamRef.current) return;
    startMeter(streamRef.current);
    return () => teardownMeter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  useEffect(() => {
    if (langHint && langHint !== "auto") {
      setSelectedLang(langHint);
    }
  }, [langHint]);

  /* ── Live input meter ─────────────────────────────────────────────────────
     A citizen speaking into a phone needs proof the microphone is actually
     hearing them. This is the real signal — an AnalyserNode on the same
     MediaStream MediaRecorder is capturing — drawn straight to canvas on rAF
     so no React render happens per frame. Under reduced motion the bars only
     rise with actual level instead of idling. */
  function startMeter(stream: MediaStream) {
    const canvas = canvasRef.current;
    const AC: any = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!canvas || !AC) return;
    try {
      const ctx: AudioContext = new AC();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.72;
      ctx.createMediaStreamSource(stream).connect(analyser);
      void ctx.resume?.();
      audioCtxRef.current = ctx;
      analyserRef.current = analyser;
      drawMeter();
    } catch {
      analyserRef.current = null;
    }
  }

  function drawMeter() {
    const analyser = analyserRef.current;
    const canvas = canvasRef.current;
    const c2d = canvas?.getContext("2d");
    if (!analyser || !canvas || !c2d) return;
    const reduced = prefersReducedMotion();
    const data = new Uint8Array(analyser.frequencyBinCount);
    const BARS = 40;
    const step = Math.max(1, Math.floor(data.length / BARS));
    let dpr = 0;

    const paint = () => {
      const w = canvas.clientWidth || 320;
      const h = canvas.clientHeight || 56;
      const nextDpr = Math.min(window.devicePixelRatio || 1, 2);
      if (dpr !== nextDpr || canvas.width !== Math.round(w * nextDpr) || canvas.height !== Math.round(h * nextDpr)) {
        dpr = nextDpr;
        canvas.width = Math.round(w * nextDpr);
        canvas.height = Math.round(h * nextDpr);
      }
      c2d.setTransform(dpr, 0, 0, dpr, 0, 0);
      analyser.getByteFrequencyData(data);
      c2d.clearRect(0, 0, w, h);
      const gap = 2;
      const bw = Math.max(2, (w - gap * (BARS - 1)) / BARS);
      const mid = h / 2;
      const radius = Math.min(bw / 2, 2.5);
      for (let i = 0; i < BARS; i++) {
        let sum = 0;
        for (let j = 0; j < step; j++) sum += data[i * step + j] || 0;
        const norm = sum / step / 255;
        // Speech energy sits low in the spectrum — favour low bands, but let
        // the high bands show silence honestly rather than pinning them up.
        const weight = 1.25 - (i / BARS) * 0.5;
        const amp = reduced ? Math.max(0.06, Math.min(0.3, norm)) : Math.min(1, Math.pow(norm * weight, 0.6));
        const bh = Math.max(3, amp * (h - 4));
        c2d.fillStyle = `rgba(23,78,166,${0.25 + amp * 0.65})`;
        const x = i * (bw + gap);
        const y = mid - bh / 2;
        c2d.beginPath();
        if (typeof (c2d as any).roundRect === "function") (c2d as any).roundRect(x, y, bw, bh, radius);
        else c2d.rect(x, y, bw, bh);
        c2d.fill();
      }
    };

    // Paint one frame immediately: a paused animation frame (background tab)
    // must never leave an empty box where the level meter should be.
    paint();
    const loop = () => {
      if (!analyserRef.current) return;
      rafRef.current = requestAnimationFrame(loop);
      paint();
    };
    loop();
  }

  function teardownMeter() {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
    analyserRef.current = null;
    try {
      audioCtxRef.current?.close();
    } catch {}
    audioCtxRef.current = null;
  }

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

    streamRef.current = stream;
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
    teardownMeter();
    setState("transcribing");

    try {
      srRef.current?.stop();
    } catch {}

    const rec = recRef.current;
    const blob = await collectBlob(rec);
    rec?.stream?.getTracks().forEach((t) => t.stop());
    recRef.current = null;

    // Use finals, else interim/live as fallback (captures short utterances where browser hasn't finalized)
    const speechText = finals.current.join(" ").replace(/\s+/g, " ").trim();
    const interimFallback = (interim || "").trim();
    const liveFallback = liveTranscripts.join(" ").trim();
    const combinedFallback = speechText || interimFallback || liveFallback;
    let text = combinedFallback;
    // Keep the user's explicit language choice; only overwrite with a
    // server-confirmed language from real Gemini transcription.
    let lang = selectedLang === "auto" ? "" : selectedLang;
    let audioUrl: string | null = null;
    let source = combinedFallback ? "speech-recognition" : "transcribe";
    // Whatever the transcription engine said about a failure, verbatim.
    let engineNote: { error?: string; hint?: string; code?: string; model?: string } | null = null;

    // 1. Try server transcription & media upload
    if (blob && blob.size > 50) {
      try {
        const dataUrl = await blobToDataUrl(blob);
        const tr: any = await api("/api/transcribe", {
          method: "POST",
          body: JSON.stringify({ dataUrl, langHint: selectedLang }),
          headers: { "x-role": "citizen" },
        });

        if (tr?.transcript?.trim() && tr.source === "gemini") {
          // Real server transcription wins — it heard the raw audio, not just
          // the browser's interim hypotheses. Mock/unavailable/empty sources
          // are ignored so silence never becomes a fabricated complaint.
          text = tr.transcript.trim();
          if (tr.language && tr.language !== "und") lang = tr.language;
          source = "gemini";
        } else if (tr) {
          // Gemini 3.5 Transcribe reports *why* it could not answer
          // (auth / quota / no speech). Carry that to the citizen instead of
          // inventing an engine-busy explanation.
          engineNote = { error: tr.error, hint: tr.hint, code: tr.code, model: tr.model };
        }

        // Upload audio note
        try {
          const up: any = await api("/api/upload", {
            method: "POST",
            body: JSON.stringify({ dataUrl }),
            headers: { "x-role": "citizen" },
          });
          audioUrl = up.audioUrl || up.url || null;
          if (up?.backend === "mock") console.warn("voice note stored as demo mock URL (not persisted):", up.storageError || up.note || "storage unconfigured");
        } catch {}
      } catch (e: any) {
        engineNote = { error: String(e?.message || "The transcription request failed.") };
      }
    }

    // 2. No fabricated fallback: silence must never become a synthetic complaint
    // attributed to the citizen. Surface the real reason the engine gave.
    if (!text) {
      const hasAudio = !!(blob && blob.size > 200);
      const reason = engineNote?.error
        ? `${engineNote.error}${engineNote.hint ? ` ${engineNote.hint}` : ""}`
        : hasAudio
        ? "The speech service returned no transcript."
        : "";
      setNote({
        kind: "error",
        msg: hasAudio
          ? `We captured your audio (${(blob!.size / 1024).toFixed(0)} KB) but could not turn it into text. ${reason} Nothing was submitted — retry, or type your request below.`
          : "No speech detected. Check microphone permission (lock icon in the address bar), pick the language you actually spoke (ગુજરાતી / हिन्दी / English), speak for 2–3 seconds, then tap Stop. Or type your request below.",
      });
      setInterim("");
      setState("idle");
      return;
    }

    // Resolve display/source language honestly: explicit choice wins, then
    // server-confirmed, then script detection — never blind-default to "gu".
    if (!lang || lang === "auto") {
      if (/[\u0A80-\u0AFF]/.test(text)) lang = "gu";
      else if (/[\u0900-\u097F]/.test(text)) lang = "hi";
      else if (text) lang = "en";
      else lang = selectedLang === "auto" ? "auto" : selectedLang;
    }

    setNote({
      kind: "success",
      // Name the language in its own script, and say what the picker above does:
      // the citizen's next move is often "read this back to me in English".
      msg: `Transcribed in ${langName(lang)}. Review it below — choosing another language above also translates it.`,
    });
    onTranscript(text, lang, { audioUrl, source });

    setInterim("");
    setState("idle");
  }

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2 flex-wrap">
        {state !== "recording" ? (
          <Button onClick={start} disabled={state === "transcribing"} aria-busy={state === "transcribing"} className="gap-2 bg-civic-700 hover:bg-civic-800 text-white shadow-xs min-h-11">
            {state === "transcribing" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Mic className="h-4 w-4" aria-hidden="true" />} {state === "transcribing" ? "Processing…" : "Tap to speak"}
          </Button>
        ) : (
          <Button variant="secondary" onClick={stop} className="gap-2 border-red-300 bg-red-50 text-red-700 hover:bg-red-100 min-h-11">
            <Square className="h-4 w-4 fill-current" aria-hidden="true" /> Stop &amp; Transcribe
          </Button>
        )}

        {/* Language selector toggle */}
        <div role="group" aria-label="Speech language" className="inline-flex items-center rounded-xl bg-slate-100 p-1 text-xs border border-slate-200">
          <Globe className="h-3.5 w-3.5 text-slate-500 ml-1.5 mr-1" aria-hidden="true" />
          <button
            type="button"
            onClick={() => { setSelectedLang("gu"); onLangChange?.("gu"); }}
            aria-pressed={selectedLang === "gu"}
            className={`min-h-[44px] px-3 rounded-lg font-medium transition-[background-color,box-shadow,color] ${
              selectedLang === "gu" ? "bg-white text-civic-800 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
            style={{ touchAction: "manipulation" }}
          >
            ગુજરાતી
          </button>
          <button
            type="button"
            onClick={() => { setSelectedLang("hi"); onLangChange?.("hi"); }}
            aria-pressed={selectedLang === "hi"}
            className={`min-h-[44px] px-3 rounded-lg font-medium transition-[background-color,box-shadow,color] ${
              selectedLang === "hi" ? "bg-white text-civic-800 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
            style={{ touchAction: "manipulation" }}
          >
            हिन्दी
          </button>
          <button
            type="button"
            onClick={() => { setSelectedLang("en"); onLangChange?.("en"); }}
            aria-pressed={selectedLang === "en"}
            className={`min-h-[44px] px-3 rounded-lg font-medium transition-[background-color,box-shadow,color] ${
              selectedLang === "en" ? "bg-white text-civic-800 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
            style={{ touchAction: "manipulation" }}
          >
            English
          </button>
        </div>

        {state === "recording" && (
          <div className="w-full rounded-2xl border border-[#D2E3FC] bg-white px-3 py-2.5">
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
              <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#174EA6]">
                <span className="h-2 w-2 rounded-full bg-[#D93025] animate-ping" aria-hidden="true" />
                Recording · <span className="tabular-nums">{clock}</span>
              </span>
              <span className="text-[11px] text-[#5F6368]">{LANG_NAME[selectedLang as keyof typeof LANG_NAME] || LANG_NAME.auto} · speak for 2–3 seconds, then tap Stop</span>
            </div>
            <canvas
              ref={canvasRef}
              className="mt-1.5 block h-[56px] w-full"
              lang={LANG_BCP47[selectedLang as keyof typeof LANG_BCP47] || "en-IN"}
              aria-hidden="true"
            />
          </div>
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

