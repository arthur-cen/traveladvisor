'use client';

import { useState } from 'react';
import type { GeoPoint, TripAnswers } from '@/lib/types';

type TripBasics = Pick<TripAnswers, 'origin' | 'destination' | 'travelDates' | 'days'>;

type Props = {
  onSubmit: (basics: TripBasics) => void;
  onDestinationGeocoded: (point: GeoPoint) => void;
  onOriginGeocoded: (point: GeoPoint) => void;
};

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
  const [travelDates, setTravelDates] = useState('');
  const [days, setDays] = useState('');

  const isValid = origin.trim() && destination.trim() && travelDates.trim() && days.trim();

  async function handleDestinationBlur() {
    if (!destination.trim()) return;
    const point = await geocode(destination);
    if (point) onDestinationGeocoded(point);
  }

  async function handleOriginBlur() {
    if (!origin.trim()) return;
    const point = await geocode(origin);
    if (point) onOriginGeocoded(point);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    onSubmit({ origin, destination, travelDates, days });
  }

  return (
    <div className="p-4 border-b border-border bg-white">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-rausch text-lg">✈️</span>
        <h1 className="font-extrabold text-hof text-base tracking-tight">TravelAdvisor</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <FormField
            label="From"
            icon="🏠"
            value={origin}
            onChange={setOrigin}
            onBlur={handleOriginBlur}
            placeholder="New York, NY"
          />
          <FormField
            label="To"
            icon="📍"
            value={destination}
            onChange={setDestination}
            onBlur={handleDestinationBlur}
            placeholder="Paris, France"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <FormField
            label="Dates"
            icon="📅"
            value={travelDates}
            onChange={setTravelDates}
            placeholder="June 14–16, 2026"
          />
          <FormField
            label="Days"
            icon="🗓️"
            value={days}
            onChange={setDays}
            placeholder="3"
            type="number"
            min="1"
            max="30"
          />
        </div>

        <button
          type="submit"
          disabled={!isValid}
          className="w-full py-2.5 rounded-xl bg-rausch hover:bg-[#e04f54] disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-semibold text-white text-sm shadow-sm"
        >
          Plan My Trip →
        </button>
      </form>
    </div>
  );
}

type FieldProps = {
  label: string;
  icon: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  placeholder: string;
  type?: string;
  min?: string;
  max?: string;
};

function FormField({ label, icon, value, onChange, onBlur, placeholder, type = 'text', min, max }: FieldProps) {
  return (
    <div>
      <label className="text-xs font-semibold text-foggy mb-1 flex items-center gap-1">
        <span>{icon}</span>{label}
      </label>
      <input
        type={type}
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        className="w-full px-3 py-2 text-sm text-hof border border-border rounded-xl placeholder:text-foggy focus:outline-none focus:border-rausch focus:ring-1 focus:ring-rausch transition-colors bg-white"
      />
    </div>
  );
}
