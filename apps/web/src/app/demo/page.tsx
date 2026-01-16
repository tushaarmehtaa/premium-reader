'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useClientSearchParams } from '@/hooks/useClientSearchParams';
import { PremiumReader } from '@premium-reader/reader-ui';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ArticleData {
  title: string;
  author: string | null;
  siteName: string | null;
  content: string;
  paragraphs: string[];
  wordCount: number;
  estimatedReadTime: number;
}

const DEMO_ARTICLE: ArticleData = {
  title: "The Art of Deep Reading in a Distracted World",
  author: "Dr. Sarah Chen",
  siteName: "Sutra Journal",
  paragraphs: [],
  wordCount: 850,
  estimatedReadTime: 4,
  content: `
    <article>
      <p>In an age of endless notifications, infinite scrolling, and constant digital interruptions, the ability to engage in deep reading has become both more valuable and more challenging than ever before.</p>
      <p>The practice of deep reading — the kind of immersive, focused engagement with text that leads to genuine understanding and retention — is rapidly becoming a lost art. Yet it remains one of the most powerful tools we have for learning.</p>
      <p>Consider the difference between skimming a news headline and truly engaging with a long-form essay. The former might inform us of facts, but the latter transforms our thinking.</p>
      <p>Deep reading activates different neural pathways, encouraging critical thinking, empathy, and the kind of slow, deliberate processing that builds lasting knowledge.</p>
      <p>The good news is that anyone can reclaim the ability to read deeply. It requires intentional effort and the creation of supportive conditions.</p>
      <p>The first step is recognizing that deep reading is not the default mode — it must be actively chosen and protected.</p>
    </article>
  `,
};

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-paper flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 border-4 border-black/10 border-t-ink rounded-full animate-spin mx-auto" />
        <p className="font-display text-xl text-ink animate-pulse">Unraveling the thread...</p>
      </div>
    </div>
  );
}

