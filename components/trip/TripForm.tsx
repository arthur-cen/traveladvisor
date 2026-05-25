'use client';

import { useState } from 'react';
import type { GeoPoint, TripAnswers } from '@/lib/types';
import LocationAutocomplete from './LocationAutocomplete';

type Props = {
  onSubmit: (answers: TripAnswers) => void;
  onDestinationGeocoded: (point: GeoPoint) => void;
  onOriginGeocoded: (point: GeoPoint) => void;
};

const TRIP_STYLES = [
  { label: 'Relaxation', value: 'relaxation' },
  { label: 'Food & Drink', value: 'food & drink' },
  { label: 'Adventure', value: 'adventure' },
  { label: 'Nature', value: 'nature' },
  { label: 'Cultural', value: 'cultural' },
];

const TRANSPORTS = [
  { label: 'Walking', value: 'walking' },
  { label: 'Transit', value: 'public transit' },
  { label: 'Car', value: 'car' },
  { label: 'Train', value: 'train' },
  { label: 'Bike', value: 'bike' },
];

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function formatTravelDates(dep: string, ret: string): string {
  const d = new Date(dep + 'T00:00:00');
  const r = new Date(ret + 'T00:00:00');
  if (d.getMonth() === r.getMonth() && d.getFullYear() === r.getFullYear()) {
    return `${MONTHS[d.getMonth()]} ${d.getDate()}–${r.getDate()}, ${r.getFullYear()}`;
  }
  return `${MONTHS[d.getMonth()]} ${d.getDate()} – ${MONTHS[r.getMonth()]} ${r.getDate()}, ${r.getFullYear()}`;
}

function calcDays(dep: string, ret: string): number {
  const ms = new Date(ret + 'T00:00:00').getTime() - new Date(dep + 'T00:00:00').getTime();
  return Math.max(1, Math.round(ms / 86400000));
}

