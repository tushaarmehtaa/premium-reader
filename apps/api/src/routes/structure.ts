import { FastifyPluginAsync } from 'fastify';
import { genAI, ENHANCEMENT_MODEL } from '../lib/gemini.js';
import type { ArticleStructure, StructureResponse } from '@premium-reader/types';

interface StructureRequestBody {
    paragraphs: string[];
    title?: string;
}

const STRUCTURE_PROMPT = `Analyze this article and generate a clear navigation structure with sections.

Article Title: "{title}"

Article Content (paragraphs):
{paragraphs}

Your task:
1. Identify 3-8 logical sections within the article (group paragraphs by topic/theme)
2. Create a concise, descriptive title for each section (2-5 words, like "Key Findings" or "Market Analysis")
3. Write a brief summary/context for each section (1 sentence, ~10-20 words)
4. Optionally generate a better title if the original is vague
5. Create a one-line TL;DR of the entire article

Rules:
- Section titles should be actionable and descriptive (not generic like "Introduction")
- Summaries should tell readers what they'll learn in that section
- Each section should cover at least 1-2 paragraphs
- Consecutive paragraphs should be grouped logically
- Level 1 = main sections, Level 2 = subsections (use sparingly)

Return ONLY valid JSON (no markdown, no code blocks):
{
  "sections": [
    {
      "id": "section-1",
      "title": "Section Title",
      "summary": "What this section covers in one sentence.",
      "startParagraphIndex": 0,
      "endParagraphIndex": 2,
      "level": 1
    }
  ],
  "generatedTitle": "Better Title" | null,
  "tldr": "One line summary of the entire article."
}`;

export const structureRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.post<{ Body: StructureRequestBody }>('/structure', async (request, reply) => {
        const { paragraphs, title } = request.body;

        if (!paragraphs || !Array.isArray(paragraphs)) {
            return reply.code(400).send({ error: 'paragraphs array required' });
        }

        if (paragraphs.length === 0) {
            return reply.code(400).send({ error: 'paragraphs array cannot be empty' });
        }

        try {
            const structure = await generateStructure(paragraphs, title || 'Untitled Article');

            const response: StructureResponse = {
                success: true,
                structure,
            };

            return response;
        } catch (error) {
            fastify.log.error(error, 'Structure generation failed');
            return reply.code(500).send({
                success: false,
                error: 'Failed to generate article structure'
            });
        }
    });
};

async function generateStructure(
    paragraphs: string[],
    title: string
): Promise<ArticleStructure> {
    // Format paragraphs with indices for the prompt
    const formattedParagraphs = paragraphs
        .map((p, i) => `[${i}] ${p.slice(0, 200)}${p.length > 200 ? '...' : ''}`)
        .join('\n\n');

    const prompt = STRUCTURE_PROMPT
        .replace('{title}', title)
        .replace('{paragraphs}', formattedParagraphs);

    try {
        const model = genAI.getGenerativeModel({ model: ENHANCEMENT_MODEL });
        const result = await model.generateContent(prompt);
        const response = result.response;
        const responseText = response.text();

        // Parse the JSON response
        let parsed: ArticleStructure;
        try {
            parsed = JSON.parse(responseText);
        } catch {
            // If parsing fails, try to extract JSON from the response
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                parsed = JSON.parse(jsonMatch[0]);
            } else {
                // Return a default structure if parsing fails
                return createFallbackStructure(paragraphs, title);
            }
        }

        // Validate and fix section indices
        if (parsed.sections && Array.isArray(parsed.sections)) {
            parsed.sections = parsed.sections.map((section, index) => ({
                ...section,
                id: section.id || `section-${index}`,
                level: section.level || 1,
                startParagraphIndex: Math.max(0, Math.min(section.startParagraphIndex, paragraphs.length - 1)),
                endParagraphIndex: Math.max(0, Math.min(section.endParagraphIndex, paragraphs.length - 1)),
            }));
        } else {
            return createFallbackStructure(paragraphs, title);
        }

        return parsed;
    } catch (error) {
        console.error('Error generating structure:', error);
        return createFallbackStructure(paragraphs, title);
    }
}

function createFallbackStructure(paragraphs: string[], title: string): ArticleStructure {
    // Create a simple fallback structure with 3 sections
    const totalParagraphs = paragraphs.length;
    const sectionSize = Math.ceil(totalParagraphs / 3);

    const sections = [];
    const sectionNames = ['Opening', 'Main Points', 'Conclusion'];

    for (let i = 0; i < 3 && i * sectionSize < totalParagraphs; i++) {
        const start = i * sectionSize;
        const end = Math.min((i + 1) * sectionSize - 1, totalParagraphs - 1);

        sections.push({
            id: `section-${i}`,
            title: sectionNames[i],
            summary: `${end - start + 1} paragraph${end - start > 0 ? 's' : ''} in this section.`,
            startParagraphIndex: start,
            endParagraphIndex: end,
            level: 1 as const,
        });
    }

    return {
        sections,
        tldr: `Article: ${title}`,
    };
}
