'use client';

import { useState } from 'react';
import type { GeoPoint, Itinerary, TripAnswers } from '@/lib/types';
import TripForm from './trip/TripForm';
import ChatPanel from './chat/ChatPanel';
import ItineraryPanel from './itinerary/ItineraryPanel';
import dynamic from 'next/dynamic';

const TravelMap = dynamic(() => import('./map/TravelMap'), { ssr: false });

export default function AppShell() {
  const [tripAnswers, setTripAnswers] = useState<TripAnswers | null>(null);
  const [originPoint, setOriginPoint] = useState<GeoPoint>();
  const [destPoint, setDestPoint] = useState<GeoPoint>();
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamText, setStreamText] = useState('');

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-charcoal text-cream">
      {/* LEFT — Form or planning status */}
      <section
        aria-label="Trip planner"
        className="flex flex-col w-[30%] min-w-[300px] overflow-hidden relative bg-topo"
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

      {/* CENTER — Itinerary column */}
      <main
        aria-label="Itinerary"
        className="flex flex-col w-[33%] min-w-[320px] overflow-hidden relative"
        style={{
          background: 'var(--charcoal-mid)',
          borderRight: '1px solid var(--border-amber)',
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
          />
        </div>
      </main>

      {/* RIGHT — Map column */}
      <aside aria-label="Trip map" className="flex-1 min-w-0 overflow-hidden relative">
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
