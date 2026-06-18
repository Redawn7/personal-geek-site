import { defineCollection, z } from 'astro:content';

const base = {
  title: z.string(),
  date: z.date(),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false)
};

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    ...base,
    description: z.string(),
    category: z.string(),
    cover: z.string().optional(),
    series: z.string().optional(),
    updated: z.date().optional(),
    canonical: z.string().url().optional(),
    related: z.array(z.string()).default([])
  })
});

const notes = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    tags: z.array(z.string()).default([]),
    status: z.enum(['seed', 'growing', 'evergreen']).default('seed'),
    description: z.string().optional(),
    source: z.string().optional(),
    links: z.array(z.string()).default([]),
    draft: z.boolean().default(false)
  })
});

const life = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    type: z.enum(['photo', 'place', 'fragment', 'recap']),
    description: z.string().optional(),
    draft: z.boolean().default(false),
    location: z.string().optional(),
    weather: z.string().optional(),
    photos: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    mood: z.string().optional(),
    coordinates: z
      .object({
        lat: z.number(),
        lng: z.number()
      })
      .optional()
  })
});

const lab = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    status: z.enum(['idea', 'building', 'shipped', 'archived']).default('idea'),
    description: z.string().optional(),
    tags: z.array(z.string()).default([]),
    repo: z.string().url().optional(),
    demo: z.string().url().optional(),
    stack: z.array(z.string()).default([]),
    screenshot: z.string().optional(),
    writeup: z.boolean().default(true),
    draft: z.boolean().default(false)
  })
});

const books = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    creator: z.string(),
    date: z.date(),
    status: z.enum(['reading', 'finished', 'paused', 'wishlist']),
    rating: z.number().min(0).max(5).optional(),
    notes: z.string().optional(),
    cover: z.string().optional(),
    quotes: z.array(z.string()).default([]),
    related: z.array(z.string()).default([]),
    draft: z.boolean().default(false)
  })
});

export const collections = {
  posts,
  notes,
  life,
  lab,
  books
};
