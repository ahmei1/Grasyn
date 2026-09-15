import { accessMaxAgeMs, validateConfig } from './config';
const valid = {
  JWT_ACCESS_SECRET: 'a'.repeat(48),
  DATABASE_URL: 'postgresql://localhost/test',
};
describe('Configuration', () => {
  it('accepts development defaults', () =>
    expect(validateConfig(valid)).toEqual(valid));
  it.each([
    { JWT_ACCESS_SECRET: 'short' },
    { JWT_ACCESS_SECRET: 'change-me-to-a-long-random-string' },
    { JWT_ACCESS_EXPIRES: '1000' },
    { REFRESH_EXPIRES_DAYS: '-1' },
    { PORT: '0' },
    { FRONTEND_ORIGIN: 'https://example.com/path' },
    { NODE_ENV: 'production', COOKIE_SECURE: 'false' },
  ])('rejects invalid settings %p', (settings) => {
    expect(() => validateConfig({ ...valid, ...settings })).toThrow();
  });
  it('keeps cookie duration aligned with configured JWT duration', () => {
    expect(accessMaxAgeMs('1h')).toBe(3600000);
    expect(accessMaxAgeMs('15m')).toBe(900000);
  });
});
