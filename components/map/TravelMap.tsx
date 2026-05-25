'use client';

import 'mapbox-gl/dist/mapbox-gl.css';
import { useEffect, useRef } from 'react';
import type { GeoPoint } from '@/lib/types';

type Props = {
  origin?: GeoPoint;
  destination?: GeoPoint;
  activeLocation?: GeoPoint;
};

export default function TravelMap({ origin, destination, activeLocation }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    let mapboxgl: typeof import('mapbox-gl');

    async function initMap() {
      mapboxgl = (await import('mapbox-gl')).default as unknown as typeof import('mapbox-gl');

      const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? '';
      (mapboxgl as unknown as { accessToken: string }).accessToken = token;

      if (mapRef.current) return;

      mapRef.current = new (mapboxgl as unknown as { Map: new (...args: unknown[]) => object }).Map({
        container: containerRef.current!,
        style: 'mapbox://styles/mapbox/light-v11',
        center: destination
          ? [destination.lng, destination.lat]
          : [-95.7, 37.1],
        zoom: destination ? 9 : 3,
      });

      mapRef.current.addControl(
        new (mapboxgl as unknown as { NavigationControl: new (...args: unknown[]) => object }).NavigationControl({ showCompass: false }),
        'bottom-right'
      );
    }

    initMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update markers when points change
  useEffect(() => {
    if (!mapRef.current) return;

    async function updateMarkers() {
      const mapboxgl = (await import('mapbox-gl')).default;

      // Remove existing markers
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      if (destination) {
        const el = createMarkerEl('#FF5A5F', '📍', `Destination: ${destination?.placeName ?? 'destination'}`);
        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([destination.lng, destination.lat])
          .addTo(mapRef.current);
        markersRef.current.push(marker);
      }

      if (origin) {
        const el = createMarkerEl('#484848', '🏠', `Origin: ${origin?.placeName ?? 'origin'}`);
        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([origin.lng, origin.lat])
          .addTo(mapRef.current);
        markersRef.current.push(marker);
      }

      if (activeLocation) {
        const el = createMarkerEl('#D4A853', '🧭', `Day Location: ${activeLocation?.placeName ?? 'active'}`);
        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([activeLocation.lng, activeLocation.lat])
          .addTo(mapRef.current);
        markersRef.current.push(marker);

        mapRef.current.flyTo({ center: [activeLocation.lng, activeLocation.lat], zoom: 11, duration: 1200 });
      } else {
        // Fit bounds if both present
        if (origin && destination) {
          const bounds = [
            [Math.min(origin.lng, destination.lng) - 0.5, Math.min(origin.lat, destination.lat) - 0.5],
            [Math.max(origin.lng, destination.lng) + 0.5, Math.max(origin.lat, destination.lat) + 0.5],
          ] as [[number, number], [number, number]];
          mapRef.current.fitBounds(bounds, { padding: 80, duration: 1000 });
        } else if (destination) {
          mapRef.current.flyTo({ center: [destination.lng, destination.lat], zoom: 9, duration: 1200 });
        }
      }
    }

    updateMarkers();
  }, [origin, destination, activeLocation]);

  const hasDestination = !!destination;

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" role="img" aria-label="Interactive trip map" />

      {!hasDestination && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-bg-light/80 backdrop-blur-sm pointer-events-none">
          <div className="text-4xl mb-3">🗺️</div>
          <p className="text-hof font-semibold text-sm">Enter a destination</p>
          <p className="text-foggy text-xs mt-1">Your route will appear on the map</p>
        </div>
      )}
    </div>
  );
}

function createMarkerEl(color: string, emoji: string, label: string): HTMLDivElement {
  const el = document.createElement('div');
  el.setAttribute('role', 'img');
  el.setAttribute('aria-label', label);
  el.style.cssText = `
    width: 32px; height: 32px;
    border-radius: 50% 50% 50% 0;
    background: ${color};
    border: 2px solid white;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    transform: rotate(-45deg);
    display: flex; align-items: center; justify-content: center;
    cursor: default;
  `;
  const inner = document.createElement('div');
  inner.style.cssText = 'transform: rotate(45deg); font-size: 14px; line-height: 1;';
  inner.textContent = emoji;
  el.appendChild(inner);
  return el;
}
