'use client';

import type { Activity } from '@/lib/types';

const TIME_COLORS: Record<string, { bar: string; chip: string; label: string }> = {
  Morning:   { bar: 'bg-amber-400',  chip: 'bg-amber-50 text-amber-700',   label: '☀️' },
  Lunch:     { bar: 'bg-emerald-400', chip: 'bg-emerald-50 text-emerald-700', label: '🍽️' },
  Afternoon: { bar: 'bg-blue-400',   chip: 'bg-blue-50 text-blue-700',     label: '🌤️' },
  Evening:   { bar: 'bg-purple-400', chip: 'bg-purple-50 text-purple-700', label: '🌙' },
};

const COST_COLORS: Record<string, string> = {
  '$':   'bg-green-50 text-green-700',
  '$$':  'bg-yellow-50 text-yellow-700',
  '$$$': 'bg-orange-50 text-orange-700',
};

export default function ActivityCard({ activity }: { activity: Activity }) {
  const colors = TIME_COLORS[activity.time] ?? TIME_COLORS['Afternoon'];

  return (
    <div className="flex gap-3 bg-white rounded-card shadow-card hover:shadow-card-hover transition-shadow duration-200 overflow-hidden group">
      {/* Left accent bar */}
      <div className={`w-1 flex-shrink-0 ${colors.bar} rounded-l-card`} />

      <div className="flex-1 py-3 pr-3">
        {/* Header row */}
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${colors.chip}`}>
            <span>{colors.label}</span>
            {activity.time}
          </span>
          {activity.duration && (
            <span className="text-xs text-foggy">· {activity.duration}</span>
          )}
          {activity.cost && (
            <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${COST_COLORS[activity.cost] ?? 'bg-gray-100 text-gray-600'}`}>
              {activity.cost}
            </span>
          )}
        </div>

        {/* Activity name */}
        <p className="font-semibold text-hof text-sm leading-snug mb-0.5 group-hover:text-rausch transition-colors">
          {activity.name}
        </p>

        {/* Description */}
        <p className="text-foggy text-xs leading-relaxed">{activity.description}</p>
      </div>
    </div>
  );
}
