import { describe, expect, it } from 'vitest';
import { readingTime } from '../src/lib/readingTime';

describe('readingTime', () => {
  it('returns at least one minute for short text', () => {
    expect(readingTime('short text')).toBe('1 min read');
  });

  it('rounds up by word count', () => {
    const text = Array.from({ length: 401 }, () => 'word').join(' ');
    expect(readingTime(text)).toBe('3 min read');
  });
});