async function geocode(q: string): Promise<GeoPoint | null> {
  try {
    const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`);
    if (!res.ok) return null;
    const data = await res.json();
    return { lat: data.latitude, lng: data.longitude, placeName: data.placeName };
  } catch {
    return null;
  }
}

export default function TripForm({ onSubmit, onDestinationGeocoded, onOriginGeocoded }: Props) {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [travelers, setTravelers] = useState('');
  const [budget, setBudget] = useState<TripAnswers['budget'] | ''>('');
  const [tripStyle, setTripStyle] = useState<string[]>([]);
  const [transport, setTransport] = useState<string[]>([]);
  const [accommodation, setAccommodation] = useState('');
  const [fitnessLevel, setFitnessLevel] = useState<TripAnswers['fitnessLevel'] | ''>('');
  const [dietaryRestrictions, setDietaryRestrictions] = useState('');
  const [thingsToAvoid, setThingsToAvoid] = useState('');

  const days = departureDate && returnDate ? calcDays(departureDate, returnDate) : 0;
  const dateRangeInvalid = !!(departureDate && returnDate && returnDate < departureDate);
  const showAccommodation = days >= 2;
  const showFitness = tripStyle.some(s => s === 'adventure' || s === 'nature');
  const showDietary = tripStyle.includes('food & drink');

  const isValid = !!(
    origin.trim() && destination.trim() && departureDate && returnDate &&
    !dateRangeInvalid && travelers && budget && tripStyle.length > 0 && transport.length > 0
  );

  function toggleChip(arr: string[], val: string): string[] {
    return arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val];
  }

  async function handleOriginBlur() {
    if (!origin.trim()) return;
    const pt = await geocode(origin);
    if (pt) onOriginGeocoded(pt);
  }

  async function handleDestinationBlur() {
    if (!destination.trim()) return;
    const pt = await geocode(destination);
    if (pt) onDestinationGeocoded(pt);
  }

  function handleOriginSelect(pt: GeoPoint) {
    setOrigin(pt.placeName ?? origin);
    onOriginGeocoded(pt);
  }

  function handleDestinationSelect(pt: GeoPoint) {
    setDestination(pt.placeName ?? destination);
    onDestinationGeocoded(pt);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || !budget) return;
    onSubmit({
      origin: origin.trim(), destination: destination.trim(),
      departureDate, returnDate,
      travelDates: formatTravelDates(departureDate, returnDate),
      days: days.toString(), travelers, budget, transport, tripStyle,
      accommodation: showAccommodation && accommodation ? accommodation : undefined,
      fitnessLevel: showFitness && fitnessLevel ? fitnessLevel : undefined,
      dietaryRestrictions: showDietary && dietaryRestrictions.trim() ? dietaryRestrictions.trim() : undefined,
      thingsToAvoid: thingsToAvoid.trim() && thingsToAvoid.trim().toLowerCase() !== 'none' ? thingsToAvoid.trim() : undefined,
    });
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <form onSubmit={handleSubmit} noValidate className="flex flex-col flex-1 min-h-0 px-5">
        {/* Mission Brief heading */}
        <div className="flex-shrink-0 pt-1 pb-2">
          <div className="flex items-baseline justify-between">
            <h2 className="display-serif text-lg leading-none" style={{ color: 'var(--cream-text)' }}>
              Mission Brief
            </h2>
            <span className="exp-eyebrow" style={{ color: 'var(--bone)' }}>§ 01</span>
          </div>
          <p className="text-xs mt-1.5 leading-relaxed" style={{ color: 'var(--cream-dim)' }}>
            Furnish the bureau with the particulars of your forthcoming expedition.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto space-y-5 pb-3 pt-3 pr-1">

          {/* Route */}
          <SectionBlock eyebrow="I · Route">
            <div className="grid grid-cols-1 gap-3">
              <ExpField label="Origin" htmlFor="trip-origin" required marker="A">
                <LocationAutocomplete
                  id="trip-origin"
                  value={origin}
                  placeholder="New York, NY"
                  aria-required="true"
                  onChange={setOrigin}
                  onSelect={handleOriginSelect}
                  onBlur={handleOriginBlur}
                />
              </ExpField>
              <ExpField label="Destination" htmlFor="trip-destination" required marker="B">
                <LocationAutocomplete
                  id="trip-destination"
                  value={destination}
                  placeholder="Paris, France"
                  aria-required="true"
                  onChange={setDestination}
                  onSelect={handleDestinationSelect}
                  onBlur={handleDestinationBlur}
                />
              </ExpField>
            </div>
          </SectionBlock>

          <ExpRule />

          {/* Dates */}
          <SectionBlock eyebrow="II · Window">
            <div className="grid grid-cols-2 gap-3">
              <ExpField label="Depart" htmlFor="trip-departure" required>
                <input
                  id="trip-departure"
                  type="date"
                  value={departureDate}
                  aria-required="true"
                  onChange={e => setDepartureDate(e.target.value)}
                  className="exp-input"
                />
              </ExpField>
              <ExpField label="Return" htmlFor="trip-return" required>
                <input
                  id="trip-return"
                  type="date"
                  value={returnDate}
                  min={departureDate}
                  aria-required="true"
                  aria-describedby={dateRangeInvalid ? 'date-range-error' : undefined}
                  onChange={e => setReturnDate(e.target.value)}
                  className={`exp-input ${dateRangeInvalid ? 'invalid' : ''}`}
                />
              </ExpField>
            </div>
            {dateRangeInvalid && (
              <p
                id="date-range-error"
                role="alert"
                className="mt-2 text-xs"
                style={{ color: 'var(--danger)' }}
              >
                ⚠ Return must follow departure.
              </p>
            )}
            {days > 0 && !dateRangeInvalid && (
              <p
                className="mt-2 text-xs flex items-baseline gap-2"
                style={{ color: 'var(--cream-dim)' }}
                aria-live="polite"
              >
                <span
                  className="display-serif text-xl leading-none"
                  style={{ color: 'var(--amber)' }}
                >
                  {days}
                </span>
                <span className="exp-eyebrow" style={{ color: 'var(--amber)' }}>
                  {days === 1 ? 'Day' : 'Days'}
                </span>
                <span style={{ color: 'var(--charcoal-light)' }}>·</span>
                <span className="mono text-[11px]" style={{ color: 'var(--bone)' }}>
                  {formatTravelDates(departureDate, returnDate)}
                </span>
              </p>
            )}
          </SectionBlock>

          <ExpRule />

          {/* Party & Budget */}
          <SectionBlock eyebrow="III · Party">
            <ExpField label="Travelers" htmlFor="trip-travelers" required>
              <select
                id="trip-travelers"
                value={travelers}
                aria-required="true"
                onChange={e => setTravelers(e.target.value)}
                className="exp-input"
              >
                <option value="">Select party…</option>
                <option value="solo">Solo</option>
                <option value="couple">Couple</option>
                <option value="2 adults">Two adults</option>
                <option value="family with kids">Family with kids</option>
                <option value="small group (3–4)">Small group (3–4)</option>
                <option value="large group (5+)">Large group (5+)</option>
              </select>
            </ExpField>

            <ExpField label="Budget per person" htmlFor="trip-budget" required>
              <BudgetSlider
                value={budget}
                onChange={(v) => setBudget(v as TripAnswers['budget'])}
              />
            </ExpField>
          </SectionBlock>

          <ExpRule />

          {/* Style */}
          <SectionBlock eyebrow="IV · Disposition">
            <ChipGroup label="Expedition style" required>
              <div className="flex flex-wrap gap-1.5">
                {TRIP_STYLES.map(s => (
                  <ChipToggle
                    key={s.value}
                    label={s.label}
                    active={tripStyle.includes(s.value)}
                    onToggle={() => setTripStyle(toggleChip(tripStyle, s.value))}
                  />
                ))}
              </div>
            </ChipGroup>

            <ChipGroup label="Means of conveyance" required>
              <div className="flex flex-wrap gap-1.5">
                {TRANSPORTS.map(t => (
                  <ChipToggle
                    key={t.value}
                    label={t.label}
                    active={transport.includes(t.value)}
                    onToggle={() => setTransport(toggleChip(transport, t.value))}
                  />
                ))}
              </div>
            </ChipGroup>
          </SectionBlock>

          {(showAccommodation || showFitness || showDietary) && <ExpRule />}

          {(showAccommodation || showFitness || showDietary) && (
            <SectionBlock eyebrow="V · Provisions">
              {showAccommodation && (
                <ExpField label="Lodgings" htmlFor="trip-accommodation">
                  <select
                    id="trip-accommodation"
                    value={accommodation}
                    onChange={e => setAccommodation(e.target.value)}
                    className="exp-input"
                  >
                    <option value="">Quartermaster's choice…</option>
                    <option value="hotel">Hotel</option>
                    <option value="Airbnb">Airbnb</option>
                    <option value="hostel">Hostel</option>
                    <option value="camping">Camping</option>
                  </select>
                </ExpField>
              )}

              {showFitness && (
                <ExpField label="Constitution" htmlFor="trip-fitness">
                  <select
                    id="trip-fitness"
                    value={fitnessLevel}
                    onChange={e => setFitnessLevel(e.target.value as TripAnswers['fitnessLevel'])}
                    className="exp-input"
                  >
                    <option value="">Select level…</option>
                    <option value="easy">Easy — light walking</option>
                    <option value="moderate">Moderate — some hiking</option>
                    <option value="strenuous">Strenuous — intense activity</option>
                  </select>
                </ExpField>
              )}

              {showDietary && (
                <ExpField label="Dietary notes" htmlFor="trip-dietary">
                  <input
                    id="trip-dietary"
                    type="text"
                    value={dietaryRestrictions}
                    onChange={e => setDietaryRestrictions(e.target.value)}
                    placeholder="vegetarian, nut allergy…"
                    className="exp-input"
                  />
                </ExpField>
              )}
            </SectionBlock>
          )}

          <ExpRule />

          <SectionBlock eyebrow="VI · Caveats">
            <ExpField label="Avoid (optional)" htmlFor="trip-avoid">
              <input
                id="trip-avoid"
                type="text"
                value={thingsToAvoid}
                onChange={e => setThingsToAvoid(e.target.value)}
                placeholder="tourist traps, crowds, long drives…"
                className="exp-input"
              />
            </ExpField>
          </SectionBlock>

        </div>

        <div className="flex-shrink-0 py-4">
          <button
            type="submit"
            disabled={!isValid}
            aria-disabled={!isValid}
            title={!isValid ? 'Complete all required fields to dispatch your brief.' : undefined}
            className="exp-btn-primary"
          >
            <span aria-hidden="true">⛰</span>
            <span>Chart the Expedition</span>
            <span aria-hidden="true" className="ml-1">→</span>
          </button>
          <p
            className="exp-eyebrow text-center mt-2.5 flex items-center justify-center gap-1.5"
            style={{ color: 'var(--bone)' }}
            aria-hidden="true"
          >
            <span style={{ color: 'var(--amber)' }}>✦</span>
            Bureau of Wayfinding
            <span style={{ color: 'var(--amber)' }}>✦</span>
          </p>
        </div>
      </form>
    </div>
  );
}

/* ─── Subcomponents ──────────────────────────────────────── */

function ExpRule() {
  return (
    <div className="exp-rule" aria-hidden="true">
      <span className="exp-rule-dot" />
    </div>
  );
}

function SectionBlock({
  eyebrow,
  children,
}: { eyebrow: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="exp-eyebrow flex items-center gap-2" style={{ color: 'var(--bone)' }}>
        <span style={{ color: 'var(--amber)' }} aria-hidden="true">◇</span>
        {eyebrow}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Required() {
  return (
    <>
      <span aria-hidden="true" style={{ color: 'var(--amber)', marginLeft: '0.2rem' }}>*</span>
      <span className="sr-only">(required)</span>
    </>
  );
}

function ExpField({
  label,
  htmlFor,
  required,
  marker,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  marker?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="exp-label flex items-center gap-2">
        {marker && (
          <span
            aria-hidden="true"
            className="inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold"
            style={{
              color: 'var(--amber-glow)',
              border: '1px solid var(--border-amber-strong)',
              borderRadius: '50%',
              letterSpacing: 0,
            }}
          >
            {marker}
          </span>
        )}
        {label}
        {required && <Required />}
      </label>
      {children}
    </div>
  );
}

function ChipGroup({
  label,
  required,
  children,
}: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <fieldset className="border-none p-0 m-0">
      <legend className="exp-label">
        {label}
        {required && <Required />}
      </legend>
      {children}
    </fieldset>
  );
}

function ChipToggle({
  label,
  active,
  onToggle,
}: { label: string; active: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={active}
      className="exp-chip"
    >
      {active && (
        <span aria-hidden="true" style={{ color: 'var(--amber)' }}>✓</span>
      )}
      {label}
    </button>
  );
}

const BUDGET_STOPS: { value: string; label: string; desc: string }[] = [
  { value: 'budget', label: 'Frugal', desc: 'Under $30' },
  { value: 'mid-range', label: 'Mid-range', desc: '$30–$100' },
  { value: 'luxury', label: 'Luxury', desc: 'No limit' },
];

function BudgetSlider({
  value,
  onChange,
}: { value: string; onChange: (v: string) => void }) {
  const idx = BUDGET_STOPS.findIndex(s => s.value === value);
  const sliderValue = idx >= 0 ? idx : 1;

  return (
    <div className="budget-slider-wrapper">
      <input
        id="trip-budget"
        type="range"
        min={0}
        max={2}
        step={1}
        value={sliderValue}
        aria-required="true"
        aria-label="Budget per person"
        aria-valuetext={BUDGET_STOPS[sliderValue].label}
        className="budget-slider"
        onChange={e => onChange(BUDGET_STOPS[parseInt(e.target.value)].value)}
      />
      <div className="budget-labels" aria-hidden="true">
        {BUDGET_STOPS.map((stop, i) => (
          <span
            key={stop.value}
            className={`budget-label${i === sliderValue ? ' is-active' : ''}`}
          >
            <span style={{ display: 'block' }}>{stop.label}</span>
            <span style={{ display: 'block', fontSize: '0.55rem', opacity: 0.7, marginTop: 2 }}>
              {stop.desc}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
