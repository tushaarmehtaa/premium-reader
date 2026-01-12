import React, { useEffect, useState, useMemo } from 'react';
import { ReaderProvider, useReader } from '../context/ReaderContext';
import { TableOfContents } from './TableOfContents';
import type { UserSettings } from '@premium-reader/types';

interface PremiumReaderProps {
  article: {
    title: string;
    author?: string;
    siteName?: string;
    content: string;
    estimatedReadTime?: number;
    wordCount?: number;
  };
  onClose?: () => void;
  onSave?: () => void;
  onEnhance?: (paragraphs: string[]) => void;
  initialTheme?: UserSettings['theme'];
  initialFontSize?: UserSettings['fontSize'];
}

// Sutra Design Tokens - Refined
const tokens = {
  paper: '#F9F9F7',
  paperTranslucent: 'rgba(249, 249, 247, 0.85)',
  ink: '#1C1C1C',
  inkSecondary: '#4A4A4A',
  inkMuted: '#8A8A8A',
  border: 'rgba(0,0,0,0.06)',
  accent: '#D97706',
  fontDisplay: '"Playfair Display", Georgia, serif',
  fontBody: '"Merriweather", Georgia, serif',
  fontUi: '"Inter", sans-serif',
};

function ReaderInner({ article, onClose, onEnhance }: PremiumReaderProps) {
  const { mode, initializeParagraphs, paragraphs, setMode, structure } = useReader();
  const [isScrolling, setIsScrolling] = useState(false);
  const [showIsland, setShowIsland] = useState(true);

  // Initialization logic remains same...
  useEffect(() => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(article.content, 'text/html');
    const elements = doc.querySelectorAll('p');
    const paragraphHtmls = Array.from(elements)
      .map((el) => el.innerHTML)
      .filter((html) => html.trim().length > 0);

    if (paragraphHtmls.length === 0) {
      const wrapper = doc.body;
      if (wrapper && wrapper.innerHTML.trim()) {
        paragraphHtmls.push(wrapper.innerHTML);
      }
    }

    initializeParagraphs(paragraphHtmls);

    if (onEnhance) {
      const plainTexts = paragraphHtmls.map((html) => {
        const temp = document.createElement('div');
        temp.innerHTML = html;
        return temp.textContent || '';
      });
      onEnhance(plainTexts);
    }
  }, [article.content, initializeParagraphs, onEnhance]);

  // Refined Scroll Logic for "Liquid" Island
  useEffect(() => {
    let scrollTimeout: ReturnType<typeof setTimeout>;

    const handleScroll = () => {
      moveIsland(false);
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        moveIsland(true);
      }, 800); // Faster reappearance for better UX
    };

    const moveIsland = (visible: boolean) => {
      setShowIsland(visible);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) onClose();
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        setMode(mode === 'read' ? 'scan' : 'read'); // Cmd+K toggle
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, setMode, mode]);

  return (
    <div
      className="sutra-reader"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        backgroundColor: tokens.paper,
        overflowY: 'auto',
        color: tokens.ink,
        fontFamily: tokens.fontUi,
      }}
    >
      {/* Table of Contents - Left Sidebar (only in scan mode) */}
      <TableOfContents title={article.title} />

      {/* Minimal Header - "Glass" */}
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          padding: '20px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: tokens.paperTranslucent,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${tokens.border}`,
          zIndex: 100,
          transition: 'all 0.5s ease',
        }}
      >
        <button
          onClick={onClose}
          className="group"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontFamily: tokens.fontUi,
            fontSize: '14px',
            fontWeight: 500,
            color: tokens.inkSecondary,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'color 0.2s ease',
          }}
        >
          <span className="opacity-50 group-hover:opacity-100 transition-opacity">←</span>
          <span className="group-hover:text-ink transition-colors">Back</span>
        </button>

        <span
          style={{
            fontFamily: tokens.fontDisplay,
            fontSize: '20px',
            fontWeight: 600,
            letterSpacing: '-0.02em',
            opacity: 0.8
          }}
        >
          Sutra.
        </span>

        <div style={{ width: '60px' }} /> {/* Spacer for balance */}
      </header>

      {/* Main Content - The Sanctuary */}
      <main
        style={{
          maxWidth: '680px', // Optimal reading width
          margin: '0 auto',
          padding: '140px 24px 200px',
        }}
      >
        {/* Editorial Header */}
        <header style={{ marginBottom: '64px', textAlign: 'center' }}>
          <h1
            style={{
              fontFamily: tokens.fontDisplay,
              fontSize: 'clamp(40px, 6vw, 64px)', // Responsive fluid type
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              color: tokens.ink,
              marginBottom: '24px',
              animation: 'fadeSlideUp 0.8s ease-out forwards',
            }}
          >
            {article.title}
          </h1>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '12px',
              fontFamily: tokens.fontUi,
              fontSize: '13px',
              color: tokens.inkMuted,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              fontWeight: 500,
              animation: 'fadeSlideUp 0.8s ease-out 0.1s forwards',
              opacity: 0,
            }}
          >
            {article.author && <span>{article.author}</span>}
            {article.author && (article.siteName || article.estimatedReadTime) && <span style={{ opacity: 0.3 }}>•</span>}
            {article.siteName && <span>{article.siteName}</span>}
            {article.siteName && article.estimatedReadTime && <span style={{ opacity: 0.3 }}>•</span>}
            {!article.siteName && article.author && article.estimatedReadTime && <span style={{ opacity: 0.3 }}>•</span>}
            {article.estimatedReadTime && <span>{article.estimatedReadTime} min read</span>}
          </div>
        </header>

        {/* Divider */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '64px', opacity: 0.3 }}>
          <span style={{ fontSize: '24px', fontFamily: tokens.fontDisplay, color: tokens.accent }}>❦</span>
        </div>

        {/* The Thread (Content) */}
        <article>
          {paragraphs.map((p, index) => {
            // Check if a section starts here (only main sections for now)
            const section = structure?.sections?.find(s => s.startParagraphIndex === index);

            return (
              <React.Fragment key={p.index}>
                {section && (
                  <div
                    style={{
                      marginTop: index === 0 ? '0' : '64px',
                      marginBottom: '32px',
                      fontFamily: tokens.fontUi,
                      borderTop: index === 0 ? 'none' : `1px solid ${tokens.border}`,
                      paddingTop: index === 0 ? '0' : '32px',
                    }}
                  >
                    <span
                      style={{
                        display: 'block',
                        fontSize: '11px',
                        fontWeight: 600,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: tokens.accent,
                        marginBottom: '8px',
                      }}
                    >
                      Part {structure?.sections?.indexOf(section)! + 1}
                    </span>
                    <h2
                      style={{
                        fontFamily: tokens.fontDisplay,
                        fontSize: '32px',
                        fontWeight: 600,
                        color: tokens.ink,
                        margin: 0,
                        lineHeight: 1.2,
                        letterSpacing: '-0.02em',
                      }}
                    >
                      {section.title}
                    </h2>
                  </div>
                )}
                <Paragraph
                  html={p.html}
                  insightText={p.insightText}
                  index={index}
                  mode={mode}
                />
              </React.Fragment>
            );
          })}
        </article>
      </main>

      {/* Floating Dynamic Island - "The Control Center" */}
      <div
        style={{
          position: 'fixed',
          bottom: '32px',
          left: '50%',
          transform: `translateX(-50%) translateY(${showIsland ? '0' : '40px'}) scale(${showIsland ? '1' : '0.95'})`,
          opacity: showIsland ? 1 : 0,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(0,0,0,0.08)',
          borderRadius: '100px',
          padding: '6px', // Tight padding
          boxShadow: '0 8px 32px -8px rgba(0,0,0,0.12), 0 2px 8px -2px rgba(0,0,0,0.04)', // Refined shadow
          zIndex: 200,
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)', // iOS-like spring physics
          pointerEvents: showIsland ? 'auto' : 'none',
        }}
      >
        {/* Toggle Pill - Scan First (users scan before reading) */}
        <div style={{ position: 'relative', display: 'flex', backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: '100px', padding: '4px' }}>

          {/* Active Background - Sliding Animation */}
          <div
            style={{
              position: 'absolute',
              top: '4px',
              left: mode === 'scan' ? '4px' : 'calc(50% + 2px)',
              width: 'calc(50% - 6px)',
              height: 'calc(100% - 8px)',
              backgroundColor: '#FFF',
              borderRadius: '100px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              zIndex: 0,
            }}
          />

          <button
            onClick={() => setMode('scan')}
            style={{
              position: 'relative',
              padding: '8px 24px',
              border: 'none',
              background: 'transparent',
              borderRadius: '100px',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              color: mode === 'scan' ? tokens.ink : tokens.inkSecondary,
              fontFamily: tokens.fontUi,
              transition: 'color 0.4s ease',
              zIndex: 1,
            }}
          >
            Scan
          </button>

          <button
            onClick={() => setMode('read')}
            style={{
              position: 'relative',
              padding: '8px 24px',
              border: 'none',
              background: 'transparent',
              borderRadius: '100px',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              color: mode === 'read' ? tokens.ink : tokens.inkSecondary,
              fontFamily: tokens.fontUi,
              transition: 'color 0.4s ease',
              zIndex: 1,
            }}
          >
            Read
          </button>
        </div>

        {/* Separator */}
        <div style={{ width: '1px', height: '16px', backgroundColor: 'rgba(0,0,0,0.1)', margin: '0 8px' }} />

        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            border: 'none',
            background: 'transparent',
            color: tokens.inkSecondary,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

      </div>
    </div>
  );
}

