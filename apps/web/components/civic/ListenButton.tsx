"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Square, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

export type ListenLang = "gu" | "hi" | "en";

const LANGS: { id: ListenLang; endonym: string; english: string }[] = [
  { id: "gu", endonym: "ગુજરાતી", english: "Gujarati" },
  { id: "hi", endonym: "हिन्दी", english: "Hindi" },
  { id: "en", endonym: "English", english: "English" },
];

/** Script beats guessing: Gujarati block → gu, Devanagari → hi, Latin → en. */
export function detectListenLang(text: string): ListenLang {
  if (/[\u0A80-\u0AFF]/.test(text)) return "gu";
  if (/[\u0900-\u097F]/.test(text)) return "hi";
  return "en";
}

/** One voice at a time, across every Listen control on the page. */
let activeAudio: HTMLAudioElement | null = null;
function stopActive() {
  if (!activeAudio) return;
  try {
    activeAudio.pause();
    activeAudio.currentTime = 0;
  } catch {}
  activeAudio = null;
}

/**
 * Reads grounded text aloud with Gemini TTS in Gujarati, Hindi or English.
 * Errors are never silent: the control names the failure (auth, quota, network)
 * and keeps a persistent line under it after the toast has gone.
 */
export function ListenButton({
  text,
  defaultLang,
  label = "Listen",
  recovery,
  className,
}: {
  text: string;
  /** Force the starting language; otherwise it follows the text's script. */
  defaultLang?: ListenLang;
  label?: string;
  /** Context-specific recovery advice for a failed request. */
  recovery?: string;
  className?: string;
}) {
  const clean = (text || "").trim();
  const detected = useMemo(() => detectListenLang(clean), [clean]);
  const [lang, setLang] = useState<ListenLang>(defaultLang || detected);
  const [state, setState] = useState<"idle" | "loading" | "playing">("idle");
  const [failure, setFailure] = useState<{ message: string; recovery: string } | null>(null);
  const [partial, setPartial] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pickedByUser = useRef(false);

  // Keep pace with the content until the reader overrides the language.
  useEffect(() => {
    if (!pickedByUser.current) setLang(defaultLang || detected);
  }, [defaultLang, detected]);

  const stop = useCallback(() => {
    const a = audioRef.current;
    if (a) {
      try {
        a.pause();
        a.currentTime = 0;
      } catch {}
      if (activeAudio === a) activeAudio = null;
      audioRef.current = null;
    }
    setState("idle");
  }, []);

  // Releasing the clip on unmount or on new text is what stops two voices
  // overlapping when the copilot answer is replaced.
  useEffect(() => () => stop(), [stop]);
  useEffect(() => {
    stopActive();
    stop();
  }, [clean, lang, stop]);

  async function play() {
    if (!clean) return;
    if (state === "playing") {
      stop();
      return;
    }
    setFailure(null);
    setState("loading");
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 45_000);
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: clean, lang }),
      });
      const data: any = await res.json().catch(() => null);
      if (!res.ok || data?.source !== "gemini" || !data?.audioDataUrl) {
        const message = data?.error || `Speech is unavailable right now (HTTP ${res.status}).`;
        const advice = data?.hint || recovery || "Please retry, or read the text below.";
        setFailure({ message, recovery: advice });
        toast(`${message} ${advice}`, "error");
        setState("idle");
        return;
      }
      setPartial(!!data.truncated);
      stopActive();
      const audio = new Audio(data.audioDataUrl);
      audioRef.current = audio;
      activeAudio = audio;
      audio.onended = () => stop();
      audio.onerror = () => {
        setFailure({ message: "This browser could not play the audio.", recovery: "Try again, or use another browser." });
        setState("idle");
      };
      await audio.play();
      setState("playing");
    } catch (e: any) {
      const aborted = e?.name === "AbortError";
      const message = aborted ? "The speech request timed out." : "Could not reach the speech service.";
      const advice = recovery || "Please retry.";
      setFailure({ message, recovery: advice });
      toast(`${message} ${advice}`, "error");
      setState("idle");
    } finally {
      clearTimeout(timer);
    }
  }

  const current = LANGS.find((l) => l.id === lang)!;

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={play}
        disabled={!clean || state === "loading"}
        aria-busy={state === "loading"}
        aria-label={
          state === "playing"
            ? "Stop reading aloud"
            : `${label} in ${current.english}`
        }
        className="gap-1.5 min-h-11 sm:min-h-9"
      >
        {state === "loading" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
        ) : state === "playing" ? (
          <Square className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
        ) : (
          <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
        )}
        {state === "loading" ? "Preparing…" : state === "playing" ? "Stop" : label}
      </Button>

      <div
        role="group"
        aria-label="Read-aloud language"
        className="inline-flex items-center rounded-full bg-[#F8FAFC] border border-[#E5E7EB] p-0.5"
      >
        {LANGS.map((l) => (
          <button
            key={l.id}
            type="button"
            onClick={() => {
              pickedByUser.current = true;
              setLang(l.id);
            }}
            aria-pressed={lang === l.id}
            aria-label={`Read aloud in ${l.english}`}
            title={`Read aloud in ${l.english}`}
            className={cn(
              "min-h-11 sm:min-h-9 px-3 rounded-full text-xs font-medium transition-[background-color,color,box-shadow] touch-manipulation",
              lang === l.id ? "bg-white text-[#0B1F3A] shadow-soft" : "text-[#5F6368] hover:text-[#172033]",
            )}
          >
            {l.endonym}
          </button>
        ))}
      </div>

      <span role="status" className="sr-only">
        {state === "playing" ? `Reading aloud in ${current.english}` : ""}
      </span>

      {partial && !failure && (
        <p className="w-full text-xs leading-snug text-[#5F6368]">Reads the first part of this long text aloud.</p>
      )}

      {failure && (
        <p role="alert" className="w-full text-xs leading-snug text-[#C5221F]">
          {failure.message} {failure.recovery}
        </p>
      )}
    </div>
  );
}
