import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Project from '@/models/Project';
import { connectToDatabase } from '@/lib/mongodb';
import { authenticate } from '@/lib/auth';
import { RAW_PROJECTS } from '@/data/raw-projects';

export async function POST(request: NextRequest) {
  try {
    const payload = await authenticate(request);
    await connectToDatabase();

    const targetUserId = payload.firebaseUid || payload.userId;
    if (!targetUserId) {
      return NextResponse.json(
        { success: false, error: 'User identifier not found in authentication token' },
        { status: 400 }
      );
    }

    const userIds = Array.from(
      new Set([payload.userId, payload.firebaseUid].filter((x): x is string => Boolean(x)))
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
          ? `Successfully seeded ${insertedCount} raw projects into your studio database!`
          : 'All raw projects already exist in your database.',
      count: insertedCount,
      data: updatedProjects,
    });
  } catch (error) {
    console.error('Projects seed error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    const status = message.includes('Unauthorized') ? 401 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
