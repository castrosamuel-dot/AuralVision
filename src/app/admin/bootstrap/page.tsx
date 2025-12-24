'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Loader2 } from 'lucide-react';

export default function BootstrapPage() {
  const { user, loading, isSuperAdmin, getIdToken, refreshClaims } = useAuth();
  const router = useRouter();
  const [status, setStatus] = useState('');
  const [isBootstrapping, setIsBootstrapping] = useState(false);
  const [bootstrapInfo, setBootstrapInfo] = useState<{
    hasAdmins: boolean;
    hasSuperAdmin: boolean;
    bootstrapEmail: string;
  } | null>(null);

  // Check bootstrap status on load
  useEffect(() => {
    async function checkStatus() {
      try {
        const response = await fetch('/api/admin/bootstrap');
        if (response.ok) {
          const data = await response.json();
          setBootstrapInfo(data);
        }
      } catch (error) {
        console.error('Failed to check bootstrap status:', error);
      }
    }
    checkStatus();
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/admin/login');
    }
  }, [user, loading, router]);

  // Redirect if already a super admin
  useEffect(() => {
    if (!loading && isSuperAdmin) {
      router.push('/admin');
    }
  }, [loading, isSuperAdmin, router]);

  const handleBootstrap = async () => {
    if (!user) return;

    setIsBootstrapping(true);
    setStatus('Setting up super admin...');

    try {
      const token = await getIdToken();
      if (!token) {
        setStatus('Error: Could not get authentication token');
        setIsBootstrapping(false);
        return;
      }

      const response = await fetch('/api/admin/bootstrap', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setStatus(data.message);
        // Refresh claims to get the new admin status
        await refreshClaims();
        setTimeout(() => router.push('/admin'), 2000);
      } else {
        setStatus(`Error: ${data.error}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setStatus(`Error: ${message}`);
    } finally {
      setIsBootstrapping(false);
    }
  };

  if (loading) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  const canBootstrap = bootstrapInfo && user.email === bootstrapInfo.bootstrapEmail;
  const alreadyHasSuperAdmin = bootstrapInfo?.hasSuperAdmin;

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="flex justify-center">
          <ShieldCheck className="h-16 w-16 text-blue-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bootstrap Super Admin</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            This is a one-time setup to create the initial super admin account using Firebase Auth custom claims.
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Logged in as: <strong className="text-gray-900 dark:text-white">{user.email}</strong>
          </p>

          {alreadyHasSuperAdmin ? (
            <div className="text-amber-600 dark:text-amber-400 text-sm bg-amber-50 dark:bg-amber-900/20 p-3 rounded-md">
              A super admin already exists. Please contact them to add you as an admin.
            </div>
          ) : canBootstrap ? (
            <button
              onClick={handleBootstrap}
              disabled={isBootstrapping}
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 flex items-center justify-center"
            >
              {isBootstrapping ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Setting up...
                </>
              ) : (
                'Activate Super Admin'
              )}
            </button>
          ) : (
            <div className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
              Only <strong>{bootstrapInfo?.bootstrapEmail}</strong> can be bootstrapped as super admin.
            </div>
          )}

          {status && (
            <p className={`text-sm ${status.includes('Error') ? 'text-red-600' : status.includes('already') ? 'text-amber-600' : 'text-green-600'}`}>
              {status}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
