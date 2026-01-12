import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';

export interface ExtractedArticle {
  title: string;
  author: string | null;
  siteName: string | null;
  publishedDate: string | null;
  content: string;           // Clean HTML
  textContent: string;       // Plain text for AI processing
  paragraphs: string[];      // Individual paragraph texts
  wordCount: number;
  estimatedReadTime: number; // in minutes
}

export interface FetchResult {
  success: true;
  article: ExtractedArticle;
  url: string;
  canonicalUrl: string | null;
}

export interface FetchError {
  success: false;
  error: string;
  code: 'FETCH_FAILED' | 'NOT_ARTICLE' | 'PAYWALL' | 'BLOCKED' | 'TIMEOUT' | 'INVALID_URL';
  suggestion?: string;
}

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

/**
 * Fetches and extracts article content from a URL
 */
export async function fetchAndExtract(url: string): Promise<FetchResult | FetchError> {
  // Validate URL
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return {
        success: false,
        error: 'Invalid URL protocol. Use http or https.',
        code: 'INVALID_URL',
      };
    }
  } catch {
    return {
      success: false,
      error: 'Invalid URL format',
      code: 'INVALID_URL',
      suggestion: 'Make sure you\'re pasting a complete URL starting with http:// or https://',
    };
  }

  // Fetch with timeout
  let html: string;
  let finalUrl = url;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout

    const response = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
      },
      redirect: 'follow',
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      if (response.status === 403 || response.status === 401) {
        return {
          success: false,
          error: 'This site is blocking access',
          code: 'BLOCKED',
          suggestion: 'Try copying the article text and using paste mode instead',
        };
      }
      if (response.status === 404) {
        return {
          success: false,
          error: 'Article not found',
          code: 'FETCH_FAILED',
        };
      }
      return {
        success: false,
        error: `Failed to fetch: HTTP ${response.status}`,
        code: 'FETCH_FAILED',
      };
    }

    finalUrl = response.url; // Get final URL after redirects
    html = await response.text();
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      return {
        success: false,
        error: 'Request timed out',
        code: 'TIMEOUT',
        suggestion: 'The site is taking too long. Try pasting the content instead.',
      };
    }
    return {
      success: false,
      error: 'Failed to fetch the URL',
      code: 'FETCH_FAILED',
      suggestion: 'Check if the URL is correct and accessible',
    };
  }

  // Parse with JSDOM and Readability
  const dom = new JSDOM(html, { url: finalUrl });
  const document = dom.window.document;

  // Check for paywall indicators
  const paywallIndicators = [
    'paywall',
    'subscribe-wall',
    'subscriber-only',
    'premium-content',
    'registration-wall',
  ];

  const bodyClass = document.body?.className?.toLowerCase() || '';
  const bodyId = document.body?.id?.toLowerCase() || '';
  const isPaywalled = paywallIndicators.some(
    indicator => bodyClass.includes(indicator) || bodyId.includes(indicator) || html.toLowerCase().includes(`class="${indicator}"`)
  );

  // Extract with Readability
  const reader = new Readability(document, {
    charThreshold: 100,
  });

  const article = reader.parse();

  if (!article || !article.content || article.content.length < 200) {
    return {
      success: false,
      error: 'Could not extract article content from this page',
      code: 'NOT_ARTICLE',
      suggestion: 'This might not be an article page. Try pasting the content directly.',
    };
  }

  // Extract canonical URL
  const canonicalLink = document.querySelector('link[rel="canonical"]');
  const canonicalUrl = canonicalLink?.getAttribute('href') || null;

  // Extract published date
  const publishedDate = extractPublishedDate(document);

  // Parse paragraphs from extracted content
  const contentDom = new JSDOM(article.content);
  const paragraphElements = contentDom.window.document.querySelectorAll('p');
  const paragraphs = Array.from(paragraphElements)
    .map(p => p.textContent?.trim() || '')
    .filter(text => text.length > 20); // Filter out tiny paragraphs

  // Calculate metrics
  const textContent = article.textContent || '';
  const wordCount = countWords(textContent);
  const estimatedReadTime = Math.max(1, Math.ceil(wordCount / 200));

  // Clean author name
  let author = article.byline || null;
  if (author) {
    // Remove common prefixes
    author = author.replace(/^(by|written by|author:)\s*/i, '').trim();
    // Limit length
    if (author.length > 100) author = author.substring(0, 100);
  }

  const result: ExtractedArticle = {
    title: article.title || 'Untitled Article',
    author,
    siteName: article.siteName || parsedUrl.hostname.replace('www.', ''),
    publishedDate,
    content: article.content,
    textContent,
    paragraphs,
    wordCount,
    estimatedReadTime,
  };

  // Add paywall warning if detected
  if (isPaywalled && paragraphs.length < 3) {
    return {
      success: false,
      error: 'This article appears to be behind a paywall',
      code: 'PAYWALL',
      suggestion: 'Only partial content is available. Try pasting the full article text.',
    };
  }

  return {
    success: true,
    article: result,
    url: finalUrl,
    canonicalUrl,
  };
}

