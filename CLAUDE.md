# TravelAdvisor — CLAUDE.md

> Codebase guide for Claude Code. Read this before touching any file.

---

## Quick Reference: Run the App

```bash
# Install dependencies (first time only)
npm install

# Copy env template and add your API key
cp .env.example .env
# Edit .env and set: ANTHROPIC_API_KEY=sk-ant-...

# Run the app
npm start

# Run with debug trace logs
node index.js --debug
```

---

## Project Overview

A conversational CLI trip-planning assistant. The user answers a guided Q&A (via Inquirer.js), and the app sends the structured answers to Claude (claude-sonnet-4-6) to generate a tailored itinerary. Output format is adaptive: single-day format for 1-day trips, multi-day format for 2+ day trips.

See `DEVELOPER_PLAN.md` for the full product specification, output format definitions, and phased roadmap.

---

## Tech Stack

| Layer | Package | Version |
|---|---|---|
| Runtime | Node.js | ESM (`"type": "module"`) |
| AI / LLM | `@anthropic-ai/sdk` | latest |
| Terminal Q&A | `inquirer` | ^9.3.0 |
| Terminal colors | `chalk` | ^5.3.0 |
| Env config | `dotenv` | ^16.4.0 |
| Table output | `cli-table3` | ^0.6.3 |

All imports use ES module syntax (`import`/`export`). Do not use `require()`.

---

## File Map

```
TravelAdvisor/
├── index.js                  # Entry point — orchestrates the full flow
├── src/
│   ├── questionnaire.js      # Inquirer question definitions (core + conditional follow-ups)
│   ├── planner.js            # Calls Claude API with streaming; injects system prompt + trip context
│   ├── formatter.js          # Streams Claude output to stdout with chalk decoration
│   ├── utils.js              # buildTripContext() — serializes answers into the [Trip Context] block
│   └── debug.js              # isDebug flag + trace() helper (activated via --debug flag)
├── prompts/
│   └── system_prompt.txt     # Claude system prompt — output format rules, constraint enforcement
├── .env                      # ANTHROPIC_API_KEY (not committed)
├── .env.example              # Key template (committed; safe to share)
├── package.json
├── DEVELOPER_PLAN.md         # Full product spec, output formats, roadmap
└── CLAUDE.md                 # This file
```

---

## Architecture: Data Flow

```
index.js
  └─ runQuestionnaire()         (questionnaire.js)   → answers object
  └─ buildItinerary(answers)    (planner.js)
       └─ buildTripContext()    (utils.js)            → [Trip Context] string
       └─ client.messages.stream(...)                 → AsyncIterable stream
  └─ displayItinerary(stream)   (formatter.js)        → streams text to stdout
```

---

## Key Design Decisions

**Prompt caching** — The system prompt in `planner.js` uses `cache_control: { type: 'ephemeral' }`. This reduces latency and cost on repeated calls since the system prompt is large and static.

**Streaming** — The Claude response is streamed via `client.messages.stream()`. `formatter.js` iterates `content_block_delta` events and writes each `text_delta` directly to `process.stdout` so the user sees output as it arrives.

**Conditional questions** — `questionnaire.js` uses Inquirer's `when` property to show follow-up questions only when relevant (e.g., accommodation only for multi-day trips, fitness level only for adventure/nature trips).

**Adaptive output format** — The system prompt in `prompts/system_prompt.txt` instructs Claude to use single-day or multi-day format based on the `Dates` field in the trip context. The format definitions are authoritative; do not modify them without updating the system prompt.

**ESM-only** — `package.json` sets `"type": "module"`. All files use `import`/`export`. `__dirname` is unavailable natively; `planner.js` reconstructs it with `fileURLToPath` + `dirname`.

---

## Environment Setup

`.env` must contain:

```
ANTHROPIC_API_KEY=sk-ant-...
```

`planner.js` throws a descriptive error at startup if the key is missing. Never commit `.env` — it is in `.gitignore`.

---

## Implemented (Phase 1 — Complete)

- [x] Project scaffold with ESM and all dependencies
- [x] `.env` / `.env.example` setup
- [x] `questionnaire.js` — all 8 core questions + 7 conditional follow-ups
- [x] `planner.js` — Claude API call with streaming and prompt caching
- [x] `formatter.js` — streams itinerary to terminal with chalk header/footer
- [x] `utils.js` — `buildTripContext()` serializes all answers into the prompt block
- [x] `debug.js` — `--debug` flag for trace logging throughout the pipeline
- [x] `prompts/system_prompt.txt` — full output format rules and constraint enforcement
- [x] `index.js` — end-to-end orchestration with error handling

## Not Yet Implemented (Phase 2 / 3)

- [ ] Save itinerary to `.txt` / `.md` file
- [ ] Re-run / refine flow ("adjust my Day 2 plans")
- [ ] "Help me decide" destination suggestions (Claude handles this via system prompt already, but no special UI)
- [ ] Express API wrapper for Vercel deployment
- [ ] Web frontend (Phase 3)

---

## Common Commands

```bash
# Install / update dependencies
npm install

# Run normally
npm start

# Run with full debug trace
node index.js --debug

# Check installed package versions
npm list --depth=0

# Add a new package
npm install <package-name>
```

---

## Constraints to Respect

- **Always ask questions before generating** — the Q&A flow is mandatory; never skip it or auto-fill answers.
- **Adaptive output format** — single-day vs multi-day is determined by the `days` answer; the system prompt enforces the correct format.
- **Support short and long-distance trips** — no assumptions about distance; the questionnaire covers both.
- **Node.js / npm ecosystem** — do not introduce Python, Bun, or Deno tooling.
- **Vercel-compatible structure** — keep business logic in clean service modules (`src/`) so Phase 3 deployment requires minimal refactoring.
