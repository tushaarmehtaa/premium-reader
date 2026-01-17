import { createServerClient as createSupabaseServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createClient() {
    // Check if Supabase is configured
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Return null if credentials are missing or using placeholder values
    if (!url || !key || url === 'your-supabase-url' || key === 'your-supabase-anon-key') {
        return null;
    }

    const cookieStore = cookies();

    return createSupabaseServerClient(
        url,
        key,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                    try {
                        cookieStore.set({ name, value, ...options });
                    } catch (error) {
                        // This can happen when setting cookies from Server Components
                        // which is fine - the middleware will handle it
                    }
                },
                remove(name: string, options: CookieOptions) {
                    try {
                        cookieStore.set({ name, value: '', ...options });
                    } catch (error) {
                        // Same as above
                    }
                },
            },
        }
    );
}

// Alias for backwards compatibility
export { createClient as createServerClient };
