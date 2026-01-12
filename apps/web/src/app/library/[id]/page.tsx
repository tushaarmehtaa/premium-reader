'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { PremiumReader } from '@premium-reader/reader-ui';

interface Article {
  id: string;
  title: string;
  author?: string;
  site_name?: string;
  content: string;
  enhanced_content?: string;
  url: string;
}

export default function ArticlePage({ params }: { params: { id: string } }) {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function loadArticle() {
      try {
        const { data, error } = await supabase
          .from('articles')
          .select('*')
          .eq('id', params.id)
          .single();

        if (error) {
          throw error;
        }

        setArticle(data);

        // Mark as read
        await supabase
          .from('articles')
          .update({ read_at: new Date().toISOString() })
          .eq('id', params.id);
      } catch (err) {
        console.error('Error loading article:', err);
        setError('Article not found');
      } finally {
        setLoading(false);
      }
    }

    loadArticle();
  }, [params.id, supabase]);

  const handleClose = () => {
    router.push('/library');
  };

  const handleEnhance = async (paragraphs: string[]) => {
    // Enhancement happens via the API
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    try {
      const response = await fetch(`${apiUrl}/api/enhance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paragraphs }),
      });

      if (!response.ok) {
        throw new Error('Enhancement failed');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) return;

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (!data.done && !data.error) {
                window.dispatchEvent(
                  new CustomEvent('premium-reader-enhance', { detail: data })
                );
              }
            } catch (e) {
              console.error('Parse error:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Enhancement failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading article...</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || 'Article not found'}</p>
          <button
            onClick={() => router.push('/library')}
            className="text-black hover:underline"
          >
            Back to Library
          </button>
        </div>
      </div>
    );
  }

  return (
    <PremiumReader
      article={{
        title: article.title,
        author: article.author,
        siteName: article.site_name,
        content: article.enhanced_content || article.content,
      }}
      onClose={handleClose}
      onEnhance={handleEnhance}
    />
  );
}
