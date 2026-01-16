import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  // Check if Supabase is properly configured
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If not configured or using placeholder values, return null
  if (!url || !key || url === 'your-supabase-url' || key === 'your-supabase-anon-key') {
    console.warn('Supabase credentials not configured');
    // Return a dummy client that won't crash but won't work either
    return createBrowserClient('https://placeholder.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTU2MDAsImV4cCI6MTk2MDc3MTYwMH0.placeholder');
  }

  return createBrowserClient(url, key);
}

// Alias for backwards compatibility
export { createClient as createBrowserClient };
