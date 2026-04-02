import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { checkRateLimit } from '../src/lib/rateLimit';

describe('rateLimit', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('allows requests within the limit', () => {
    expect(() => checkRateLimit('user1', 2, 1000)).not.toThrow();
    expect(() => checkRateLimit('user1', 2, 1000)).not.toThrow();
  });

  it('throws an error when limit is exceeded', () => {
    checkRateLimit('user2', 2, 1000);
    checkRateLimit('user2', 2, 1000);

    expect(() => checkRateLimit('user2', 2, 1000)).toThrow(/Muitas requisições/);
  });

  it('resets the limit after the window ends', () => {
    checkRateLimit('user3', 1, 1000);
    expect(() => checkRateLimit('user3', 1, 1000)).toThrow();

    vi.advanceTimersByTime(1001);

    expect(() => checkRateLimit('user3', 1, 1000)).not.toThrow();
  });
});