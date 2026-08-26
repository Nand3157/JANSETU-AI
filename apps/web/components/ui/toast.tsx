"use client";
import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export type ToastKind = "success" | "error" | "info";

type ToastItem = { id: number; kind: ToastKind; msg: string };
type Listener = (items: ToastItem[]) => void;

let items: ToastItem[] = [];
const listeners = new Set<Listener>();
let seq = 0;

function emit() {
  const snapshot = [...items];
  listeners.forEach((l) => l(snapshot));
}

export function dismissToast(id: number) {
  items = items.filter((t) => t.id !== id);
  emit();
}

export function toast(msg: string, kind: ToastKind = "info") {
  const id = ++seq;
  items = [...items, { id, kind, msg }].slice(-4);
  emit();
  setTimeout(() => dismissToast(id), kind === "error" ? 7000 : 4500);
}

const styles: Record<ToastKind, string> = {
  success: "border-[#CEE6D0] bg-[#E6F4EA] text-[#0D652D]",
  error: "border-[#FADBD8] bg-[#FCE8E6] text-[#C5221F]",
  info: "border-[#D2E3FC] bg-[#E8F0FE] text-[#174EA6]",
};

const icons: Record<ToastKind, typeof Info> = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

export function ToastHost() {
  const [list, setList] = useState<ToastItem[]>([]);

  useEffect(() => {
    const listener: Listener = setList;
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  if (list.length === 0) return null;

  return (
    <div aria-live="polite" aria-atomic="false" className="fixed bottom-4 right-4 left-4 sm:left-auto z-[200] flex flex-col gap-2 max-w-[380px] pb-[env(safe-area-inset-bottom)]">
      {list.map((t) => {
        const Icon = icons[t.kind];
        return (
          <div
            key={t.id}
            role={t.kind === "error" ? "alert" : "status"}
            className={`animate-fade-in flex items-start gap-2.5 rounded-2xl border px-4 py-3 shadow-card text-sm leading-snug ${styles[t.kind]}`}
          >
            <Icon className="h-4 w-4 mt-0.5 shrink-0" aria-hidden="true" />
            <span className="flex-1">{t.msg}</span>
            <button
              type="button"
              onClick={() => dismissToast(t.id)}
              aria-label="Dismiss notification"
              className="shrink-0 rounded-full p-2 min-h-11 min-w-11 grid place-items-center hover:bg-black/5 touch-manipulation"
              style={{ touchAction: "manipulation" }}
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
