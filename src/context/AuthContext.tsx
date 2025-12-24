'use client';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged, User, getIdTokenResult } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { AdminRole } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  adminRole: AdminRole | null;
  refreshClaims: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  isSuperAdmin: false,
  adminRole: null,
  refreshClaims: async () => {},
  getIdToken: async () => null,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [adminRole, setAdminRole] = useState<AdminRole | null>(null);

  // Function to check claims from ID token
  const checkClaims = useCallback(async (currentUser: User) => {
    try {
      // Force refresh to get latest claims
      const tokenResult = await getIdTokenResult(currentUser, true);
      const claims = tokenResult.claims;

      if (claims.admin === true) {
        setIsAdmin(true);
        setAdminRole(claims.role as AdminRole);
        setIsSuperAdmin(claims.role === 'super_admin');
      } else {
        setIsAdmin(false);
        setAdminRole(null);
        setIsSuperAdmin(false);
      }
    } catch (error) {
      console.error('Error checking claims:', error);
      setIsAdmin(false);
      setAdminRole(null);
      setIsSuperAdmin(false);
    }
  }, []);

  // Function to refresh claims (useful after bootstrap)
  const refreshClaims = useCallback(async () => {
    if (user) {
      await checkClaims(user);
    }
  }, [user, checkClaims]);

  // Function to get ID token for API calls
  const getIdToken = useCallback(async (): Promise<string | null> => {
    if (!user) return null;
    try {
      return await user.getIdToken();
    } catch {
      return null;
    }
  }, [user]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await checkClaims(currentUser);
      } else {
        setUser(null);
        setIsAdmin(false);
        setAdminRole(null);
        setIsSuperAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [checkClaims]);

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, isSuperAdmin, adminRole, refreshClaims, getIdToken }}>
      {loading ? <div className="h-screen flex items-center justify-center">Loading...</div> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export function withProtected<P extends object>(Component: React.ComponentType<P>) {
  return function ProtectedRoute(props: P) {
    const { user, loading, isAdmin } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && !user) {
        router.push('/admin/login');
      } else if (!loading && user && !isAdmin) {
        router.push('/admin/login?error=unauthorized');
      }
    }, [user, loading, isAdmin, router]);

    if (loading) {
      return <div className="h-screen flex items-center justify-center">Loading...</div>;
    }

    if (!user || !isAdmin) {
      return null;
    }

    return <Component {...props} />;
  };
}

export function withSuperAdmin<P extends object>(Component: React.ComponentType<P>) {
  return function SuperAdminRoute(props: P) {
    const { user, loading, isSuperAdmin } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && !user) {
        router.push('/admin/login');
      } else if (!loading && user && !isSuperAdmin) {
        router.push('/admin?error=super_admin_required');
      }
    }, [user, loading, isSuperAdmin, router]);

    if (loading) {
      return <div className="h-screen flex items-center justify-center">Loading...</div>;
    }

    if (!user || !isSuperAdmin) {
      return null;
    }

    return <Component {...props} />;
  };
}
