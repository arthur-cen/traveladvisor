# Plan: Input Form Overhaul

**Source PRD**: `.claude/prds/web-ux-overhaul.prd.md`
**Selected Milestone**: 1 — Input form overhaul
**Complexity**: Medium

## Summary

Replace the current 4-field free-text form with a full structured intake form that collects all `TripAnswers` fields upfront — eliminating the AI-driven Q&A phase. Departure and return dates use `<input type="date">` pickers; the day count is auto-derived. Conditional fields (accommodation, fitness level, dietary) appear dynamically based on prior selections. All values are validated and normalized before "Plan My Trip" is enabled. `AppShell` and `ChatPanel` are updated to accept the full answer set and skip directly to generation.

## Patterns to Mirror

| Category | Source | Pattern |
|---|---|---|
| Naming | `TripForm.tsx:6` | `TripBasics = Pick<TripAnswers, ...>` — pick types for prop shapes |
| Conditional logic | `questions.ts:33` | `when: (a) => parseInt(a.days ?? '0', 10) >= 2` — reactive conditions on answer state |
| Geocoding | `TripForm.tsx:14` | `async geocode(q)` returning `GeoPoint \| null`, called on blur |
| Multi-value fields | `buildTripContext.ts:7` | `Array.isArray(answers.transport) ? answers.transport.join(', ') : answers.transport` |
| Type shapes | `lib/types.ts:1` | Named `type`/`interface` exports; string literal unions for constrained fields |
| Error handling | `ChatPanel.tsx:126` | `try/catch` with fallback UI message, no silent swallows |

## Files to Change

| File | Action | Why |
|---|---|---|
| `web/lib/types.ts` | UPDATE | Add `departureDate` + `returnDate` to `TripAnswers`; remove Q&A-only phase value `'qa'` from `AppPhase` |
| `web/components/trip/TripForm.tsx` | REWRITE | Full replacement: date pickers, multi-select chips, conditional fields, validation, emits full `TripAnswers` |
| `web/components/AppShell.tsx` | UPDATE | `tripBasics: TripBasics` → `tripAnswers: TripAnswers`; pass full answers to `ChatPanel` |
| `web/components/chat/ChatPanel.tsx` | UPDATE | Remove Q&A phase; accept full `TripAnswers`; call `generateItinerary` on mount |
| `web/lib/buildTripContext.ts` | UPDATE | Format `departureDate`/`returnDate` into the existing `Dates:` line; keep all other lines unchanged |

## Tasks

### Task 1: Extend `TripAnswers` type (`lib/types.ts`)

Add two structured date fields to `TripAnswers`:
```ts
departureDate: string;  // ISO "YYYY-MM-DD"
returnDate: string;     // ISO "YYYY-MM-DD"
```
Keep `travelDates: string` and `days: string` — they will be derived by the form before calling `onSubmit` so the rest of the pipeline (`buildTripContext`, API route) needs zero changes.

Remove `'qa'` from `AppPhase` union (phases are now `'form' | 'generating' | 'done'`).

- **Mirror**: string literal union pattern from `TripAnswers.budget`
- **Validate**: `cd web && npm run typecheck` — zero errors

### Task 2: Rewrite `TripForm.tsx`

**Form sections (in order):**

1. **Route** — "From" text input + "To" text input (keep existing geocode-on-blur pattern)

2. **Dates** — Two `<input type="date">` fields side by side (Departure / Return). Below them, a read-only derived badge: `{N} days`. Validation: return ≥ departure; both required; no past dates.

3. **Travelers** — `<select>`: Solo · 2 adults · Family (with kids) · Small group (3–4) · Large group (5+)

4. **Budget** — `<select>`: Budget-friendly · Mid-range · Luxury (maps to existing `budget` union values)

5. **Trip style** — Multi-select chip toggles (tap to toggle, multiple allowed): Relaxation · Food & Drink · Adventure · Nature · Cultural. Stored as `string[]` matching existing `tripStyle` type.

6. **Transport** — Multi-select chip toggles: Walking · Public transit · Car · Train · Bike. Stored as `string[]`.

7. **Accommodation** *(conditional — shows when `days >= 2`)* — `<select>`: Hotel · Airbnb · Hostel · Camping

8. **Fitness level** *(conditional — shows when tripStyle includes "Adventure" or "Nature")* — `<select>`: Easy · Moderate · Strenuous. Maps to `fitnessLevel` union.

9. **Dietary notes** *(conditional — shows when tripStyle includes "Food & Drink")* — Text input, optional.

10. **Things to avoid** — Text input, optional, always shown. Pre-filled hint "none".

