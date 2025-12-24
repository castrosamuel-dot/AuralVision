import { config } from 'dotenv';
import { resolve } from 'path';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Load .env.local
config({ path: resolve(process.cwd(), '.env.local') });

async function checkUser(email: string) {
  try {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!serviceAccountKey) {
        throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is not defined in .env.local');
    }

    const serviceAccount = JSON.parse(serviceAccountKey);

    const app = getApps().length === 0 ? initializeApp({
      credential: cert(serviceAccount),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    }) : getApps()[0];

    const auth = getAuth(app);
    
    console.log(`Checking system for user: ${email}...`);
    try {
        const user = await auth.getUserByEmail(email);
        console.log('------------------------------------------------');
        console.log('✅ User FOUND');
        console.log(`UID: ${user.uid}`);
        console.log(`Email: ${user.email}`);
        console.log(`Display Name: ${user.displayName || 'N/A'}`);
        console.log(`Custom Claims:`, user.customClaims || '{}');
        console.log('------------------------------------------------');
    } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
            console.log('❌ User NOT FOUND in the system.');
        } else {
            throw error;
        }
    }
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

const emailToCheck = process.argv[2] || 'castro.samuel@gmail.com';
checkUser(emailToCheck);
