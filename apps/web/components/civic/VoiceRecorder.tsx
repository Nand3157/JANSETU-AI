"use client";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Loader2, Wand2 } from "lucide-react";

export function VoiceRecorder({ onTranscript, langHint="auto" }: { onTranscript: (text: string, lang?: string)=>void; langHint?: string }) {
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  async function start() {
    try {
      // try MediaRecorder for audio capture (for Storage upload in prod)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      recRef.current = rec;
      chunks.current = [];
      rec.ondataavailable = e => chunks.current.push(e.data);
      rec.onstop = async () => {
        const blob = new Blob(chunks.current, { type: "audio/webm" });
        // In prod: upload blob to Cloud Storage + call Gemini transcription via Firebase AI Logic
        // Here we simulate: use Web Speech API if available, else mock Gujarati demo
        setTranscribing(true);
        // Try Web Speech API
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition && langHint !== "gu") {
          // Fallback: we already have blob, but Web Speech would need live. So mock.
        }
        // Mock: if langHint gu, return demo gu text, else generic
        await new Promise(r=> setTimeout(r, 900));
        const mock = langHint==="gu"
          ? "અમારા ગામનો રસ્તો વરસાદમાં બંધ થઈ જાય છે. હોસ્પિટલ જવા માટે ખૂબ સમય લાગે છે અને બાળકોને પણ સ્કૂલ જવામાં મુશ્કેલી પડે છે."
          : "Road blocked in monsoon, hospital access delayed and children can't reach school.";
        onTranscript(mock, langHint);
        setTranscribing(false);
        stream.getTracks().forEach(t=> t.stop());
      };
      rec.start();
      setRecording(true);
    } catch (e) {
      alert("Microphone permission denied or unsupported. Type instead.");
    }
  }
  function stop() {
    recRef.current?.stop();
    setRecording(false);
  }

  return (
    <div className="flex items-center gap-2">
      {!recording ? (
        <Button onClick={start} className="gap-2"><Mic className="h-4 w-4" /> Tap to speak</Button>
      ) : (
        <Button variant="secondary" onClick={stop} className="gap-2 border-red-200 bg-red-50 text-red-700"><Square className="h-4 w-4" /> Stop · recording</Button>
      )}
      {transcribing && <span className="inline-flex items-center gap-1.5 text-xs rounded-full bg-violet-50 text-violet-700 border border-violet-200 px-3 py-1.5"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Gemini transcribing…</span>}
      {recording && <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />}
    </div>
  );
}
