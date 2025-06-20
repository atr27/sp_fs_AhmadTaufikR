'use client';

import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/login');
    router.refresh();
  };

  return (
    <button
      onClick={handleSignOut}
      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
    >
      Sign Out
    </button>
  );
}
