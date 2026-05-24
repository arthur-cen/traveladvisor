import { NextRequest, NextResponse } from 'next/server';

export interface SuggestionResult {
  id: string;
  placeName: string;
  secondaryText: string;
  center: [number, number]; // [lng, lat]
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q');
  if (!q || q.trim().length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  const token = process.env.MAPBOX_TOKEN;
  if (!token) {
    return NextResponse.json({ error: 'Mapbox token not configured' }, { status: 500 });
  }

  const types = 'place,poi,address,country,region';
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q.trim())}.json?access_token=${token}&limit=6&types=${types}`;

  try {
    const res = await fetch(url, { next: { revalidate: 0 } });
    if (!res.ok) {
      return NextResponse.json({ error: 'Geocoding failed' }, { status: 502 });
    }

    const data = await res.json();
    const suggestions: SuggestionResult[] = (data.features ?? []).map(
      (feature: {
        id: string;
        place_name: string;
        text: string;
        center: [number, number];
      }) => {
        // Split "Primary Name, Secondary context" for display
        const parts = feature.place_name.split(', ');
        const primary = parts[0] ?? feature.place_name;
        const secondary = parts.slice(1).join(', ');
        return {
          id: feature.id,
          placeName: feature.place_name,
          secondaryText: secondary,
          // Render primary name as text — it's just the feature.text
          primaryText: primary,
          center: feature.center,
        };
      }
    );

    return NextResponse.json({ suggestions });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch suggestions' }, { status: 502 });
  }
}
