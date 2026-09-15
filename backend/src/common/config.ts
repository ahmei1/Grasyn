// Validate deployment settings before Nest starts accepting requests.
export function validateConfig(env: Record<string, string | undefined>) {
  const secret = env.JWT_ACCESS_SECRET;
  if (
    typeof secret !== 'string' ||
    secret.length < 32 ||
    secret === 'change-me-to-a-long-random-string'
  ) {
    throw new Error(
      'JWT_ACCESS_SECRET must be a random secret of at least 32 characters',
    );
  }
  const days = Number(env.REFRESH_EXPIRES_DAYS ?? 7);
  if (!Number.isInteger(days) || days < 1 || days > 365) {
    throw new Error(
      'REFRESH_EXPIRES_DAYS must be an integer between 1 and 365',
    );
  }
  const expires = String(env.JWT_ACCESS_EXPIRES ?? '15m');
  if (!/^[1-9]\d*[smhd]$/.test(expires)) {
    throw new Error(
      'JWT_ACCESS_EXPIRES must be a positive duration such as 15m or 1h',
    );
  }
  const port = Number(env.PORT ?? 4000);
  if (!Number.isInteger(port) || port < 1 || port > 65535)
    throw new Error('Invalid PORT');
  if (!env.DATABASE_URL) throw new Error('DATABASE_URL is required');
  const origin = new URL(
    String(env.FRONTEND_ORIGIN ?? 'http://localhost:5173'),
  );
  if (
    !['http:', 'https:'].includes(origin.protocol) ||
    origin.origin !== String(env.FRONTEND_ORIGIN ?? 'http://localhost:5173')
  ) {
    throw new Error(
      'FRONTEND_ORIGIN must be a single HTTP(S) origin without a trailing slash',
    );
  }
  if (
    env.COOKIE_SECURE !== undefined &&
    !['true', 'false'].includes(String(env.COOKIE_SECURE))
  )
    throw new Error('COOKIE_SECURE must be true or false');
  if (
    env.NODE_ENV === 'production' &&
    (env.COOKIE_SECURE !== 'true' || origin.protocol !== 'https:')
  ) {
    throw new Error(
      'Production requires COOKIE_SECURE=true and an HTTPS FRONTEND_ORIGIN',
    );
  }
  return env;
}

export function accessMaxAgeMs(duration: string): number {
  const units: Record<string, number> = {
    s: 1000,
    m: 60000,
    h: 3600000,
    d: 86400000,
  };
  return Number(duration.slice(0, -1)) * units[duration.slice(-1)];
}
