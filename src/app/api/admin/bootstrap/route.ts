import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, setAdminClaims, listAdmins, AdminClaims } from '@/lib/firebase-admin';

// The email that is allowed to be bootstrapped as super admin
const BOOTSTRAP_EMAIL = 'castro.samuel@gmail.com';

// POST /api/admin/bootstrap - Bootstrap first super admin
export async function POST(request: NextRequest) {
  // Verify the requesting user's token
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Missing authorization header' }, { status: 401 });
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    // Verify the token
    const decodedToken = await adminAuth.verifyIdToken(token);

    // Check if the user email matches the bootstrap email
    if (decodedToken.email !== BOOTSTRAP_EMAIL) {
      return NextResponse.json(
        { error: `Only ${BOOTSTRAP_EMAIL} can be bootstrapped as super admin` },
        { status: 403 }
      );
    }

    // Check if already has admin claims
    const claims = decodedToken as AdminClaims;
    if (claims.admin && claims.role === 'super_admin') {
      return NextResponse.json({
        success: true,
        message: 'You are already a super admin',
        alreadyAdmin: true,
      });
    }

    // Check if there are already any admins
    const existingAdmins = await listAdmins();
    const hasSuperAdmin = existingAdmins.some(admin => admin.role === 'super_admin');

    if (hasSuperAdmin) {
      return NextResponse.json(
        { error: 'A super admin already exists. Use the admin panel to add more admins.' },
        { status: 400 }
      );
    }

    // Set the super admin claims
    await setAdminClaims(decodedToken.uid, 'super_admin');

    return NextResponse.json({
      success: true,
      message: 'You are now a super admin! Please sign out and sign back in for changes to take effect.',
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: 'super_admin',
    });

  } catch (error) {
    console.error('Bootstrap error:', error);
    return NextResponse.json({ error: 'Failed to bootstrap admin' }, { status: 500 });
  }
}

// GET /api/admin/bootstrap - Check bootstrap status
export async function GET() {
  try {
    const existingAdmins = await listAdmins();
    const hasSuperAdmin = existingAdmins.some(admin => admin.role === 'super_admin');

    return NextResponse.json({
      hasAdmins: existingAdmins.length > 0,
      hasSuperAdmin,
      bootstrapEmail: BOOTSTRAP_EMAIL,
    });
  } catch (error) {
    console.error('Bootstrap status error:', error);
    return NextResponse.json({ error: 'Failed to check status' }, { status: 500 });
  }
}
