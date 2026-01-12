import React, { useState } from 'react';
import { useReader } from '../context/ReaderContext';
import { colors, typography } from '../tokens';
import type { UserSettings } from '@premium-reader/types';

export function SettingsMenu() {
  const { theme, fontSize, setTheme, setFontSize } = useReader();
  const [isOpen, setIsOpen] = useState(false);
  const themeColors = colors[theme];

  const themes: { key: UserSettings['theme']; label: string }[] = [
    { key: 'light', label: 'Light' },
    { key: 'dark', label: 'Dark' },
    { key: 'sepia', label: 'Sepia' },
  ];

  const fontSizes: { key: UserSettings['fontSize']; label: string }[] = [
    { key: 'small', label: 'Small' },
    { key: 'medium', label: 'Medium' },
    { key: 'large', label: 'Large' },
  ];

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '8px',
          color: themeColors.textSecondary,
          fontSize: '18px',
        }}
        title="Settings"
      >
        Aa
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setIsOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 10,
            }}
          />

          {/* Menu */}
          <div
            style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '8px',
              backgroundColor: themeColors.background,
              border: `1px solid ${themeColors.border}`,
              borderRadius: '12px',
              padding: '16px',
              minWidth: '200px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              zIndex: 11,
            }}
          >
            {/* Theme */}
            <div style={{ marginBottom: '16px' }}>
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: themeColors.textSecondary,
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Theme
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {themes.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setTheme(key)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      border: `1px solid ${theme === key ? themeColors.accent : themeColors.border}`,
                      borderRadius: '6px',
                      backgroundColor: theme === key ? themeColors.surface : 'transparent',
                      color: themeColors.textPrimary,
                      cursor: 'pointer',
                      fontSize: '13px',
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size */}
            <div>
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: themeColors.textSecondary,
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Font Size
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {fontSizes.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setFontSize(key)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      border: `1px solid ${fontSize === key ? themeColors.accent : themeColors.border}`,
                      borderRadius: '6px',
                      backgroundColor: fontSize === key ? themeColors.surface : 'transparent',
                      color: themeColors.textPrimary,
                      cursor: 'pointer',
                      fontSize: '13px',
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
