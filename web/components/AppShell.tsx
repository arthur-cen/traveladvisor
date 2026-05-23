'use client';

import { useState } from 'react';
import type { GeoPoint, Itinerary, TripAnswers } from '@/lib/types';
import TripForm from './trip/TripForm';
import ChatPanel from './chat/ChatPanel';
import ItineraryPanel from './itinerary/ItineraryPanel';
import dynamic from 'next/dynamic';

const TravelMap = dynamic(() => import('./map/TravelMap'), { ssr: false });

type TripBasics = Pick<TripAnswers, 'origin' | 'destination' | 'travelDates' | 'days'>;

export default function AppShell() {
  const [tripBasics, setTripBasics] = useState<TripBasics | null>(null);
  const [originPoint, setOriginPoint] = useState<GeoPoint>();
  const [destPoint, setDestPoint] = useState<GeoPoint>();
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamText, setStreamText] = useState('');

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg-light">

      {/* LEFT — Chat column */}
      <div className="flex flex-col w-[30%] min-w-[280px] border-r border-border bg-white overflow-hidden">
        <TripForm
          onSubmit={setTripBasics}
          onDestinationGeocoded={setDestPoint}
          onOriginGeocoded={setOriginPoint}
        />

        <div className="flex-1 overflow-hidden">
          {tripBasics ? (
            <ChatPanel
              key={`${tripBasics.origin}-${tripBasics.destination}`}
              tripBasics={tripBasics}
              onItineraryReady={(parsed) => {
                setItinerary(parsed);
                setIsStreaming(false);
                setStreamText('');
              }}
              onStreamUpdate={setStreamText}
              onStreamingChange={setIsStreaming}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center px-6 gap-3">
              <span className="text-4xl">👋</span>
              <p className="font-semibold text-hof text-sm">
                Fill in your trip details above to get started
              </p>
              <p className="text-foggy text-xs">
                I&apos;ll ask a few quick questions, then build your perfect itinerary.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* CENTER — Itinerary column */}
      <div className="flex flex-col w-[33%] min-w-[300px] border-r border-border bg-bg-light overflow-hidden">
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
      </div>

      {/* RIGHT — Map column */}
      <div className="flex-1 min-w-0 overflow-hidden">
        <TravelMap origin={originPoint} destination={destPoint} />
      </div>

    </div>
  );
}
