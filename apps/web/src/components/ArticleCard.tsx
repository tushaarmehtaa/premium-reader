'use client';

import Link from 'next/link';
import type { Article } from '@premium-reader/types';

interface ArticleCardProps {
  article: {
    id: string;
    title: string;
    author?: string;
    site_name?: string;
    url: string;
    saved_at: string;
    read_at?: string;
    insights?: Array<{ text: string }>;
  };
  onDelete?: (id: string) => void;
}

export function ArticleCard({ article, onDelete }: ArticleCardProps) {
  const savedDate = new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(article.saved_at));

  const insightCount = article.insights?.length || 0;

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete && window.confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
      onDelete(article.id);
    }
  };

  return (
    <Link href={`/library/${article.id}`}>
      <article className="border border-gray-200 rounded-lg p-4 hover:border-gray-400 transition group">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-gray-900 group-hover:text-black line-clamp-2">
            {article.title}
          </h3>
          {onDelete && (
            <button
              onClick={handleDelete}
              className="text-gray-400 hover:text-red-500 transition opacity-0 group-hover:opacity-100 ml-2 flex-shrink-0"
              aria-label="Delete article"
              title="Delete article"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
          {article.site_name && <span>{article.site_name}</span>}
          {article.site_name && article.author && <span>·</span>}
          {article.author && <span>{article.author}</span>}
        </div>

        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{savedDate}</span>
          <div className="flex items-center gap-3">
            {insightCount > 0 && (
              <span className="flex items-center gap-1">
                <span>✓</span>
                <span>{insightCount} insights</span>
              </span>
            )}
            {article.read_at && (
              <span className="bg-gray-100 px-2 py-0.5 rounded">Read</span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
