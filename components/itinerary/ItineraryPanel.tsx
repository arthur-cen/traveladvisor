'use client';

import { useState } from 'react';
import type { Itinerary } from '@/lib/types';
import ActivityCard from './ActivityCard';
import ChatInput from '../chat/ChatInput';

type Props = {
  itinerary: Itinerary | null;
  isStreaming?: boolean;
  streamText?: string;
  onChatSend?: (message: string) => void;
};

export default function ItineraryPanel({ itinerary, isStreaming, streamText, onChatSend }: Props) {
  const [activeTab, setActiveTab] = useState(0);

  /* ─── Empty state ────────────────────────────────────── */
  if (!itinerary && !isStreaming) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-8 gap-5 bg-topo-faint">
        <div className="relative" aria-hidden="true">
          <svg width="74" height="74" viewBox="0 0 74 74" fill="none">
            <circle cx="37" cy="37" r="34" stroke="var(--border-amber)" strokeWidth="1" />
            <circle cx="37" cy="37" r="28" stroke="var(--border-amber)" strokeWidth="0.5" />
            <polygon
              points="37,12 33,37 37,35 41,37"
              fill="var(--amber)"
              opacity="0.9"
            />
            <polygon
              points="37,62 33,37 37,39 41,37"
              fill="var(--charcoal-light)"
            />
            <circle cx="37" cy="37" r="2.5" fill="var(--charcoal)" stroke="var(--amber)" strokeWidth="1" />
            <text x="37" y="9" textAnchor="middle" fontSize="7" fontWeight="700" fill="var(--amber-glow)" fontFamily="Playfair Display, serif">N</text>
          </svg>
        </div>
        <div className="max-w-[280px]">
          <p className="exp-eyebrow" style={{ color: 'var(--amber)' }}>
            The Journal Awaits
          </p>
          <h2
            className="display-serif text-2xl mt-2 leading-tight"
            style={{ color: 'var(--cream-text)' }}
          >
            Expedition Log
          </h2>
          <p
            className="text-xs mt-3 leading-relaxed"
            style={{ color: 'var(--cream-dim)' }}
          >
            Furnish your brief on the left. Once dispatched, your route, daily entries,
            and field observations will appear here.
          </p>
        </div>
        <div className="exp-rule w-32" aria-hidden="true">
          <span className="exp-rule-dot" />
        </div>
      </div>
    );
  }

  /* ─── Streaming state ────────────────────────────────── */
  if (isStreaming && !itinerary) {
    return (
      <div className="flex flex-col h-full">
        <div
          className="px-5 py-3 flex items-center justify-between"
          style={{ borderBottom: '1px solid var(--border-amber)', background: 'var(--charcoal)' }}
        >
          <div
            className="flex items-center gap-2"
            aria-live="polite"
            aria-label="Building itinerary"
          >
            <span
              className="inline-block w-1.5 h-1.5 anim-cursor"
              style={{ background: 'var(--amber)' }}
              aria-hidden="true"
            />
            <span className="exp-eyebrow" style={{ color: 'var(--amber)' }}>
              Logging Route…
            </span>
          </div>
          <span className="exp-eyebrow" style={{ color: 'var(--bone)' }}>
            Live Dispatch
          </span>
        </div>
        {/* Shimmer line */}
        <div
          className="h-px anim-shimmer flex-shrink-0"
          aria-hidden="true"
        />
        <div className="flex-1 overflow-y-auto px-5 py-4 bg-topo-faint">
          <pre
            className="mono text-[11px] leading-relaxed whitespace-pre-wrap"
            style={{ color: 'var(--cream-dim)' }}
          >
            {streamText}
            <span
              className="anim-cursor inline-block"
              aria-hidden="true"
              style={{ color: 'var(--amber)' }}
            >
              ▍
            </span>
          </pre>
        </div>
      </div>
    );
  }

  if (!itinerary) return null;

  const selectedDay = itinerary.days[activeTab] ?? itinerary.days[0];
  const hasSummary = itinerary.type === 'multi-day' && itinerary.summary;
  const hasPractical = itinerary.type === 'single-day' && itinerary.practicalInfo;

  /* ─── Tabbed itinerary view ──────────────────────────── */
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Destination header */}
      <div
        className="px-5 py-4 flex-shrink-0 relative"
        style={{
          background: 'var(--charcoal)',
          borderBottom: '1px solid var(--border-amber)',
        }}
      >
        <div className="exp-eyebrow mb-1" style={{ color: 'var(--amber)' }}>
          <span aria-hidden="true" className="mr-1.5">✦</span>
          Field Journal · Vol. I
        </div>
        <h2
          className="display-serif text-2xl leading-tight"
          style={{ color: 'var(--cream-text)' }}
        >
          {itinerary.destination}
        </h2>
        <p
          className="mono text-[11px] mt-1.5"
          style={{ color: 'var(--bone)' }}
        >
          {itinerary.dates}
        </p>
      </div>

      {/* Day tabs */}
      <div className="day-tabs" role="tablist" aria-label="Itinerary days">
        {itinerary.days.map((day, i) => {
          const dayLabel = String(day.number).padStart(2, '0');
          return (
            <button
              key={day.number}
              role="tab"
              aria-selected={i === activeTab}
              aria-controls={`day-panel-${day.number}`}
              id={`day-tab-${day.number}`}
              className={`day-tab${i === activeTab ? ' is-active' : ''}`}
              onClick={() => setActiveTab(i)}
            >
              <span className="day-tab__number">{dayLabel}</span>
              {day.theme && (
                <span className="hidden sm:inline">{day.theme}</span>
              )}
              {!day.theme && <span>Day {dayLabel}</span>}
            </button>
          );
        })}
        {(hasSummary || hasPractical) && (
          <button
            role="tab"
            aria-selected={activeTab === itinerary.days.length}
            aria-controls="overview-panel"
            id="overview-tab"
            className={`day-tab${activeTab === itinerary.days.length ? ' is-active' : ''}`}
            onClick={() => setActiveTab(itinerary.days.length)}
          >
            <span aria-hidden="true" style={{ marginRight: '0.3rem' }}>§</span>
            Overview
          </button>
        )}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 bg-topo-faint">
        {activeTab < itinerary.days.length && selectedDay ? (
          <div
            role="tabpanel"
            id={`day-panel-${selectedDay.number}`}
            aria-labelledby={`day-tab-${selectedDay.number}`}
            className="flex flex-col gap-2 anim-fade-up"
          >
            {/* Day theme heading */}
            {selectedDay.theme && (
              <div className="flex items-center gap-2 mb-1">
                <span className="exp-eyebrow" style={{ color: 'var(--amber)' }}>
                  <span aria-hidden="true" className="mr-1">◇</span>
                  {selectedDay.theme}
                </span>
              </div>
            )}

            {/* Activity cards */}
            {selectedDay.activities.map((activity) => (
              <ActivityCard
                key={`${activity.time}-${activity.name}`}
                activity={activity}
              />
            ))}

            {/* Stay info */}
            {selectedDay.stay && (
              <div
                className="flex items-start gap-2 mt-1 px-3 py-2.5"
                style={{
                  background: 'rgba(212,168,83,0.04)',
                  border: '1px dashed var(--border-amber)',
                  borderRadius: '2px',
                }}
              >
                <span aria-hidden="true" style={{ color: 'var(--amber)' }}>◈</span>
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: 'var(--cream-dim)' }}
                >
                  <span
                    className="exp-eyebrow mr-1.5"
                    style={{ color: 'var(--amber)' }}
                  >
                    Encampment
                  </span>
                  {selectedDay.stay}
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Overview tab panel */
          <div
            role="tabpanel"
            id="overview-panel"
            aria-labelledby="overview-tab"
            className="flex flex-col gap-3 anim-fade-up"
          >
            {hasSummary && <SummarySection summary={itinerary.summary!} />}
            {hasPractical && <PracticalSection info={itinerary.practicalInfo!} />}
          </div>
        )}

        {/* Final field stamp */}
        <div className="flex flex-col items-center gap-2 py-4 mt-2" aria-hidden="true">
          <div className="exp-rule w-40">
            <span className="exp-rule-dot" />
          </div>
          <p className="exp-eyebrow" style={{ color: 'var(--bone)' }}>
            End of Dispatch
          </p>
        </div>
      </div>

      {/* Inline chat dock at bottom */}
      {onChatSend && (
        <ChatInput
          onSend={onChatSend}
          disabled={!!isStreaming}
          placeholder={'Adjust your expedition — e.g. "swap Day 2 lunch for seafood"…'}
        />
      )}
    </div>
  );
}

