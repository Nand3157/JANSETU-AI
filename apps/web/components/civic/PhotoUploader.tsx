"use client";
import { useState } from "react";
import { Camera, X, UploadCloud } from "lucide-react";

export function PhotoUploader({ onFile }: { onFile: (file: File | null, previewUrl?: string)=>void }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] || null;
    if (!f) { setPreview(null); setName(null); onFile(null); return; }
    setName(f.name);
    const url = URL.createObjectURL(f);
    setPreview(url);
    onFile(f, url);
    // In prod: upload to Cloud Storage via signed URL + store photoUrl in Firestore
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Photo <span className="text-muted font-normal">· optional · stored in Cloud Storage, not PII</span></label>
      {!preview ? (
        <label className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm cursor-pointer hover:bg-white hover:border-civic-200 transition">
          <UploadCloud className="h-6 w-6 text-muted" />
          <span>Add photo of the issue</span>
          <span className="text-xs text-muted">JPG/PNG · max 10MB</span>
          <input type="file" accept="image/*" onChange={onChange} className="hidden" />
        </label>
      ) : (
        <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-white">
          <img src={preview} alt="preview" className="h-48 w-full object-cover" />
          <button onClick={()=> { setPreview(null); setName(null); onFile(null); }} className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/60 text-white grid place-items-center"><X className="h-4 w-4" /></button>
          <div className="p-2 flex items-center gap-1.5 text-xs text-muted"><Camera className="h-3.5 w-3.5" /> {name} · uploaded on submit</div>
        </div>
      )}
    </div>
  );
}
