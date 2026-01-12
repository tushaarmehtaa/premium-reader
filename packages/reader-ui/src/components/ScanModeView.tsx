import React from 'react';
import { useReader } from '../context/ReaderContext';
import { colors, typography } from '../tokens';

export function ScanModeView() {
  const { paragraphs, theme, setMode } = useReader();
  const themeColors = colors[theme];

  // Extract first sentence from each paragraph as the "key insight"
  const getFirstSentence = (html: string): string => {
    const text = html.replace(/<[^>]*>/g, '');
    const match = text.match(/^[^.!?]+[.!?]/);
    return match ? match[0].trim() : text.slice(0, 100);
  };

  const handleParagraphClick = (index: number) => {
    setMode('read');
    setTimeout(() => {
      const paragraphElements = document.querySelectorAll('.premium-reader article p');
      const targetParagraph = paragraphElements[index];
      if (targetParagraph) {
        targetParagraph.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  return (
    <article>
      {paragraphs.map((p) => {
        const plainText = p.html.replace(/<[^>]*>/g, '');
        const keyInsight = p.insight || getFirstSentence(p.html);
        const remainingText = plainText.replace(keyInsight, '').trim();

        return (
          <div
            key={p.index}
            onClick={() => handleParagraphClick(p.index)}
            style={{
              marginBottom: '24px',
              cursor: 'pointer',
              transition: 'opacity 150ms ease-out',
            }}
          >
            {/* Key insight - bold, full opacity */}
            <span
              style={{
                fontWeight: 700,
                fontFamily: typography.fontFamily.serif,
                fontSize: '18px',
                lineHeight: 1.7,
                color: themeColors.textPrimary,
              }}
            >
              {keyInsight}
            </span>
            {/* Remaining text - reduced opacity */}
            {remainingText && (
              <span
                style={{
                  fontWeight: 400,
                  fontFamily: typography.fontFamily.serif,
                  fontSize: '18px',
                  lineHeight: 1.7,
                  color: themeColors.textSecondary,
                  opacity: 0.4,
                }}
              >
                {' '}{remainingText}
              </span>
            )}
          </div>
        );
      })}

      {paragraphs.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '48px 0',
            color: themeColors.textSecondary,
          }}
        >
          <p>Loading content...</p>
        </div>
      )}
    </article>
  );
}
