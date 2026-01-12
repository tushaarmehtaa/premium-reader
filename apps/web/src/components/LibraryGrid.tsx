'use client';

import { useState } from 'react';
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
  const supabase = createClient();

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('articles').delete().eq('id', id);

      if (error) throw error;

      setArticles((prev) => prev.filter((a) => a.id !== id));
    } catch (error) {
      console.error('Failed to delete:', error);
      alert('Failed to delete article');
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
      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search articles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
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
