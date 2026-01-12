import React, { useRef, useEffect, useState } from 'react';
import { useReader } from '../context/ReaderContext';
import { colors, animation, typography } from '../tokens';

interface ParagraphProps {
  html: string;
  isEnhanced: boolean;
  isEnhancing: boolean;
}

export function Paragraph({ html, isEnhanced, isEnhancing }: ParagraphProps) {
  const { theme, fontSize } = useReader();
  const themeColors = colors[theme];
  const [showHighlight, setShowHighlight] = useState(false);
  const prevEnhanced = useRef(isEnhanced);

  // Trigger highlight animation when paragraph becomes enhanced
  useEffect(() => {
    if (isEnhanced && !prevEnhanced.current) {
      setShowHighlight(true);
      const timer = setTimeout(() => setShowHighlight(false), 400);
      return () => clearTimeout(timer);
    }
    prevEnhanced.current = isEnhanced;
  }, [isEnhanced]);

  return (
    <p
      style={{
        marginBottom: '24px',
        opacity: isEnhancing ? 0.7 : 1,
        transform: isEnhancing ? 'translateY(2px)' : 'translateY(0)',
        transition: `all ${animation.enhanceDuration} ${animation.easing}`,
        fontFamily: typography.fontFamily.serif,
        color: themeColors.textPrimary,
      }}
      dangerouslySetInnerHTML={{ __html: html }}
      className={showHighlight ? 'paragraph-highlight' : ''}
    />
  );
}
