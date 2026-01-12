import { createClient } from '@supabase/supabase-js';

if (!process.env.SUPABASE_URL) {
  console.warn('SUPABASE_URL not set - database operations will fail');
}

if (!process.env.SUPABASE_SERVICE_KEY) {
  console.warn('SUPABASE_SERVICE_KEY not set - database operations will fail');
}

export const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export const supabaseAnon = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY || ''
);
