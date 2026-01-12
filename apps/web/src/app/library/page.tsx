import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase-server';
import { Navbar } from '@/components/Navbar';
import { LibraryGrid } from '@/components/LibraryGrid';

export const dynamic = 'force-dynamic';

export default async function LibraryPage() {
  const supabase = createServerClient();

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
            <a
              href="/#get-extension"
              className="inline-block bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition"
            >
              Get the Extension
            </a>
          </div>
        )}
      </main>
    </div>
  );
}