/**
 * Parses pasted content into structured article format
 */
export function parsePastedContent(content: string): ExtractedArticle | null {
  if (!content || content.trim().length < 50) {
    return null;
  }

  const trimmed = content.trim();

  // Check if it's HTML
  const isHtml = /<[a-z][\s\S]*>/i.test(trimmed);

  let paragraphs: string[];
  let textContent: string;

  if (isHtml) {
    // Parse as HTML
    const dom = new JSDOM(trimmed);
    const document = dom.window.document;

    // Try Readability first
    const reader = new Readability(document, { charThreshold: 50 });
    const article = reader.parse();

    if (article && article.content) {
      const contentDom = new JSDOM(article.content);
      const pElements = contentDom.window.document.querySelectorAll('p');
      paragraphs = Array.from(pElements)
        .map(p => p.textContent?.trim() || '')
        .filter(text => text.length > 10);
      textContent = article.textContent || '';
    } else {
      // Fallback: extract text from all block elements
      textContent = document.body?.textContent || trimmed;
      paragraphs = splitIntoParagraphs(textContent);
    }
  } else {
    // Plain text or markdown
    textContent = trimmed;
    paragraphs = splitIntoParagraphs(trimmed);
  }

  if (paragraphs.length === 0) {
    paragraphs = [textContent];
  }

  const wordCount = countWords(textContent);
  const estimatedReadTime = Math.max(1, Math.ceil(wordCount / 200));

  // Try to extract title from first line if it looks like a heading
  let title = 'Pasted Content';
  const firstLine = paragraphs[0];
  if (firstLine && firstLine.length < 150 && !firstLine.includes('.')) {
    // Looks like a title
    title = firstLine;
    paragraphs = paragraphs.slice(1);
  }

  return {
    title,
    author: null,
    siteName: null,
    publishedDate: null,
    content: paragraphs.map(p => `<p>${escapeHtml(p)}</p>`).join('\n'),
    textContent,
    paragraphs,
    wordCount,
    estimatedReadTime,
  };
}

/**
 * Splits text into logical paragraphs
 */
function splitIntoParagraphs(text: string): string[] {
  // Split by double newlines, or single newlines followed by a capital letter
  return text
    .split(/\n\s*\n|\n(?=[A-Z])/)
    .map(p => p.replace(/\s+/g, ' ').trim())
    .filter(p => p.length > 20);
}

/**
 * Counts words in text
 */
function countWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 0).length;
}

/**
 * Extracts published date from document metadata
 */
function extractPublishedDate(document: Document): string | null {
  // Try various meta tags
  const selectors = [
    'meta[property="article:published_time"]',
    'meta[name="publication_date"]',
    'meta[name="date"]',
    'meta[property="og:published_time"]',
    'time[datetime]',
    'time[pubdate]',
  ];

  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      const value = element.getAttribute('content') || element.getAttribute('datetime');
      if (value) {
        try {
          const date = new Date(value);
          if (!isNaN(date.getTime())) {
            return date.toISOString();
          }
        } catch {
          continue;
        }
      }
    }
  }

  return null;
}

/**
 * Escapes HTML special characters
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
