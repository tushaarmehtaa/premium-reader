import { FastifyPluginAsync } from 'fastify';

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  return process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY;
};

// Mock user for development without database
const mockUser = {
  id: 'local-user',
  email: 'demo@premiumreader.local',
  plan: 'free' as const,
  settings: {
    theme: 'light' as const,
    fontSize: 'medium' as const,
    defaultMode: 'read' as const,
    emailDigest: 'none' as const,
  },
  createdAt: new Date().toISOString(),
};

export const authRoutes: FastifyPluginAsync = async (fastify) => {
  // Sign up
  fastify.post<{ Body: { email: string; password: string } }>('/auth/signup', async (request, reply) => {
    if (!isSupabaseConfigured()) {
      return {
        user: mockUser,
        session: { access_token: 'mock-token-for-dev' },
        note: 'Running in demo mode (no database configured)',
      };
    }

    const { email, password } = request.body;

    if (!email || !password) {
      return reply.code(400).send({ error: 'Email and password required' });
    }

    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      return reply.code(400).send({ error: error.message });
    }

    return { user: data.user, session: data.session };
  });

  // Sign in
  fastify.post<{ Body: { email: string; password: string } }>('/auth/signin', async (request, reply) => {
    if (!isSupabaseConfigured()) {
      return {
        user: mockUser,
        session: { access_token: 'mock-token-for-dev' },
        note: 'Running in demo mode (no database configured)',
      };
    }

    const { email, password } = request.body;

    if (!email || !password) {
      return reply.code(400).send({ error: 'Email and password required' });
    }

    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return reply.code(401).send({ error: error.message });
    }

    return { user: data.user, session: data.session };
  });

  // Sign out
  fastify.post('/auth/signout', async () => {
    return { success: true };
  });

  // Get current user
  fastify.get('/auth/me', async (request, reply) => {
    if (!isSupabaseConfigured()) {
      return { user: mockUser, profile: mockUser };
    }

    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return reply.code(401).send({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);

    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabase.auth.getUser(token);

    if (error) {
      return reply.code(401).send({ error: 'Invalid token' });
    }

    return { user: data.user, profile: null };
  });

  // Update settings
  fastify.patch<{ Body: { userId: string; settings: Record<string, unknown> } }>(
    '/auth/settings',
    async (request, reply) => {
      if (!isSupabaseConfigured()) {
        return { profile: { ...mockUser, settings: request.body.settings } };
      }

      const { userId, settings } = request.body;

      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_KEY!
      );

      const { data, error } = await supabase
        .from('profiles')
        .update({ settings })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        return reply.code(500).send({ error: error.message });
      }

      return { profile: data };
    }
  );
};
