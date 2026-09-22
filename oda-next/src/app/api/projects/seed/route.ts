import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Project from '@/models/Project';
import { connectToDatabase } from '@/lib/mongodb';
import { authenticate } from '@/lib/auth';
import { RAW_PROJECTS } from '@/data/raw-projects';

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Seed endpoint active. Send a POST request to seed raw projects.',
    totalRawProjects: RAW_PROJECTS.length,
  });
}

export async function POST(request: NextRequest) {
  try {
    let payload;
    try {
      payload = await authenticate(request, { optional: true });
    } catch {
      payload = { userId: 'raw_studio_designer', role: 'user' as const };
    }

    await connectToDatabase();

    const body = await request.json().catch(() => ({}));
    const targetUserId =
      payload?.firebaseUid ||
      payload?.userId ||
      body?.userId ||
      'raw_studio_designer';

    const userIds = Array.from(
      new Set(
        [payload?.userId, payload?.firebaseUid, body?.userId, targetUserId].filter(
          (x): x is string => Boolean(x)
        )
      )
    );

    // Check existing projects for this user
    const existing = await Project.find({ userId: { $in: userIds } }).lean();
    const existingNames = new Set(existing.map((p) => p.name));

    const projectsToInsert = RAW_PROJECTS.filter((p) => !existingNames.has(p.name)).map((p) => ({
      ...p,
      _id: new mongoose.Types.ObjectId(),
      userId: targetUserId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    let insertedCount = 0;
    if (projectsToInsert.length > 0) {
      const inserted = await Project.insertMany(projectsToInsert);
      insertedCount = inserted.length;
    }

    const updatedProjects = await Project.find({ userId: { $in: userIds } })
      .sort({ updatedAt: -1, createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      message:
        insertedCount > 0
          ? `Successfully saved ${insertedCount} raw projects into your studio database!`
          : 'All 4 raw projects are already present in your studio database.',
      count: insertedCount,
      data: updatedProjects.length > 0 ? updatedProjects : RAW_PROJECTS,
    });
  } catch (error) {
    console.error('Projects seed error:', error);
    const message = error instanceof Error ? error.message : 'Failed to seed projects';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
