'use client';

import { useState } from 'react';
import type { GeoPoint, TripAnswers } from '@/lib/types';

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
  { label: 'Public transit', value: 'public transit' },
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
    <div className="flex flex-col h-full overflow-hidden bg-white">
      <div className="px-4 pt-4 pb-2 flex-shrink-0 flex items-center gap-2">
        <span aria-hidden="true" className="text-rausch text-lg">✈️</span>
        <h1 className="font-extrabold text-hof text-base tracking-tight">TravelAdvisor</h1>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col flex-1 min-h-0 px-4">
        <div className="flex-1 overflow-y-auto space-y-4 pb-3 pr-0.5">

          <div>
            <div className="grid grid-cols-2 gap-2">
              <Field label="From" icon="🏠" htmlFor="trip-origin" required>
                <input id="trip-origin" type="text" value={origin} placeholder="New York, NY"
                  aria-required="true" onChange={e => setOrigin(e.target.value)}
                  onBlur={handleOriginBlur} className={inputCls} />
              </Field>
              <Field label="To" icon="📍" htmlFor="trip-destination" required>
                <input id="trip-destination" type="text" value={destination} placeholder="Paris, France"
                  aria-required="true" onChange={e => setDestination(e.target.value)}
                  onBlur={handleDestinationBlur} className={inputCls} />
              </Field>
            </div>
          </div>

          <div>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Departure" icon="📅" htmlFor="trip-departure" required>
                <input id="trip-departure" type="date" value={departureDate}
                  aria-required="true" onChange={e => setDepartureDate(e.target.value)} className={inputCls} />
              </Field>
              <Field label="Return" icon="🏁" htmlFor="trip-return" required>
                <input id="trip-return" type="date" value={returnDate} min={departureDate}
                  aria-required="true"
                  aria-describedby={dateRangeInvalid ? 'date-range-error' : undefined}
                  onChange={e => setReturnDate(e.target.value)}
                  className={`${inputCls} ${dateRangeInvalid ? 'border-rausch ring-1 ring-rausch' : ''}`} />
              </Field>
            </div>
            {dateRangeInvalid && (
              <p id="date-range-error" role="alert" className="mt-1 text-xs text-rausch">
                Return date must be after departure date
              </p>
            )}
            {days > 0 && !dateRangeInvalid && (
              <p className="mt-1.5 text-xs text-foggy" aria-live="polite">
                <span className="font-semibold text-babu">{days} {days === 1 ? 'day' : 'days'}</span>
                {' · '}{formatTravelDates(departureDate, returnDate)}
              </p>
            )}
          </div>

          <Section label="Who's going?" htmlFor="trip-travelers" required>
            <select id="trip-travelers" value={travelers} aria-required="true"
              onChange={e => setTravelers(e.target.value)} className={inputCls}>
              <option value="">Select…</option>
              <option value="solo">Solo</option>
              <option value="couple">Couple</option>
              <option value="2 adults">2 adults</option>
              <option value="family with kids">Family with kids</option>
              <option value="small group (3–4)">Small group (3–4)</option>
              <option value="large group (5+)">Large group (5+)</option>
            </select>
          </Section>

          <Section label="Budget per person" htmlFor="trip-budget" required>
            <select id="trip-budget" value={budget} aria-required="true"
              onChange={e => setBudget(e.target.value as TripAnswers['budget'])} className={inputCls}>
              <option value="">Select…</option>
              <option value="budget">Budget-friendly (under $30/activity)</option>
              <option value="mid-range">Mid-range ($30–$100/activity)</option>
              <option value="luxury">Luxury (premium, no limit)</option>
            </select>
          </Section>

          <ChipGroup label="Trip style" required>
            <div className="flex flex-wrap gap-1.5">
              {TRIP_STYLES.map(s => (
                <ChipToggle key={s.value} label={s.label}
                  active={tripStyle.includes(s.value)}
                  onToggle={() => setTripStyle(toggleChip(tripStyle, s.value))} />
              ))}
            </div>
          </ChipGroup>

          <ChipGroup label="Getting around" required>
            <div className="flex flex-wrap gap-1.5">
              {TRANSPORTS.map(t => (
                <ChipToggle key={t.value} label={t.label}
                  active={transport.includes(t.value)}
                  onToggle={() => setTransport(toggleChip(transport, t.value))} />
              ))}
            </div>
          </ChipGroup>

          {showAccommodation && (
            <Section label="Accommodation" htmlFor="trip-accommodation">
              <select id="trip-accommodation" value={accommodation}
                onChange={e => setAccommodation(e.target.value)} className={inputCls}>
                <option value="">Select…</option>
                <option value="hotel">Hotel</option>
                <option value="Airbnb">Airbnb</option>
                <option value="hostel">Hostel</option>
                <option value="camping">Camping</option>
              </select>
            </Section>
          )}

          {showFitness && (
            <Section label="Fitness / activity level" htmlFor="trip-fitness">
              <select id="trip-fitness" value={fitnessLevel}
                onChange={e => setFitnessLevel(e.target.value as TripAnswers['fitnessLevel'])} className={inputCls}>
                <option value="">Select…</option>
                <option value="easy">Easy — light walking</option>
                <option value="moderate">Moderate — some hiking</option>
                <option value="strenuous">Strenuous — intense activity</option>
              </select>
            </Section>
          )}

          {showDietary && (
            <Section label="Dietary notes" htmlFor="trip-dietary">
              <input id="trip-dietary" type="text" value={dietaryRestrictions}
                onChange={e => setDietaryRestrictions(e.target.value)}
                placeholder="e.g. vegetarian, nut allergy…" className={inputCls} />
            </Section>
          )}

          <Section label="Anything to avoid? (optional)" htmlFor="trip-avoid">
            <input id="trip-avoid" type="text" value={thingsToAvoid}
              onChange={e => setThingsToAvoid(e.target.value)}
              placeholder="e.g. crowded tourist traps, long walks…" className={inputCls} />
          </Section>

        </div>

        <div className="flex-shrink-0 py-3">
          <button type="submit" disabled={!isValid} aria-disabled={!isValid}
            title={!isValid ? 'Fill in all required fields to continue' : undefined}
            className="w-full py-2.5 rounded-xl bg-rausch hover:bg-kazan disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-semibold text-white text-sm shadow-sm">
            Plan My Trip →
          </button>
        </div>
      </form>
    </div>
  );
}

