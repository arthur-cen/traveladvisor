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
    <div className="flex h-screen w-screen overflow-hidden bg-bg-light">

      {/* LEFT — Form or planning status */}
      <section aria-label="Trip planner" className="flex flex-col w-[30%] min-w-[280px] border-r border-border bg-white overflow-hidden">
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
      </section>

      {/* CENTER — Itinerary column */}
      <main aria-label="Itinerary" className="flex flex-col w-[33%] min-w-[300px] border-r border-border bg-bg-light overflow-hidden">
        <div className="px-4 py-2.5 border-b border-border bg-white flex-shrink-0">
          <span className="text-xs font-semibold text-foggy uppercase tracking-wider">Itinerary</span>
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
      <aside aria-label="Trip map" className="flex-1 min-w-0 overflow-hidden">
        <TravelMap origin={originPoint} destination={destPoint} />
      </aside>

    </div>
  );
}
