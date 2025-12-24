import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, setAdminClaims, removeAdminClaims, listAdmins, getUserByEmail, AdminRole, AdminClaims } from '@/lib/firebase-admin';

// Verify the requesting user is a super admin
async function verifySuperAdmin(request: NextRequest): Promise<{ valid: boolean; uid?: string; error?: string }> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return { valid: false, error: 'Missing authorization header' };
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    const claims = decodedToken as AdminClaims & { uid: string };

    if (!claims.admin || claims.role !== 'super_admin') {
      return { valid: false, error: 'Super admin access required' };
    }

    return { valid: true, uid: decodedToken.uid };
  } catch {
    return { valid: false, error: 'Invalid token' };
  }
}

// GET /api/admin - List all admins (super admin only)
export async function GET(request: NextRequest) {
  const verification = await verifySuperAdmin(request);
  if (!verification.valid) {
    return NextResponse.json({ error: verification.error }, { status: 401 });
  }

  try {
    const admins = await listAdmins();
    return NextResponse.json({ admins });
  } catch (error) {
    console.error('Error listing admins:', error);
    return NextResponse.json({ error: 'Failed to list admins' }, { status: 500 });
  }
}

// POST /api/admin - Add or update admin (super admin only)
export async function POST(request: NextRequest) {
  const verification = await verifySuperAdmin(request);
  if (!verification.valid) {
    return NextResponse.json({ error: verification.error }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { email, role } = body as { email: string; role: AdminRole };

    if (!email || !role) {
      return NextResponse.json({ error: 'Email and role are required' }, { status: 400 });
    }

    if (!['admin', 'super_admin'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await setAdminClaims(user.uid, role);

    return NextResponse.json({
      success: true,
      message: `${email} is now a ${role}`,
      user: {
        uid: user.uid,
        email: user.email,
        role: role,
      }
    });
  } catch (error) {
    console.error('Error setting admin:', error);
    return NextResponse.json({ error: 'Failed to set admin' }, { status: 500 });
  }
}

// DELETE /api/admin - Remove admin (super admin only)
export async function DELETE(request: NextRequest) {
  const verification = await verifySuperAdmin(request);
  if (!verification.valid) {
    return NextResponse.json({ error: verification.error }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get('uid');

    if (!uid) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Prevent super admin from removing themselves
    if (uid === verification.uid) {
      return NextResponse.json({ error: 'Cannot remove your own admin access' }, { status: 400 });
    }

    await removeAdminClaims(uid);

    return NextResponse.json({
      success: true,
      message: 'Admin access removed'
    });
  } catch (error) {
    console.error('Error removing admin:', error);
    return NextResponse.json({ error: 'Failed to remove admin' }, { status: 500 });
  }
}
