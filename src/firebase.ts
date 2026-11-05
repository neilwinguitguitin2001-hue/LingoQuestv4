import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  setPersistence,
  browserLocalPersistence,
  signInWithPopup,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import appletFallbackConfig from '../firebase-applet-config.json';

/**
 * Firebase Modular v9+ Initialization for LingoQuest
 *
 * Reads configuration from Vite environment variables (`VITE_FIREBASE_*`)
 * for Vercel production/preview deployments (https://lingo-questv3.vercel.app/),
 * with a safe fallback to `firebase-applet-config.json` in the AI Studio preview environment.
 */
const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env || {};

const hasAppletConfig =
  Boolean(appletFallbackConfig.apiKey) &&
  Boolean(appletFallbackConfig.projectId) &&
  appletFallbackConfig.projectId !== 'remixed-project-id';

const isVercelHost =
  typeof window !== 'undefined' && window.location.hostname.includes('vercel.app');

const hasValidEnvConfig =
  Boolean(env.VITE_FIREBASE_API_KEY) &&
  Boolean(env.VITE_FIREBASE_PROJECT_ID) &&
  !String(env.VITE_FIREBASE_API_KEY).includes('your_');

// Use firebase-applet-config.json in AI Studio; allow VITE_FIREBASE_* override on Vercel or if applet config is absent
const useEnvConfig = (!hasAppletConfig || isVercelHost) && hasValidEnvConfig;

const firebaseConfig = {
  apiKey: useEnvConfig ? env.VITE_FIREBASE_API_KEY : appletFallbackConfig.apiKey,
  authDomain: useEnvConfig ? env.VITE_FIREBASE_AUTH_DOMAIN : appletFallbackConfig.authDomain,
  projectId: useEnvConfig ? env.VITE_FIREBASE_PROJECT_ID : appletFallbackConfig.projectId,
  storageBucket: useEnvConfig
    ? env.VITE_FIREBASE_STORAGE_BUCKET
    : appletFallbackConfig.storageBucket,
  messagingSenderId: useEnvConfig
    ? env.VITE_FIREBASE_MESSAGING_SENDER_ID
    : appletFallbackConfig.messagingSenderId,
  appId: useEnvConfig ? env.VITE_FIREBASE_APP_ID : appletFallbackConfig.appId,
};

// Named Firestore database ID from firebase-applet-config.json in AI Studio, or VITE_FIREBASE_DATABASE_ID on Vercel
const firestoreDatabaseId = useEnvConfig
  ? env.VITE_FIREBASE_DATABASE_ID && env.VITE_FIREBASE_DATABASE_ID !== '(default)'
    ? env.VITE_FIREBASE_DATABASE_ID
    : undefined
  : appletFallbackConfig.firestoreDatabaseId;

export const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = firestoreDatabaseId
  ? getFirestore(app, firestoreDatabaseId)
  : getFirestore(app);

export const auth = getAuth(app);
export const storage = getStorage(app);

// Google Workspace Scopes (Google Sheets API)
export const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

export const googleAuthProvider = new GoogleAuthProvider();
SCOPES.forEach((scope) => googleAuthProvider.addScope(scope));
googleAuthProvider.setCustomParameters({ prompt: 'select_account' });

// In-memory Google Workspace OAuth access token cache (never stored in localStorage/sessionStorage)
let cachedAccessToken: string | null = null;

export function getWorkspaceAccessToken(): string | null {
  return cachedAccessToken;
}

export function clearWorkspaceAccessToken(): void {
  cachedAccessToken = null;
}

export function initWorkspaceAuth(callback?: (user: User | null, token: string | null) => void) {
  return onAuthStateChanged(auth, (user) => {
    if (!user) {
      cachedAccessToken = null;
    }
    if (callback) {
      callback(user, cachedAccessToken);
    }
  });
}

export async function signInWithGoogleSheetsScope(): Promise<{
  user: User;
  accessToken: string | null;
}> {
  const provider = new GoogleAuthProvider();
  SCOPES.forEach((scope) => provider.addScope(scope));
  provider.setCustomParameters({ prompt: 'consent select_account' });

  const result = await signInWithPopup(auth, provider);
  const credential = GoogleAuthProvider.credentialFromResult(result);
  cachedAccessToken = credential?.accessToken ?? null;
  return { user: result.user, accessToken: cachedAccessToken };
}

// Ensure persistent browser sessions across reloads
setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.warn('Firebase Auth persistence notice:', err);
});

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

