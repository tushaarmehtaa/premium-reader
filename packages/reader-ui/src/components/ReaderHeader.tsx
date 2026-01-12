import React from 'react';
import { useReader } from '../context/ReaderContext';
import { ModeToggle } from './ModeToggle';
import { SettingsMenu } from './SettingsMenu';
import { colors, typography } from '../tokens';

interface ReaderHeaderProps {
  title: string;
  author?: string;
  siteName?: string;
  onClose?: () => void;
  onSave?: () => void;
}

export function ReaderHeader({ title, author, siteName, onClose, onSave }: ReaderHeaderProps) {
  const { theme, fontSize, enhancementProgress, isEnhancing } = useReader();
  const themeColors = colors[theme];
  const themeFontSize = typography.fontSize[fontSize];

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        backgroundColor: themeColors.background,
        borderBottom: `1px solid ${themeColors.border}`,
        zIndex: 10,
      }}
    >
      {/* Progress bar */}
      {isEnhancing && (
        <div
          style={{
            height: '2px',
            backgroundColor: themeColors.border,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${enhancementProgress}%`,
              backgroundColor: themeColors.accent,
              transition: 'width 200ms ease-out',
            }}
          />
        </div>
      )}

      {/* Top bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 24px',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            color: themeColors.textSecondary,
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <span style={{ fontSize: '16px' }}>&#8592;</span> Back
        </button>

        <ModeToggle />

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {onSave && (
            <button
              onClick={onSave}
              style={{
                background: 'none',
                border: `1px solid ${themeColors.border}`,
                borderRadius: '6px',
                cursor: 'pointer',
                padding: '6px 12px',
                color: themeColors.textSecondary,
                fontSize: '14px',
              }}
            >
              Save
            </button>
          )}
          <SettingsMenu />
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              color: themeColors.textSecondary,
              fontSize: '20px',
              lineHeight: 1,
            }}
            title="Close (Escape)"
          >
            &#215;
          </button>
        </div>
      </div>

      {/* Title section */}
      <div
        style={{
          maxWidth: '680px',
          margin: '0 auto',
          padding: '24px 24px 32px',
        }}
      >
        <h1
          style={{
            fontFamily: typography.fontFamily.serif,
            fontSize: themeFontSize.title,
            lineHeight: typography.lineHeight.title,
            fontWeight: 400,
            marginBottom: '16px',
            color: themeColors.textPrimary,
          }}
        >
          {title}
        </h1>

        {(author || siteName) && (
          <p
            style={{
              color: themeColors.textSecondary,
              fontSize: '14px',
            }}
          >
            {author && <span>{author}</span>}
            {author && siteName && <span> &middot; </span>}
            {siteName && <span>{siteName}</span>}
          </p>
        )}
      </div>
    </header>
  );
}
