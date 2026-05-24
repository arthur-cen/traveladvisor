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

export default function ChatPanel({
  tripAnswers,
  onItineraryReady,
  onStreamUpdate,
  onStreamingChange,
}: Props) {
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

  const days = parseInt(tripAnswers.days);

  return (
    <div className="flex flex-col h-full">
      {/* Briefing header */}
      <div
        className="px-5 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border-amber)' }}
      >
        <div className="exp-eyebrow mb-1.5" style={{ color: 'var(--amber)' }}>
          <span aria-hidden="true" className="mr-1.5">✦</span>
          Dispatched Brief
        </div>
        <p
          className="text-sm font-semibold flex items-center gap-2 flex-wrap"
          style={{ color: 'var(--cream-text)' }}
        >
          <span>{tripAnswers.origin}</span>
          <span style={{ color: 'var(--amber)' }} aria-hidden="true">⟶</span>
          <span className="display-serif text-base" style={{ color: 'var(--amber-glow)' }}>
            {tripAnswers.destination}
          </span>
        </p>
        <p
          className="mono text-[11px] mt-1"
          style={{ color: 'var(--bone)' }}
        >
          {tripAnswers.travelDates} · {tripAnswers.days} {days === 1 ? 'day' : 'days'}
        </p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-6">
        {phase === 'generating' && (
          <div
            role="status"
            aria-live="polite"
            aria-label="Generating itinerary"
            className="flex flex-col items-center gap-6 anim-fade-up"
          >
            <CompassLoader />
            <div>
              <p
                className="display-serif text-lg leading-tight"
                style={{ color: 'var(--cream-text)' }}
              >
                Charting your expedition…
              </p>
              <p
                className="exp-eyebrow mt-2"
                style={{ color: 'var(--amber)' }}
              >
                Surveying {tripAnswers.destination}
              </p>
              <p
                className="text-xs mt-3 leading-relaxed max-w-[240px] mx-auto"
                style={{ color: 'var(--cream-dim)' }}
              >
                Consulting field reports, local lore, and seasonal almanacs.
              </p>
            </div>
          </div>
        )}

        {phase === 'done' && (
          <div
            role="status"
            aria-live="polite"
            className="flex flex-col items-center gap-4 anim-fade-up"
          >
            <div
              className="flex items-center justify-center w-16 h-16"
              style={{
                border: '1px solid var(--border-amber-strong)',
                borderRadius: '50%',
                background: 'rgba(212,168,83,0.06)',
              }}
              aria-hidden="true"
            >
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                <path
                  d="M6 14.5 L12 20 L23 8"
                  stroke="var(--amber)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <p
                className="exp-eyebrow"
                style={{ color: 'var(--amber)' }}
              >
                Itinerary Ready
              </p>
              <p
                className="display-serif text-xl mt-1.5"
                style={{ color: 'var(--cream-text)' }}
              >
                Your route is charted.
              </p>
              <p className="text-xs mt-2" style={{ color: 'var(--cream-dim)' }}>
                Review the field journal →
              </p>
            </div>
          </div>
        )}

        {phase === 'error' && (
          <div
            role="alert"
            aria-live="assertive"
            className="flex flex-col items-center gap-4 anim-fade-up"
          >
            <div
              className="flex items-center justify-center w-14 h-14"
              style={{
                border: '1px solid var(--danger)',
                borderRadius: '50%',
                color: 'var(--danger)',
                fontSize: 24,
              }}
              aria-hidden="true"
            >
              ⚠
            </div>
            <div>
              <p
                className="exp-eyebrow"
                style={{ color: 'var(--danger)' }}
              >
                Expedition Failed
              </p>
              <p
                className="display-serif text-base mt-1.5"
                style={{ color: 'var(--cream-text)' }}
              >
                The dispatch was lost in transit.
              </p>
              <p className="text-xs mt-2 mb-4" style={{ color: 'var(--cream-dim)' }}>
                Try again — the wire may have been crossed.
              </p>
              <button
                onClick={handleRetry}
                disabled={retrying}
                aria-busy={retrying}
                className="exp-btn-secondary"
              >
                {retrying ? 'Re-dispatching…' : '↻ Try Again'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Animated compass loader ────────────────────────────── */

function CompassLoader() {
  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: 140, height: 140 }}
      aria-hidden="true"
    >
      {/* Expanding rings */}
      <span
        className="absolute inset-0 anim-ring"
        style={{
          border: '1px solid var(--amber)',
          borderRadius: '50%',
          animationDelay: '0s',
        }}
      />
      <span
        className="absolute inset-0 anim-ring"
        style={{
          border: '1px solid var(--amber)',
          borderRadius: '50%',
          animationDelay: '0.7s',
        }}
      />
      <span
        className="absolute inset-0 anim-ring"
        style={{
          border: '1px solid var(--amber)',
          borderRadius: '50%',
          animationDelay: '1.4s',
        }}
      />

      {/* Compass body */}
      <svg width="110" height="110" viewBox="0 0 110 110" fill="none">
        {/* Outer dial */}
        <circle
          cx="55"
          cy="55"
          r="52"
          stroke="var(--border-amber-strong)"
          strokeWidth="1"
          fill="var(--charcoal)"
        />
        <circle
          cx="55"
          cy="55"
          r="46"
          stroke="var(--border-amber)"
          strokeWidth="0.5"
          fill="none"
        />

        {/* Tick marks group — slow rotation */}
        <g className="anim-compass-slow" style={{ transformOrigin: '55px 55px' }}>
          {Array.from({ length: 36 }).map((_, i) => {
            const angle = (i * 360) / 36;
            const isMajor = i % 9 === 0;
            return (
              <line
                key={i}
                x1="55"
                y1={isMajor ? 6 : 9}
                x2="55"
                y2="12"
                stroke="var(--amber)"
                strokeWidth={isMajor ? 1.2 : 0.5}
                opacity={isMajor ? 1 : 0.45}
                transform={`rotate(${angle} 55 55)`}
              />
            );
          })}
        </g>

        {/* Cardinal markers */}
        <text
          x="55"
          y="22"
          textAnchor="middle"
          fontFamily="Playfair Display, serif"
          fontSize="11"
          fontWeight="800"
          fill="var(--amber-glow)"
        >
          N
        </text>
        <text
          x="55"
          y="95"
          textAnchor="middle"
          fontFamily="Playfair Display, serif"
          fontSize="9"
          fontWeight="700"
          fill="var(--bone)"
        >
          S
        </text>
        <text
          x="93"
          y="59"
          textAnchor="middle"
          fontFamily="Playfair Display, serif"
          fontSize="9"
          fontWeight="700"
          fill="var(--bone)"
        >
          E
        </text>
        <text
          x="17"
          y="59"
          textAnchor="middle"
          fontFamily="Playfair Display, serif"
          fontSize="9"
          fontWeight="700"
          fill="var(--bone)"
        >
          W
        </text>

        {/* Compass needle — wobbling */}
        <g className="anim-compass-needle" style={{ transformOrigin: '55px 55px' }}>
          <polygon
            points="55,16 49,55 55,52 61,55"
            fill="var(--amber-glow)"
            stroke="var(--amber-warm)"
            strokeWidth="0.5"
          />
          <polygon
            points="55,94 49,55 55,58 61,55"
            fill="var(--charcoal-light)"
            stroke="var(--bone)"
            strokeWidth="0.5"
          />
          <circle cx="55" cy="55" r="3.5" fill="var(--charcoal)" stroke="var(--amber)" strokeWidth="1" />
          <circle cx="55" cy="55" r="1" fill="var(--amber-glow)" />
        </g>
      </svg>
    </div>
  );
}
