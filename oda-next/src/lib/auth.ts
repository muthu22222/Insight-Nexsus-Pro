import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { verifyFirebaseToken } from '@/lib/firebase-admin';

const JWT_SECRET = process.env.JWT_SECRET || 'oda-next-secret-key';

export interface TokenPayload {
  userId: string;
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
  const authHeader = request.headers.get('Authorization');
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

  // Try Firebase token first
  try {
    const decoded = await verifyFirebaseToken(token);
    if (decoded.uid) {
      // Look up user by firebaseUid or create on first login
      try {
        const { connectToDatabase } = await import('@/lib/mongodb');
        const User = (await import('@/models/User')).default;
        await connectToDatabase();

        let user = await User.findOne({ firebaseUid: decoded.uid });
        if (!user && decoded.email) {
          user = await User.findOne({ email: decoded.email.toLowerCase() });
          if (user) {
            user.firebaseUid = decoded.uid;
            await user.save();
          }
        }

        if (user) {
          return { userId: user._id.toString(), role: user.role };
        }
      } catch {
        // DB not available, use demo fallback
      }

      // If no MongoDB user found, create a virtual payload
      return { userId: decoded.uid, role: 'user' };
    }
  } catch {
    // Not a Firebase token, try JWT
  }

  // Fallback to JWT (for demo mode)
  try {
    return verifyToken(token);
  } catch {
    if (options.optional) {
      return { userId: 'guest-user', role: 'user' };
    }
    throw new Error('Unauthorized: Invalid or expired token');
  }
}

export function requireAdmin(request: NextRequest): TokenPayload {
  // For admin routes, we need to check JWT-based admin role
  // Firebase custom claims would be set via Firebase Admin SDK
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Unauthorized: No token provided');
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    throw new Error('Unauthorized: Invalid token format');
  }

  // Try JWT first (for admin users)
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
