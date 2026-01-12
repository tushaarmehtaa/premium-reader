export const colors = {
  light: {
    background: '#FFFFFF',
    surface: '#FAFAFA',
    textPrimary: '#1A1A1A',
    textSecondary: '#6B7280',
    accent: '#000000',
    border: '#E5E7EB',
    highlight: '#FEF3C7',
  },
  dark: {
    background: '#0A0A0A',
    surface: '#141414',
    textPrimary: '#F5F5F5',
    textSecondary: '#9CA3AF',
    accent: '#FFFFFF',
    border: '#262626',
    highlight: '#422006',
  },
  sepia: {
    background: '#F4ECD8',
    surface: '#EDE4CF',
    textPrimary: '#3D3529',
    textSecondary: '#6B5F4D',
    accent: '#3D3529',
    border: '#D4C9B5',
    highlight: '#E8D5A3',
  },
};

export const typography = {
  fontFamily: {
    serif: "'Libre Baskerville', Georgia, serif",
    sans: "'Inter', -apple-system, sans-serif",
    mono: "'Fira Code', monospace",
  },
  fontSize: {
    small: { body: '16px', title: '32px', heading: '20px' },
    medium: { body: '18px', title: '40px', heading: '24px' },
    large: { body: '20px', title: '48px', heading: '28px' },
  },
  lineHeight: {
    body: 1.8,
    heading: 1.3,
    title: 1.2,
  },
};

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
};

export const animation = {
  enhanceDuration: '200ms',
  highlightDuration: '400ms',
  easing: 'ease-out',
};

export type ThemeColors = typeof colors.light;
export type FontSizes = typeof typography.fontSize.medium;
