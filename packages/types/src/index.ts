export interface Article {
  id: string;
  url: string;
  title: string;
  author?: string;
  siteName?: string;
  publishedAt?: string;
  content: string;              // Raw HTML content
  enhancedContent?: string;     // HTML with insights bolded
  insights: Insight[];
  savedAt: string;
  readAt?: string;
  folderId?: string;
  tags: string[];
  userId: string;
}

export interface Insight {
  paragraphIndex: number;
  text: string;                 // Exact text to bold
  startIndex: number;           // Position in paragraph
  endIndex: number;
}

export interface EnhanceRequest {
  paragraphs: string[];         // Array of paragraph text
}

export interface EnhanceResponse {
  index: number;
  insight: string | null;
  startIndex: number;
  endIndex: number;
}

export interface User {
  id: string;
  email: string;
  plan: 'free' | 'premium';
  settings: UserSettings;
  createdAt: string;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'sepia';
  fontSize: 'small' | 'medium' | 'large';
  defaultMode: 'read' | 'scan';
  emailDigest: 'daily' | 'weekly' | 'none';
}

export interface Folder {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
}

export type ReadingMode = 'read' | 'scan' | 'reference';

// AI-generated article structure for navigation
export interface ArticleSection {
  id: string;
  title: string;               // AI-generated section title
  summary: string;             // Brief context for the section
  startParagraphIndex: number; // First paragraph in this section
  endParagraphIndex: number;   // Last paragraph in this section
  level: 1 | 2;               // 1 = main section, 2 = subsection
}

export interface ArticleStructure {
  sections: ArticleSection[];
  generatedTitle?: string;     // AI-generated title if original is poor
  tldr?: string;               // One-line summary of entire article
}

export interface StructureRequest {
  paragraphs: string[];
  title?: string;
}

export interface StructureResponse {
  success: true;
  structure: ArticleStructure;
}

export interface ExtractedArticle {
  title: string;
  content: string;
  author?: string;
  siteName?: string;
  excerpt?: string;
}

export interface ParagraphState {
  index: number;
  html: string;
  insight: string | null;
  isEnhanced: boolean;
  isEnhancing: boolean;
}

// API Response Types for Fetch and Parse

export interface ArticleMetadata {
  title: string;
  author: string | null;
  siteName: string | null;
  publishedDate: string | null;
  content: string;
  paragraphs: string[];
  wordCount: number;
  estimatedReadTime: number;
}

export interface FetchResponse {
  success: true;
  article: ArticleMetadata;
  url: string;
  canonicalUrl: string | null;
  inputMethod: 'url';
}

export interface ParseResponse {
  success: true;
  article: ArticleMetadata;
  inputMethod: 'paste';
}

export interface APIError {
  success: false;
  error: string;
  code: 'FETCH_FAILED' | 'NOT_ARTICLE' | 'PAYWALL' | 'BLOCKED' | 'TIMEOUT' | 'INVALID_URL' | 'MISSING_CONTENT' | 'TOO_SHORT' | 'IS_URL' | 'IS_CODE' | 'PARSE_FAILED';
  suggestion?: string;
  detectedUrl?: string;
}

export type FetchResult = FetchResponse | APIError;
export type ParseResult = ParseResponse | APIError;