**Validation logic** (computed `isValid`):
- `origin` and `destination` non-empty
- `departureDate` and `returnDate` set; return ≥ departure
- `travelers` selected
- `budget` selected
- `tripStyle` at least one chip selected
- `transport` at least one chip selected

**On submit:**
- Derive `travelDates`: format departure+return into "MMM D–D, YYYY" or "MMM D – MMM D, YYYY" string
- Derive `days`: `Math.max(1, diffDays).toString()`
- Call `onSubmit(fullAnswers)` with complete `TripAnswers`

**Left column scroll:** wrap the form body in `overflow-y-auto flex-1` so it scrolls when the conditional fields expand.

- **Mirror**: `FormField` inner component pattern; `geocode()` function kept as-is
- **Validate**: Visual test — all fields render; conditional fields appear/disappear correctly; button disabled until valid

### Task 3: Update `AppShell.tsx`

- Rename `tripBasics` state to `tripAnswers`, type as `TripAnswers | null`
- Remove `TripBasics` local type alias (no longer needed)
- Update `TripForm` `onSubmit` prop to `(answers: TripAnswers) => void`
- Pass `tripAnswers` to `ChatPanel` as `tripAnswers` prop (replacing `tripBasics`)
- `ChatPanel` key: keep `${tripAnswers.origin}-${tripAnswers.destination}` pattern

- **Mirror**: existing `useState<TripBasics | null>(null)` pattern
- **Validate**: `npm run typecheck` — zero errors

### Task 4: Simplify `ChatPanel.tsx`

**Props change:** `tripBasics: Pick<TripAnswers, ...>` → `tripAnswers: TripAnswers`

**Remove entirely:**
- `queueIndex` state
- `phase: 'qa'` branch
- `applicableQuestions` / `getNextQuestion()` logic
- `handleSend()` Q&A handler
- Initial "first question" `useEffect`

**Keep:**
- `generateItinerary()` function unchanged (still calls `/api/chat`)
- `onItineraryReady`, `onStreamUpdate`, `onStreamingChange` callbacks
- Error recovery message

**New mount behaviour:**
```ts
useEffect(() => {
  generateItinerary(tripAnswers);
}, []); // runs once on mount, answers already complete
```

The left column area below the form now shows only the generation status (streaming indicator or done). The Q&A message list is no longer needed — remove `messages` state and `ChatMessageBubble` rendering. Keep `ChatInput` hidden for now (M4 will re-introduce it for refinement prompts).

- **Mirror**: existing `generateItinerary` async pattern, `try/catch` error UI
- **Validate**: submitting the form triggers generation immediately with no Q&A step

### Task 5: Update `buildTripContext.ts`

Replace the `days` parse line to also accept the new structured dates if present:
```ts
const days = parseInt(answers.days, 10);
// travelDates is already pre-formatted by the form — no change needed
```
No structural change required. The form pre-computes `travelDates` and `days` as strings before calling onSubmit, so this file is unchanged. Mark as a no-op after confirming with `typecheck`.

- **Validate**: `npm run typecheck` passes; manual test confirms trip context string looks correct in API response

## Validation

```bash
cd web

# Type safety
npm run typecheck

# Build passes
npm run build

# Manual flow test
# 1. Open http://localhost:3000
# 2. Fill origin + destination → map geocodes on blur
# 3. Pick departure date, then return date → day badge auto-updates
# 4. Select travelers, budget, trip style chips
# 5. Select "Adventure" → fitness level field appears
# 6. Select "Food & Drink" → dietary field appears
# 7. Set return > departure by 2+ days → accommodation field appears
# 8. Click "Plan My Trip" → generation starts immediately (no Q&A)
# 9. Itinerary streams into center panel
```

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| `<input type="date">` value format varies by locale on older Safari | Low | Normalize with `new Date(value).toISOString().slice(0, 10)` before storing |
| Long form overflows left column on smaller screens | Medium | Wrap form in `overflow-y-auto`; form is desktop-only per PRD scope |
| Removing Q&A breaks ChatPanel's streaming callbacks | Low | `generateItinerary` is self-contained; callbacks are passed from AppShell unchanged |
| `tripStyle` as `string[]` vs existing `string` handling in buildTripContext | None | `buildTripContext.ts:11` already handles `Array.isArray(answers.tripStyle)` |

## Acceptance

- [ ] All tasks complete
- [ ] `npm run typecheck` passes with zero errors
- [ ] `npm run build` succeeds
- [ ] Form: all 10 field sections render; conditional fields appear/disappear correctly
- [ ] Form: "Plan My Trip" disabled until all required fields are filled
- [ ] Form: days badge auto-derives from selected dates
- [ ] Submission: generation starts immediately, no Q&A prompt shown
- [ ] Itinerary streams and renders in center panel as before
