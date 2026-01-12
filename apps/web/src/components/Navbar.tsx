'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

interface NavbarProps {
  user?: {
    email?: string;
  } | null;
}

export function Navbar({ user }: NavbarProps) {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <nav className="border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href={user ? '/library' : '/'} className="text-xl font-semibold">
          Premium Reader
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link
                href="/library"
                className="text-gray-600 hover:text-gray-900 transition"
              >
                Library
              </Link>
              <Link
                href="/settings"
                className="text-gray-600 hover:text-gray-900 transition"
              >
                Settings
              </Link>
              <button
                onClick={handleSignOut}
                className="text-gray-600 hover:text-gray-900 transition"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-gray-600 hover:text-gray-900 transition"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
