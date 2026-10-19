import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getAuth, DecodedIdToken } from 'firebase-admin/auth';

export class FirebaseService {
  private static app: App | null = null;

  static initialize(): void {
    if (this.app || getApps().length > 0) {
      if (!this.app && getApps().length > 0) {
        this.app = getApps()[0];
      }
      return;
    }

    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const rawKey = process.env.FIREBASE_PRIVATE_KEY;
    const privateKey = rawKey ? rawKey.replace(/\\n/g, '\n').replace(/^"|"$/g, '') : undefined;

    if (projectId && clientEmail && privateKey) {
      try {
        this.app = initializeApp({
          credential: cert({
            projectId,
            clientEmail,
            privateKey,
          }),
        });
        console.log('[FirebaseService] Firebase Admin SDK initialized successfully');
      } catch (err: any) {
        console.warn('[FirebaseService] Failed to initialize Firebase Admin SDK:', err?.message || err);
      }
    } else {
      console.warn('[FirebaseService] Firebase credentials missing or incomplete in environment');
    }
  }

  static async verifyIdToken(idToken: string): Promise<DecodedIdToken> {
    this.initialize();
    if (!this.app && getApps().length === 0) {
      throw new Error('Firebase Admin SDK is not configured on the server');
    }
    const auth = getAuth(this.app || undefined);
    return auth.verifyIdToken(idToken);
  }
}
