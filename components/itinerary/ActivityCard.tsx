'use client';

import type { Activity } from '@/lib/types';

const TIME_META: Record<
  string,
  { icon: string; accent: string; eyebrow: string }
> = {
  Morning:   { icon: '☀',  accent: 'var(--amber-glow)', eyebrow: 'Dawn' },
  Lunch:     { icon: '⊹',  accent: 'var(--forest-light)', eyebrow: 'Midday' },
  Afternoon: { icon: '◐',  accent: 'var(--amber)',      eyebrow: 'Afternoon' },
  Evening:   { icon: '☾',  accent: 'var(--bone)',       eyebrow: 'Dusk' },
};

const COST_LABELS: Record<string, string> = {
  '$': 'Budget cost',
  '$$': 'Moderate cost',
  '$$$': 'Premium cost',
};

const COST_META: Record<string, { color: string; tag: string }> = {
  '$':   { color: 'var(--forest-light)', tag: 'Modest' },
  '$$':  { color: 'var(--amber)',        tag: 'Mid' },
  '$$$': { color: 'var(--amber-glow)',   tag: 'Premium' },
};

export default function ActivityCard({ activity }: { activity: Activity }) {
  const meta = TIME_META[activity.time] ?? TIME_META['Afternoon'];
  const costMeta = activity.cost ? COST_META[activity.cost] : undefined;

  return (
    <article
      className="relative flex gap-3 group transition-all duration-200"
      style={{
        background: 'var(--charcoal-mid)',
        border: '1px solid var(--charcoal-light)',
        borderRadius: '2px',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Time accent rail */}
      <div
        aria-hidden="true"
        className="flex-shrink-0 flex flex-col items-center justify-start pt-3 pb-3 px-2"
        style={{
          background: 'rgba(0,0,0,0.3)',
          borderRight: '1px solid var(--charcoal-light)',
          minWidth: 52,
        }}
      >
        <span style={{ color: meta.accent, fontSize: 16 }}>{meta.icon}</span>
        <span
          className="exp-eyebrow mt-1.5 text-center leading-none"
          style={{ color: meta.accent, fontSize: '0.55rem', letterSpacing: '0.15em' }}
        >
          {activity.time}
        </span>
        {activity.duration && (
          <span
            className="mono text-[9px] mt-1.5"
            style={{ color: 'var(--bone)' }}
          >
            {activity.duration}
          </span>
        )}
      </div>

      <div className="flex-1 py-3 pr-3 min-w-0">
        <div className="flex items-start gap-2 mb-1">
          <h4
            className="display-serif text-sm leading-snug flex-1"
            style={{ color: 'var(--cream-text)' }}
          >
            {activity.name}
          </h4>
          {activity.cost && costMeta && (
            <span
              aria-label={COST_LABELS[activity.cost] ?? activity.cost}
              className="exp-eyebrow flex-shrink-0 px-1.5 py-0.5"
              style={{
                color: costMeta.color,
                border: `1px solid ${costMeta.color}`,
                borderRadius: '2px',
                fontSize: '0.55rem',
                opacity: 0.85,
              }}
            >
              {activity.cost}
            </span>
          )}
        </div>
        <p
          className="text-xs leading-relaxed"
          style={{ color: 'var(--cream-dim)' }}
        >
          {activity.description}
        </p>
      </div>
    </article>
  );
}
