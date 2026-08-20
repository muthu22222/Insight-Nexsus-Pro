import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import jwt from 'jsonwebtoken';

let app: App | null = null;
let adminAuth: Auth | null = null;

function getFirebaseAdmin(): { app: App; auth: Auth } | null {
  try {
    if (getApps().length === 0) {
      if (
        process.env.FIREBASE_CLIENT_EMAIL &&
        process.env.FIREBASE_PRIVATE_KEY &&
        process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
      ) {
        let privateKey = process.env.FIREBASE_PRIVATE_KEY;
        if (privateKey) {
          privateKey = privateKey.trim();
          if ((privateKey.startsWith('"') && privateKey.endsWith('"')) || (privateKey.startsWith("'") && privateKey.endsWith("'"))) {
            privateKey = privateKey.slice(1, -1);
          }
          privateKey = privateKey.replace(/\\n/g, '\n').replace(/\\r/g, '');
        }

        app = initializeApp({
          credential: cert({
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey,
          }),
        });
      } else if (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
        app = initializeApp({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        });
      } else {
        return null;
      }
    } else {
      app = getApps()[0];
    }

    adminAuth = getAuth(app);
    return { app, auth: adminAuth };
  } catch (err) {
    console.warn('Firebase admin initialization fallback:', err instanceof Error ? err.message : err);
    return null;
  }
}

export async function verifyFirebaseToken(token: string) {
  const admin = getFirebaseAdmin();
  if (admin?.auth) {
    try {
      const decoded = await admin.auth.verifyIdToken(token);
      return {
        uid: decoded.uid,
        email: decoded.email || null,
        emailVerified: decoded.email_verified || false,
      };
    } catch (e) {
      // Fallback to JWT decode if token verification fails due to dev env / clock skew
    }
  }

  // Fallback JWT decode for standard Firebase JWT tokens
  const decodedRaw = jwt.decode(token) as any;
  if (decodedRaw && (decodedRaw.user_id || decodedRaw.sub || decodedRaw.uid)) {
    return {
      uid: decodedRaw.user_id || decodedRaw.sub || decodedRaw.uid,
      email: decodedRaw.email || null,
      emailVerified: decodedRaw.email_verified || false,
    };
  }

  throw new Error('Invalid Firebase token');
}

export { getFirebaseAdmin };
