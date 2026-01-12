import { FastifyPluginAsync } from 'fastify';
import { parsePastedContent } from '../lib/extractor.js';
import { genAI, ENHANCEMENT_MODEL } from '../lib/gemini.js';

interface ParseRequestBody {
  content: string;
}

interface AIStructureResult {
  title: string;
  author: string | null;
  paragraphs: string[];
}

const STRUCTURE_PROMPT = `Analyze this pasted text and extract its structure.

Text:
"""
{content}
"""

Return ONLY valid JSON (no markdown, no code blocks):
{
  "title": "the main title or topic (create a concise one if not obvious, max 100 chars)",
  "author": "author name if mentioned, otherwise null",
  "paragraphs": ["array of logical paragraphs - split by topic/idea, not just newlines"]
}

Rules:
- Keep all original text, don't summarize or rewrite
- Split long blocks into logical paragraphs (aim for 2-5 sentences each)
- If text has a clear heading/title at start, use it. Otherwise, generate one from the main topic.
- Clean up formatting issues (extra spaces, broken lines from copy-paste)
- Preserve the reading order`;

export const parseRoutes: FastifyPluginAsync = async (fastify) => {
  /**
   * POST /api/parse
   * Parses pasted content into structured article format
   * Uses AI to intelligently extract structure if needed
   */
  fastify.post<{ Body: ParseRequestBody }>('/parse', async (request, reply) => {
    const { content } = request.body;

    if (!content || typeof content !== 'string') {
      return reply.code(400).send({
        success: false,
        error: 'Content is required',
        code: 'MISSING_CONTENT',
      });
    }

    const trimmed = content.trim();

    if (trimmed.length < 50) {
      return reply.code(400).send({
        success: false,
        error: 'Content is too short',
        code: 'TOO_SHORT',
        suggestion: 'Please paste at least a few sentences to analyze.',
      });
    }

    // Check if it looks like a URL instead of content
    if (/^https?:\/\/\S+$/.test(trimmed) && trimmed.length < 500) {
      return reply.code(400).send({
        success: false,
        error: 'This looks like a URL',
        code: 'IS_URL',
        suggestion: 'Use the URL fetch mode instead, or paste the article content.',
        detectedUrl: trimmed,
      });
    }

    // Check if it looks like code
    const codeIndicators = [
      /^{[\s\S]*}$/,                    // JSON
      /^[\s\S]*function\s*\(/,          // JavaScript function
      /^[\s\S]*import\s+.*from/,        // ES imports
      /^[\s\S]*class\s+\w+\s*{/,        // Class definition
      /^<\?php/,                         // PHP
      /^#!\s*\/usr\/bin/,               // Shebang
    ];

    if (codeIndicators.some(pattern => pattern.test(trimmed))) {
      return reply.code(400).send({
        success: false,
        error: 'This looks like code, not an article',
        code: 'IS_CODE',
        suggestion: 'Paste article text, not source code.',
      });
    }

    console.log(`[parse] Parsing pasted content (${trimmed.length} chars)`);

    // First try simple parsing
    const simpleResult = parsePastedContent(trimmed);

    if (!simpleResult) {
      return reply.code(422).send({
        success: false,
        error: 'Could not parse the content',
        code: 'PARSE_FAILED',
      });
    }

    // For longer content, use AI to improve structure
    let finalResult = simpleResult;

    if (trimmed.length > 500 && process.env.GEMINI_API_KEY) {
      try {
        const aiResult = await extractWithAI(trimmed);
        if (aiResult && aiResult.paragraphs.length > 0) {
          finalResult = {
            ...simpleResult,
            title: aiResult.title || simpleResult.title,
            author: aiResult.author,
            paragraphs: aiResult.paragraphs,
            content: aiResult.paragraphs.map(p => `<p>${escapeHtml(p)}</p>`).join('\n'),
          };
        }
      } catch (err) {
        console.warn('[parse] AI structure extraction failed, using simple parsing:', err);
        // Fall back to simple result
      }
    }

    console.log(`[parse] Success: "${finalResult.title}" (${finalResult.wordCount} words, ${finalResult.paragraphs.length} paragraphs)`);

    return {
      success: true,
      article: {
        title: finalResult.title,
        author: finalResult.author,
        siteName: null,
        publishedDate: null,
        content: finalResult.content,
        paragraphs: finalResult.paragraphs,
        wordCount: finalResult.wordCount,
        estimatedReadTime: finalResult.estimatedReadTime,
      },
      inputMethod: 'paste',
    };
  });
};

/**
 * Uses AI to intelligently extract article structure from pasted text
 */
async function extractWithAI(content: string): Promise<AIStructureResult | null> {
  // Limit content length for AI processing
  const truncated = content.length > 15000 ? content.substring(0, 15000) + '...' : content;

  const prompt = STRUCTURE_PROMPT.replace('{content}', truncated);

  try {
    const model = genAI.getGenerativeModel({ model: ENHANCEMENT_MODEL });
    const result = await model.generateContent(prompt);
    const response = result.response;
    const responseText = response.text();

    // Parse JSON response
    let parsed: AIStructureResult;
    try {
      parsed = JSON.parse(responseText);
    } catch {
      // Try to extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        return null;
      }
    }

    // Validate structure
    if (!parsed.title || !Array.isArray(parsed.paragraphs)) {
      return null;
    }

    return {
      title: parsed.title,
      author: parsed.author || null,
      paragraphs: parsed.paragraphs.filter(p => typeof p === 'string' && p.trim().length > 0),
    };
  } catch {
    return null;
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
