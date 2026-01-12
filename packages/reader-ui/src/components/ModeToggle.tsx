import React, { useEffect } from 'react';
import { useReader } from '../context/ReaderContext';
import { colors } from '../tokens';
import type { ReadingMode } from '@premium-reader/types';

const modes: { key: ReadingMode; label: string; shortcut: string }[] = [
  { key: 'scan', label: 'Scan', shortcut: 'S' },
  { key: 'read', label: 'Read', shortcut: 'R' },
  { key: 'reference', label: 'Reference', shortcut: 'F' },
];

export function ModeToggle() {
  const { mode, setMode, theme } = useReader();
  const themeColors = colors[theme];

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const key = e.key.toLowerCase();
      if (key === 'r') setMode('read');
      if (key === 's') setMode('scan');
      if (key === 'f') setMode('reference');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setMode]);

  return (
    <div
      style={{
        display: 'flex',
        gap: '4px',
        backgroundColor: themeColors.surface,
        padding: '4px',
        borderRadius: '8px',
      }}
    >
      {modes.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => setMode(key)}
          title={`${label} mode (${key.toUpperCase()})`}
          style={{
            padding: '8px 16px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 500,
            backgroundColor: mode === key ? themeColors.background : 'transparent',
            color: mode === key ? themeColors.textPrimary : themeColors.textSecondary,
            boxShadow: mode === key ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            transition: 'all 150ms ease-out',
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
