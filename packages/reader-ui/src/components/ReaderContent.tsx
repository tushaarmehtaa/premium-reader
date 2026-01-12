import React from 'react';
import { useReader } from '../context/ReaderContext';
import { Paragraph } from './Paragraph';
import { typography } from '../tokens';

export function ReaderContent() {
  const { paragraphs } = useReader();

  return (
    <article style={{ lineHeight: typography.lineHeight.body }}>
      {paragraphs.map((para) => (
        <Paragraph
          key={para.index}
          html={para.html}
          isEnhanced={para.isEnhanced}
          isEnhancing={para.isEnhancing}
        />
      ))}
    </article>
  );
}
