'use client';

import { useState, useMemo } from 'react';
import { ArticleCard } from './ArticleCard';
import { createClient } from '@/lib/supabase';

interface Article {
  id: string;
  title: string;
  author?: string;
  site_name?: string;
  url: string;
  saved_at: string;
  read_at?: string;
  insights?: Array<{ text: string }>;
}

interface LibraryGridProps {
  initialArticles: Article[];
}

export function LibraryGrid({ initialArticles }: LibraryGridProps) {
  const [articles, setArticles] = useState(initialArticles);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const supabase = useMemo(() => createClient(), []);

  const handleDelete = async (id: string) => {
    try {
      setError(null);
      const { error } = await supabase.from('articles').delete().eq('id', id);

      if (error) throw error;

      setArticles((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error('Failed to delete:', err);
      setError('Failed to delete article. Please try again.');
      // Auto-dismiss error after 5 seconds
      setTimeout(() => setError(null), 5000);
    }
  };

  const filteredArticles = articles.filter((article) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      article.title.toLowerCase().includes(query) ||
      article.author?.toLowerCase().includes(query) ||
      article.site_name?.toLowerCase().includes(query)
    );
  });

  return (
    <div>
      {/* Error Toast */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
          {error}
        </div>
      )}

      {/* Search */}
      <div className="mb-6">
        <input
          type="search"
          name="search"
          autoComplete="off"
          placeholder="Search articles…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:border-transparent"
        />
      </div>

      {/* Grid */}
      {filteredArticles.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredArticles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          {searchQuery ? (
            <p>No articles match your search</p>
          ) : (
            <p>No articles yet</p>
          )}
        </div>
      )}
    </div>
  );
}
