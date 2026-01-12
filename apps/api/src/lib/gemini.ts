import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GEMINI_API_KEY) {
  console.warn('GEMINI_API_KEY not set - AI enhancement will fail');
}

export const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Use Gemini 3 Flash Preview - latest and fastest
export const ENHANCEMENT_MODEL = 'gemini-3-flash-preview';

export const ENHANCEMENT_PROMPT = `Given this paragraph from an article, identify the single sentence or phrase that captures the key insight—the one that would help a reader grasp the main point while skimming.

Rules:
- Select existing text only, never rewrite
- Choose text that works standalone
- Prefer concrete claims over general statements
- Return null if no sentence clearly stands out
- The insight should be 10-40 words typically

Paragraph:
"""
{paragraph}
"""

Return ONLY valid JSON (no markdown, no code blocks, no explanation):
{"insight": "exact text from paragraph" | null}`;
