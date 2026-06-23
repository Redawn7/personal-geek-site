import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { isPublished, normalizeTag, publishedNewestFirst } from '../src/lib/content';

const homeUrl = new URL('../src/lib/home.ts', import.meta.url);

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

describe('selectFeaturedProject', () => {
  it('prefers an explicit featured published project', async () => {
    expect(existsSync(fileURLToPath(homeUrl))).toBe(true);
    const { selectFeaturedProject } = await import('../src/lib/home');
    const entries = [
      { slug: 'new', data: { date: new Date('2026-06-23'), draft: false, featured: false } },
      { slug: 'featured', data: { date: new Date('2026-06-01'), draft: false, featured: true } }
    ];

    expect(selectFeaturedProject(entries)?.slug).toBe('featured');
  });

  it('falls back to the newest published project', async () => {
    expect(existsSync(fileURLToPath(homeUrl))).toBe(true);
    const { selectFeaturedProject } = await import('../src/lib/home');
    const entries = [
      { slug: 'old', data: { date: new Date('2026-05-01'), draft: false, featured: false } },
      { slug: 'new', data: { date: new Date('2026-06-23'), draft: false, featured: false } },
      { slug: 'draft', data: { date: new Date('2026-07-01'), draft: true, featured: true } }
    ];

    expect(selectFeaturedProject(entries)?.slug).toBe('new');
  });
});

describe('selectLifePostcards', () => {
  it('returns at most three newest published entries', async () => {
    expect(existsSync(fileURLToPath(homeUrl))).toBe(true);
    const { selectLifePostcards } = await import('../src/lib/home');
    const entries = [1, 2, 3, 4].map((day) => ({
      slug: String(day),
      data: { date: new Date(`2026-06-0${day}`), draft: false }
    }));

    expect(selectLifePostcards(entries).map((entry) => entry.slug)).toEqual(['4', '3', '2']);
  });
});
