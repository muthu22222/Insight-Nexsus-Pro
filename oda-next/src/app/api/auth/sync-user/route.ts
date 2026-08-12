import { NextRequest, NextResponse } from 'next/server';
import { verifyFirebaseToken } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const decoded = await verifyFirebaseToken(token);

    const body = await request.json();
    const { name, email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    try {
      const { connectToDatabase } = await import('@/lib/mongodb');
      const User = (await import('@/models/User')).default;
      await connectToDatabase();

      let user = await User.findOne({ firebaseUid: decoded.uid });

      if (!user) {
        user = await User.findOne({ email: email.toLowerCase() });
        if (user) {
          user.firebaseUid = decoded.uid;
          await user.save();
        }
      }

      if (!user) {
        user = await User.create({
          name: name || email.split('@')[0],
          email: email.toLowerCase(),
          password: 'firebase-managed',
          firebaseUid: decoded.uid,
          avatar: '',
          role: 'user',
        });
      }

      return NextResponse.json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (dbError) {
      console.log('MongoDB not available, user sync skipped');
      return NextResponse.json({
        success: true,
        data: { message: 'User sync skipped (demo mode)' },
      });
    }
  } catch (error) {
    console.error('Sync user error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