/* ─── Sections ───────────────────────────────────────── */

function SummarySection({ summary }: { summary: NonNullable<Itinerary['summary']> }) {
  return (
    <section
      className="p-4 space-y-3 relative"
      style={{
        background: 'var(--charcoal)',
        border: '1px solid var(--border-amber)',
        borderRadius: '2px',
      }}
      aria-labelledby="summary-heading"
    >
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 w-12 h-px"
        style={{ background: 'var(--amber)' }}
      />
      <div className="exp-eyebrow flex items-center gap-2" style={{ color: 'var(--amber)' }}>
        <span aria-hidden="true">§</span>
        <span id="summary-heading">Expedition Summary</span>
      </div>
      {summary.estimatedCost && (
        <SummaryRow label="Est. Provisions" value={summary.estimatedCost} />
      )}
      {summary.gettingAround && (
        <SummaryRow label="Conveyance" value={summary.gettingAround} />
      )}
      {summary.localTip && (
        <SummaryRow label="Field Note" value={summary.localTip} />
      )}
      {summary.bookInAdvance && summary.bookInAdvance.length > 0 && (
        <div className="text-xs">
          <p className="exp-eyebrow mb-1.5" style={{ color: 'var(--bone)' }}>
            Reserve in Advance
          </p>
          <ul className="pl-1 space-y-1">
            {summary.bookInAdvance.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2"
                style={{ color: 'var(--cream-dim)' }}
              >
                <span aria-hidden="true" style={{ color: 'var(--amber)' }}>◇</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function PracticalSection({ info }: { info: NonNullable<Itinerary['practicalInfo']> }) {
  return (
    <section
      className="p-4 space-y-3 relative"
      style={{
        background: 'var(--charcoal)',
        border: '1px solid var(--border-amber)',
        borderRadius: '2px',
      }}
      aria-labelledby="practical-heading"
    >
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 w-12 h-px"
        style={{ background: 'var(--amber)' }}
      />
      <div className="exp-eyebrow flex items-center gap-2" style={{ color: 'var(--amber)' }}>
        <span aria-hidden="true">§</span>
        <span id="practical-heading">Practical Notes</span>
      </div>
      {info.estimatedCost && (
        <SummaryRow label="Est. Provisions" value={info.estimatedCost} />
      )}
      {info.gettingThere && (
        <SummaryRow label="Getting There" value={info.gettingThere} />
      )}
      {info.tips && info.tips.length > 0 && (
        <div className="text-xs">
          <p className="exp-eyebrow mb-1.5" style={{ color: 'var(--bone)' }}>
            Field Tips
          </p>
          <ul className="pl-1 space-y-1">
            {info.tips.map((tip) => (
              <li
                key={tip}
                className="flex items-start gap-2"
                style={{ color: 'var(--cream-dim)' }}
              >
                <span aria-hidden="true" style={{ color: 'var(--amber)' }}>◇</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <p className="text-xs leading-relaxed" style={{ color: 'var(--cream-dim)' }}>
      <span
        className="exp-eyebrow mr-2"
        style={{ color: 'var(--bone)' }}
      >
        {label}
      </span>
      <span style={{ color: 'var(--cream-text)' }}>{value}</span>
    </p>
  );
}
