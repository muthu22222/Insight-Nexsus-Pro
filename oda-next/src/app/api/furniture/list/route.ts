import { NextRequest, NextResponse } from 'next/server';
import FurnitureItem from '@/models/FurnitureItem';
import { connectToDatabase } from '@/lib/mongodb';
import { COMPREHENSIVE_CATALOG } from '@/lib/furniture-matcher';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '20', 10);
  const category = searchParams.get('category');
  const style = searchParams.get('style');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const search = searchParams.get('search');

  try {
    await connectToDatabase();

    if (id) {
      const item = await FurnitureItem.findById(id);
      if (item) {
        return NextResponse.json({ success: true, data: item });
      }
    }

    const filter: Record<string, unknown> = {};
    if (category && category !== 'All') filter.category = category;
    if (style && style !== 'All') filter.style = style;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) (filter.price as Record<string, number>).$gte = parseFloat(minPrice);
      if (maxPrice) (filter.price as Record<string, number>).$lte = parseFloat(maxPrice);
    }
    if (search) {
      filter.$or = [
        { productName: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      FurnitureItem.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
      FurnitureItem.countDocuments(filter),
    ]);

    if (items && (items.length > 0 || total > 0)) {
      return NextResponse.json({
        success: true,
        data: {
          items,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit) || 1,
          },
        },
      });
    }
  } catch (error) {
    console.warn('Furniture MongoDB query fallback to catalog:', error instanceof Error ? error.message : error);
  }

  // Graceful fallback to rich local catalog
  let fallbackItems = COMPREHENSIVE_CATALOG.map((item, idx) => ({
    _id: `cat_${idx + 1}`,
    ...item,
    inStock: true,
  }));

  if (id) {
    const single = fallbackItems.find((i) => i._id === id) || fallbackItems[0];
    return NextResponse.json({ success: true, data: single });
  }

  if (category && category !== 'All') {
    fallbackItems = fallbackItems.filter((i) => i.category.toLowerCase().includes(category.toLowerCase()));
  }
  if (style && style !== 'All') {
    fallbackItems = fallbackItems.filter((i) => i.style.toLowerCase().includes(style.toLowerCase()));
  }
  if (search) {
    const s = search.toLowerCase();
    fallbackItems = fallbackItems.filter((i) =>
      i.productName.toLowerCase().includes(s) ||
      i.brand.toLowerCase().includes(s) ||
      i.category.toLowerCase().includes(s) ||
      i.description.toLowerCase().includes(s)
    );
  }

  const total = fallbackItems.length;
  const start = (page - 1) * limit;
  const paginated = fallbackItems.slice(start, start + limit);

  return NextResponse.json({
    success: true,
    data: {
      items: paginated,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit) || 1,
      },
    },
  });
}
