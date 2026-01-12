import { FastifyPluginAsync } from 'fastify';
import { fetchAndExtract } from '../lib/extractor.js';

interface FetchRequestBody {
  url: string;
}

export const fetchRoutes: FastifyPluginAsync = async (fastify) => {
  /**
   * POST /api/fetch
   * Fetches an article from a URL and extracts its content
   */
  fastify.post<{ Body: FetchRequestBody }>('/fetch', async (request, reply) => {
    const { url } = request.body;

    if (!url || typeof url !== 'string') {
      return reply.code(400).send({
        success: false,
        error: 'URL is required',
        code: 'INVALID_URL',
      });
    }

    // Normalize URL
    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = 'https://' + normalizedUrl;
    }

    console.log(`[fetch] Fetching article from: ${normalizedUrl}`);

    const result = await fetchAndExtract(normalizedUrl);

    if (!result.success) {
      console.warn(`[fetch] Failed: ${result.error}`);
      return reply.code(422).send(result);
    }

    console.log(`[fetch] Success: "${result.article.title}" (${result.article.wordCount} words, ${result.article.paragraphs.length} paragraphs)`);

    return {
      success: true,
      article: {
        title: result.article.title,
        author: result.article.author,
        siteName: result.article.siteName,
        publishedDate: result.article.publishedDate,
        content: result.article.content,
        paragraphs: result.article.paragraphs,
        wordCount: result.article.wordCount,
        estimatedReadTime: result.article.estimatedReadTime,
      },
      url: result.url,
      canonicalUrl: result.canonicalUrl,
      inputMethod: 'url',
    };
  });
};
