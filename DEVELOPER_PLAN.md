# TravelAdvisor App — Developer Plan

## Overview

A conversational trip-planning assistant that collects user preferences through a guided Q&A flow, then generates a tailored itinerary — formatted for the trip's duration and scope (single-day or multi-day, short or long distance).

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Runtime | **Node.js** | Rich npm ecosystem; fast feature development |
| Framework | **Express.js** | Lightweight HTTP server; easy to extend |
| AI / LLM | **Claude API (Anthropic SDK)** | Powers the conversational planning agent |
| CLI / Chat UI | **Inquirer.js** (local) | Interactive terminal prompts for the Q&A flow |
| Output formatting | **Marked / cli-table3** | Render structured itineraries cleanly |
| Config / env | **dotenv** | Manage API keys and settings |
| Hosting (future) | **Vercel** | Serverless deployment; zero-config for Node |

---

## Hosting Strategy

- **Phase 1 (Now):** Run fully locally — `node index.js` in the terminal. No server required.
- **Phase 2 (Future):** Deploy to **Vercel** as a serverless API + lightweight web frontend (Next.js or plain HTML). Minimal refactoring needed if the business logic is kept in clean service modules from the start.

---

## Pre-Planning Q&A Flow

Before generating any itinerary, the agent **must** prompt the user with questions to narrow down the trip. Questions are asked conversationally and only those relevant to the trip type are shown.

### Core Questions (always asked)

1. **Where are you starting from?** *(origin city / address)*
2. **Where do you want to go?** *(destination — specific city, region, or "help me decide")*
3. **When are you planning to travel?** *(date or date range)*
4. **How many days is this trip?** *(single day → single-day format; 2+ days → multi-day format)*
5. **How many people are traveling?** *(solo, couple, group — affects recommendations)*
6. **What is your approximate budget?** *(per person: budget / mid-range / luxury)*
7. **How do you prefer to get around?** *(car, public transit, flight, train, bike, walk)*
8. **What kind of trip is this?** *(relaxation, adventure, cultural, food & drink, nature, nightlife, family-friendly, mix)*

### Follow-up Questions (asked based on earlier answers)

| Condition | Follow-up |
|---|---|
| Multi-day trip | Preferred accommodation type? (hotel, Airbnb, hostel, camping) |
| Long-distance trip | Any layover preferences or flight constraints? |
| Group travel | Any children? Ages? |
| Food & drink focus | Any dietary restrictions or cuisines to prioritize? |
| Adventure / nature | Fitness level? (easy, moderate, strenuous) |
| "Help me decide" destination | What region or climate appeals to you? |
| Any trip | Anything you specifically want to avoid? |

---

## Output Format

The itinerary output adapts to the trip type detected from the user's answers.

### Single-Day Format

```
== Day Trip: [Destination] on [Date] ==

Morning (9:00 AM – 12:00 PM)
  • [Activity / Place] — [Brief description] (~[duration])

Lunch (12:00 PM – 1:30 PM)
  • [Restaurant] — [Cuisine, price range]

Afternoon (1:30 PM – 6:00 PM)
  • [Activity / Place] — [Brief description]
  • [Activity / Place] — [Brief description]

Evening (6:00 PM – 9:00 PM)  [optional]
  • [Dinner / Evening activity]

== Practical Info ==
  • Getting there: [directions / transit]
  • Estimated cost: $[X] – $[Y] per person
  • Tips: [weather, parking, reservations needed]
```

### Multi-Day Format

```
== [N]-Day Itinerary: [Destination] | [Start Date] – [End Date] ==

--- Day 1: [Theme / Area] ---
Morning   → [Activity]
Afternoon → [Activity]
Evening   → [Dinner + activity]
Stay: [Hotel / Airbnb name + neighborhood]

--- Day 2: [Theme / Area] ---
...

--- Day N ---
...

== Trip Summary ==
  • Total estimated cost: $[X] – $[Y] per person
  • Packing tips, best transport card, key bookings to make in advance
```

---

## Project Structure

```
TravelAdvisor/
├── index.js              # Entry point — starts the Q&A flow
├── src/
│   ├── questionnaire.js  # All pre-planning questions (Inquirer.js)
│   ├── planner.js        # Calls Claude API, builds the prompt
│   ├── formatter.js      # Detects single-day vs multi-day, formats output
│   └── utils.js          # Shared helpers (date parsing, budget labels, etc.)
├── prompts/
│   └── system_prompt.txt # Claude system prompt — role + output rules
├── .env                  # ANTHROPIC_API_KEY (not committed)
├── .env.example          # Template for contributors
├── package.json
└── DEVELOPER_PLAN.md
```

---

## Claude Agent Design

### System Prompt Goals
- Act as an expert, friendly travel planner
- Always ask clarifying questions before planning (do not skip the Q&A)
- Produce output **only** in the format that matches the trip duration
- Respect user constraints: budget, accessibility, dietary needs, travel style
- For ambiguous destinations, suggest 2–3 options with a one-line rationale each

### Prompt Construction (in `planner.js`)
The user answers from the Q&A are serialized into a structured context block and injected into the Claude prompt, e.g.:

```
[Trip Context]
Origin: San Francisco, CA
Destination: Yosemite National Park
Dates: June 14–15, 2026 (2 days)
Travelers: 2 adults
Budget: Mid-range
Transport: Car
Trip style: Nature / adventure
Fitness level: Moderate
Dietary notes: Vegetarian
Avoid: Crowded tourist spots
```

Claude then generates the itinerary in the correct format.

---

## Development Phases

### Phase 1 — Local MVP
- [ ] Project scaffold: `npm init`, install dependencies
- [ ] `.env` setup with `ANTHROPIC_API_KEY`
- [ ] Build `questionnaire.js` — all core + follow-up questions
- [ ] Build `planner.js` — assemble context, call Claude API
- [ ] Build `formatter.js` — detect and render single-day vs multi-day output
- [ ] Wire up `index.js` end-to-end
- [ ] Test with 3–4 representative trip scenarios

### Phase 2 — Polish & Local UX
- [ ] Color-coded terminal output (chalk)
- [ ] Save itinerary to a `.txt` or `.md` file
- [ ] Re-run / refine flow ("adjust my Day 2 plans")
- [ ] Handle "help me decide" destination with suggestions

### Phase 3 — Vercel Deployment
- [ ] Wrap logic in an Express or Next.js API route
- [ ] Build a minimal web UI (form → itinerary display)
- [ ] Deploy to Vercel; configure env variables in the dashboard
- [ ] Add rate limiting and basic error handling for production

---

## Key npm Packages

```json
{
  "dependencies": {
    "@anthropic-ai/sdk": "latest",
    "dotenv": "^16.0.0",
    "inquirer": "^9.0.0",
    "chalk": "^5.0.0",
    "cli-table3": "^0.6.0"
  }
}
```

---

## Open Questions / Future Ideas

- Should the app support saving and revisiting past trips?
- Add a map link (Google Maps / Apple Maps) for each day's route?
- Support voice input for questions in a future mobile version?
- Multi-language support for international users?
