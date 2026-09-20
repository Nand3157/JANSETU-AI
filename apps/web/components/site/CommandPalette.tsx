"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Command, CornerDownLeft, Search, X } from "lucide-react";
import { APP_ROUTES, searchRoutes, type AppRoute } from "@/lib/appRoutes";
import { cn } from "@/lib/utils";
import { prefersReducedMotion } from "@/lib/motion";

const RECENTS_KEY = "jansetu_recent_routes";

/** Surfaces worth showing before anything has been typed. */
const SUGGESTED = ["/citizen/submit", "/government/copilot", "/government/map", "/citizen/requests"];

/** Stable DOM id for a route's palette row. */
function commandOptionId(href: string): string {
  return `command-option-${href.replace(/\W+/g, "-")}`;
}

function loadRecents(): string[] {
  try {
    const raw = localStorage.getItem(RECENTS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((h) => typeof h === "string").slice(0, 4) : [];
  } catch {
    return [];
  }
}

function rememberRoute(href: string) {
  try {
    const next = [href, ...loadRecents().filter((h) => h !== href)].slice(0, 4);
    localStorage.setItem(RECENTS_KEY, JSON.stringify(next));
  } catch {}
}

/**
 * CommandPalette — one way to reach every surface.
 *
 * This is the navigation spine of the product: it exists because the two
 * portals together are deeper than a sidebar should carry, and because an
 * official at a desk works from the keyboard. It searches in Gujarati, Hindi
 * and English (the same three languages the platform accepts by voice), keeps
 * the last few destinations, and never traps focus outside itself.
 */
export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [recents, setRecents] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const restoreFocus = useRef<Element | null>(null);

  const results = useMemo(() => {
    if (query.trim()) return searchRoutes(query).slice(0, 9);
    const byHref = new Map(APP_ROUTES.map((r) => [r.href, r]));
    const recentRoutes = recents.map((h) => byHref.get(h)).filter(Boolean) as AppRoute[];
    const suggested = SUGGESTED.map((h) => byHref.get(h)).filter(Boolean) as AppRoute[];
    const seen = new Set<string>();
    return [...recentRoutes, ...suggested].filter((r) => (seen.has(r.href) ? false : seen.add(r.href)));
  }, [query, recents]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActive(0);
    const el = restoreFocus.current as HTMLElement | null;
    if (el && typeof el.focus === "function") el.focus();
  }, []);

  const go = useCallback(
    (route: AppRoute) => {
      rememberRoute(route.href);
      close();
      router.push(route.href);
    },
    [close, router],
  );

  // Global shortcut: ⌘K / Ctrl+K, plus "/" for people who expect it. "/" is
  // ignored while the caret is in a field so typing a slash never hijacks input.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const typing =
        !!target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable);
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => {
          if (!v) {
            restoreFocus.current = document.activeElement;
            setRecents(loadRecents());
          }
          return !v;
        });
        return;
      }
      if (e.key === "/" && !typing && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        restoreFocus.current = document.activeElement;
        setRecents(loadRecents());
        setOpen(true);
      }
    }
    // The palette also answers to a normal event so any trigger can open it.
    function onOpenEvent() {
      restoreFocus.current = document.activeElement;
      setRecents(loadRecents());
      setOpen(true);
    }
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("jansetu:open-command", onOpenEvent);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("jansetu:open-command", onOpenEvent);
    };
  }, []);

  // Focus the field on open; lock the page behind the dialog. Focus is applied
  // synchronously (the field mounts in the same commit) and retried once, so it
  // does not depend on an animation frame that a backgrounded tab may skip.
  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const t = window.setTimeout(() => inputRef.current?.focus(), 60);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.clearTimeout(t);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  useEffect(() => setActive(0), [query]);

  // Keep the highlighted row inside the scroll viewport.
  useEffect(() => {
    if (!open) return;
    const item = listRef.current?.children[active] as HTMLElement | undefined;
    item?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  function onListKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (results.length ? (i + 1) % results.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (results.length ? (i - 1 + results.length) % results.length : 0));
    } else if (e.key === "Home") {
      e.preventDefault();
      setActive(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActive(Math.max(0, results.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const route = results[active];
      if (route) go(route);
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "Tab") {
      // The palette is a single focusable field: keep the caret in it.
      e.preventDefault();
    }
  }

  const listId = "command-palette-results";
  const activeId = results[active] ? commandOptionId(results[active].href) : undefined;

  // No trigger here on purpose: each layout renders its own `PaletteTrigger`
  // (which broadcasts `jansetu:open-command`), so the dialog never adds a
  // second search button to the page.
  //
  // Mount this *outside* any backdrop-filtered ancestor (see Header.tsx): a
  // filtered element becomes the containing block for `position: fixed`, which
  // would clip this overlay to the header's own height.
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-[300] flex items-start justify-center px-4 pt-[12vh]"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div
            aria-hidden="true"
            className={cn(
              "absolute inset-0 bg-[#0B1F3A]/25",
              !prefersReducedMotion() && "animate-[fade-in_140ms_ease-out_both]",
            )}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Search JANSETU AI"
            className="relative w-full max-w-[560px] overflow-hidden rounded-[20px] border border-[#E5E7EB] bg-white shadow-elevated"
            onKeyDown={onListKeyDown}
          >
            <div className="flex items-center gap-3 border-b border-[#E5E7EB] px-4">
              <Search className="h-4 w-4 shrink-0 text-[#5F6368]" aria-hidden="true" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                role="combobox"
                aria-expanded="true"
                aria-controls={listId}
                aria-activedescendant={activeId}
                aria-autocomplete="list"
                aria-label="Search pages, actions and datasets"
                placeholder="Search pages, actions, datasets — ગુજરાતી, हिन्दी or English…"
                className="h-[56px] w-full bg-transparent text-[16px] text-[#172033] outline-none placeholder:text-[#5F6368] md:text-sm"
                autoComplete="off"
                spellCheck={false}
              />
              <button
                type="button"
                onClick={close}
                aria-label="Close search"
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-[#5F6368] hover:bg-[#F8FAFC] hover:text-[#172033]"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            {results.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-[#172033]">Nothing matches “{query.trim()}”.</p>
                <p className="mt-1 text-xs text-[#5F6368]">
                  Try a district, a need like “water” (પાણી · पानी), or a surface like “budget”.
                </p>
              </div>
            ) : (
              <ul ref={listRef} id={listId} role="listbox" aria-label="Destinations" className="max-h-[min(52vh,420px)] overflow-y-auto p-2">
                {!query.trim() && (
                  <li aria-hidden="true" className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#5F6368]">
                    {recents.length ? "Jump back in" : "Start here"}
                  </li>
                )}
                {results.map((route, i) => {
                  const Icon = route.icon;
                  const selected = i === active;
                  return (
                    <li key={route.href} role="none">
                      <button
                        id={commandOptionId(route.href)}
                        role="option"
                        aria-selected={selected}
                        type="button"
                        onMouseEnter={() => setActive(i)}
                        onClick={() => go(route)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                          selected ? "bg-[#E8F0FE]" : "hover:bg-[#F8FAFC]",
                        )}
                      >
                        <span
                          className={cn(
                            "grid h-8 w-8 shrink-0 place-items-center rounded-lg border",
                            selected ? "border-[#174EA6] bg-white text-[#174EA6]" : "border-[#E5E7EB] bg-white text-[#5F6368]",
                          )}
                        >
                          <Icon className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-[#172033]">{route.label}</span>
                          <span className="block truncate text-xs text-[#5F6368]">{route.hint}</span>
                        </span>
                        <span className="shrink-0 text-[11px] font-medium uppercase tracking-[0.08em] text-[#5F6368]">{route.group}</span>
                        {selected && <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-[#174EA6]" aria-hidden="true" />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            <div className="flex items-center justify-between gap-3 border-t border-[#E5E7EB] bg-[#F8FAFC] px-4 py-2 text-[11px] text-[#5F6368]">
              <span className="flex items-center gap-3">
                <span>↑↓ to move</span>
                <span>↵ to open</span>
                <span>Esc to close</span>
              </span>
              <span className="hidden items-center gap-1 sm:flex">
                <Command className="h-3 w-3" aria-hidden="true" />K
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * The always-visible entry point. A shortcut nobody can discover is not a
 * feature, so the trigger renders as a search field on every wide screen and a
 * labelled button on mobile.
 */
export function PaletteTrigger({
  onClick,
  className,
  iconOnly = false,
}: {
  onClick?: () => void;
  className?: string;
  /** Portal headers already carry a data search box — keep this to one icon there. */
  iconOnly?: boolean;
}) {
  function fire() {
    if (onClick) onClick();
    else window.dispatchEvent(new Event("jansetu:open-command"));
  }
  if (iconOnly) {
    return (
      <button
        type="button"
        onClick={fire}
        title="Search pages and actions (⌘K)"
        aria-label="Search pages and actions"
        className={cn(
          "grid h-11 w-11 place-items-center rounded-full border border-[#E5E7EB] bg-white text-[#5F6368] transition-colors hover:border-[#CBD5E1] hover:text-[#172033]",
          className,
        )}
      >
        <Search className="h-4 w-4" aria-hidden="true" />
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={fire}
      aria-label="Search pages and actions"
      className={cn(
        "group inline-flex h-11 items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-3.5 text-sm text-[#5F6368] transition-colors hover:border-[#CBD5E1] hover:text-[#172033] md:h-9",
        className,
      )}
    >
      <Search className="h-4 w-4" aria-hidden="true" />
      <span className="hidden lg:inline">Search</span>
      <span className="hidden items-center gap-0.5 rounded-md border border-[#E5E7EB] bg-[#F8FAFC] px-1.5 py-0.5 text-[11px] font-medium text-[#5F6368] lg:inline-flex">
        <Command className="h-3 w-3" aria-hidden="true" />K
      </span>
    </button>
  );
}
