import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        // The Soul - High contrast Serif for headlines
        display: ['Playfair Display', 'Georgia', 'serif'],
        // Body text - Readable Serif with tall x-height  
        serif: ['Merriweather', 'Georgia', 'serif'],
        // The Tool - Clean Sans for UI elements
        sans: ['Inter', '-apple-system', 'sans-serif'],
      },
      colors: {
        // Paper & Ink Color Palette
        paper: {
          DEFAULT: '#F9F9F7',
          warm: '#F5F5F0',
          cream: '#FAFAF8',
        },
        ink: {
          DEFAULT: '#1C1C1C',     // Soft Charcoal - primary text
          secondary: '#4A4A4A',   // Graphite - secondary text
          muted: '#6B6B6B',       // Light graphite
          faint: '#8A8A8A',       // Very light
        },
        accent: {
          amber: '#D97706',       // Highlighter Amber
          forest: '#14532D',      // Deep Forest
          sage: '#4A5D4A',        // Sage green
        },
        border: {
          subtle: '#E5E5E0',      // Ultra-subtle borders
          warm: '#DEDEDA',        // Slightly visible borders
        },
      },
      letterSpacing: {
        tighter: '-0.02em',
        tight: '-0.01em',
      },
      lineHeight: {
        relaxed: '1.7',
        loose: '1.8',
      },
      maxWidth: {
        prose: '65ch',
        'prose-lg': '70ch',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'float': 'float 0.3s ease-out',
        'scale-in': 'scaleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.7' },
        },
        float: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};

export default config;
