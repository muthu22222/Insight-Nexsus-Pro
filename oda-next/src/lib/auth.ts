import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

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

export function authenticate(request: NextRequest): TokenPayload {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Unauthorized: No token provided');
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    throw new Error('Unauthorized: Invalid token format');
  }

  try {
    return verifyToken(token);
  } catch {
    throw new Error('Unauthorized: Invalid or expired token');
  }
}

export function requireAdmin(request: NextRequest): TokenPayload {
  const payload = authenticate(request);
  if (payload.role !== 'admin') {
    throw new Error('Forbidden: Admin access required');
  }
  return payload;
}
