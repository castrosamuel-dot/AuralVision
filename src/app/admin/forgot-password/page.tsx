'use client';
import { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { auth } from '@/lib/firebase';
import Link from 'next/link';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      await sendPasswordResetEmail(auth, email);
      setStatus('success');
    } catch (error) {
      console.error('Password reset error:', error);
      setStatus('error');
      
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case 'auth/user-not-found':
            setErrorMessage('No account found with this email address.');
            break;
          case 'auth/invalid-email':
            setErrorMessage('Please enter a valid email address.');
            break;
          case 'auth/too-many-requests':
            setErrorMessage('Too many requests. Please try again later.');
            break;
          case 'auth/missing-email':
            setErrorMessage('Please provide an email address.');
            break;
          default:
            setErrorMessage(`Failed to send reset email: ${error.message}`);
        }
      } else if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('An unexpected error occurred.');
      }
    }
  };

  if (status === 'success') {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="flex justify-center">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Check your email
            </h2>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              We&apos;ve sent a password reset link to:
            </p>
            <p className="mt-2 font-medium text-gray-900 dark:text-white">
              {email}
            </p>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Click the link in the email to reset your password. If you don&apos;t see it, check your spam folder.
            </p>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => {
                setStatus('idle');
                setEmail('');
              }}
              className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              Send another email
            </button>
            <Link
              href="/admin/login"
              className="block w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 text-center"
            >
              Back to login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <Link
            href="/admin/login"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to login
          </Link>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Enter your email address and we&apos;ll send you a link to reset your password.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="sr-only">
              Email address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full pl-10 px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                placeholder="Email address"
              />
            </div>
          </div>

          {status === 'error' && (
            <div className="text-red-500 text-sm text-center bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'loading' ? 'Sending...' : 'Send reset link'}
          </button>
        </form>
      </div>
    </div>
  );
}
