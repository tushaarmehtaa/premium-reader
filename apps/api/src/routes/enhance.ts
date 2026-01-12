import { FastifyPluginAsync } from 'fastify';
import { genAI, ENHANCEMENT_MODEL, ENHANCEMENT_PROMPT } from '../lib/gemini.js';
import type { EnhanceResponse } from '@premium-reader/types';

interface EnhanceRequestBody {
  paragraphs: string[];
}

export const enhanceRoutes: FastifyPluginAsync = async (fastify) => {
  // Streaming enhancement endpoint
  fastify.post<{ Body: EnhanceRequestBody }>('/enhance', async (request, reply) => {
    const { paragraphs } = request.body;

    if (!paragraphs || !Array.isArray(paragraphs)) {
      return reply.code(400).send({ error: 'paragraphs array required' });
    }

    if (paragraphs.length === 0) {
      return reply.code(400).send({ error: 'paragraphs array cannot be empty' });
    }

    // Set up SSE with CORS headers
    const origin = request.headers.origin || 'http://localhost:3000';
    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Credentials': 'true',
    });

    // Process paragraphs in batches of 3
    const batchSize = 3;

    try {
      for (let i = 0; i < paragraphs.length; i += batchSize) {
        const batch = paragraphs.slice(i, i + batchSize);
        const results = await processBatch(batch, i);

        for (const result of results) {
          reply.raw.write(`data: ${JSON.stringify(result)}\n\n`);
        }
      }

      reply.raw.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    } catch (error) {
      fastify.log.error(error, 'Enhancement failed');
      reply.raw.write(`data: ${JSON.stringify({ error: 'Enhancement failed' })}\n\n`);
    }

    reply.raw.end();
  });

  // Non-streaming endpoint for single paragraph (useful for testing)
  fastify.post<{ Body: { paragraph: string } }>('/enhance/single', async (request, reply) => {
    const { paragraph } = request.body;

    if (!paragraph || typeof paragraph !== 'string') {
      return reply.code(400).send({ error: 'paragraph string required' });
    }

    try {
      const result = await processSingleParagraph(paragraph, 0);
      return result;
    } catch (error) {
      fastify.log.error(error, 'Enhancement failed');
      return reply.code(500).send({ error: 'Enhancement failed' });
    }
  });
};

async function processBatch(
  paragraphs: string[],
  startIndex: number
): Promise<EnhanceResponse[]> {
  const results: EnhanceResponse[] = [];

  // Process in parallel
  await Promise.all(
    paragraphs.map(async (text, batchIndex) => {
      const index = startIndex + batchIndex;
      const result = await processSingleParagraph(text, index);
      results.push(result);
    })
  );

  // Sort by index to maintain order
  return results.sort((a, b) => a.index - b.index);
}

async function processSingleParagraph(
  text: string,
  index: number
): Promise<EnhanceResponse> {
  // Skip very short paragraphs
  if (text.length < 50) {
    return { index, insight: null, startIndex: 0, endIndex: 0 };
  }

  try {
    const prompt = ENHANCEMENT_PROMPT.replace('{paragraph}', text);

    const model = genAI.getGenerativeModel({ model: ENHANCEMENT_MODEL });
    const result = await model.generateContent(prompt);
    const response = result.response;
    const responseText = response.text();

    // Try to parse the JSON response
    let parsed: { insight: string | null };
    try {
      parsed = JSON.parse(responseText);
    } catch {
      // If parsing fails, try to extract JSON from the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        return { index, insight: null, startIndex: 0, endIndex: 0 };
      }
    }

    if (parsed.insight) {
      const startIdx = text.indexOf(parsed.insight);
      const endIdx = startIdx + parsed.insight.length;

      return {
        index,
        insight: parsed.insight,
        startIndex: startIdx >= 0 ? startIdx : 0,
        endIndex: startIdx >= 0 ? endIdx : 0,
      };
    }

    return { index, insight: null, startIndex: 0, endIndex: 0 };
  } catch (error) {
    console.error(`Error processing paragraph ${index}:`, error);
    return { index, insight: null, startIndex: 0, endIndex: 0 };
  }
}
