'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Shield, ShieldCheck, UserPlus, Trash2, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface AdminUser {
  uid: string;
  email: string;
  displayName: string | null;
  role: 'admin' | 'super_admin';
  createdAt: string;
  lastSignIn: string;
}

export default function AdminUsersPage() {
  const { user, loading, isSuperAdmin, getIdToken } = useAuth();
  const router = useRouter();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Add admin form
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<'admin' | 'super_admin'>('admin');
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState('');

  // Redirect if not super admin
  useEffect(() => {
    if (!loading && !user) {
      router.push('/admin/login');
    } else if (!loading && user && !isSuperAdmin) {
      router.push('/admin');
    }
  }, [user, loading, isSuperAdmin, router]);

  // Fetch admins list
  const fetchAdmins = async () => {
    try {
      const token = await getIdToken();
      if (!token) return;

      const response = await fetch('/api/admin', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAdmins(data.admins);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to load admins');
      }
    } catch {
      setError('Failed to load admins');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isSuperAdmin) {
      fetchAdmins();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuperAdmin]);

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');
    setAddSuccess('');
    setIsAdding(true);

    try {
      const token = await getIdToken();
      if (!token) {
        setAddError('Not authenticated');
        return;
      }

      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: newAdminEmail,
          role: newAdminRole,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setAddSuccess(data.message);
        setNewAdminEmail('');
        fetchAdmins();
      } else {
        setAddError(data.error || 'Failed to add admin');
      }
    } catch {
      setAddError('Failed to add admin');
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveAdmin = async (adminUid: string, adminEmail: string) => {
    if (!confirm(`Are you sure you want to remove admin access for ${adminEmail}?`)) {
      return;
    }

    try {
      const token = await getIdToken();
      if (!token) return;

      const response = await fetch(`/api/admin?uid=${adminUid}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchAdmins();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to remove admin');
      }
    } catch {
      alert('Failed to remove admin');
    }
  };

  if (loading || !isSuperAdmin) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/admin" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </Link>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Management</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage admin users and their roles using Firebase Auth custom claims
          </p>
        </div>
        <ShieldCheck className="h-8 w-8 text-blue-500" />
      </div>

      {/* Add Admin Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
          <UserPlus className="h-5 w-5 mr-2 text-green-500" />
          Add Admin
        </h2>
        <form onSubmit={handleAddAdmin} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                User must already have an account
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Role
              </label>
              <select
                value={newAdminRole}
                onChange={(e) => setNewAdminRole(e.target.value as 'admin' | 'super_admin')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>
          </div>

          {addError && (
            <div className="text-red-600 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
              {addError}
            </div>
          )}
          {addSuccess && (
            <div className="text-green-600 text-sm bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
              {addSuccess}
            </div>
          )}

          <button
            type="submit"
            disabled={isAdding}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {isAdding ? (
              <>
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
                Adding...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Admin
              </>
            )}
          </button>
        </form>
      </div>

      {/* Admins List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            Current Admins ({admins.length})
          </h2>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin h-8 w-8 text-gray-400" />
          </div>
        ) : error ? (
          <div className="text-red-600 text-center py-12">{error}</div>
        ) : admins.length === 0 ? (
          <div className="text-gray-500 text-center py-12">No admins found</div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {admins.map((admin) => (
              <li key={admin.uid} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    {admin.role === 'super_admin' ? (
                      <ShieldCheck className="h-8 w-8 text-purple-500" />
                    ) : (
                      <Shield className="h-8 w-8 text-blue-500" />
                    )}
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {admin.email}
                      {admin.uid === user?.uid && (
                        <span className="ml-2 text-xs text-gray-500">(you)</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        admin.role === 'super_admin'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                      }`}>
                        {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                      </span>
                      <span className="ml-2">
                        Last sign in: {admin.lastSignIn ? new Date(admin.lastSignIn).toLocaleDateString() : 'Never'}
                      </span>
                    </p>
                  </div>
                </div>
                {admin.uid !== user?.uid && (
                  <button
                    onClick={() => handleRemoveAdmin(admin.uid, admin.email || '')}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    title="Remove admin"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
