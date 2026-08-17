import { NextRequest, NextResponse } from 'next/server';
import Store from '@/models/Store';
import { connectToDatabase } from '@/lib/mongodb';

function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get('lat') || '0');
    const lng = parseFloat(searchParams.get('lng') || '0');
    const category = searchParams.get('category');
    const radius = parseFloat(searchParams.get('radius') || '50');

    if (!lat || !lng) {
      return NextResponse.json(
        { success: false, error: 'lat and lng query parameters are required' },
        { status: 400 }
      );
    }

    const filter: Record<string, unknown> = {};
    if (category) {
      filter.category = category;
    }

    const stores = await Store.find(filter);

    const storesWithDistance = stores
      .map((store) => ({
        _id: store._id,
        name: store.name,
        address: store.address,
        lat: store.lat,
        lng: store.lng,
        phone: store.phone,
        website: store.website,
        category: store.category,
        rating: store.rating,
        openingHours: store.openingHours,
        distance: haversineDistance(lat, lng, store.lat, store.lng),
      }))
      .filter((store) => store.distance <= radius)
      .sort((a, b) => a.distance - b.distance);

    return NextResponse.json({
      success: true,
      data: storesWithDistance,
    });
  } catch (error) {
    console.error('Stores nearby error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
