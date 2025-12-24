'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {loading ? <div className="h-screen flex items-center justify-center">Loading...</div> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export function withProtected(Component: React.FC) {
    return function ProtectedRoute(props: any) {
      const { user, loading } = useAuth();
      const router = useRouter();
  
      useEffect(() => {
        if (!loading && !user) {
          router.push('/admin/login');
        }
      }, [user, loading, router]);
  
      if (loading) {
        return <div>Loading...</div>; // Or a better spinner
      }

      if (!user) {
        return null; 
      }
  
      return <Component {...props} />;
    };
  }
