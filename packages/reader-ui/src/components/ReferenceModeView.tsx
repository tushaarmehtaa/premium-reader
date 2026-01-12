import React, { useMemo, useState, useEffect } from 'react';
import { useReader } from '../context/ReaderContext';
import { colors, typography } from '../tokens';

interface Section {
  id: string;
  title: string;
  level: number;
  startIndex: number;
  element?: string;
}

export function ReferenceModeView() {
  const { paragraphs, theme, setMode } = useReader();
  const themeColors = colors[theme];
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Extract headings and structure from paragraphs
  const sections = useMemo(() => {
    const result: Section[] = [];
    let sectionCount = 0;

    paragraphs.forEach((p, index) => {
      const text = p.html.replace(/<[^>]*>/g, '').trim();

      // Check for heading patterns or first paragraph of logical groups
      const isHeading = p.html.includes('<h') ||
        p.html.includes('<strong>') && text.length < 80 ||
        text.toUpperCase() === text && text.length < 50;

      // Create sections every 4-5 paragraphs or at natural breaks
      if (isHeading || index % 5 === 0) {
        sectionCount++;
        const title = isHeading
          ? text.slice(0, 50) + (text.length > 50 ? '...' : '')
          : `Section ${sectionCount}`;

        result.push({
          id: `section-${index}`,
          title: title || `Section ${sectionCount}`,
          level: isHeading ? 1 : 2,
          startIndex: index,
        });
      }
    });

    // If we have too few sections, ensure at least some structure
    if (result.length < 3 && paragraphs.length > 3) {
      return paragraphs
        .filter((_, i) => i % Math.ceil(paragraphs.length / 6) === 0)
        .map((p, i) => ({
          id: `section-${i}`,
          title: p.html.replace(/<[^>]*>/g, '').slice(0, 40) + '...',
          level: 1,
          startIndex: i * Math.ceil(paragraphs.length / 6),
        }));
    }

    return result;
  }, [paragraphs]);

  const scrollToSection = (section: Section) => {
    setActiveSection(section.id);
    setMode('read');
    setTimeout(() => {
      const paragraphElements = document.querySelectorAll('.premium-reader article p');
      const targetParagraph = paragraphElements[section.startIndex];
      if (targetParagraph) {
        targetParagraph.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  return (
    <div style={{ display: 'flex', gap: '40px', minHeight: '70vh' }}>
      {/* Sidebar Navigation */}
      <nav
        style={{
          width: '200px',
          flexShrink: 0,
          borderRight: `1px solid ${themeColors.border}`,
          paddingRight: '24px',
          position: 'sticky',
          top: '100px',
          height: 'fit-content',
          maxHeight: 'calc(100vh - 150px)',
          overflowY: 'auto',
        }}
      >
        <div
          style={{
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            color: themeColors.textSecondary,
            marginBottom: '16px',
            paddingBottom: '12px',
            borderBottom: `2px solid ${themeColors.textPrimary}`,
          }}
        >
          CONTENTS
        </div>

        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {sections.map((section) => (
            <li key={section.id} style={{ marginBottom: '4px' }}>
              <button
                onClick={() => scrollToSection(section)}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '8px 0',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  fontFamily: typography.fontFamily.sans,
                  fontSize: '13px',
                  lineHeight: 1.4,
                  color: activeSection === section.id
                    ? themeColors.textPrimary
                    : themeColors.textSecondary,
                  fontWeight: activeSection === section.id ? 600 : 400,
                  transition: 'color 150ms ease-out',
                  paddingLeft: section.level === 2 ? '12px' : '0',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = themeColors.textPrimary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = activeSection === section.id
                    ? themeColors.textPrimary
                    : themeColors.textSecondary;
                }}
              >
                {section.title}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Main Content Preview */}
      <div style={{ flex: 1 }}>
        <p
          style={{
            color: themeColors.textSecondary,
            marginBottom: '24px',
            fontSize: '14px',
          }}
        >
          {sections.length} sections · Click sidebar to navigate
        </p>

        <article>
          {paragraphs.map((p, index) => {
            const isSectionStart = sections.some(s => s.startIndex === index);
            const section = sections.find(s => s.startIndex === index);

            return (
              <div
                key={p.index}
                style={{
                  marginBottom: '16px',
                  paddingTop: isSectionStart ? '24px' : '0',
                  borderTop: isSectionStart && index > 0 ? `1px solid ${themeColors.border}` : 'none',
                }}
              >
                {isSectionStart && section && (
                  <h3
                    style={{
                      fontFamily: typography.fontFamily.serif,
                      fontSize: '24px',
                      fontWeight: 600,
                      marginBottom: '16px',
                      color: themeColors.textPrimary,
                    }}
                  >
                    {section.title}
                  </h3>
                )}
                <p
                  style={{
                    fontFamily: typography.fontFamily.serif,
                    fontSize: '16px',
                    lineHeight: 1.7,
                    color: themeColors.textSecondary,
                  }}
                  dangerouslySetInnerHTML={{ __html: p.html }}
                />
              </div>
            );
          })}
        </article>
      </div>
    </div>
  );
}
