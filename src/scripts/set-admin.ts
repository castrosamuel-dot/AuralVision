import { config } from 'dotenv';
import { resolve } from 'path';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Load .env.local
config({ path: resolve(process.cwd(), '.env.local') });

async function setSuperAdmin(email: string) {
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
    
    console.log(`Looking up user ${email}...`);
    const user = await auth.getUserByEmail(email);
    
    console.log(`Found user ${user.uid}. Setting super_admin claims...`);
    await auth.setCustomUserClaims(user.uid, {
      admin: true,
      role: 'super_admin'
    });

    console.log(`Successfully set 'super_admin' role for ${email}.`);
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

setSuperAdmin('castro.samuel@gmail.com');
