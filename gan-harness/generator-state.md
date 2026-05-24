# Generator State — Iteration 001

## What Was Built
Complete adventurer/expedition visual redesign of the TravelAdvisor web app. Same 3-column layout, all logic preserved, but the surface now feels like a NatGeo expedition bureau: dark luxury, parchment-on-charcoal, deep forest green and amber-gold accents, Playfair Display + Inter type pairing, hand-drawn topographic patterns, and an animated brass-compass loader during itinerary generation.

### Files modified
- `/Users/arthurcen/Developer/TravelAdvisor/web/app/globals.css` — full design token system rewrite (CSS custom properties for the expedition palette), SVG noise grain overlay, topographic CSS background utilities (`.bg-topo`, `.bg-topo-faint`), dark scrollbars, `.exp-input` / `.exp-label` / `.exp-chip` / `.exp-btn-primary|secondary` / `.exp-rule` primitives, keyframe animations (compass spin/wobble, ring pulse, typing cursor, fade-up, shimmer), reduced-motion overrides.
- `/Users/arthurcen/Developer/TravelAdvisor/web/app/layout.tsx` — metadata title to "Expedition Planner — TravelAdvisor".
- `/Users/arthurcen/Developer/TravelAdvisor/web/tailwind.config.ts` — added expedition palette tokens (forest, amber, parchment, charcoal, bone, cream) plus `font-display` (Playfair) and `font-mono` (JetBrains Mono).
- `/Users/arthurcen/Developer/TravelAdvisor/web/components/AppShell.tsx` — full dark layout: left brand header ("Expedition · Travel Advisor · Field Bureau" with coordinates eyebrow), amber dividers between panels, "Field Journal Vol. I" rail above the center column, map vignette + "Survey 1:250k" cartographic corner marker.
- `/Users/arthurcen/Developer/TravelAdvisor/web/components/trip/TripForm.tsx` — restyled into a "Mission Brief" with six numbered Roman-numeral sections (I Route, II Window, III Party, IV Disposition, V Provisions, VI Caveats), point-A/point-B markers on origin/destination, amber-on-charcoal dates with display-serif duration count, "Chart the Expedition →" gradient button with shine sweep. All aria attrs preserved.
- `/Users/arthurcen/Developer/TravelAdvisor/web/components/chat/ChatPanel.tsx` — "Dispatched Brief" header, animated SVG brass compass loader (rotating tick dial + wobbling needle + three pulsing concentric rings), "Charting your expedition…" message, expedition-styled done and error states with bordered icon medallions.
- `/Users/arthurcen/Developer/TravelAdvisor/web/components/itinerary/ItineraryPanel.tsx` — empty state with custom compass SVG and "Expedition Log" title; streaming state with shimmer line + blinking cursor + monospace dispatch text; itinerary header with double rule + "Field Journal · Vol. I" eyebrow + Playfair destination; "End of Dispatch" stamp footer; Summary/Practical sections styled as bordered field-report cards.
- `/Users/arthurcen/Developer/TravelAdvisor/web/components/itinerary/DayGroup.tsx` — "DAY 01" Playfair numeral in amber + theme title, amber left rail accent, dashed amber separator on expand, encampment block for `day.stay`.
- `/Users/arthurcen/Developer/TravelAdvisor/web/components/itinerary/ActivityCard.tsx` — dark card with left time-rail (icon + small-caps period + duration), Playfair activity title, bordered amber cost tag.

## Key Design Decisions
1. **Type pairing.** Playfair Display 800 for display copy; Inter 400/500/600/700 for body; JetBrains Mono for coordinates/dates/dispatch text. This gives the bureau document feel without monotony.
2. **Palette discipline.** All color through CSS custom properties; legacy Tailwind aliases (`rausch`, `kazan`, `hof`, `foggy`, `border`, `bg-light`) remap to the new dark tokens so any leftover utility classes also render in-theme.
3. **Texture, not decoration.** SVG noise grain at 6% opacity overlays the whole viewport. Topographic contour SVG is used in two strengths (`.bg-topo` on the form, `.bg-topo-faint` on the journal panel) — drawn pattern, no stock images.
4. **Motion that means something.** The compass loader is a real instrument: outer dial rotates slowly, needle wobbles between bearings, three concentric rings pulse outward at staggered offsets — communicates "surveying" rather than "spinner". A shimmer line plus monospace cursor sells "live dispatch" during streaming.
5. **Editorial micro-typography.** Roman numerals + section symbols (§, ✦, ◇, ◈) used sparingly as bureau motifs, not generic emoji. Origin/destination get A/B point markers. Eyebrow labels in tight uppercase tracking (0.18–0.22em).
6. **Accessibility preserved.** Every `aria-required`, `aria-pressed`, `aria-describedby`, `role="alert"`, `role="status"`, `aria-live`, `aria-expanded`, `aria-controls` and `sr-only` Required tag is kept intact. Focus rings recolored to amber but still 2px high-contrast against dark ground. `prefers-reduced-motion` disables all new keyframe animations.
7. **No regressions.** All props interfaces, geocoding `onBlur` handlers, date validation, conditional sections (showAccommodation / showFitness / showDietary), submit logic, streaming reader, retry handler, and parse fallback are unchanged. `npm run typecheck` is clean.

## Known Issues
- The map (Mapbox) styling is left untouched per spec; the dark-theme vignette + corner marker integrate it visually but the basemap itself is whatever Mapbox style is configured in `TravelMap.tsx`.
- The form is dense; mobile (<768px) keeps the 3-column layout but each panel has a `min-w` so very narrow viewports will scroll horizontally. Spec called for desktop-first expedition feel.

## Dev Server
- URL: http://localhost:3000
- Status: running (Next.js 16.2.6 Turbopack, returns 200)
- Command: `cd /Users/arthurcen/Developer/TravelAdvisor/web && npm run dev`
