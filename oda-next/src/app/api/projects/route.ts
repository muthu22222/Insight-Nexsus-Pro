import { NextRequest, NextResponse } from 'next/server';
import Project from '@/models/Project';
import { connectToDatabase } from '@/lib/mongodb';
import { authenticate } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const payload = await authenticate(request);
    await connectToDatabase();

    const projects = await Project.find({ userId: payload.userId })
      .sort({ updatedAt: -1 })
      .select('-shoppingList');

    return NextResponse.json({
      success: true,
      data: projects,
    });
  } catch (error) {
    console.error('Projects list error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    const status = message.includes('Unauthorized') ? 401 : 500;
    return NextResponse.json(
      { success: false, error: message },
      { status }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await authenticate(request);
    await connectToDatabase();

    const body = await request.json();
    const { name, roomImage } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Project name is required' },
        { status: 400 }
      );
    }

    const project = await Project.create({
      userId: payload.userId,
      name,
      roomImage: roomImage || '',
      originalImage: roomImage || '',
      status: 'draft',
    });

    return NextResponse.json(
      { success: true, data: project },
      { status: 201 }
    );
  } catch (error) {
    console.error('Project create error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    const status = message.includes('Unauthorized') ? 401 : 500;
    return NextResponse.json(
      { success: false, error: message },
      { status }
    );
  }
}
