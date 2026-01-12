import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import { enhanceRoutes } from './routes/enhance.js';
import { articleRoutes } from './routes/articles.js';
import { authRoutes } from './routes/auth.js';
import { fetchRoutes } from './routes/fetch.js';
import { parseRoutes } from './routes/parse.js';
import { structureRoutes } from './routes/structure.js';

const fastify = Fastify({
  logger: true,
});

async function start() {
  // Check configuration
  const hasGemini = !!process.env.GEMINI_API_KEY;
  const hasSupabase = !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY);

  console.log('\n=== Premium Reader API ===');
  console.log(`Gemini API: ${hasGemini ? '✓ Configured' : '✗ Not configured (AI enhancement disabled)'}`);
  console.log(`Supabase: ${hasSupabase ? '✓ Configured' : '○ Not configured (using in-memory storage)'}`);
  console.log('');

  // Register plugins
  await fastify.register(cors, {
    origin: [
      /chrome-extension:\/\/.*/,
      'http://localhost:3000',
      'http://localhost:5173',
      process.env.WEB_APP_URL || '',
    ].filter(Boolean),
    credentials: true,
  });

  await fastify.register(cookie, {
    secret: process.env.COOKIE_SECRET || 'premium-reader-secret-key',
  });

  // Routes
  await fastify.register(enhanceRoutes, { prefix: '/api' });
  await fastify.register(articleRoutes, { prefix: '/api' });
  await fastify.register(authRoutes, { prefix: '/api' });
  await fastify.register(fetchRoutes, { prefix: '/api' });
  await fastify.register(parseRoutes, { prefix: '/api' });
  await fastify.register(structureRoutes, { prefix: '/api' });

  // Health check
  fastify.get('/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    geminiConfigured: hasGemini,
    supabaseConfigured: hasSupabase,
  }));

  // Root route
  fastify.get('/', async () => ({
    name: 'Premium Reader API',
    version: '1.0.0',
    mode: hasSupabase ? 'production' : 'demo',
    endpoints: {
      health: '/health',
      fetch: 'POST /api/fetch - Extract article from URL',
      parse: 'POST /api/parse - Parse pasted content',
      enhance: 'POST /api/enhance - AI highlight key insights',
      structure: 'POST /api/structure - Generate article navigation structure',
      articles: '/api/articles',
      auth: '/api/auth/*',
    },
  }));

  const port = parseInt(process.env.PORT || '3001', 10);
  const host = process.env.HOST || '0.0.0.0';

  try {
    await fastify.listen({ port, host });
    console.log(`API running on http://localhost:${port}`);
    if (!hasGemini) {
      console.log('\n⚠️  Set GEMINI_API_KEY in .env to enable AI enhancement\n');
    }
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  await fastify.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await fastify.close();
  process.exit(0);
});

start();
