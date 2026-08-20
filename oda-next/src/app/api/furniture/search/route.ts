import { NextRequest, NextResponse } from 'next/server';
import FurnitureItem from '@/models/FurnitureItem';
import Furniture from '@/models/Furniture';
import { connectToDatabase } from '@/lib/mongodb';
import { getAmazonProductUrl, getFlipkartProductUrl } from '@/lib/store-links';
import { COMPREHENSIVE_CATALOG } from '@/lib/furniture-matcher';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Search query (q) is required' },
        { status: 400 }
      );
    }

    const items = await FurnitureItem.find({
      $or: [
        { productName: { $regex: query, $options: 'i' } },
        { brand: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } },
      ],
    })
      .limit(30)
      .sort({ rating: -1, createdAt: -1 });

    if (items && items.length > 0) {
      const mapped = items.map((doc: any) => {
        const obj = doc.toObject ? doc.toObject() : doc;
        const name = obj.productName || obj.name;
        return {
          ...obj,
          amazonUrl: getAmazonProductUrl(name, obj.amazonUrl),
          flipkartUrl: getFlipkartProductUrl(name, obj.flipkartUrl),
        };
      });

      return NextResponse.json({
        success: true,
        data: mapped,
      });
    }
  } catch (error) {
    console.warn('Furniture search MongoDB fallback:', error);
  }

  // Fallback to local catalog with query filter
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get('q') || '').toLowerCase();

  const fallback = COMPREHENSIVE_CATALOG.filter(
    (i) =>
      i.productName.toLowerCase().includes(query) ||
      i.brand.toLowerCase().includes(query) ||
      i.category.toLowerCase().includes(query) ||
      i.description.toLowerCase().includes(query)
  ).map((i, idx) => ({
    _id: `cat_${idx + 1}`,
    ...i,
    amazonUrl: getAmazonProductUrl(i.productName, i.amazonUrl),
    flipkartUrl: getFlipkartProductUrl(i.productName, i.flipkartUrl),
  }));

  return NextResponse.json({
    success: true,
    data: fallback,
  });
}
