'use client';

import { useEffect, useRef, useState } from 'react';
import type { Itinerary, TripAnswers } from '@/lib/types';
import { parseItinerary } from '@/lib/parseItinerary';

type Props = {
  tripAnswers: TripAnswers;
  onItineraryReady: (itinerary: Itinerary) => void;
  onStreamUpdate: (text: string) => void;
  onStreamingChange: (streaming: boolean) => void;
};

type Phase = 'generating' | 'done' | 'error';

export default function ChatPanel({ tripAnswers, onItineraryReady, onStreamUpdate, onStreamingChange }: Props) {
  const [phase, setPhase] = useState<Phase>('generating');
  const [retrying, setRetrying] = useState(false);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;
    generate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function generate() {
    setPhase('generating');
    onStreamingChange(true);
    let accumulated = '';

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: tripAnswers }),
      });

      if (!res.ok || !res.body) throw new Error('API error');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        onStreamUpdate(accumulated);
      }

      onStreamingChange(false);
      const parsed = parseItinerary(accumulated);
      if (parsed) {
        onItineraryReady(parsed);
      } else {
        onItineraryReady({
          type: 'single-day',
          destination: tripAnswers.destination,
          dates: tripAnswers.travelDates,
          days: [{ number: 1, activities: [{ time: 'Morning', name: 'Your Itinerary', description: accumulated.slice(0, 200) + '…' }] }],
        });
      }
      setPhase('done');
    } catch {
      onStreamingChange(false);
      setPhase('error');
    } finally {
      setRetrying(false);
    }
  }

  async function handleRetry() {
    setRetrying(true);
    hasStarted.current = false;
    await generate();
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="px-4 py-3 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span aria-hidden="true" className="text-rausch">✈️</span>
          <h2 className="font-bold text-hof text-sm">TravelAdvisor</h2>
        </div>
        <p className="text-foggy text-xs">
          {tripAnswers.origin} → {tripAnswers.destination}
          {' · '}{tripAnswers.travelDates}
          {' · '}{tripAnswers.days} {parseInt(tripAnswers.days) === 1 ? 'day' : 'days'}
        </p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-4">
        {phase === 'generating' && (
          <div role="status" aria-live="polite" aria-label="Generating itinerary" className="flex flex-col items-center gap-4">
            <div className="flex gap-1.5" aria-hidden="true">
              <span className="w-2.5 h-2.5 rounded-full bg-rausch animate-bounce motion-reduce:animate-none" style={{ animationDelay: '0ms' }} />
              <span className="w-2.5 h-2.5 rounded-full bg-rausch animate-bounce motion-reduce:animate-none" style={{ animationDelay: '150ms' }} />
              <span className="w-2.5 h-2.5 rounded-full bg-rausch animate-bounce motion-reduce:animate-none" style={{ animationDelay: '300ms' }} />
            </div>
            <div>
              <p className="font-semibold text-hof text-sm">Planning your trip…</p>
              <p className="text-foggy text-xs mt-1">Building your {tripAnswers.destination} itinerary</p>
            </div>
          </div>
        )}

        {phase === 'done' && (
          <div role="status" aria-live="polite" className="flex flex-col items-center gap-4">
            <span aria-hidden="true" className="text-4xl">🗺️</span>
            <div>
              <p className="font-semibold text-hof text-sm">Itinerary ready!</p>
              <p className="text-foggy text-xs mt-1">Review your plan in the panel →</p>
            </div>
          </div>
        )}

        {phase === 'error' && (
          <div role="alert" aria-live="assertive" className="flex flex-col items-center gap-4">
            <span aria-hidden="true" className="text-3xl">⚠️</span>
            <div>
              <p className="font-semibold text-hof text-sm">Something went wrong</p>
              <p className="text-foggy text-xs mt-1 mb-3">Could not generate your itinerary</p>
              <button
                onClick={handleRetry}
                disabled={retrying}
                aria-busy={retrying}
                className="px-4 py-2 bg-rausch text-white text-xs font-semibold rounded-xl hover:bg-kazan disabled:opacity-60 transition-colors"
              >
                {retrying ? 'Retrying…' : 'Try again'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
