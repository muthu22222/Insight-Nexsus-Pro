import { NextRequest, NextResponse } from 'next/server';
import { generateToken } from '@/lib/auth';
import { isDemoMode, createDemoUser, findDemoUserByEmail } from '@/lib/demo-store';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    let user: any = null;
    let useDemo = isDemoMode();

    if (!useDemo) {
      try {
        const bcrypt = await import('bcryptjs');
        const { connectToDatabase } = await import('@/lib/mongodb');
        const User = (await import('@/models/User')).default;
        await connectToDatabase();

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
          return NextResponse.json(
            { success: false, error: 'Email already registered' },
            { status: 409 }
          );
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = await User.create({
          name,
          email: email.toLowerCase(),
          password: hashedPassword,
        });
      } catch (dbError) {
        console.log('MongoDB not available, falling back to demo mode');
        useDemo = true;
      }
    }

    if (useDemo) {
      const existing = await findDemoUserByEmail(email);
      if (existing) {
        return NextResponse.json(
          { success: false, error: 'Email already registered' },
          { status: 409 }
        );
      }
      user = await createDemoUser({ name, email, password });
    }

    const token = generateToken(user._id.toString(), user.role);

    return NextResponse.json(
      {
        success: true,
        data: {
          token,
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            preferences: user.preferences,
            createdAt: user.createdAt,
          },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
