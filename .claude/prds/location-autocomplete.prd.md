# Location Autocomplete — Origin & Destination Inputs

## Problem
Travelers using the TravelAdvisor form must type exact city names or airport codes into free-form text fields with no guidance. If the text doesn't match Mapbox's geocoding expectations, the map silently fails to update and the generated itinerary may reference the wrong place. The current UX provides no feedback during typing and offers no way to resolve ambiguous names (e.g. "Paris, TX" vs "Paris, France").

## Evidence
- Assumption — needs validation via user observation / session recording
- Known technical risk: Mapbox geocoding on `blur` only; no inline validation means users submit malformed locations without knowing

## Users
- **Primary**: A traveler filling in the expedition planning form — they know roughly where they want to go but may not know the exact city spelling, the IATA code, or which "Springfield" is correct
- **Not for**: API consumers or programmatic itinerary generation; no need for autocomplete on non-human input paths

## Hypothesis
We believe **a live-search dropdown on the From and To inputs** will **eliminate silent geocoding failures and speed up location entry** for travelers.
We'll know we're right when **users land a valid geocoded location on their first try without re-typing or re-blurring the field**.

## Success Metrics
| Metric | Target | How measured |
|---|---|---|
| Geocode success on first blur | ≥ 90% of sessions | client-side event: geocode response vs. input attempts |
| Time to fill From + To fields | ≤ 15 seconds | session timing |
| Dropdown interaction rate | ≥ 60% of users who type ≥ 2 chars | click / keyboard select event |

## Scope

**MVP**
- Dropdown appears after user types ≥ 2 characters into the From or To field
- Results sourced from Mapbox Geocoding API (place + poi.landmark types); airport codes resolved via same API (IATA codes return airport features)
- Each result row shows: place name (bold) + country/region secondary line
- User can select via mouse click or keyboard (↑ ↓ Enter Escape)
- On selection: input is populated, geocoded GeoPoint is passed immediately (no separate blur call needed), map markers update
- Dropdown styled to match expedition design system: dark charcoal surface, amber highlight on hover/focus, Playfair Display for place name, Inter for secondary line, amber border — no white boxes
- Debounced at 300ms to avoid hammering the API on every keystroke
- Loading indicator inside the input while fetching (small amber spinner or amber shimmer border)
- Graceful empty state: "No locations found" in bone/muted text
- Accessible: `role="listbox"`, `role="option"`, `aria-expanded`, `aria-activedescendant`, keyboard trap handled

**Out of scope**
- Recent search history / saved locations — adds persistence complexity, deferred
- Airline / flight-specific search (IATA route pairs) — different data source, separate feature
- Mobile swipe/tap optimization beyond standard click — deferred to mobile-specific pass
- Offline / cached results — overkill for MVP
- Multi-city / waypoint inputs — current form is origin → destination only

## Delivery Milestones

| # | Milestone | Outcome | Status | Plan |
|---|---|---|---|---|
| 1 | Autocomplete dropdown component | From and To fields show styled, accessible suggestions while typing; selection populates the field | pending | — |
| 2 | Mapbox geocode integration | Selection triggers immediate geocoding, map markers update without separate blur event, no regression on current geocode path | pending | — |

## Open Questions
- [ ] Should airport code search (`JFK`, `CDG`) hit the same Mapbox endpoint or a separate airports dataset? Mapbox places API does return airports by IATA code — verify coverage before committing.
- [ ] How many results to show? 4–6 is typical; confirm with design whether the dropdown can accommodate 6 rows inside the expedition panel's dark sidebar.
- [ ] Debounce at 300ms — acceptable on slower connections? Could raise to 400ms if geocode latency is noticeable on first render.
- [ ] What happens if the user types and does NOT select from the dropdown (still blur-submits)? Current behavior (blur geocode) should be preserved as fallback.

## Risks
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Mapbox rate limit during fast typing | Medium | User sees empty dropdown / errors | 300ms debounce + abort in-flight requests on new keystroke |
| Dropdown z-index conflict with map layer | Low | Dropdown hidden behind Mapbox canvas | Ensure dropdown has `z-index` above the map pane; test explicitly |
| Geocode path regression (blur fallback breaks) | Low | Map stops updating after form submit | Integration test the existing blur → geocode → marker flow before and after |
| IATA airport code coverage gap | Medium | Airport code users get no results | Validate a sample of major codes (JFK, LHR, CDG, HND) against Mapbox before launch |

---
*Status: DRAFT — requirements only. Implementation planning pending via /plan.*
