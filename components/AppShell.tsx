'use client';

import { useState, useCallback } from 'react';
import type { GeoPoint, Itinerary, TripAnswers } from '@/lib/types';
import TripForm from './trip/TripForm';
import ChatPanel from './chat/ChatPanel';
import ItineraryPanel from './itinerary/ItineraryPanel';
import PanelHandle from './layout/PanelHandle';
import { parseItinerary } from '@/lib/parseItinerary';
import dynamic from 'next/dynamic';

const TravelMap = dynamic(() => import('./map/TravelMap'), { ssr: false });

export default function AppShell() {
  const [tripAnswers, setTripAnswers] = useState<TripAnswers | null>(null);
  const [originPoint, setOriginPoint] = useState<GeoPoint>();
  const [destPoint, setDestPoint] = useState<GeoPoint>();
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamText, setStreamText] = useState('');

  // Panel state
  const [leftOpen, setLeftOpen] = useState(true);
  const [mapExpanded, setMapExpanded] = useState(false);

  // Chat refinement handler — re-generates itinerary with user's modification request
  const handleChatSend = useCallback(async (message: string) => {
    if (!tripAnswers || isStreaming) return;

    setIsStreaming(true);
    setItinerary(null);
    setStreamText('');

    let accumulated = '';

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: tripAnswers,
          refinement: message,
        }),
      });

      if (!res.ok || !res.body) throw new Error('API error');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setStreamText(accumulated);
      }

      setIsStreaming(false);
      const parsed = parseItinerary(accumulated);
      if (parsed) {
        setItinerary(parsed);
      } else {
        setItinerary({
          type: 'single-day',
          destination: tripAnswers.destination,
          dates: tripAnswers.travelDates,
          days: [
            {
              number: 1,
              activities: [
                {
                  time: 'Morning',
                  name: 'Your Itinerary',
                  description: accumulated.slice(0, 200) + '…',
                },
              ],
            },
          ],
        });
      }
    } catch {
      setIsStreaming(false);
    }
  }, [tripAnswers, isStreaming]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-charcoal text-cream">
      {/* LEFT — Sidebar (collapsible) */}
      <section
        aria-label="Trip planner"
        className={`panel-sidebar flex flex-col w-[30%] min-w-[300px] overflow-hidden relative bg-topo${
          !leftOpen ? ' is-collapsed' : ''
        }`}
        style={{
          borderRight: '1px solid var(--border-amber)',
        }}
      >
        {/* Brand header */}
        <header className="flex-shrink-0 px-5 pt-5 pb-3 relative">
          <div className="flex items-baseline gap-2">
            <span
              className="exp-eyebrow"
              style={{ color: 'var(--bone)' }}
            >
              Est. MMXXIV
            </span>
            <span className="ml-auto exp-eyebrow flex items-center gap-1.5" aria-hidden="true">
              <span style={{ color: 'var(--amber)' }}>✦</span>
              <span style={{ color: 'var(--bone)' }}>N 40.7°</span>
            </span>
          </div>
          <h1 className="display-serif text-2xl mt-1 leading-none" style={{ color: 'var(--cream-text)' }}>
            Expedition
          </h1>
          <p className="exp-eyebrow mt-1" style={{ color: 'var(--amber)' }}>
            Travel&nbsp;Advisor &middot; Field&nbsp;Bureau
          </p>
          <div className="exp-rule mt-3" aria-hidden="true">
            <span className="exp-rule-dot" />
          </div>
        </header>

        <div className="flex-1 min-h-0 overflow-hidden">
          {!tripAnswers ? (
            <TripForm
              onSubmit={setTripAnswers}
              onDestinationGeocoded={setDestPoint}
              onOriginGeocoded={setOriginPoint}
            />
          ) : (
            <ChatPanel
              key={`${tripAnswers.origin}-${tripAnswers.destination}`}
              tripAnswers={tripAnswers}
              onItineraryReady={(parsed) => {
                setItinerary(parsed);
                setIsStreaming(false);
                setStreamText('');
              }}
              onStreamUpdate={setStreamText}
              onStreamingChange={setIsStreaming}
            />
          )}
        </div>
      </section>

      {/* Left panel handle — always visible */}
      <PanelHandle
        side="left"
        isOpen={leftOpen}
        onToggle={() => setLeftOpen(o => !o)}
        label="Toggle trip planner sidebar"
      />

      {/* CENTER — Itinerary canvas (auto-expands) */}
      <main
        aria-label="Itinerary"
        className="flex flex-col flex-1 min-w-[320px] overflow-hidden relative"
        style={{
          background: 'var(--charcoal-mid)',
        }}
      >
        <div
          className="px-5 py-3 flex-shrink-0 flex items-center justify-between"
          style={{ borderBottom: '1px solid var(--border-amber)', background: 'var(--charcoal)' }}
        >
          <span className="exp-eyebrow" style={{ color: 'var(--amber)' }}>
            <span aria-hidden="true" className="mr-1.5">✦</span>
            Field Journal
          </span>
          <span className="exp-eyebrow" style={{ color: 'var(--bone)' }}>
            Vol. I
          </span>
        </div>
        <div className="flex-1 overflow-hidden">
          <ItineraryPanel
            itinerary={itinerary}
            isStreaming={isStreaming}
            streamText={streamText}
            onChatSend={tripAnswers ? handleChatSend : undefined}
          />
        </div>
      </main>

      {/* Map panel handle */}
      <PanelHandle
        side="right"
        isOpen={!mapExpanded}
        onToggle={() => setMapExpanded(e => !e)}
        label="Toggle map size"
      />

      {/* RIGHT — Map column (expandable) */}
      <aside
        aria-label="Trip map"
        className="overflow-hidden relative transition-all duration-300"
        style={{
          flex: mapExpanded ? '0 0 55%' : '0 0 30%',
        }}
      >
        <TravelMap origin={originPoint} destination={destPoint} />
        {/* Subtle vignette overlay for atmospheric feel */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.35) 100%)',
          }}
        />
        {/* Cartographic corner marker */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-4 right-4 exp-eyebrow flex items-center gap-2"
          style={{ color: 'var(--amber)', textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}
        >
          <span>Survey</span>
          <span style={{ color: 'var(--cream-dim)' }}>—</span>
          <span style={{ color: 'var(--cream-dim)' }}>1:250k</span>
        </div>
      </aside>
    </div>
  );
}
