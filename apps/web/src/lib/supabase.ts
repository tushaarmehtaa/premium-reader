import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  // Provide fallback values during build time when env vars might not be available
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

  return createBrowserClient(url, key);
}

// Alias for backwards compatibility
export { createClient as createBrowserClient };
