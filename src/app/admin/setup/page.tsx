'use client';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useState } from 'react';

export default function SetupPage() {
  const [status, setStatus] = useState('Idle');

  const createAdmin = async () => {
    setStatus('Creating...');
    try {
      await createUserWithEmailAndPassword(auth, 'castro.samuel@gmail.com', 'ID10t091');
      setStatus('Success! User created. You can now log in.');
    } catch (error: any) {
      setStatus('Error: ' + error.message);
    }
  };

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-4">Setup Admin User</h1>
      <button 
        onClick={createAdmin}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Create Admin (castro.samuel@gmail.com)
      </button>
      <p className="mt-4 text-lg">{status}</p>
    </div>
  );
}
