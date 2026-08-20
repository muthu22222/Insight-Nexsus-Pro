import { NextRequest, NextResponse } from 'next/server';
import Project from '@/models/Project';
import { connectToDatabase } from '@/lib/mongodb';
import { authenticate } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const payload = await authenticate(request);
    await connectToDatabase();

    const body = await request.json();
    const { projectId, design } = body;

    if (!projectId || !design) {
      return NextResponse.json(
        { success: false, error: 'projectId and design are required' },
        { status: 400 }
      );
    }

    const userIds: string[] = Array.from(
      new Set([payload.userId, payload.firebaseUid].filter((x): x is string => Boolean(x)))
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

    project.designs.push(design);
    await project.save();

    return NextResponse.json({
      success: true,
      data: project.designs,
    });
  } catch (error) {
    console.error('Design save error:', error);
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

    const userIds: string[] = Array.from(
      new Set([payload.userId, payload.firebaseUid].filter((x): x is string => Boolean(x)))
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
      data: project.designs,
    });
  } catch (error) {
    console.error('Design list error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    const status = message.includes('Unauthorized') ? 401 : 500;
    return NextResponse.json(
      { success: false, error: message },
      { status }
    );
  }
}
