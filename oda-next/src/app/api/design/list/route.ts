import { NextRequest, NextResponse } from 'next/server';
import Project from '@/models/Project';
import { connectToDatabase } from '@/lib/mongodb';
import { authenticate } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const payload = authenticate(request);
    await connectToDatabase();

    const projects = await Project.find({ userId: payload.userId })
      .select('name designs roomImage status createdAt updatedAt')
      .sort({ updatedAt: -1 });

    const allDesigns = projects.flatMap((project) =>
      project.designs.map((design: any) => ({
        _id: design._id,
        projectId: project._id,
        projectName: project.name,
        roomImage: project.roomImage,
        style: design.style,
        mood: design.mood,
        color: design.color,
        budget: design.budget,
        generatedImage: design.generatedImage,
        hotspots: design.hotspots,
        projectStatus: project.status,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      }))
    );

    return NextResponse.json({
      success: true,
      data: allDesigns,
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
