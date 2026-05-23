# TravelAdvisor Web — UX Overhaul v2

## Problem

Time-conscious travellers who want to plan efficiently are blocked by four compounding friction points in the current web app: an unusable input form (free-text fields, redundant day counter, no validation), a map that never renders, a planning phase that exposes raw AI streaming noise with no visual hierarchy, and an itinerary panel that gives no way to inspect individual days or request targeted changes. Together these make the app unusable for its intended purpose: visualizing a trip plan as it is built.

## Evidence

- Developer direct observation: map column stays blank after submitting the trip form (first-hand test, 2026-05-23)
- Developer direct observation: free-text date field accepts invalid strings with no feedback; "Days" counter is redundant once dates are chosen
- Developer direct observation: itinerary panel shows a flat unstructured block; no day-level navigation possible
- Developer direct observation: planning phase streams raw text with no abridgement — overwhelming and visually noisy

## Users

- **Primary**: Independent travellers who enjoy planning but want to reduce manual effort and visualize the itinerary geographically as it is built. They are comfortable with web apps, expect form validation, and want a polished "thinking tool" feel — not a raw chat window.
- **Not for**: Travel agents managing multiple clients, or users who want a pure conversational interface without structured form input.

## Hypothesis

We believe **a validated structured input form, a working map, an abridged planning UI, and an interactive expandable itinerary** will **make the planning experience usable and satisfying** for **time-conscious independent travellers**. We'll know we're right when a user can complete a full plan — origin → form → map visible → itinerary expanded by day → targeted edit applied — without hitting a dead end or seeing raw streaming noise.

## Success Metrics

| Metric | Target | How measured |
|---|---|---|
| Full planning flow completable end-to-end | 100% of attempts | Manual test: origin → plan → edit |
| Map renders on Plan My Trip click | Always | Visual check + no console errors |
| Day card expands / collapses on click | Works for all days | Manual interaction test |
| In-place day edit applies without full reload | Works for a single targeted prompt | Manual test |
| Input form rejects invalid dates | Always surfaces an error | Manual test with bad input |
| API cost per itinerary generation | Reduced vs Sonnet 4.6 | Model switched to Haiku 4.5 |

## Scope

**MVP** — The minimum to make the app usable for a complete planning session:

1. **Input form overhaul** — Replace free-text date field with a structured date-range picker (month + day dropdowns for departure and return). Derive the number of days automatically from the two dates; remove the standalone "Days" input. Add core conditional fields from the original CLI questionnaire (travel style, budget, group size, accommodation preference for multi-day, fitness level for adventure trips) as dynamic fields that appear only when relevant. Validate and normalize all inputs before enabling "Plan My Trip".

2. **Map activation fix** — Diagnose and fix the map render failure. Map must become visible as soon as "Plan My Trip" is clicked, centred on the destination. Origin and destination markers appear as geocoding resolves.

3. **Planning phase UX + model switch** — Replace raw streaming text in the middle panel with a collapsible "Planning your trip…" section. While the model is working, the section is open and shows abridged streaming output (a condensed status, not the full token stream). When generation completes the section collapses automatically, leaving only the finished itinerary. Switch the generation model from `claude-sonnet-4-6` to `claude-haiku-4-5` to reduce cost.

4. **Interactive itinerary panel** — Render each day as a card. On hover, highlight the card. On click, expand to show the full day's activities; click again to collapse. Allow the user to type a refinement prompt targeted at a specific day ("change Day 2 afternoon to a museum visit") and apply the result as an in-place patch to that day card only, without re-generating the full itinerary.

**Out of scope**

- Gemini / third-party model integration — architectural change; deferred until model requirements are validated
- Extended thinking (real chain-of-thought) in the planning section — Haiku 4.5 does not support it; the abridged UI will simulate the pattern without real thinking tokens
- Multi-user sessions or saved itineraries — no auth or persistence layer planned
- CLI (`index.js`) changes — unaffected by this scope
- Map route drawing between origin and destination — deferred; markers only for MVP
- Mobile / responsive layout — desktop-first for now

## Delivery Milestones

| # | Milestone | Outcome | Status | Plan |
|---|---|---|---|---|
| 1 | Input form overhaul | User fills a validated structured form; days auto-derived from date range; conditional fields appear dynamically | in-progress | `.claude/plans/web-ux-overhaul.plan.md` |
| 2 | Map activation fix | Map renders immediately on Plan My Trip click; markers appear for origin and destination | pending | — |
| 3 | Planning UX + model switch | Planning phase shows collapsible abridged stream; generation uses Haiku 4.5 | pending | — |
| 4 | Interactive itinerary panel | Day cards expand/collapse on click with hover highlight; targeted day edits apply in-place | pending | — |

## Open Questions

- [ ] **Thinking UI model**: Real extended thinking (requires Sonnet or Opus — higher cost) vs. simulated "planning…" header with Haiku streaming (cheaper, less informative). Decision needed before Milestone 3 implementation.
- [ ] **Date picker UX**: Month + day dropdowns vs. a calendar date-picker widget. Dropdowns are simpler to build; calendar is more familiar to travel users. Preference?
- [ ] **Map token**: Is `NEXT_PUBLIC_MAPBOX_TOKEN` present in `web/.env.local`? If missing, the map fix is a config gap, not a code bug.
- [ ] **Conditional field trigger rules**: The CLI has 7 conditional follow-ups. Which subset is essential for MVP form? (e.g. accommodation type, travel style, budget range, group size — fitness level may be lower priority)
- [ ] **In-place edit scope**: Should a day-level edit prompt be sent to the AI with full context (all days) or only the single day's content? Full context is more accurate; single-day is cheaper.

## Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Mapbox token missing from env — map fix looks like code bug | High | Medium | Confirm token presence before implementation |
| Haiku 4.5 output format diverges from parser expectations | Medium | High | Test `parseItinerary()` against Haiku output before wiring UI |
| In-place day patching requires significant state restructuring | Medium | Medium | Design itinerary state as a mutable day array from the start |
| Simulated thinking UI feels hollow without real chain-of-thought | Low | Low | Revisit with Sonnet extended thinking if user feedback flags it |

---
*Status: DRAFT — requirements only. Implementation planning pending via /plan.*
