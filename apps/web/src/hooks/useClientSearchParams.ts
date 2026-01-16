import { useSearchParams as useNextSearchParams } from 'next/navigation';

// Wrapper to handle useSearchParams safely during build/prerender
export function useClientSearchParams() {
  // During build or prerendering, return a mock URLSearchParams
  if (typeof window === 'undefined') {
    return new URLSearchParams();
  }

  return useNextSearchParams();
}
