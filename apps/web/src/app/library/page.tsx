import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createServerClient } from '@/lib/supabase-server';
import { Navbar } from '@/components/Navbar';
import { LibraryGrid } from '@/components/LibraryGrid';

export const dynamic = 'force-dynamic';

export default async function LibraryPage() {
  const supabase = createServerClient();

  // Check if Supabase is configured
  if (!supabase || !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'your-supabase-url') {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-md text-center">
          <div className="text-6xl mb-6">🚧</div>
          <h1 className="text-2xl font-serif mb-4">Authentication Not Configured</h1>
          <p className="text-gray-600 mb-6">
            Supabase authentication is not set up yet. Try the demo instead!
          </p>
          <Link
            href="/demo"
            className="inline-block bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition"
          >
            Try Demo
          </Link>
        </div>
      </div>
    );
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  const { data: articles, error } = await supabase
    .from('articles')
    .select('*')
    .eq('user_id', session.user.id)
    .order('saved_at', { ascending: false });

  if (error) {
    console.error('Error fetching articles:', error);
  }

  return (
    <div className="min-h-screen">
      <Navbar user={session.user} />

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-serif">Your Library</h1>
          <p className="text-gray-500">{articles?.length || 0} articles</p>
        </div>

        {articles && articles.length > 0 ? (
          <LibraryGrid initialArticles={articles} />
        ) : (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">📚</div>
            <h2 className="text-xl font-semibold mb-2">No saved articles yet</h2>
            <p className="text-gray-500 mb-6">
              Install the Chrome extension to start saving articles
            </p>
            <Link
              href="/#get-extension"
              className="inline-block bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition"
            >
              Get the Extension
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
