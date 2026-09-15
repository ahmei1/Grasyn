export const ACCESS_COOKIE = 'grasyn_access';
export const REFRESH_COOKIE = 'grasyn_refresh';

export function cookieOptions(maxAgeMs: number, secure: boolean) {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure,
    path: '/',
    maxAge: maxAgeMs,
  };
}

export function readCookie(cookies: unknown, name: string): string | undefined {
  if (!cookies || typeof cookies !== 'object') return undefined;
  const value = (cookies as Record<string, unknown>)[name];
  return typeof value === 'string' ? value : undefined;
}
