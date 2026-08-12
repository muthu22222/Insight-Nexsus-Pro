import { NextRequest, NextResponse } from 'next/server';
import Project from '@/models/Project';
import FurnitureItem from '@/models/FurnitureItem';
import { connectToDatabase } from '@/lib/mongodb';
import { authenticate } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const payload = authenticate(request);
    await connectToDatabase();

    const body = await request.json();
    const { projectId, furnitureItems } = body as {
      projectId: string;
      furnitureItems: { furnitureId: string; quantity: number }[];
    };

    if (!projectId || !furnitureItems || !Array.isArray(furnitureItems)) {
      return NextResponse.json(
        { success: false, error: 'projectId and furnitureItems array are required' },
        { status: 400 }
      );
    }

    const project = await Project.findOne({
      _id: projectId,
      userId: payload.userId,
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    const furnitureIds = furnitureItems.map((item) => item.furnitureId);
    const furnitureDocs = await FurnitureItem.find({ _id: { $in: furnitureIds } });

    const furnitureMap = new Map(
      furnitureDocs.map((f) => [f._id.toString(), f])
    );

    const shoppingList = furnitureItems
      .map((item) => {
        const furniture = furnitureMap.get(item.furnitureId);
        if (!furniture) return null;

        return {
          furnitureId: furniture._id,
          quantity: item.quantity || 1,
          price: furniture.price,
          store: furniture.storeName,
          productLink: furniture.productUrl,
          checked: false,
        };
      })
      .filter(Boolean);

    project.shoppingList = shoppingList as typeof project.shoppingList;
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
    const payload = authenticate(request);
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { success: false, error: 'projectId is required' },
        { status: 400 }
      );
    }

    const project = await Project.findOne({
      _id: projectId,
      userId: payload.userId,
    }).populate('shoppingList.furnitureId');

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: project.shoppingList,
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
