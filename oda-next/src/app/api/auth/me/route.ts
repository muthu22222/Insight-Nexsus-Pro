import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth';
import { isDemoMode, findDemoUserById, sanitizeDemoUser } from '@/lib/demo-store';

export async function GET(request: NextRequest) {
  try {
    const payload = await authenticate(request);
    let useDemo = isDemoMode();

    if (!useDemo) {
      try {
        const { connectToDatabase } = await import('@/lib/mongodb');
        const User = (await import('@/models/User')).default;
        await connectToDatabase();

        const user = await User.findById(payload.userId).select('-password');
        if (!user) {
          return NextResponse.json(
            { success: false, error: 'User not found' },
            { status: 404 }
          );
        }

        return NextResponse.json({
          success: true,
          data: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            preferences: user.preferences,
            createdAt: user.createdAt,
          },
        });
      } catch (dbError) {
        console.log('MongoDB not available, falling back to demo mode');
        useDemo = true;
      }
    }

    if (useDemo) {
      const user = await findDemoUserById(payload.userId);
      if (!user) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        data: sanitizeDemoUser(user),
      });
    }

    return NextResponse.json(
      { success: false, error: 'User not found' },
      { status: 404 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    const status = message.includes('Unauthorized') ? 401 : 500;
    return NextResponse.json(
      { success: false, error: message },
      { status }
    );
  }
}
