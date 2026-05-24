'use client';

import { useState } from 'react';
import type { Day } from '@/lib/types';
import ActivityCard from './ActivityCard';

export default function DayGroup({
  day,
  defaultOpen = false,
}: { day: Day; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = `day-${day.number}-panel`;
  const dayLabel = String(day.number).padStart(2, '0');

  return (
    <div
      className="overflow-hidden relative"
      style={{
        background: 'var(--charcoal)',
        border: '1px solid var(--charcoal-light)',
        borderLeft: '2px solid var(--amber)',
        borderRadius: '2px',
        transition: 'border-color var(--duration-fast) var(--ease-out-expo)',
      }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3.5 text-left transition-colors group"
        style={{ background: 'transparent' }}
        aria-expanded={open}
        aria-controls={panelId}
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* Day numeral block */}
          <div
            aria-hidden="true"
            className="flex flex-col items-center justify-center flex-shrink-0"
            style={{
              minWidth: 36,
            }}
          >
            <span
              className="exp-eyebrow leading-none"
              style={{ color: 'var(--amber)', fontSize: '0.55rem' }}
            >
              Day
            </span>
            <span
              className="display-serif leading-none mt-0.5"
              style={{
                color: 'var(--amber-glow)',
                fontSize: '1.5rem',
                fontWeight: 800,
              }}
            >
              {dayLabel}
            </span>
          </div>

          <div className="min-w-0 flex-1 border-l pl-3" style={{ borderColor: 'var(--charcoal-light)' }}>
            <h3
              className="display-serif text-base leading-tight truncate"
              style={{ color: 'var(--cream-text)' }}
            >
              {day.theme || `Entry ${dayLabel}`}
            </h3>
            <p
              className="exp-eyebrow mt-1"
              style={{ color: 'var(--bone)', fontSize: '0.625rem' }}
            >
              {day.activities.length} {day.activities.length === 1 ? 'stop' : 'stops'}
            </p>
          </div>
        </div>

        <svg
          aria-hidden="true"
          className="flex-shrink-0 transition-transform duration-200"
          style={{
            color: 'var(--amber)',
            transform: open ? 'rotate(180deg)' : 'rotate(0)',
          }}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          id={panelId}
          role="region"
          aria-label={`Day ${day.number} details`}
          className="px-3 pb-3 pt-1 flex flex-col gap-2 anim-fade-up"
          style={{
            background: 'rgba(0,0,0,0.25)',
            borderTop: '1px dashed var(--border-amber)',
          }}
        >
          {day.activities.map((activity) => (
            <ActivityCard
              key={`${activity.time}-${activity.name}`}
              activity={activity}
            />
          ))}
          {day.stay && (
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
                {day.stay}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