const inputCls =
  'w-full px-3 py-2 text-sm text-hof border border-border rounded-xl placeholder:text-foggy ' +
  'focus:outline-none focus:border-rausch focus:ring-1 focus:ring-rausch transition-colors bg-white';

const labelCls = 'text-xs font-semibold text-foggy mb-1.5 uppercase tracking-wider';

function Required() {
  return (
    <>
      <span aria-hidden="true" className="text-rausch ml-0.5">*</span>
      <span className="sr-only">(required)</span>
    </>
  );
}

function Field({ label, icon, htmlFor, required, children }: {
  label: string; icon: string; htmlFor: string; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="text-xs font-semibold text-foggy mb-1 flex items-center gap-1">
        <span aria-hidden="true">{icon}</span>
        {label}
        {required && <Required />}
      </label>
      {children}
    </div>
  );
}

function Section({ label, htmlFor, required, children }: {
  label: string; htmlFor: string; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className={`${labelCls} block`}>
        {label}{required && <Required />}
      </label>
      {children}
    </div>
  );
}

function ChipGroup({ label, required, children }: {
  label: string; required?: boolean; children: React.ReactNode;
}) {
  return (
    <fieldset className="border-none p-0 m-0">
      <legend className={labelCls}>{label}{required && <Required />}</legend>
      {children}
    </fieldset>
  );
}

function ChipToggle({ label, active, onToggle }: { label: string; active: boolean; onToggle: () => void }) {
  return (
    <button type="button" onClick={onToggle} aria-pressed={active}
      className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
        active ? 'bg-rausch text-white border-rausch' : 'bg-white text-foggy border-border hover:border-rausch hover:text-rausch'
      }`}>
      {label}
    </button>
  );
}
