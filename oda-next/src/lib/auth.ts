import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { verifyFirebaseToken } from '@/lib/firebase-admin';

const JWT_SECRET = process.env.JWT_SECRET || 'oda-next-secret-key';

export interface TokenPayload {
  userId: string;
  firebaseUid?: string;
  email?: string | null;
  role: 'user' | 'admin';
}

export function generateToken(userId: string, role: 'user' | 'admin' = 'user'): string {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}

export async function authenticate(
  request: NextRequest,
  options: { optional?: boolean } = {}
): Promise<TokenPayload> {
  const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    if (options.optional) {
      return { userId: 'guest-user', role: 'user' };
    }
    throw new Error('Unauthorized: No token provided');
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    if (options.optional) {
      return { userId: 'guest-user', role: 'user' };
    }
    throw new Error('Unauthorized: Invalid token format');
  }

  // 1. Try Firebase ID Token
  try {
    const decoded = await verifyFirebaseToken(token);
    if (decoded?.uid) {
      const firebaseUid = decoded.uid;
      const email = decoded.email?.toLowerCase() || '';

      // Sync or lookup user in MongoDB
      try {
        const { connectToDatabase } = await import('@/lib/mongodb');
        const User = (await import('@/models/User')).default;
        await connectToDatabase();

        let user = await User.findOne({ firebaseUid });
        if (!user && email) {
          user = await User.findOne({ email });
          if (user) {
            user.firebaseUid = firebaseUid;
            await user.save();
          }
        }

        if (!user && email) {
          try {
            user = await User.create({
              name: email.split('@')[0] || 'User',
              email,
              password: 'firebase-authenticated',
              firebaseUid,
              avatar: '',
              role: 'user',
            });
          } catch (createErr) {
            // If email already exists or duplicate key race condition, reload user
            user = await User.findOne({ $or: [{ firebaseUid }, { email }] });
          }
        }

        if (user) {
          return {
            userId: user._id.toString(),
            firebaseUid,
            email: user.email,
            role: user.role || 'user',
          };
        }
      } catch (dbErr) {
        console.warn('MongoDB user lookup in auth:', dbErr instanceof Error ? dbErr.message : dbErr);
      }

      return {
        userId: firebaseUid,
        firebaseUid,
        email,
        role: 'user',
      };
    }
  } catch (firebaseErr) {
    // Not a Firebase token, try JWT next
  }

  // 2. Try JWT Token (e.g. for demo user / admin)
  try {
    const payload = verifyToken(token);
    return {
      userId: payload.userId,
      firebaseUid: payload.firebaseUid || payload.userId,
      email: payload.email,
      role: payload.role || 'user',
    };
  } catch (jwtErr) {
    if (options.optional) {
      return { userId: 'guest-user', role: 'user' };
    }
    throw new Error('Unauthorized: Invalid or expired token');
  }
}

export function requireAdmin(request: NextRequest): TokenPayload {
  const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Unauthorized: No token provided');
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    throw new Error('Unauthorized: Invalid token format');
  }

  try {
    const payload = verifyToken(token);
    if (payload.role !== 'admin') {
      throw new Error('Forbidden: Admin access required');
    }
    return payload;
  } catch (e) {
    if (e instanceof Error && e.message.includes('Forbidden')) throw e;
  }

  throw new Error('Unauthorized: Admin authentication required');
}
