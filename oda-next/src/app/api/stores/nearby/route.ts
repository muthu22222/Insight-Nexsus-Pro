import { NextRequest, NextResponse } from 'next/server';
import Store from '@/models/Store';
import { connectToDatabase } from '@/lib/mongodb';
import { RAW_STORES, CITY_COORDINATES, getRawStores, calculateDistance } from '@/data/raw-stores';

function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  return calculateDistance(lat1, lng1, lat2, lng2);
}

// Category mappings for OpenStreetMap tags
const categoryFilterMap: Record<string, string> = {
  All: 'furniture|interior_decoration|lighting|bed|curtain|houseware',
  Furniture: 'furniture',
  'Home Decor': 'interior_decoration|houseware',
  Lighting: 'lighting',
  Curtains: 'curtain',
  Mattress: 'bed',
};

async function geocodeLocation(query: string): Promise<{ lat: number; lng: number; displayName: string } | null> {
  const clean = query.trim().toLowerCase();
  // Instant lookup for known cities
  for (const [key, val] of Object.entries(CITY_COORDINATES)) {
    if (clean.includes(key) || key.includes(clean)) {
      return {
        lat: val.lat,
        lng: val.lng,
        displayName: val.name,
      };
    }
  }

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'InsightNexsus/1.0 (Interior Design Studio Platform)',
      },
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        displayName: data[0].display_name,
      };
    }
  } catch (err) {
    console.warn('Nominatim geocoding error or timeout:', err);
  }
  return null;
}

