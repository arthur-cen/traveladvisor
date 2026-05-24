import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q');
  if (!q?.trim()) {
    return NextResponse.json({ error: 'Missing query' }, { status: 400 });
  }

  const token = process.env.MAPBOX_TOKEN;
  if (!token) {
    return NextResponse.json({ error: 'Mapbox token not configured' }, { status: 500 });
  }

  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json?access_token=${token}&limit=1`;

  const res = await fetch(url);
  if (!res.ok) {
    return NextResponse.json({ error: 'Geocoding failed' }, { status: 502 });
  }

  const data = await res.json();
  const feature = data.features?.[0];
  if (!feature) {
    return NextResponse.json({ error: 'Location not found' }, { status: 404 });
  }

  const [lng, lat] = feature.center;
  return NextResponse.json({
    latitude: lat,
    longitude: lng,
    placeName: feature.place_name,
    bbox: feature.bbox ?? null,
  });
}
