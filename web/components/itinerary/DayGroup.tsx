'use client';

import { useState } from 'react';
import type { Day } from '@/lib/types';
import ActivityCard from './ActivityCard';

export default function DayGroup({ day, defaultOpen = false }: { day: Day; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = `day-${day.number}-panel`;

  return (
    <div className="border border-border rounded-card overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-bg-light transition-colors text-left"
        aria-expanded={open}
        aria-controls={panelId}
      >
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="flex items-center justify-center w-7 h-7 rounded-full bg-rausch text-white text-xs font-bold flex-shrink-0">
            {day.number}
          </span>
          <h3 className="font-semibold text-hof text-sm inline">
            Day {day.number}
            {day.theme && (
              <span className="text-foggy text-xs font-normal ml-1.5">— {day.theme}</span>
            )}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-foggy">{day.activities.length} activities</span>
          <svg
            aria-hidden="true"
            className={`w-4 h-4 text-foggy transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {open && (
        <div id={panelId} role="region" aria-label={`Day ${day.number} details`}
          className="px-3 pb-3 pt-2 bg-bg-light flex flex-col gap-2">
          {day.activities.map((activity) => (
            <ActivityCard key={`${activity.time}-${activity.name}`} activity={activity} />
          ))}
          {day.stay && (
            <div className="flex items-start gap-2 mt-1 px-1">
              <span aria-hidden="true" className="text-sm">🏨</span>
              <p className="text-xs text-foggy leading-relaxed">
                <span className="font-semibold text-hof">Stay: </span>
                {day.stay}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
