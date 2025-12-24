'use client';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function SetupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Block in production - setup should only be done once in development
  const isProduction = process.env.NODE_ENV === 'production';

  const createAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setStatus('Please enter email and password');
      return;
    }
    if (password.length < 6) {
      setStatus('Password must be at least 6 characters');
      return;
    }

    setIsCreating(true);
    setStatus('Creating...');
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setStatus('Success! Admin user created. You can now log in at /admin/login');
      setEmail('');
      setPassword('');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setStatus('Error: ' + message);
    } finally {
      setIsCreating(false);
    }
  };

  if (isProduction) {
    return (
      <div className="p-10">
        <h1 className="text-2xl font-bold mb-4 text-red-600">Setup Disabled</h1>
        <p className="text-gray-600">
          Admin setup is disabled in production. Please use the Firebase Console to manage users.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-center">Setup Admin User</h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            Create your initial admin account. This page is only available in development.
          </p>
        </div>

        <form onSubmit={createAdmin} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Admin Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="admin@example.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  placeholder="Minimum 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {status && (
            <p className={`text-sm text-center ${status.includes('Success') ? 'text-green-600' : status.includes('Error') ? 'text-red-600' : 'text-gray-600'}`}>
              {status}
            </p>
          )}

          <button
            type="submit"
            disabled={isCreating}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isCreating ? 'Creating...' : 'Create Admin User'}
          </button>
        </form>
      </div>
    </div>
  );
}
