import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GEMINI_API_KEY) {
  console.warn('GEMINI_API_KEY not set - AI enhancement will fail');
}

export const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Use Gemini 3 Flash Preview - latest and fastest
export const ENHANCEMENT_MODEL = 'gemini-3-flash-preview';

export const ENHANCEMENT_PROMPT = `Analyze this paragraph to find the highest-signal "nugget"—the specific sentence that contains the core insight, counter-intuitive fact, or key argument.

Your goal is to highlight ONLY the part that makes the reader say "aha!" or learn something new. Be extremely selective.

CRITICAL INSTRUCTIONS:
- STRICTLY AVOID "Setup" or "Topic" sentences. (e.g. "Here is why this is important..." -> IGNORE. "The reason is X..." -> HIGHLIGHT).
- If the paragraph is purely transitional, conversational filler, or low-information, return null. It is better to highlight nothing than to highlight noise.
- The selection MUST be an EXACT copy-paste of a substring from the paragraph. Never rewrite.
- The substring must make sense as a standalone statement.

Paragraph:
"""
{paragraph}
"""

Return ONLY valid JSON (no markdown, no code blocks):
{"insight": "exact text from paragraph" | null}`;
