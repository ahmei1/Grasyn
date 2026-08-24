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
