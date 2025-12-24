import { config } from 'dotenv';
import { resolve } from 'path';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Load .env.local
config({ path: resolve(process.cwd(), '.env.local') });

async function listAllUsers() {
  try {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!serviceAccountKey) {
        throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is not defined');
    }
    const serviceAccount = JSON.parse(serviceAccountKey);

    const app = getApps().length === 0 ? initializeApp({
      credential: cert(serviceAccount),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    }) : getApps()[0];

    const auth = getAuth(app);
    
    console.log(`Project ID: ${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}`);
    console.log('Fetching users...');
    const listUsersResult = await auth.listUsers(1000);
    
    console.log('\n--- User List ---');
    listUsersResult.users.forEach((user) => {
      console.log(`UID: ${user.uid} | Email: ${user.email} | Claims: ${JSON.stringify(user.customClaims)}`);
    });
    console.log('-----------------');

  } catch (error) {
    console.error('Error listing users:', error);
  }
}

listAllUsers();
