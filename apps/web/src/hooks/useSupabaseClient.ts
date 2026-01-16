import { useMemo } from 'react';
import { createClient } from '@/lib/supabase';

// Hook to safely create Supabase client only on client side
export function useSupabaseClient() {
  return useMemo(() => {
    // Only create client if we're in the browser
    if (typeof window !== 'undefined') {
      return createClient();
    }
    // Return null during SSR/build, pages should handle this
    return null;
  }, []);
}