// Paragraph component with insight highlighting
interface ParagraphProps {
  html: string;
  insightText: string | null;
  index: number;
  mode: string;
}

function Paragraph({ html, insightText, index, mode }: ParagraphProps) {
  // Parse HTML to get plain text and find insight position
  const parts = useMemo(() => {
    // Get plain text from HTML
    const temp = document.createElement('div');
    temp.innerHTML = html;
    const plainText = temp.textContent || '';

    // If no insight, return whole text as non-highlighted
    if (!insightText) {
      return [{ text: plainText, isHighlight: false }];
    }

    // Normalize for comparison (handle whitespace differences)
    const normalizedInsight = insightText.replace(/\s+/g, ' ').trim();
    const normalizedPlain = plainText.replace(/\s+/g, ' ').trim();

    // Find insight in text
    const insightIndex = normalizedPlain.toLowerCase().indexOf(normalizedInsight.toLowerCase());

    if (insightIndex === -1) {
      // Insight not found - return plain text
      return [{ text: plainText, isHighlight: false }];
    }

    // Split into before, insight, after
    const result: { text: string; isHighlight: boolean }[] = [];

    const before = normalizedPlain.substring(0, insightIndex);
    const insight = normalizedPlain.substring(insightIndex, insightIndex + normalizedInsight.length);
    const after = normalizedPlain.substring(insightIndex + normalizedInsight.length);

    if (before) result.push({ text: before, isHighlight: false });
    result.push({ text: insight, isHighlight: true });
    if (after) result.push({ text: after, isHighlight: false });

    return result;
  }, [html, insightText]);

  const isScanMode = mode === 'scan';

  return (
    <p
      style={{
        fontFamily: tokens.fontBody,
        fontSize: '20px',
        lineHeight: 1.8,
        marginBottom: '32px',
        color: tokens.ink,
        fontWeight: 300,
        opacity: 0,
        animation: `fadeSlideUp 0.8s ease-out ${Math.min(index * 0.05, 0.5)}s forwards`,
        transition: 'color 0.5s ease',
      }}
    >
      {parts.map((part, i) => (
        <span
          key={i}
          style={{
            fontWeight: part.isHighlight ? 600 : 300,
            backgroundColor: part.isHighlight && isScanMode ? 'rgba(217, 119, 6, 0.15)' : 'transparent',
            color: isScanMode && !part.isHighlight ? 'rgba(0,0,0,0.25)' : tokens.ink,
            transition: 'all 0.4s ease',
            borderRadius: part.isHighlight && isScanMode ? '2px' : '0',
            padding: part.isHighlight && isScanMode ? '2px 4px' : '0',
            margin: part.isHighlight && isScanMode ? '0 -4px' : '0',
          }}
        >
          {part.text}
        </span>
      ))}
    </p>
  );
}

export function PremiumReader(props: PremiumReaderProps) {
  return (
    <ReaderProvider>
      <ReaderInner {...props} />
    </ReaderProvider>
  );
}
