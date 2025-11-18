/**
 * Centralized API configuration
 * In production (Vercel), API is on same origin, so use relative paths
 * In development, use explicit URL
 */
export function getApiUrl(): string {
  // Server-side: use environment variable or default
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  }
  
  // Client-side: use relative paths in production, explicit URL in dev
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // In production on Vercel, API is on same origin
  if (process.env.NODE_ENV === 'production') {
    return '';
  }
  
  // Development fallback
  return 'http://localhost:3001';
}

export const API_URL = getApiUrl();

