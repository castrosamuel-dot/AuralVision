import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAI, VertexAIBackend } from "firebase/ai";
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "firebase/app-check";

const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || (isBuildTime ? "mock-api-key" : undefined),
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || (isBuildTime ? "mock-auth-domain" : undefined),
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || (isBuildTime ? "mock-project-id" : undefined),
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || (isBuildTime ? "mock-storage-bucket" : undefined),
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || (isBuildTime ? "mock-sender-id" : undefined),
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || (isBuildTime ? "mock-app-id" : undefined),
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const vertexAI = getAI(app, { backend: new VertexAIBackend() });

// Initialize App Check
if (typeof window !== 'undefined') {
  // Enable debug token for localhost
  if (process.env.NODE_ENV === 'development') {
    (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  }

  initializeAppCheck(app, {
    // TODO: Replace with your actual ReCaptcha Enterprise site key for production
    provider: new ReCaptchaEnterpriseProvider(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '6LeIQO4qAAAAAL8H1_qK9fT8q9q9q9q9q9q9q9q'),
    isTokenAutoRefreshEnabled: true,
  });
}

export { app, auth, db, vertexAI };
