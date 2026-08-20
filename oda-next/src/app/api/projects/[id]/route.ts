import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Project from '@/models/Project';
import { connectToDatabase } from '@/lib/mongodb';
import { authenticate } from '@/lib/auth';
import { getAmazonProductUrl, getFlipkartProductUrl } from '@/lib/store-links';

function isValidObjectId(id: string) {
  return mongoose.Types.ObjectId.isValid(id);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await authenticate(request);
    await connectToDatabase();
    const { id } = await params;

    if (!id || !isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    const userIds: string[] = Array.from(
      new Set([payload.userId, payload.firebaseUid].filter((x): x is string => Boolean(x)))
    );

    const project = await Project.findOne({
      _id: id,
      userId: { $in: userIds },
    }).lean();

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error('Project get error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    const status = message.includes('Unauthorized') ? 401 : 500;
    return NextResponse.json(
      { success: false, error: message },
      { status }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await authenticate(request);
    await connectToDatabase();
    const { id } = await params;

    if (!id || !isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    const userIds: string[] = Array.from(
      new Set([payload.userId, payload.firebaseUid].filter((x): x is string => Boolean(x)))
    );

    const existing = await Project.findOne({
      _id: id,
      userId: { $in: userIds },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Project not found or unauthorized' },
        { status: 404 }
      );
    }

    const body = await request.json().catch(() => ({}));

    // 1. Handle adding furniture from catalog / product details
    if (Array.isArray(body.addFurniture) && body.addFurniture.length > 0) {
      body.addFurniture.forEach((p: any, idx: number) => {
        const pName = p.name || p.productName || `Furniture Item ${existing.furniture.length + idx + 1}`;
        const numPrice = typeof p.price === 'number' ? p.price : parseInt(String(p.price || '0').replace(/[^\d]/g, ''), 10) || 15000;
        const newItem = {
          _id: p._id || `furn_${Date.now()}_${idx}`,
          name: pName,
          productName: pName,
          category: p.category || 'Furniture',
          brand: p.brand || 'Retailer',
          price: numPrice,
          image: p.image || '',
          description: p.description || '',
          style: p.style || existing.selectedStyle || 'Modern',
          rating: p.rating || 4.5,
          amazonUrl: getAmazonProductUrl(pName, p.amazonUrl),
          flipkartUrl: getFlipkartProductUrl(pName, p.flipkartUrl),
          productUrl: p.productUrl || 'https://www.urbanladder.com',
          storeName: p.storeName || p.store || 'Urban Ladder',
          inStock: true,
        };

        existing.furniture.push(newItem as any);
        existing.furniturePrices.push(numPrice);

        // Also add to shopping list
        existing.shoppingList.push({
          furnitureId: newItem._id,
          productName: pName,
          name: pName,
          category: p.category || 'Furniture',
          quantity: 1,
          price: numPrice,
          store: newItem.storeName,
          productLink: newItem.productUrl,
          amazonUrl: newItem.amazonUrl,
          flipkartUrl: newItem.flipkartUrl,
          checked: false,
        } as any);
      });

      // Recalculate spent in budget plan
      const calculatedSpend = existing.furniturePrices.reduce((a: number, b: number) => a + (Number(b) || 0), 0);
      if (existing.budgetPlan) {
        existing.budgetPlan.spent = calculatedSpend;
        existing.budgetPlan.remaining = Math.max(0, (existing.budgetPlan.totalBudget || existing.budget || 200000) - calculatedSpend);
      }

      await existing.save();
      return NextResponse.json({
        success: true,
        data: existing,
      });
    }

    // 2. Handle partial updates
    if (typeof body.name === 'string' && body.name.trim()) {
      existing.name = body.name.trim();
    }
    if (body.originalImage) {
      existing.originalImage = body.originalImage;
      existing.roomImage = body.originalImage;
    }
    if (body.roomImage) {
      existing.roomImage = body.roomImage;
      if (!existing.originalImage) existing.originalImage = body.roomImage;
    }
    if (body.generatedImage) existing.generatedImage = body.generatedImage;
    if (body.roomType) existing.roomType = body.roomType;
    if (body.roomAnalysis) existing.roomAnalysis = body.roomAnalysis;
    if (body.selectedStyle || body.style) existing.selectedStyle = body.selectedStyle || body.style;
    if (body.style) existing.style = body.style;
    if (body.mood) existing.mood = body.mood;
    if (body.colorPreference || body.color) existing.colorPreference = body.colorPreference || body.color;
    if (body.color) existing.color = body.color;
    if (typeof body.budget === 'number' || body.budget) existing.budget = Number(body.budget);
    if (body.status) existing.status = body.status;

    if (body.selectedDesign) {
      existing.selectedDesign = body.selectedDesign;
    }
    if (Array.isArray(body.designs) && body.designs.length > 0) {
      existing.designs = body.designs as any;
    }

    // Normalize furniture if provided
    if (Array.isArray(body.furniture) && body.furniture.length > 0) {
      existing.furniture = body.furniture.map((item: any, idx: number) => {
        const pName = item.name || item.productName || `Furniture Item ${idx + 1}`;
        const numPrice = typeof item.price === 'number' ? item.price : parseInt(String(item.price || '0').replace(/[^\d]/g, ''), 10) || 15000;
        return {
          _id: item._id || `furn_${idx + 1}`,
          name: pName,
          productName: pName,
          category: item.category || 'Furniture',
          brand: item.brand || 'Retailer',
          price: numPrice,
          image: item.image || '',
          description: item.description || '',
          style: item.style || existing.selectedStyle || 'Modern',
          rating: item.rating || 4.5,
          amazonUrl: getAmazonProductUrl(pName, item.amazonUrl),
          flipkartUrl: getFlipkartProductUrl(pName, item.flipkartUrl),
          productUrl: item.productUrl || 'https://www.urbanladder.com',
          storeName: item.storeName || item.store || 'Urban Ladder',
          inStock: true,
        };
      }) as any;

      existing.furniturePrices = existing.furniture.map((f: any) => f.price);
    }

    // Normalize shopping list if provided
    if (Array.isArray(body.shoppingList) && body.shoppingList.length > 0) {
      existing.shoppingList = body.shoppingList.map((item: any) => ({
        furnitureId: item.furnitureId || item._id || '',
        productName: item.productName || item.name || '',
        name: item.name || item.productName || '',
        category: item.category || 'Furniture',
        quantity: typeof item.quantity === 'number' ? item.quantity : 1,
        price: typeof item.price === 'number' ? item.price : parseInt(String(item.price || '0').replace(/[^\d]/g, ''), 10) || 0,
        store: item.store || 'Store',
        productLink: item.productLink || '',
        amazonUrl: getAmazonProductUrl(item.productName || item.name || '', item.amazonUrl),
        flipkartUrl: getFlipkartProductUrl(item.productName || item.name || '', item.flipkartUrl),
        checked: Boolean(item.checked),
      })) as any;
    }

    if (body.budgetPlan) {
      existing.budgetPlan = body.budgetPlan;
    }

    await existing.save();

    return NextResponse.json({
      success: true,
      data: existing,
    });
  } catch (error) {
    console.error('Project update error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    const status = message.includes('Unauthorized') ? 401 : 500;
    return NextResponse.json(
      { success: false, error: message },
      { status }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return PUT(request, { params });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await authenticate(request);
    await connectToDatabase();
    const { id } = await params;

    if (!id || !isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    const userIds: string[] = Array.from(
      new Set([payload.userId, payload.firebaseUid].filter((x): x is string => Boolean(x)))
    );

    const project = await Project.findOneAndDelete({
      _id: id,
      userId: { $in: userIds },
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error) {
    console.error('Project delete error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    const status = message.includes('Unauthorized') ? 401 : 500;
    return NextResponse.json(
      { success: false, error: message },
      { status }
    );
  }
}
