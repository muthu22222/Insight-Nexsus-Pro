import { NextRequest, NextResponse } from 'next/server';
import Project from '@/models/Project';
import Furniture from '@/models/Furniture';
import FurnitureItem from '@/models/FurnitureItem';
import { connectToDatabase } from '@/lib/mongodb';
import { authenticate } from '@/lib/auth';
import { getAmazonProductUrl, getFlipkartProductUrl } from '@/lib/store-links';

export async function POST(request: NextRequest) {
  try {
    const payload = await authenticate(request);
    await connectToDatabase();

    const body = await request.json();
    const { projectId, furnitureItems } = body as {
      projectId: string;
      furnitureItems: { furnitureId?: string; name?: string; quantity: number; price?: number; store?: string; productLink?: string }[];
    };

    if (!projectId || !furnitureItems || !Array.isArray(furnitureItems)) {
      return NextResponse.json(
        { success: false, error: 'projectId and furnitureItems array are required' },
        { status: 400 }
      );
    }

    const userIds = Array.from(
      new Set([payload.userId, payload.firebaseUid].filter(Boolean))
    );

    const project = await Project.findOne({
      _id: projectId,
      userId: { $in: userIds },
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    const shoppingList = furnitureItems.map((item) => {
      const pName = item.name || 'Furniture Item';
      return {
        furnitureId: item.furnitureId || '',
        productName: pName,
        name: pName,
        quantity: item.quantity || 1,
        price: item.price || 0,
        store: item.store || 'Store',
        productLink: item.productLink || '',
        amazonUrl: getAmazonProductUrl(pName),
        flipkartUrl: getFlipkartProductUrl(pName),
        checked: false,
      };
    });

    project.shoppingList = shoppingList as any;
    await project.save();

    return NextResponse.json({
      success: true,
      data: project.shoppingList,
    });
  } catch (error) {
    console.error('Shopping list create error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    const status = message.includes('Unauthorized') ? 401 : 500;
    return NextResponse.json(
      { success: false, error: message },
      { status }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const payload = await authenticate(request);
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { success: false, error: 'projectId is required' },
        { status: 400 }
      );
    }

    const userIds = Array.from(
      new Set([payload.userId, payload.firebaseUid].filter(Boolean))
    );

    const project = await Project.findOne({
      _id: projectId,
      userId: { $in: userIds },
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: project.shoppingList || [],
    });
  } catch (error) {
    console.error('Shopping list get error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    const status = message.includes('Unauthorized') ? 401 : 500;
    return NextResponse.json(
      { success: false, error: message },
      { status }
    );
  }
}
