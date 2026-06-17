import { describe, expect, it } from 'vitest';
import { isPublished, normalizeTag, publishedNewestFirst } from '../src/lib/content';

describe('isPublished', () => {
  it('rejects drafts', () => {
    expect(isPublished({ data: { draft: true } })).toBe(false);
  });

  it('accepts entries without draft flag', () => {
    expect(isPublished({ data: {} })).toBe(true);
  });
});

describe('normalizeTag', () => {
  it('normalizes tags for routes', () => {
    expect(normalizeTag('Personal OS')).toBe('personal-os');
  });

  it('trims whitespace', () => {
    expect(normalizeTag('  hello  ')).toBe('hello');
  });

  it('replaces multiple spaces with single hyphen', () => {
    expect(normalizeTag('a  b  c')).toBe('a-b-c');
  });
});

describe('publishedNewestFirst', () => {
  it('filters drafts and sorts newest first', () => {
    const entries = [
      { data: { date: new Date('2024-01-01'), draft: false } },
      { data: { date: new Date('2026-01-01'), draft: true } },
      { data: { date: new Date('2025-01-01'), draft: false } },
    ];

    const result = publishedNewestFirst(entries);

    expect(result).toHaveLength(2);
    expect(result[0].data.date.getFullYear()).toBe(2025);
    expect(result[1].data.date.getFullYear()).toBe(2024);
  });
});
