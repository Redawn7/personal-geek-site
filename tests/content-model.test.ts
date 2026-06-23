import { z } from 'zod';
import { describe, expect, it } from 'vitest';

const nowSchema = z.object({
  title: z.string(),
  updated: z.date(),
  making: z.string(),
  reading: z.string(),
  thinking: z.string()
});

const labSchema = z.object({
  title: z.string(),
  date: z.date(),
  status: z.enum(['idea', 'building', 'shipped', 'archived']).default('idea'),
  description: z.string().optional(),
  tags: z.array(z.string()).default([]),
  repo: z.string().url().optional(),
  demo: z.string().url().optional(),
  stack: z.array(z.string()).default([]),
  screenshot: z.string().optional(),
  featured: z.boolean().default(false),
  writeup: z.boolean().default(true),
  draft: z.boolean().default(false)
});

describe('nowSchema', () => {
  it('accepts the complete homepage status', () => {
    const result = nowSchema.parse({
      title: 'Now',
      updated: new Date('2026-06-23'),
      making: 'Building my Personal Signal Atlas',
      reading: 'How small notes become useful ideas',
      thinking: 'How can a personal site feel alive?'
    });

    expect(result.making).toBe('Building my Personal Signal Atlas');
  });

  it('rejects an incomplete status', () => {
    expect(() => nowSchema.parse({ title: 'Now' })).toThrow();
  });
});

describe('labSchema', () => {
  it('defaults featured to false', () => {
    const result = labSchema.parse({
      title: 'Tiny tool',
      date: new Date('2026-06-23')
    });

    expect(result.featured).toBe(false);
  });
});
