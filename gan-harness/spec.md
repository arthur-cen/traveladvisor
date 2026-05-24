# Design Brief: Travel Advisor — Adventurer Redesign

## Context
The existing web frontend is at `/Users/arthurcen/Developer/TravelAdvisor/web/`. It uses:
- Next.js 16 App Router, React 19, TypeScript 5 strict, Tailwind CSS 3
- Claude Haiku for itinerary generation (streaming)
- Three-column layout: TripForm (30%) | ItineraryPanel (33%) | TravelMap (37%)
- Key files: `app/page.tsx`, `components/AppShell.tsx`, `components/trip/TripForm.tsx`, `components/chat/ChatPanel.tsx`, `components/itinerary/ItineraryPanel.tsx`, `components/map/TravelMap.tsx`
- Font: Plus Jakarta Sans (existing, can be supplemented)

## Goal
Redesign the UI with a bold **adventurer/expedition** visual direction. The current UI is functional but looks like a generic form app. The new design should feel like a premium adventure travel brand — think NatGeo meets modern SaaS.

## Design Direction
- **Style:** Dark luxury / expedition journal aesthetic
- **Color palette:** Deep forest greens, warm amber/gold accents, off-white parchment tones, charcoal blacks
- **Typography:** Pair a strong display serif (for headings) with a clean sans-serif for body — both from Google Fonts
- **Texture:** Subtle grain/noise overlay on backgrounds, topographic map pattern accents
- **Imagery/Icons:** Adventure iconography — compass, mountain, trail markers
- **Motion:** Smooth transitions on form steps, parallax hints, animated loading state during itinerary generation

## Requirements
1. Redesign the full page layout — keep the 3-column structure but make it feel immersive (full-viewport, no white box)
2. Restyle TripForm to feel like an expedition briefing form — not a generic web form
3. Restyle ItineraryPanel to feel like a field journal / expedition log
4. Loading/generation state should feel epic — not a spinner
5. Maintain all WCAG accessibility from the existing audit (aria-labels, focus rings, semantic HTML, aria-live regions)
6. Maintain all existing functionality — no regressions in form validation, conditional fields, streaming output
7. Use CSS custom properties for the design token system
8. Mobile-responsive

## Dev Server
```bash
cd /Users/arthurcen/Developer/TravelAdvisor/web && npm run dev
```
Access at http://localhost:3000
