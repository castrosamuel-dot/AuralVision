import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

function getFirebaseAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  // Check for service account credentials
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (serviceAccount) {
    // Parse the JSON service account key from environment variable
    try {
      const parsedServiceAccount = JSON.parse(serviceAccount);
      return initializeApp({
        credential: cert(parsedServiceAccount),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      });
    } catch {
      console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY');
    }
  }

  // Fallback: Initialize with project ID only (works in Google Cloud environments)
  return initializeApp({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "mock-project-id",
  });
}

const adminApp = getFirebaseAdminApp();
export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);

export type AdminRole = 'admin' | 'super_admin';

export interface AdminClaims {
  admin?: boolean;
  role?: AdminRole;
}

// Helper to verify and get user claims
export async function getUserClaims(uid: string): Promise<AdminClaims | null> {
  try {
    const user = await adminAuth.getUser(uid);
    return (user.customClaims as AdminClaims) || null;
  } catch {
    return null;
  }
}

// Helper to set admin claims
export async function setAdminClaims(uid: string, role: AdminRole): Promise<void> {
  await adminAuth.setCustomUserClaims(uid, {
    admin: true,
    role: role,
  });
}

// Helper to remove admin claims
export async function removeAdminClaims(uid: string): Promise<void> {
  await adminAuth.setCustomUserClaims(uid, {
    admin: false,
    role: null,
  });
}

// Helper to get user by email
export async function getUserByEmail(email: string) {
  try {
    return await adminAuth.getUserByEmail(email);
  } catch {
    return null;
  }
}

// Helper to list all admins
export async function listAdmins() {
  const listUsersResult = await adminAuth.listUsers(1000);
  return listUsersResult.users.filter(user => {
    const claims = user.customClaims as AdminClaims;
    return claims?.admin === true;
  }).map(user => ({
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    role: (user.customClaims as AdminClaims)?.role,
    createdAt: user.metadata.creationTime,
    lastSignIn: user.metadata.lastSignInTime,
  }));
}