async function fetchFromOverpass(lat: number, lng: number, radiusMeters: number, category: string) {
  const filterVal = categoryFilterMap[category] || categoryFilterMap.All;
  const isRegex = filterVal.includes('|');
  const shopFilter = isRegex ? `["shop"~"${filterVal}"]` : `["shop"="${filterVal}"]`;

  const query = `[out:json][timeout:10];(node${shopFilter}(around:${radiusMeters},${lat},${lng});way${shopFilter}(around:${radiusMeters},${lat},${lng});relation${shopFilter}(around:${radiusMeters},${lat},${lng}););out center;`;

  const endpoints = [
    'https://overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter',
  ];

  for (const endpoint of endpoints) {
    try {
      const url = `${endpoint}?data=${encodeURIComponent(query)}`;
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'InsightNexsus/1.0 (Interior Design Studio Platform)',
          Accept: 'application/json',
        },
        signal: AbortSignal.timeout(3000), // Strict 3 second timeout so API never hangs
      });

      if (res.ok) {
        const data = await res.json();
        return data.elements || [];
      }
    } catch (e: any) {
      console.warn(`Overpass mirror ${endpoint} skipped/timeout:`, e.message);
    }
  }

  return [];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let lat = parseFloat(searchParams.get('lat') || '0');
    let lng = parseFloat(searchParams.get('lng') || '0');
    const category = searchParams.get('category') || 'All';
    const radiusKm = parseFloat(searchParams.get('radius') || '30');
    const queryLocation = searchParams.get('q');

    // If text location is provided (e.g. "Coimbatore", "RS Puram", "Bangalore"), geocode it
    if (queryLocation && queryLocation.trim()) {
      const geocoded = await geocodeLocation(queryLocation.trim());
      if (geocoded) {
        lat = geocoded.lat;
        lng = geocoded.lng;
      }
    }

    if (!lat || !lng) {
      // Default to Coimbatore coordinates if none passed (Tamil Nadu design hub)
      lat = 11.0168;
      lng = 76.9558;
    }

    const radiusMeters = Math.min(radiusKm * 1000, 35000);

    // 1. Fetch raw verified stores with distance calculation
    const rawStores = getRawStores(lat, lng, category, queryLocation || undefined).map((store) => ({
      ...store,
      source: 'Verified Showroom Partner',
    }));

    // 2. Fetch live OpenStreetMap Overpass data (non-blocking fallback)
    let osmStores: any[] = [];
    try {
      const osmElements = await fetchFromOverpass(lat, lng, radiusMeters, category);
      osmStores = osmElements
        .map((el: any) => {
          const tags = el.tags || {};
          const storeLat = el.lat || el.center?.lat;
          const storeLng = el.lon || el.center?.lon;

          if (!storeLat || !storeLng) return null;

          const name =
            tags.name ||
            tags['name:en'] ||
            tags.brand ||
            tags.operator ||
            (tags.shop ? `${tags.shop.replace(/_/g, ' ').toUpperCase()} Store` : 'Furniture & Decor Shop');

          const addressParts = [
            tags['addr:housenumber'],
            tags['addr:street'],
            tags['addr:suburb'] || tags['addr:neighbourhood'],
            tags['addr:city'],
            tags['addr:postcode'],
          ].filter(Boolean);

          const address = addressParts.length > 0 ? addressParts.join(', ') : `${name}, Local Area`;

          let storeCategory = 'Furniture';
          if (tags.shop === 'interior_decoration' || tags.shop === 'houseware') storeCategory = 'Home Decor';
          if (tags.shop === 'lighting') storeCategory = 'Lighting';
          if (tags.shop === 'curtain') storeCategory = 'Curtains';
          if (tags.shop === 'bed') storeCategory = 'Mattress';

          const distance = haversineDistance(lat, lng, storeLat, storeLng);

          const charCodeSum = (name || '').split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
          const rating = parseFloat((4.2 + (charCodeSum % 7) * 0.1).toFixed(1));

          return {
            _id: `osm_${el.type}_${el.id}`,
            name,
            address,
            lat: storeLat,
            lng: storeLng,
            phone: tags.phone || tags['contact:phone'] || tags['contact:mobile'] || null,
            website: tags.website || tags['contact:website'] || null,
            category: storeCategory,
            rating,
            openingHours: tags.opening_hours || 'Mon-Sat 10:00 AM - 8:30 PM',
            timings: tags.opening_hours || '10:00 AM - 8:30 PM',
            distance,
            source: 'OpenStreetMap',
          };
        })
        .filter(Boolean);
    } catch {
      // Overpass error handled gracefully
    }

    // 3. Fetch any registered stores from MongoDB (if connected)
    let dbStores: any[] = [];
    try {
      await connectToDatabase();
      const mongoStores = await Store.find({}).lean();
      dbStores = mongoStores
        .map((store: any) => ({
          _id: store._id.toString(),
          name: store.name,
          address: store.address,
          lat: store.lat,
          lng: store.lng,
          phone: store.phone,
          website: store.website,
          category: store.category || 'Furniture',
          rating: store.rating || 4.5,
          openingHours: store.openingHours || store.timings,
          timings: store.timings || store.openingHours,
          distance: haversineDistance(lat, lng, store.lat, store.lng),
          source: 'Verified Partner',
        }))
        .filter((s: any) => (s.distance ?? 0) <= radiusKm);
    } catch {
      // MongoDB fallback handled gracefully
    }

    // Priority merge: Verified Raw Stores first, then DB stores, then live OSM
    const allStores = [...rawStores, ...dbStores, ...osmStores];
    const seen = new Set<string>();
    const uniqueStores = allStores
      .filter((store: any) => {
        const key = `${store.name.toLowerCase().trim()}_${store.lat.toFixed(3)}_${store.lng.toFixed(3)}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((a: any, b: any) => (a.distance ?? 0) - (b.distance ?? 0));

    return NextResponse.json({
      success: true,
      data: uniqueStores,
      center: { lat, lng },
      count: uniqueStores.length,
      rawCount: RAW_STORES.length,
      source: 'Verified Showrooms + Insight Nexsus Database + OSM',
    });
  } catch (error) {
    console.error('Stores nearby error:', error);
    // Even in case of unexpected error, return raw stores!
    const fallbackStores = getRawStores();
    return NextResponse.json({
      success: true,
      data: fallbackStores,
      count: fallbackStores.length,
      source: 'Verified Raw Showroom Database',
    });
  }
}
