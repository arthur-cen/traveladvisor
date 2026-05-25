'use client';

import { useState, useCallback, useEffect } from 'react';
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
  const [mapOpen, setMapOpen] = useState(true);

  // Hoisted active itinerary tab state
  const [activeTab, setActiveTab] = useState(0);

  // Coordinates of the active day location (geocoded dynamic map target)
  const [activeLocationPoint, setActiveLocationPoint] = useState<GeoPoint>();

  // Geocode active day location when activeTab or itinerary changes
  useEffect(() => {
    if (!itinerary) {
      setActiveLocationPoint(undefined);
      return;
    }

    let locationName = '';
    if (itinerary.type === 'multi-day' && activeTab < itinerary.days.length) {
      locationName = itinerary.days[activeTab]?.location || '';
    }

    if (!locationName) {
      setActiveLocationPoint(undefined);
      return;
    }

    let active = true;
    async function fetchLocation() {
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(locationName)}`);
        if (!res.ok) return;
        const data = await res.json();
        if (active) {
          setActiveLocationPoint({
            lat: data.latitude,
            lng: data.longitude,
            placeName: data.placeName,
          });
        }
      } catch (err) {
        console.error('Failed to geocode day location:', err);
      }
    }

    fetchLocation();

    return () => {
      active = false;
    };
  }, [itinerary, activeTab]);

  // Chat refinement handler — re-generates itinerary with user's modification request
  const handleChatSend = useCallback(async (message: string) => {
    if (!tripAnswers || isStreaming) return;

    setIsStreaming(true);
    setItinerary(null);
    setStreamText('');
    setActiveTab(0); // Reset day tab to first day when refining

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
          borderRight: leftOpen ? '1px solid var(--border-amber)' : 'none',
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
                setLeftOpen(false); // Collapse sidebar automatically when planning is done
                setActiveTab(0); // Reset day tab to first day
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
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onChatSend={tripAnswers ? handleChatSend : undefined}
          />
        </div>
      </main>

      {/* Map panel handle */}
      <PanelHandle
        side="right"
        isOpen={mapOpen}
        onToggle={() => setMapOpen(o => !o)}
        label="Toggle map panel visibility"
      />

      {/* RIGHT — Map column (collapsible) */}
      <aside
        aria-label="Trip map"
        className="overflow-hidden relative transition-all duration-300"
        style={{
          flex: mapOpen ? '0 0 30%' : '0 0 0%',
          borderLeft: mapOpen ? '1px solid var(--border-amber)' : 'none',
        }}
      >
        <TravelMap origin={originPoint} destination={destPoint} activeLocation={activeLocationPoint} />
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
