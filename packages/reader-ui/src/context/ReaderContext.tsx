import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReadingMode, UserSettings, ArticleStructure, ArticleSection } from '@premium-reader/types';

interface ParagraphState {
  index: number;
  html: string;
  insightText: string | null;  // The actual insight text to highlight
  isEnhanced: boolean;
  isEnhancing: boolean;
}

interface ReaderState {
  mode: ReadingMode;
  theme: UserSettings['theme'];
  fontSize: UserSettings['fontSize'];
  paragraphs: ParagraphState[];
  isEnhancing: boolean;
  enhancementProgress: number;
  // Article structure for navigation
  structure: ArticleStructure | null;
  isLoadingStructure: boolean;
  activeSection: string | null;
}

interface ReaderContextValue extends ReaderState {
  setMode: (mode: ReadingMode) => void;
  setTheme: (theme: UserSettings['theme']) => void;
  setFontSize: (size: UserSettings['fontSize']) => void;
  initializeParagraphs: (paragraphs: string[]) => void;
  enhanceParagraph: (index: number, insightText: string | null) => void;
  // Structure methods
  setStructure: (structure: ArticleStructure) => void;
  setActiveSection: (sectionId: string | null) => void;
  scrollToSection: (section: ArticleSection) => void;
}

const ReaderContext = createContext<ReaderContextValue | null>(null);

interface ReaderProviderProps {
  children: React.ReactNode;
  initialTheme?: UserSettings['theme'];
  initialFontSize?: UserSettings['fontSize'];
  initialMode?: ReadingMode;
}

export function ReaderProvider({
  children,
  initialTheme = 'light',
  initialFontSize = 'medium',
  initialMode = 'scan'
}: ReaderProviderProps) {
  const [state, setState] = useState<ReaderState>({
    mode: initialMode,
    theme: initialTheme,
    fontSize: initialFontSize,
    paragraphs: [],
    isEnhancing: false,
    enhancementProgress: 0,
    structure: null,
    isLoadingStructure: false,
    activeSection: null,
  });

  const setMode = useCallback((mode: ReadingMode) => {
    setState(prev => ({ ...prev, mode }));
  }, []);

  const setTheme = useCallback((theme: UserSettings['theme']) => {
    setState(prev => ({ ...prev, theme }));
  }, []);

  const setFontSize = useCallback((fontSize: UserSettings['fontSize']) => {
    setState(prev => ({ ...prev, fontSize }));
  }, []);

  const initializeParagraphs = useCallback((paragraphHtmls: string[]) => {
    console.log('[ReaderContext] Initializing', paragraphHtmls.length, 'paragraphs');

    // Extract insights from each paragraph (bold text or first sentence)
    const processedParagraphs = paragraphHtmls.map((html, index) => {
      const temp = document.createElement('div');
      temp.innerHTML = html;

      // Strategy 1: Look for existing bold/strong tags
      const boldElements = temp.querySelectorAll('strong, b');
      if (boldElements.length > 0) {
        const boldTexts = Array.from(boldElements).map(el => el.textContent?.trim() || '').filter(Boolean);
        if (boldTexts.length > 0) {
          return {
            index,
            html,
            insightText: boldTexts.join(' '), // Combine all bold text as the insight
            isEnhanced: true,
            isEnhancing: false,
          };
        }
      }

      // Strategy 2: Use the first sentence as the insight (heuristic fallback)
      const plainText = temp.textContent?.trim() || '';
      const firstSentenceMatch = plainText.match(/^[^.!?]+[.!?]/);
      const firstSentence = firstSentenceMatch ? firstSentenceMatch[0].trim() : null;

      // Only use first sentence if it's substantial (more than 20 chars)
      const insightText = firstSentence && firstSentence.length > 20 ? firstSentence : null;

      return {
        index,
        html,
        insightText,
        isEnhanced: true, // Mark as enhanced so it doesn't spin forever
        isEnhancing: false,
      };
    });

    setState(prev => ({
      ...prev,
      isEnhancing: false,
      enhancementProgress: 100,
      paragraphs: processedParagraphs,
    }));
  }, []);

  const enhanceParagraph = useCallback((index: number, insightText: string | null) => {
    console.log('[ReaderContext] Enhancing paragraph', index, 'with insight:', insightText?.substring(0, 50));

    setState(prev => {
      const newParagraphs = [...prev.paragraphs];
      const paragraph = newParagraphs[index];

      if (paragraph) {
        newParagraphs[index] = {
          ...paragraph,
          insightText: insightText,
          isEnhanced: true,
          isEnhancing: false,
        };
      }

      const enhancedCount = newParagraphs.filter(p => p.isEnhanced).length;
      const progress = newParagraphs.length > 0
        ? (enhancedCount / newParagraphs.length) * 100
        : 0;
      const isEnhancing = enhancedCount < newParagraphs.length;

      return {
        ...prev,
        paragraphs: newParagraphs,
        enhancementProgress: progress,
        isEnhancing,
      };
    });
  }, []);

  // Listen for enhancement events
  useEffect(() => {
    const handleEnhanceEvent = (event: CustomEvent) => {
      const { index, insight } = event.detail;
      console.log('[ReaderContext] Received enhance event for paragraph', index);
      enhanceParagraph(index, insight || null);
    };

    window.addEventListener('premium-reader-enhance', handleEnhanceEvent as EventListener);
    return () => {
      window.removeEventListener('premium-reader-enhance', handleEnhanceEvent as EventListener);
    };
  }, [enhanceParagraph]);



  // Structure methods
  const setStructure = useCallback((structure: ArticleStructure) => {
    console.log('[ReaderContext] Setting structure with', structure.sections?.length || 0, 'sections');
    setState(prev => ({ ...prev, structure, isLoadingStructure: false }));
  }, []);

  const setActiveSection = useCallback((sectionId: string | null) => {
    setState(prev => ({ ...prev, activeSection: sectionId }));
  }, []);

  const scrollToSection = useCallback((section: ArticleSection) => {
    setActiveSection(section.id);
    // Scroll to the first paragraph of the section
    setTimeout(() => {
      const paragraphElements = document.querySelectorAll('.sutra-reader article p, .sutra-reader article > div');
      const targetParagraph = paragraphElements[section.startParagraphIndex];
      if (targetParagraph) {
        targetParagraph.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  }, [setActiveSection]);

  // Listen for structure events
  useEffect(() => {
    const handleStructureEvent = (event: CustomEvent) => {
      const structure = event.detail;
      console.log('[ReaderContext] Received structure event');
      setStructure(structure);
    };

    window.addEventListener('premium-reader-structure', handleStructureEvent as EventListener);
    return () => {
      window.removeEventListener('premium-reader-structure', handleStructureEvent as EventListener);
    };
  }, [setStructure]);

  return (
    <ReaderContext.Provider
      value={{
        ...state,
        setMode,
        setTheme,
        setFontSize,
        initializeParagraphs,
        enhanceParagraph,
        setStructure,
        setActiveSection,
        scrollToSection,
      }}
    >
      {children}
    </ReaderContext.Provider>
  );
}

export function useReader() {
  const context = useContext(ReaderContext);
  if (!context) {
    throw new Error('useReader must be used within ReaderProvider');
  }
  return context;
}
