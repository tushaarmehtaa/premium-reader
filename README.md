# Premium Reader

Transform any article into a premium reading experience with AI-enhanced key insights.

## Overview

Premium Reader is a Chrome extension and web application that:
- Extracts article content using Readability.js
- Identifies key insights in each paragraph using Claude AI
- Provides three reading modes: Read, Scan, and Reference
- Saves articles to a personal library

## Architecture

```
premium-reader/
├── apps/
│   ├── extension/     # Chrome Extension (Manifest V3, React, TypeScript)
│   ├── web/           # Next.js Web App
│   └── api/           # Fastify Backend API
├── packages/
│   ├── reader-ui/     # Shared React components
│   ├── types/         # Shared TypeScript types
│   └── utils/         # Shared utilities
```

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm 8+
- Supabase account (for database and auth)
- Anthropic API key (for AI features)

### Setup

1. Clone and install dependencies:

```bash
git clone <repo-url>
cd premium-reader
pnpm install
```

2. Set up environment variables:

```bash
# apps/api/.env
ANTHROPIC_API_KEY=your-key
SUPABASE_URL=your-url
SUPABASE_SERVICE_KEY=your-key
SUPABASE_ANON_KEY=your-key
PORT=3001

# apps/web/.env.local
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
NEXT_PUBLIC_API_URL=http://localhost:3001
```

3. Set up Supabase database:

Run the SQL schema in `apps/api/supabase-schema.sql` in your Supabase SQL editor.

4. Generate extension icons:

```bash
cd apps/extension/public/icons
# Convert icon.svg to PNG files (see README in that folder)
```

5. Start development:

```bash
pnpm dev
```

This starts:
- API at http://localhost:3001
- Web app at http://localhost:3000
- Extension builds to `apps/extension/dist`

### Load Extension in Chrome

1. Open `chrome://extensions`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select `apps/extension/dist`

## Reading Modes

### Read Mode (R)
Full article with optimal typography. Key insights are bolded as they're identified by AI.

### Scan Mode (S)
Shows only the key insights as a list. Perfect for quickly understanding an article's main points.

### Reference Mode (F)
Navigation-focused view with sections. Click to jump to any part of the article.

## AI Enhancement

The AI reads each paragraph and identifies the single sentence or phrase that captures the key insight. This happens progressively - content loads instantly, and enhancements animate in paragraph-by-paragraph.

The AI uses this prompt:
- Select existing text only, never rewrite
- Choose text that works standalone
- Prefer concrete claims over general statements
- Return null if no sentence clearly stands out

## Tech Stack

| Layer | Technology |
|-------|------------|
| Extension | Manifest V3, React 18, TypeScript, Vite |
| Content Extraction | @mozilla/readability |
| Backend | Node.js, Fastify, TypeScript |
| Database | PostgreSQL (Supabase) |
| AI | Claude API (claude-sonnet-4-20250514) |
| Web App | Next.js 14, React 18, Tailwind CSS |
| Auth | Supabase Auth |

## Scripts

```bash
pnpm dev          # Start all apps in dev mode
pnpm build        # Build all apps
pnpm type-check   # Type check all packages
pnpm lint         # Lint all packages
```

## License

MIT
