# TravelAdvisor

An AI-powered expedition planning web app. Fill in where you're going, pick your travel style, and get a fully personalised itinerary — streamed live from Claude — displayed alongside an interactive Mapbox map.

---

## Features

- **Live location autocomplete** — type 2+ characters into the Origin or Destination field; a styled dropdown pulls from the Mapbox Geocoding API with keyboard navigation (↑ ↓ Enter Esc)
- **Interactive map** — markers update in real time as you fill in the form; route is fitted to bounds when both points are geocoded
- **AI-generated itinerary** — Claude (claude-sonnet-4-6) streams a personalised single-day or multi-day itinerary based on your answers
- **Adaptive format** — single-day format for 1-day trips, full multi-day breakdown for 2+ days
- **Expedition design system** — dark charcoal + amber palette, Playfair Display headings, subtle animations

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + custom CSS design tokens |
| AI | Anthropic Claude via `@anthropic-ai/sdk` (streaming) |
| Maps | Mapbox GL JS |
| Fonts | Playfair Display · Inter · JetBrains Mono (Google Fonts) |

---

## Prerequisites

- **Node.js** ≥ 18
- An **Anthropic API key** — [console.anthropic.com](https://console.anthropic.com)
- A **Mapbox access token** — [account.mapbox.com](https://account.mapbox.com/access-tokens/)

---

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/your-username/TravelAdvisor.git
cd TravelAdvisor
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root:

```bash
cp .env.example .env.local   # if an example exists, otherwise create manually
```

Add the following keys to `.env.local`:

```env
# Anthropic — used server-side by the /api/chat route
ANTHROPIC_API_KEY=sk-ant-...

# Mapbox — server-side token for geocoding API routes
MAPBOX_TOKEN=pk.eyJ1...

# Mapbox — public token for the Mapbox GL map in the browser
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1...
```

> **Note:** `MAPBOX_TOKEN` and `NEXT_PUBLIC_MAPBOX_TOKEN` can be the same token. The server-side variable keeps it out of the client bundle for the geocoding API routes.

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
TravelAdvisor/
├── app/
│   ├── api/
│   │   ├── chat/route.ts          # Streams Claude itinerary response
│   │   └── geocode/
│   │       ├── route.ts           # Single-location geocode (blur fallback)
│   │       └── suggest/route.ts   # Live autocomplete suggestions (6 results)
│   ├── globals.css                # Design tokens, component styles
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── AppShell.tsx               # Root layout: sidebar + map split
│   ├── chat/                      # Chat panel components
│   ├── itinerary/                 # Itinerary card components
│   ├── map/
│   │   └── TravelMap.tsx          # Mapbox GL map with animated markers
│   └── trip/
│       ├── TripForm.tsx           # Expedition planning form
│       └── LocationAutocomplete.tsx  # Debounced autocomplete input
├── lib/
│   ├── buildTripContext.ts        # Serialises form answers → Claude prompt block
│   ├── parseItinerary.ts          # Parses Claude text output → structured data
│   ├── questions.ts               # Question definitions
│   └── types.ts                   # Shared TypeScript types
├── CLAUDE.md                      # Codebase guide (AI assistant context)
├── DEVELOPER_PLAN.md              # Product spec, output formats, roadmap
└── README.md                      # This file
```

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server (hot reload) |
| `npm run build` | Build for production |
| `npm start` | Start the production server (after build) |
| `npm run lint` | Run ESLint |

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | ✅ | Server-side key for Claude API calls |
| `MAPBOX_TOKEN` | ✅ | Server-side Mapbox token for geocoding routes |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | ✅ | Client-side Mapbox token for the map widget |

---

## How It Works

1. **User fills the form** — origin, destination, dates, party size, budget, style
2. **Live autocomplete** — each location field fetches suggestions from `/api/geocode/suggest` (300ms debounce, AbortController per keystroke); selecting a result immediately geocodes and pins the location on the map
3. **Form submission** — answers are serialised into a structured `[Trip Context]` block
4. **Claude streams the itinerary** — `/api/chat` sends the context to Claude; the response is streamed as Server-Sent Events and displayed token-by-token
5. **Map updates** — once both locations are geocoded, the map fits to show the full route

---

## Roadmap

See [`DEVELOPER_PLAN.md`](./DEVELOPER_PLAN.md) for the full phased roadmap.

- [x] Phase 1 — Web MVP with form, map, and streaming AI itinerary
- [x] Location autocomplete with keyboard navigation and ARIA
- [ ] Save itinerary to `.md` file
- [ ] Refine / adjust flow ("change Day 2")
- [ ] Vercel deployment with rate limiting
