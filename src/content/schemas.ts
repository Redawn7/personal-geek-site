import { z } from 'astro:content';

export const nowSchema = z.object({
  title: z.string(),
  updated: z.date(),
  making: z.string(),
  reading: z.string(),
  thinking: z.string()
});

export const labSchema = z.object({
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
