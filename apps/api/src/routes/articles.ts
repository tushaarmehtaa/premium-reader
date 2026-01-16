import { FastifyPluginAsync } from 'fastify';
import type { Article } from '@premium-reader/types';

// In-memory storage for development (when Supabase is not configured)
const inMemoryArticles: Map<string, Article> = new Map();

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  return process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY;
};

// Lazy load supabase only if configured
let supabase: ReturnType<typeof import('@supabase/supabase-js').createClient> | null = null;

async function getSupabase() {
  if (!isSupabaseConfigured()) return null;
  if (!supabase) {
    const { createClient } = await import('@supabase/supabase-js');
    supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );
  }
  return supabase;
}

interface SaveArticleBody {
  url: string;
  title: string;
  author?: string;
  siteName?: string;
  content: string;
  enhancedContent?: string;
  insights?: Array<{
    paragraphIndex: number;
    text: string;
    startIndex: number;
    endIndex: number;
  }>;
  userId?: string;
}

interface GetArticlesQuery {
  userId?: string;
  limit?: number;
  offset?: number;
}

interface ArticleParams {
  id: string;
}

export const articleRoutes: FastifyPluginAsync = async (fastify) => {
  // Save article
  fastify.post<{ Body: SaveArticleBody }>('/articles', async (request, reply) => {
    const { url, title, author, siteName, content, enhancedContent, insights } = request.body;

    if (!url || !title || !content) {
      return reply.code(400).send({ error: 'Missing required fields: url, title, content' });
    }

    const db = await getSupabase();

    if (db) {
      // Use Supabase
      const userId = request.body.userId;
      if (!userId) {
        return reply.code(400).send({ error: 'userId required when using database' });
      }

      const { data: existing } = await (db
        .from('articles') as any)
        .select('id')
        .eq('url', url)
        .eq('user_id', userId)
        .single();

      if (existing) {
        const { data, error } = await (db
          .from('articles') as any)
          .update({
            title,
            author,
            site_name: siteName,
            content,
            enhanced_content: enhancedContent,
            insights: insights || [],
            saved_at: new Date().toISOString(),
          })
          .eq('id', (existing as any).id)
          .select()
          .single();

        if (error) {
          return reply.code(500).send({ error: error.message });
        }
        return { article: data, updated: true };
      }

      const { data, error } = await (db
        .from('articles') as any)
        .insert({
          url,
          title,
          author,
          site_name: siteName,
          content,
          enhanced_content: enhancedContent,
          insights: insights || [],
          user_id: userId,
          saved_at: new Date().toISOString(),
          tags: [],
        })
        .select()
        .single();

      if (error) {
        return reply.code(500).send({ error: error.message });
      }
      return { article: data, created: true };
    }

    // In-memory storage (no database)
    const id = crypto.randomUUID();
    const article: Article = {
      id,
      url,
      title,
      author,
      siteName,
      content,
      enhancedContent,
      insights: insights || [],
      savedAt: new Date().toISOString(),
      tags: [],
      userId: 'local-user',
    };

    inMemoryArticles.set(id, article);
    return { article, created: true, note: 'Stored in memory (no database configured)' };
  });

  // Get articles
  fastify.get<{ Querystring: GetArticlesQuery }>('/articles', async (request, reply) => {
    const { limit = 50, offset = 0 } = request.query;
    const db = await getSupabase();

    if (db && request.query.userId) {
      const { data, error, count } = await db
        .from('articles')
        .select('*', { count: 'exact' })
        .eq('user_id', request.query.userId)
        .order('saved_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        return reply.code(500).send({ error: error.message });
      }
      return { articles: data, total: count, limit, offset };
    }

    // In-memory
    const articles = Array.from(inMemoryArticles.values())
      .sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime())
      .slice(offset, offset + limit);

    return { articles, total: inMemoryArticles.size, limit, offset };
  });

  // Get single article
  fastify.get<{ Params: ArticleParams }>('/articles/:id', async (request, reply) => {
    const { id } = request.params;
    const db = await getSupabase();

    if (db) {
      const { data, error } = await db
        .from('articles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        return reply.code(404).send({ error: 'Article not found' });
      }
      return { article: data };
    }

    // In-memory
    const article = inMemoryArticles.get(id);
    if (!article) {
      return reply.code(404).send({ error: 'Article not found' });
    }
    return { article };
  });

  // Delete article
  fastify.delete<{ Params: ArticleParams }>('/articles/:id', async (request, reply) => {
    const { id } = request.params;
    const db = await getSupabase();

    if (db) {
      const { error } = await db.from('articles').delete().eq('id', id);
      if (error) {
        return reply.code(500).send({ error: error.message });
      }
      return { deleted: true };
    }

    // In-memory
    const deleted = inMemoryArticles.delete(id);
    return { deleted };
  });
};
