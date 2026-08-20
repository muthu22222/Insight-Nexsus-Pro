import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { authenticate } from '@/lib/auth';
import { isDemoMode, findDemoUserById, sanitizeDemoUser } from '@/lib/demo-store';

export async function GET(request: NextRequest) {
  try {
    const payload = await authenticate(request);

    // 1. Try finding or syncing user in MongoDB
    try {
      const { connectToDatabase } = await import('@/lib/mongodb');
      const User = (await import('@/models/User')).default;
      await connectToDatabase();

      const queryConditions: any[] = [];
      if (mongoose.Types.ObjectId.isValid(payload.userId)) {
        queryConditions.push({ _id: payload.userId });
      }
      if (payload.firebaseUid) {
        queryConditions.push({ firebaseUid: payload.firebaseUid });
      }
      if (payload.email) {
        queryConditions.push({ email: payload.email.toLowerCase() });
      }

      let user = queryConditions.length > 0
        ? await User.findOne({ $or: queryConditions }).select('-password')
        : null;

      if (!user && payload.email) {
        try {
          user = await User.create({
            name: payload.email.split('@')[0] || 'User',
            email: payload.email.toLowerCase(),
            password: 'firebase-authenticated',
            firebaseUid: payload.firebaseUid || payload.userId,
            avatar: '',
            role: payload.role || 'user',
          });
        } catch (createErr) {
          user = await User.findOne({ email: payload.email.toLowerCase() });
        }
      }

      if (user) {
        return NextResponse.json({
          success: true,
          data: {
            _id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role || 'user',
            avatar: user.avatar || '',
            preferences: user.preferences || {
              favoriteStyles: [],
              defaultBudget: 200000,
              preferredColors: [],
            },
            createdAt: user.createdAt,
          },
        });
      }
    } catch (dbErr) {
      console.warn('MongoDB lookup in /api/auth/me:', dbErr instanceof Error ? dbErr.message : dbErr);
    }

    // 2. Fallback to demo store if demo mode
    if (isDemoMode()) {
      const demoUser = await findDemoUserById(payload.userId);
      if (demoUser) {
        return NextResponse.json({
          success: true,
          data: sanitizeDemoUser(demoUser),
        });
      }
    }

    // 3. Fallback to valid authenticated Firebase payload
    return NextResponse.json({
      success: true,
      data: {
        _id: payload.userId || payload.firebaseUid || 'user',
        name: payload.email?.split('@')[0] || 'User',
        email: payload.email || '',
        role: payload.role || 'user',
        avatar: '',
        preferences: {
          favoriteStyles: [],
          defaultBudget: 200000,
          preferredColors: [],
        },
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    const status = message.toLowerCase().includes('unauthorized') ||
      message.toLowerCase().includes('token') ||
      message.toLowerCase().includes('expired') ||
      message.toLowerCase().includes('bearer')
        ? 401
        : 500;
    return NextResponse.json(
      { success: false, error: message },
      { status }
    );
  }
}