export default function AppPage() {
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const searchParams = useClientSearchParams();
  const hasFetched = useRef(false);

  // Auto-fetch if URL is provided in query params
  useEffect(() => {
    const urlParam = searchParams.get('url');
    if (urlParam && !hasFetched.current) {
      hasFetched.current = true;
      setUrlInput(urlParam);
      fetchArticle(urlParam);
    }
  }, [searchParams]);

  // Fetch article from URL
  const fetchArticle = async (url: string) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/fetch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.suggestion || data.error || 'Could not fetch article');
        setLoading(false);
        return;
      }

      const contentHtml = `<article>${data.article.paragraphs.map((p: string) => `<p>${p}</p>`).join('')}</article>`;

      setArticle({
        title: data.article.title,
        author: data.article.author,
        siteName: data.article.siteName,
        content: contentHtml,
        paragraphs: data.article.paragraphs,
        wordCount: data.article.wordCount,
        estimatedReadTime: data.article.estimatedReadTime,
      });

    } catch (err) {
      console.error('Fetch error:', err);
      setError('Could not connect to server. Try pasting the text below.');
    } finally {
      setLoading(false);
    }
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    fetchArticle(urlInput.trim());
  };

  const handleTextSubmit = async () => {
    const text = textareaRef.current?.value;
    if (!text?.trim()) {
      setError('Please paste some text');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/parse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text.trim() }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.suggestion || data.error || 'Could not parse content');
        setLoading(false);
        return;
      }

      setArticle({
        title: data.article.title,
        author: data.article.author,
        siteName: 'Pasted Content',
        content: data.article.content,
        paragraphs: data.article.paragraphs,
        wordCount: data.article.wordCount,
        estimatedReadTime: data.article.estimatedReadTime,
      });

    } catch (err) {
      console.error('Parse error:', err);
      setError('Could not connect to server.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = useCallback(() => {
    setArticle(null);
    setUrlInput('');
    setError('');
    hasFetched.current = false;
    if (textareaRef.current) {
      textareaRef.current.value = '';
    }
    // Clear URL param
    window.history.replaceState({}, '', '/demo');
  }, []);

  // Call enhance API and dispatch events for highlighting
  const handleEnhance = useCallback(async (paragraphs: string[]) => {
    console.log('[enhance] Starting enhancement for', paragraphs.length, 'paragraphs');

    // Start structure generation in parallel
    fetchStructure(paragraphs, article?.title || 'Untitled');

    try {
      const response = await fetch(`${API_URL}/api/enhance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paragraphs }),
      });

      if (!response.ok || !response.body) {
        console.error('[enhance] Failed to start enhancement');
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
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
              if (data.done) {
                console.log('[enhance] Enhancement complete');
                continue;
              }
              if (data.error) {
                console.error('[enhance] Error:', data.error);
                continue;
              }

              console.log('[enhance] Got insight for paragraph', data.index, ':', data.insight?.substring(0, 50));

              // Dispatch event to reader component
              window.dispatchEvent(
                new CustomEvent('premium-reader-enhance', { detail: data })
              );
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (err) {
      console.error('[enhance] Error:', err);
    }
  }, [article?.title]);

  // Fetch AI-generated article structure for navigation
  const fetchStructure = useCallback(async (paragraphs: string[], title: string) => {
    console.log('[structure] Generating article structure...');

    try {
      const response = await fetch(`${API_URL}/api/structure`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paragraphs, title }),
      });

      if (!response.ok) {
        console.error('[structure] Failed to generate structure');
        return;
      }

      const data = await response.json();

      if (data.success && data.structure) {
        console.log('[structure] Generated', data.structure.sections?.length || 0, 'sections');

        // Dispatch event to reader component
        window.dispatchEvent(
          new CustomEvent('premium-reader-structure', { detail: data.structure })
        );
      }
    } catch (err) {
      console.error('[structure] Error:', err);
    }
  }, []);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (article) {
    return (
      <PremiumReader
        article={{
          title: article.title,
          author: article.author || undefined,
          siteName: article.siteName || undefined,
          content: article.content,
          estimatedReadTime: article.estimatedReadTime,
          wordCount: article.wordCount,
        }}
        onClose={handleClose}
        onEnhance={handleEnhance}
        initialTheme="light"
        initialFontSize="medium"
      />
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <header className="fixed top-0 left-0 right-0 z-50 p-6 flex justify-between items-center pointer-events-none">
        <Link
          href="/"
          className="font-display font-bold text-xl tracking-tight text-ink pointer-events-auto"
        >
          Sutra.
        </Link>
        <button
          onClick={() => setArticle(DEMO_ARTICLE)}
          className="text-sm font-medium text-ink-secondary hover:text-ink transition-colors pointer-events-auto"
        >
          Try Demo
        </button>
      </header>

      <main className="pt-40 pb-20 px-6">
        <div className="max-w-2xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h1 className="font-display text-6xl md:text-7xl text-ink tracking-tighter">
              Unravel the thread.
            </h1>
            <p className="font-body text-xl text-ink-secondary">
              Paste the URL. We'll do the rest.
            </p>
          </div>

          {error && (
            <div className="p-4 bg-orange-100 text-orange-800 text-sm text-center rounded-lg animate-fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleUrlSubmit} className="relative group">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Paste URL here..."
              className="w-full bg-white border border-black/5 rounded-2xl p-6 text-2xl text-center font-display placeholder:text-black/10 focus:outline-none focus:ring-2 focus:ring-black/5 shadow-xl shadow-black/5 transition-all"
            />
            <button
              type="submit"
              className={`absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center transition-all duration-300 ${urlInput ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}`}
            >
              →
            </button>
          </form>

          <div className="flex items-center gap-4 opacity-50">
            <div className="h-px bg-black/10 flex-1" />
            <span className="font-sans text-xs uppercase tracking-widest">or</span>
            <div className="h-px bg-black/10 flex-1" />
          </div>

          <div className="relative group">
            <textarea
              ref={textareaRef}
              placeholder="Paste text directly..."
              className="w-full h-64 bg-transparent border-none resize-none text-lg font-body leading-relaxed placeholder:text-black/20 focus:outline-none p-0 text-ink"
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                  handleTextSubmit();
                }
              }}
            />
            <div className="absolute bottom-0 right-0 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300">
              <button
                onClick={handleTextSubmit}
                className="px-6 py-2 bg-black text-white rounded-full text-sm font-medium hover:scale-105 transition-transform"
              >
                Read (⌘+Enter)
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
