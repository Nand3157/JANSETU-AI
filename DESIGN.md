# JANSETU AI — Web Design System (`apps/web`)

Single source of truth for visual tokens. Tailwind config (`apps/web/tailwind.config.ts`) mirrors this file. Do not introduce raw hex values in components — use these tokens or extend them here first.

## Brand palette — "premium Google civic"

| Token | Hex | Use |
|---|---|---|
| `civic-900` / `brand-navy` | `#0B1F3A` | Headings, dark sections, primary hover |
| `civic-800` / `brand-blue` | `#174EA6` | Primary actions, active nav, focus rings |
| `civic-700` | `#1A5ED6` | Icon accents, bar charts |
| `civic-600` | `#2D6AE0` | Input focus borders |
| `civic-500…100` | `#4A82DC` → `#D2E3FC` | Rings, soft borders, selected states |
| `civic-50` / `brand-light` | `#E8F0FE` | Selected backgrounds, chips |

## Semantic

- `ink #172033` body text · `muted #5F6368` secondary text (both AA on white)
- `success #188038` · `warning #F9AB00` · `critical #D93025`
- Priority bands: critical ≥80 `#DC2626`-family red · high 65–79 amber · moderate 45–64 blue · low slate
- Neutrals are **cool only**: surfaces `#FFFFFF`/`#F8FAFC`, borders `#E5E7EB`. Warm stone grays were removed in the Aug 2026 audit — do not reintroduce.

## Type & shape

- Inter (`--font-inter`) everywhere; display = same family. Page headings `.page-heading` clamp(1.55–2.15rem), tracking −0.035em.
- Radius scale: pills for controls, `rounded-[20px]–[28px]` for cards. Shadows: `shadow-card`, `shadow-card-hover`, `shadow-nav`.

## Motion rules

- Animate **transform + opacity only**; never width/height/top/left. ScoreBars fill uses `scaleX`.
- Ambient/looping animation (pulse/ping/shimmer/hotspot-pulse) is decorative-only and must stop under `prefers-reduced-motion`; state changes stay visible as instant color/shadow (see `globals.css`). Spinners exempt (text equivalent beside them).
- No JS animation libraries — CSS transitions + `lib/useInView` cover all reveal effects.
- `will-change` is banned at rest; apply only during a known-expensive animation via JS.

## Accessibility floor

- Global keyboard focus: 2px `#174EA6` outline at 2px offset (element-specificity rule in `globals.css` wins over utility `focus:outline-none`).
- Toggle controls declare state: `aria-pressed` (toggles) or `role="radio"`+`aria-checked` inside a `role="radiogroup"` (exclusive choices).
- Async feedback goes through the toast host (`components/ui/toast.tsx`) with `role="alert"` on errors. Native `alert()/confirm()` are banned.
- Touch targets ≥44×44px on mobile-primary controls.

## Honesty rules (civic product)

- Demo/sample data must be visibly labeled ("Demo mode" banner, "Sample" badges). Never pre-fill user-facing submission forms with sample content.
- No fabricated AI output: if transcription/detection fails, say so — never substitute canned content.
- Consequential decisions (approve/reject) require an explicit, editable reason that is what actually gets logged.

## Dark mode decision

Light-only for v1. `darkMode: "class"` is configured and ready; introduce dark tokens through this file before any `dark:` variants appear.
