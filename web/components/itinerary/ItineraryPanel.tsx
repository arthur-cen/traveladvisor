'use client';

import type { Itinerary } from '@/lib/types';
import DayGroup from './DayGroup';

type Props = {
  itinerary: Itinerary | null;
  isStreaming?: boolean;
  streamText?: string;
};

export default function ItineraryPanel({ itinerary, isStreaming, streamText }: Props) {
  if (!itinerary && !isStreaming) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-8 gap-4">
        <div className="w-16 h-16 rounded-full bg-border flex items-center justify-center text-2xl">
          🗺️
        </div>
        <div>
          <p className="font-semibold text-hof text-sm">Your itinerary will appear here</p>
          <p className="text-foggy text-xs mt-1">
            Complete the chat on the left to generate your personalized travel plan.
          </p>
        </div>
      </div>
    );
  }

  if (isStreaming && !itinerary) {
    return (
      <div className="flex flex-col h-full">
        <div className="px-4 py-3 border-b border-border bg-white">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <span className="w-2 h-2 rounded-full bg-rausch animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-rausch animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full bg-rausch animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-xs text-foggy font-medium">Building your itinerary…</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <pre className="text-xs text-foggy whitespace-pre-wrap font-mono leading-relaxed">
            {streamText}
          </pre>
        </div>
      </div>
    );
  }

  if (!itinerary) return null;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-white flex-shrink-0">
        <h2 className="font-bold text-hof text-sm">{itinerary.destination}</h2>
        <p className="text-foggy text-xs mt-0.5">{itinerary.dates}</p>
      </div>

      {/* Days */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
        {itinerary.days.map((day, i) => (
          <DayGroup key={day.number} day={day} defaultOpen={i === 0} />
        ))}

        {/* Summary / Practical Info */}
        {itinerary.type === 'multi-day' && itinerary.summary && (
          <SummarySection summary={itinerary.summary} />
        )}
        {itinerary.type === 'single-day' && itinerary.practicalInfo && (
          <PracticalSection info={itinerary.practicalInfo} />
        )}
      </div>
    </div>
  );
}

function SummarySection({ summary }: { summary: NonNullable<Itinerary['summary']> }) {
  return (
    <div className="border border-border rounded-card bg-white p-4 space-y-2">
      <h3 className="font-semibold text-hof text-sm flex items-center gap-1.5">
        <span>📋</span> Trip Summary
      </h3>
      {summary.estimatedCost && (
        <SummaryRow icon="💰" label="Est. cost" value={summary.estimatedCost} />
      )}
      {summary.gettingAround && (
        <SummaryRow icon="🚌" label="Getting around" value={summary.gettingAround} />
      )}
      {summary.localTip && (
        <SummaryRow icon="💡" label="Local tip" value={summary.localTip} />
      )}
      {summary.bookInAdvance && summary.bookInAdvance.length > 0 && (
        <div className="text-xs">
          <span className="font-medium text-hof flex items-center gap-1 mb-1">🎟️ Book in advance</span>
          <ul className="pl-3 space-y-0.5">
            {summary.bookInAdvance.map((item, i) => (
              <li key={i} className="text-foggy list-disc">{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function PracticalSection({ info }: { info: NonNullable<Itinerary['practicalInfo']> }) {
  return (
    <div className="border border-border rounded-card bg-white p-4 space-y-2">
      <h3 className="font-semibold text-hof text-sm flex items-center gap-1.5">
        <span>📋</span> Practical Info
      </h3>
      {info.estimatedCost && (
        <SummaryRow icon="💰" label="Est. cost" value={info.estimatedCost} />
      )}
      {info.gettingThere && (
        <SummaryRow icon="🚗" label="Getting there" value={info.gettingThere} />
      )}
      {info.tips && info.tips.length > 0 && (
        <div className="text-xs">
          <span className="font-medium text-hof flex items-center gap-1 mb-1">💡 Tips</span>
          <ul className="pl-3 space-y-0.5">
            {info.tips.map((tip, i) => (
              <li key={i} className="text-foggy list-disc">{tip}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function SummaryRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <p className="text-xs text-foggy">
      <span className="mr-1">{icon}</span>
      <span className="font-medium text-hof">{label}: </span>
      {value}
    </p>
  );
}
