import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';

let app: App;
let adminAuth: Auth;

function getFirebaseAdmin(): { app: App; auth: Auth } {
  if (getApps().length === 0) {
    app = initializeApp({
      credential: cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } else {
    app = getApps()[0];
  }

  adminAuth = getAuth(app);
  return { app, auth: adminAuth };
}

export async function verifyFirebaseToken(token: string) {
  const { auth } = getFirebaseAdmin();
  const decoded = await auth.verifyIdToken(token);
  return {
    uid: decoded.uid,
    email: decoded.email || null,
    emailVerified: decoded.email_verified || false,
  };
}

export { getFirebaseAdmin };
