# Personal Signal Atlas Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a data-driven Now Dashboard, curated Life Postcards, and a Featured Project to the homepage without adding external services or weakening the Paper/Terminal themes.

**Architecture:** Astro content collections remain the source of truth. Small pure helpers in `src/lib/home.ts` select and normalize homepage data; focused Astro components only render prepared props. The homepage composes those components, while `/now` renders the same singleton MDX entry so status text is never duplicated.

**Tech Stack:** Astro 5 content collections, MDX, TypeScript, CSS custom properties, Vitest, Pagefind.

---

## File Map

- Create `src/content/schemas.ts`: reusable schemas for the Now singleton and Lab entries.
- Modify `src/content.config.ts`: register the Now collection and use the exported Lab schema.
- Move `src/content/now.mdx` to `src/content/now/index.mdx`: schema-validated singleton content.
- Modify `src/content/lab/2026-06-17-command-palette.mdx`: mark the sample project as featured.
- Create `src/lib/home.ts`: homepage selection, fallback, and action-link logic.
- Modify `tests/content.test.ts`: test featured selection and homepage limits.
- Create `tests/content-model.test.ts`: test Now and Lab schema contracts.
- Create `src/components/NowDashboard.astro`: compact Making/Reading/Thinking status board.
- Create `src/components/LifePostcards.astro`: three-entry postcard strip with stable no-photo fallback.
- Create `src/components/FeaturedProject.astro`: featured project media, metadata, and primary action.
- Modify `src/pages/now.astro`: render the schema-validated singleton entry.
- Modify `src/pages/index.astro`: fetch, prepare, and compose the three modules.
- Delete `src/components/LifeStrip.astro`: replaced by real Life content.
- Delete `src/components/LabTile.astro`: replaced by the real featured project.
- Create `tests/personal-signal-atlas.test.ts`: source-level accessibility and integration contracts.

### Task 1: Add Schema-Validated Now And Featured Lab Content

**Files:**
- Create: `src/content/schemas.ts`
- Modify: `src/content.config.ts`
- Create: `src/content/now/index.mdx`
- Delete: `src/content/now.mdx`
- Modify: `src/content/lab/2026-06-17-command-palette.mdx`
- Test: `tests/content-model.test.ts`

- [ ] **Step 1: Write the failing schema tests**

```ts
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const schemaUrl = new URL('../src/content/schemas.ts', import.meta.url);

describe('nowSchema', () => {
  it('accepts the complete homepage status', async () => {
    expect(existsSync(fileURLToPath(schemaUrl))).toBe(true);
    const { nowSchema } = await import('../src/content/schemas');
    const result = nowSchema.parse({
      title: 'Now',
      updated: new Date('2026-06-23'),
      making: 'Building my Personal Signal Atlas',
      reading: 'How small notes become useful ideas',
      thinking: 'How can a personal site feel alive?'
    });

    expect(result.making).toBe('Building my Personal Signal Atlas');
  });

  it('rejects an incomplete status', async () => {
    expect(existsSync(fileURLToPath(schemaUrl))).toBe(true);
    const { nowSchema } = await import('../src/content/schemas');
    expect(() => nowSchema.parse({ title: 'Now' })).toThrow();
  });
});

describe('labSchema', () => {
  it('defaults featured to false', async () => {
    expect(existsSync(fileURLToPath(schemaUrl))).toBe(true);
    const { labSchema } = await import('../src/content/schemas');
    const result = labSchema.parse({
      title: 'Tiny tool',
      date: new Date('2026-06-23')
    });

    expect(result.featured).toBe(false);
  });
});
```

- [ ] **Step 2: Run the tests and verify RED**

Run: `npm test -- tests/content-model.test.ts`

Expected: FAIL with `expected false to be true` because `src/content/schemas.ts` does not exist.

- [ ] **Step 3: Create reusable schemas**

```ts
// src/content/schemas.ts
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
```

Update `src/content.config.ts`:

```ts
import { defineCollection, z } from 'astro:content';
import { labSchema, nowSchema } from './content/schemas';

const now = defineCollection({ type: 'content', schema: nowSchema });
const lab = defineCollection({ type: 'content', schema: labSchema });

export const collections = {
  posts,
  notes,
  life,
  lab,
  books,
  now
};
```

Remove the old inline `lab` schema from `src/content.config.ts`.

- [ ] **Step 4: Move and enrich the Now content**

Delete `src/content/now.mdx` and create `src/content/now/index.mdx`:

```mdx
---
title: "Now"
updated: 2026-06-23
making: "Building my Personal Signal Atlas"
reading: "How small notes become useful ideas"
thinking: "How can a personal site feel alive without becoming noisy?"
---

I am building a personal site that holds both my projects and the small parts of daily life.

我希望这里既能展示创造，也能留下真实但经过选择的生活片段。
```

Add `featured: true` to `src/content/lab/2026-06-17-command-palette.mdx`.

- [ ] **Step 5: Verify GREEN and commit**

Run: `npm test -- tests/content-model.test.ts && npm run check`

Expected: schema tests PASS and Astro reports zero errors.

```bash
git add src/content.config.ts src/content/schemas.ts src/content/now src/content/now.mdx src/content/lab/2026-06-17-command-palette.mdx tests/content-model.test.ts
git commit -m "feat: add now and featured project content models"
```

### Task 2: Add Tested Homepage Selection Helpers

**Files:**
- Create: `src/lib/home.ts`
- Modify: `tests/content.test.ts`

- [ ] **Step 1: Write failing selection tests**

Append to `tests/content.test.ts`:

```ts
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const homeUrl = new URL('../src/lib/home.ts', import.meta.url);

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
```

- [ ] **Step 2: Run the tests and verify RED**

Run: `npm test -- tests/content.test.ts`

Expected: FAIL with `expected false to be true` because `src/lib/home.ts` does not exist.

- [ ] **Step 3: Implement the minimal selectors**

```ts
// src/lib/home.ts
import { publishedNewestFirst } from './content';

type HomepageEntry = {
  data: {
    date: Date;
    draft?: boolean;
  };
};

type FeaturedEntry = HomepageEntry & {
  data: HomepageEntry['data'] & {
    featured?: boolean;
  };
};

export function selectFeaturedProject<T extends FeaturedEntry>(entries: T[]): T | undefined {
  const published = publishedNewestFirst(entries);
  return published.find((entry) => entry.data.featured === true) ?? published[0];
}

export function selectLifePostcards<T extends HomepageEntry>(entries: T[]): T[] {
  return publishedNewestFirst(entries).slice(0, 3);
}
```

- [ ] **Step 4: Verify GREEN and commit**

Run: `npm test -- tests/content.test.ts`

Expected: all content tests PASS.

```bash
git add src/lib/home.ts tests/content.test.ts
git commit -m "feat: add homepage content selectors"
```

### Task 3: Build The Now Dashboard From The Singleton Entry

**Files:**
- Create: `src/components/NowDashboard.astro`
- Modify: `src/pages/now.astro`
- Test: `tests/personal-signal-atlas.test.ts`

- [ ] **Step 1: Write the failing source contract**

```ts
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const projectFile = (path: string) => new URL(`../${path}`, import.meta.url);

async function readRequiredSource(path: string): Promise<string> {
  const url = projectFile(path);
  expect(existsSync(fileURLToPath(url))).toBe(true);
  return readFile(url, 'utf8');
}

describe('Personal Signal Atlas components', () => {
  it('renders the three Now fields and an honest updated date', async () => {
    const source = await readRequiredSource('src/components/NowDashboard.astro');

    expect(source).toContain('MAKING / 在做');
    expect(source).toContain('READING / 在读');
    expect(source).toContain('THINKING / 在想');
    expect(source).toContain('<time');
    expect(source).toContain('href="/now"');
  });
});
```

- [ ] **Step 2: Run the test and verify RED**

Run: `npm test -- tests/personal-signal-atlas.test.ts`

Expected: FAIL with `expected false to be true` because `NowDashboard.astro` does not exist.

- [ ] **Step 3: Implement `NowDashboard.astro`**

```astro
---
import { formatDate } from '../lib/dates';

type Props = {
  updated: Date;
  making: string;
  reading: string;
  thinking: string;
};

const { updated, making, reading, thinking } = Astro.props;
const rows = [
  { label: 'MAKING / 在做', value: making },
  { label: 'READING / 在读', value: reading },
  { label: 'THINKING / 在想', value: thinking }
];
---

<section class="ink-panel now-dashboard" aria-labelledby="now-dashboard-title">
  <div class="now-head">
    <div>
      <p class="mono">NOW / 近况</p>
      <h2 id="now-dashboard-title">What is happening now?</h2>
    </div>
    <time class="mono" datetime={updated.toISOString()}>Updated {formatDate(updated)}</time>
  </div>
  <div class="now-rows">
    {rows.map((row) => (
      <div class="now-row">
        <span class="mono">{row.label}</span>
        <strong>{row.value}</strong>
      </div>
    ))}
  </div>
  <a class="mono now-link" href="/now">READ THE FULL UPDATE</a>
</section>

<style>
  .now-dashboard { padding: clamp(18px, 3vw, 28px); }
  .now-head { display: flex; justify-content: space-between; gap: 20px; align-items: start; }
  .now-head p, .now-head time { color: var(--warm); font-size: 11px; margin: 0; }
  .now-head h2 { font-size: clamp(1.5rem, 3vw, 2.4rem); margin: 8px 0 0; }
  .now-rows { display: grid; margin-top: 24px; }
  .now-row { display: grid; grid-template-columns: 150px minmax(0, 1fr); gap: 16px; border-top: 1px solid var(--line); padding: 14px 0; }
  .now-row span { color: var(--muted); font-size: 11px; }
  .now-link { color: var(--blue); display: inline-block; font-size: 11px; margin-top: 10px; }
  @media (max-width: 620px) { .now-head, .now-row { grid-template-columns: 1fr; display: grid; } }
</style>
```

- [ ] **Step 4: Make `/now` render the same MDX entry**

Replace hard-coded content in `src/pages/now.astro` with:

```astro
---
import { getCollection, render } from 'astro:content';
import BaseLayout from '../layouts/BaseLayout.astro';
import NowDashboard from '../components/NowDashboard.astro';

const [entry] = await getCollection('now');
const rendered = entry ? await render(entry) : undefined;
const Content = rendered?.Content;
---

<BaseLayout title="Now" description="What I am doing now. 最近在做什么。" path="/now">
  <section class="shell" style="padding: 48px 0 96px;">
    {entry ? (
      <>
        <NowDashboard {...entry.data} />
        {Content && <div class="prose" style="margin-top: 36px;"><Content /></div>}
      </>
    ) : (
      <p class="mono" style="color: var(--muted);">Status update in progress / 近况整理中</p>
    )}
  </section>
</BaseLayout>
```

- [ ] **Step 5: Verify and commit**

Run: `npm test -- tests/personal-signal-atlas.test.ts && npm run check`

Expected: tests PASS and Astro reports zero errors.

```bash
git add src/components/NowDashboard.astro src/pages/now.astro tests/personal-signal-atlas.test.ts
git commit -m "feat: add data-driven now dashboard"
```

### Task 4: Build Curated Life Postcards With A No-Photo Fallback

**Files:**
- Create: `src/components/LifePostcards.astro`
- Modify: `tests/personal-signal-atlas.test.ts`

- [ ] **Step 1: Add the failing Life Postcards contract**

Append inside the existing describe block:

```ts
it('keeps Life postcards private by design and supports photo fallback', async () => {
  const source = await readRequiredSource('src/components/LifePostcards.astro');

  expect(source).toContain('entry.data.photos[0]');
  expect(source).toContain('postcard-fallback');
  expect(source).toContain('alt={entry.data.title}');
  expect(source).not.toContain('coordinates');
});
```

- [ ] **Step 2: Run the test and verify RED**

Run: `npm test -- tests/personal-signal-atlas.test.ts`

Expected: FAIL with `expected false to be true` because `LifePostcards.astro` does not exist.

- [ ] **Step 3: Implement `LifePostcards.astro`**

```astro
---
import type { CollectionEntry } from 'astro:content';
import { formatDate } from '../lib/dates';
import { mediaUrl } from '../lib/media';

type Props = { entries: CollectionEntry<'life'>[] };
const { entries } = Astro.props;
---

<section class="life-postcards" aria-labelledby="life-postcards-title">
  <div class="postcard-head">
    <div>
      <p class="mono">LIFE POSTCARDS / 生活明信片</p>
      <h2 id="life-postcards-title">Small moments worth keeping.</h2>
    </div>
    <a class="mono" href="/life">ALL LIFE NOTES</a>
  </div>
  {entries.length > 0 ? (
    <div class="postcard-strip">
      {entries.map((entry) => {
        const photo = entry.data.photos[0];
        return (
          <a class="postcard" href={`/life/${entry.slug}`}>
            <div class="postcard-media">
              {photo ? <img src={mediaUrl(photo)} alt={entry.data.title} loading="lazy" /> : (
                <div class="postcard-fallback mono" aria-hidden="true">{entry.data.type.toUpperCase()}</div>
              )}
            </div>
            <div class="postcard-copy">
              <span class="mono">{formatDate(entry.data.date)}</span>
              <h3>{entry.data.title}</h3>
              <p>{entry.data.description ?? entry.data.location ?? 'A small part of an ordinary day.'}</p>
              <div class="postcard-meta mono">
                {entry.data.location && <span>{entry.data.location}</span>}
                {entry.data.mood && <span>{entry.data.mood}</span>}
              </div>
            </div>
          </a>
        );
      })}
    </div>
  ) : (
    <a class="postcard-empty mono" href="/life">Life notes are being collected / 生活记录整理中</a>
  )}
</section>

<style>
  .life-postcards { margin-top: 52px; }
  .postcard-head { display: flex; align-items: end; justify-content: space-between; gap: 20px; margin-bottom: 16px; }
  .postcard-head p, .postcard-head a { color: var(--warm); font-size: 11px; margin: 0; }
  .postcard-head h2 { font-size: clamp(1.6rem, 4vw, 3rem); margin: 8px 0 0; }
  .postcard-strip { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
  .postcard { border: 1px solid var(--line-strong); border-radius: 8px; background: var(--paper); overflow: hidden; }
  .postcard-media { aspect-ratio: 4 / 3; background: var(--surface-2); overflow: hidden; }
  .postcard-media img { display: block; width: 100%; height: 100%; object-fit: cover; }
  .postcard-fallback { display: grid; place-items: center; width: 100%; height: 100%; color: var(--muted); background: repeating-linear-gradient(135deg, var(--surface), var(--surface) 16px, var(--surface-2) 16px, var(--surface-2) 17px); }
  .postcard-copy { padding: 16px; }
  .postcard-copy > span, .postcard-meta { color: var(--muted); font-size: 11px; }
  .postcard-copy h3 { margin: 8px 0; }
  .postcard-copy p { color: var(--muted); line-height: 1.55; margin: 0; }
  .postcard-meta { display: flex; gap: 8px; margin-top: 14px; }
  .postcard-empty { display: block; border-top: 1px solid var(--line); color: var(--muted); padding: 18px 0; }
  @media (max-width: 760px) { .postcard-strip { grid-template-columns: 1fr; } .postcard-head { align-items: start; flex-direction: column; } }
</style>
```

- [ ] **Step 4: Verify and commit**

Run: `npm test -- tests/personal-signal-atlas.test.ts && npm run check`

Expected: tests PASS and Astro reports zero errors.

```bash
git add src/components/LifePostcards.astro tests/personal-signal-atlas.test.ts
git commit -m "feat: add curated life postcards"
```

### Task 5: Build The Featured Project Showcase

**Files:**
- Modify: `src/lib/home.ts`
- Create: `src/components/FeaturedProject.astro`
- Modify: `tests/content.test.ts`
- Modify: `tests/personal-signal-atlas.test.ts`

- [ ] **Step 1: Write failing action-priority tests**

Append to `tests/content.test.ts`:

```ts

describe('projectAction', () => {
  it('prefers demo, then repository, then local write-up', async () => {
    const home = await import('../src/lib/home');
    expect(home).toHaveProperty('projectAction');
    const projectAction = home.projectAction as (project: {
      slug: string;
      data: { demo?: string; repo?: string; writeup?: boolean };
    }) => { href: string; label: string };

    expect(projectAction({ slug: 'x', data: { demo: 'https://demo.test', repo: 'https://repo.test', writeup: true } })).toEqual({ href: 'https://demo.test', label: 'OPEN DEMO' });
    expect(projectAction({ slug: 'x', data: { repo: 'https://repo.test', writeup: true } })).toEqual({ href: 'https://repo.test', label: 'VIEW REPO' });
    expect(projectAction({ slug: 'x', data: { writeup: true } })).toEqual({ href: '/lab/x', label: 'READ THE BUILD NOTE' });
  });
});
```

Add the component contract to `tests/personal-signal-atlas.test.ts`:

```ts
it('renders status, stack, media fallback, and one project action', async () => {
  const source = await readRequiredSource('src/components/FeaturedProject.astro');

  expect(source).toContain('project.data.status');
  expect(source).toContain('project.data.stack');
  expect(source).toContain('project-blueprint');
  expect(source).toContain('action.label');
});
```

- [ ] **Step 2: Run tests and verify RED**

Run: `npm test -- tests/content.test.ts tests/personal-signal-atlas.test.ts`

Expected: FAIL because `projectAction` is not exported and `FeaturedProject.astro` does not exist.

- [ ] **Step 3: Implement `projectAction`**

Append to `src/lib/home.ts`:

```ts
type ActionProject = {
  slug: string;
  data: {
    demo?: string;
    repo?: string;
    writeup?: boolean;
  };
};

export function projectAction(project: ActionProject): { href: string; label: string } {
  if (project.data.demo) return { href: project.data.demo, label: 'OPEN DEMO' };
  if (project.data.repo) return { href: project.data.repo, label: 'VIEW REPO' };
  return { href: `/lab/${project.slug}`, label: 'READ THE BUILD NOTE' };
}
```

- [ ] **Step 4: Implement `FeaturedProject.astro`**

```astro
---
import type { CollectionEntry } from 'astro:content';
import { mediaUrl } from '../lib/media';
import { projectAction } from '../lib/home';

type Props = { project?: CollectionEntry<'lab'> };
const { project } = Astro.props;
const action = project ? projectAction(project) : undefined;
---

<section class="featured-project" aria-labelledby="featured-project-title">
  <div class="project-copy">
    <p class="mono">FEATURED PROJECT / 精选项目</p>
    {project ? (
      <>
        <span class="project-status mono">{project.data.status}</span>
        <h2 id="featured-project-title">{project.data.title}</h2>
        <p>{project.data.description ?? 'A small project built to learn something useful.'}</p>
        <div class="project-stack mono">{project.data.stack.map((item) => <span>{item}</span>)}</div>
        {action && <a class="project-action mono" href={action.href}>{action.label}</a>}
      </>
    ) : (
      <>
        <h2 id="featured-project-title">Next build loading.</h2>
        <p>A new experiment will appear here soon. 新项目正在准备中。</p>
        <a class="project-action mono" href="/lab">OPEN LAB</a>
      </>
    )}
  </div>
  <div class="project-media">
    {project?.data.screenshot ? <img src={mediaUrl(project.data.screenshot)} alt={`${project.data.title} screenshot`} loading="lazy" /> : (
      <div class="project-blueprint mono" aria-hidden="true">BUILD / TEST / LEARN</div>
    )}
  </div>
</section>

<style>
  .featured-project { display: grid; grid-template-columns: minmax(0, .8fr) minmax(300px, 1.2fr); gap: clamp(24px, 5vw, 72px); align-items: center; border-block: 1px solid var(--line-strong); margin-top: 56px; padding: clamp(30px, 6vw, 70px) 0; }
  .project-copy > p:first-child { color: var(--cyan); font-size: 11px; }
  .project-status { color: var(--warm); font-size: 11px; text-transform: uppercase; }
  .project-copy h2 { font-size: clamp(2rem, 5vw, 4.4rem); line-height: .94; margin: 12px 0; }
  .project-copy > p:not(:first-child) { color: var(--muted); line-height: 1.65; }
  .project-stack { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 18px; }
  .project-stack span { border: 1px solid var(--line); border-radius: 999px; color: var(--muted); font-size: 10px; padding: 5px 8px; }
  .project-action { color: var(--blue); display: inline-block; font-size: 11px; margin-top: 22px; }
  .project-media { aspect-ratio: 16 / 10; border: 1px solid var(--line-strong); border-radius: 8px; background: var(--surface); overflow: hidden; }
  .project-media img { width: 100%; height: 100%; object-fit: cover; }
  .project-blueprint { display: grid; place-items: center; width: 100%; height: 100%; color: var(--muted); background: linear-gradient(90deg, transparent 31px, var(--line) 32px), linear-gradient(transparent 31px, var(--line) 32px); background-size: 32px 32px; }
  @media (max-width: 760px) { .featured-project { grid-template-columns: 1fr; } }
</style>
```

- [ ] **Step 5: Verify and commit**

Run: `npm test -- tests/content.test.ts tests/personal-signal-atlas.test.ts && npm run check`

Expected: tests PASS and Astro reports zero errors.

```bash
git add src/lib/home.ts src/components/FeaturedProject.astro tests/content.test.ts tests/personal-signal-atlas.test.ts
git commit -m "feat: add featured project showcase"
```

### Task 6: Compose The Homepage And Remove Placeholder Modules

**Files:**
- Modify: `src/pages/index.astro`
- Delete: `src/components/LifeStrip.astro`
- Delete: `src/components/LabTile.astro`
- Modify: `tests/personal-signal-atlas.test.ts`

- [ ] **Step 1: Add the failing homepage integration contract**

Append to `tests/personal-signal-atlas.test.ts`:

```ts
it('composes real Now, Life, and Lab content on the homepage', async () => {
  const source = await readFile(projectFile('src/pages/index.astro'), 'utf8');

  expect(source).toContain("getCollection('now')");
  expect(source).toContain('<NowDashboard');
  expect(source).toContain('<LifePostcards');
  expect(source).toContain('<FeaturedProject');
  expect(source).not.toContain('LifeStrip');
  expect(source).not.toContain('LabTile');
});
```

- [ ] **Step 2: Run the test and verify RED**

Run: `npm test -- tests/personal-signal-atlas.test.ts`

Expected: FAIL because the homepage still uses `LifeStrip` and `LabTile`.

- [ ] **Step 3: Update homepage data preparation**

At the top of `src/pages/index.astro`, replace placeholder imports and prepare data:

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../layouts/BaseLayout.astro';
import ModuleLauncher from '../components/ModuleLauncher.astro';
import SignalGraph from '../components/SignalGraph.astro';
import CommandPalette from '../components/CommandPalette.astro';
import NowDashboard from '../components/NowDashboard.astro';
import LifePostcards from '../components/LifePostcards.astro';
import FeaturedProject from '../components/FeaturedProject.astro';
import { publishedNewestFirst } from '../lib/content';
import { selectFeaturedProject, selectLifePostcards } from '../lib/home';

const posts = publishedNewestFirst(await getCollection('posts')).slice(0, 1);
const notes = publishedNewestFirst(await getCollection('notes')).slice(0, 1);
const allLife = await getCollection('life');
const allLab = await getCollection('lab');
const life = selectLifePostcards(allLife);
const featuredProject = selectFeaturedProject(allLab);
const [nowEntry] = await getCollection('now');
const latest = [...posts, ...notes, ...life.slice(0, 1), ...(featuredProject ? [featuredProject] : [])];
---
```

- [ ] **Step 4: Compose the modules**

Keep the existing hero and latest-updates section. Replace the existing `.module-grid` block with:

```astro
{nowEntry ? (
  <NowDashboard {...nowEntry.data} />
) : (
  <section class="ink-panel now-empty mono">Status update in progress / 近况整理中</section>
)}

<LifePostcards entries={life} />
<FeaturedProject project={featuredProject} />

<div class="module-grid">
  <ModuleLauncher />
  <SignalGraph />
</div>
```

Add:

```css
.now-empty {
  color: var(--muted);
  margin-top: 16px;
  padding: 22px;
}
```

Delete `src/components/LifeStrip.astro` and `src/components/LabTile.astro`.

- [ ] **Step 5: Verify and commit**

Run: `npm test -- tests/personal-signal-atlas.test.ts && npm run build`

Expected: contract tests PASS; Astro builds 14 routes with zero errors and warnings; Pagefind completes.

```bash
git add src/pages/index.astro src/components/LifeStrip.astro src/components/LabTile.astro tests/personal-signal-atlas.test.ts
git commit -m "feat: compose personal signal atlas homepage"
```

### Task 7: Run Full Regression And Browser Acceptance

**Files:**
- Modify only if verification exposes a scoped defect.

- [ ] **Step 1: Run the complete automated suite**

Run: `npm test`

Expected: all Vitest files PASS.

- [ ] **Step 2: Run the production build**

Run: `npm run build`

Expected: Astro check reports zero errors, warnings, and hints; static routes and Pagefind index are generated.

- [ ] **Step 3: Start the local server**

Run: `npm run dev -- --host 127.0.0.1`

Expected: Astro serves `http://127.0.0.1:4321/`.

- [ ] **Step 4: Verify desktop behavior in the in-app browser**

Check at 1280x720:

- homepage has exactly one H1;
- Now, Life Postcards, and Featured Project headings are present;
- Paper and Terminal toggles update `data-theme`, labels, and colors;
- refreshing preserves the selected theme;
- `/now`, a Life detail link, and the featured project action resolve without 404;
- no console errors and no horizontal overflow.

- [ ] **Step 5: Verify mobile behavior**

Set viewport to 390x844 and check both themes:

- navigation and theme control remain visible;
- Now rows stack cleanly;
- Life postcards have stable 4:3 media areas;
- Featured Project stacks text above media;
- no element extends beyond the viewport.

Reset the viewport after verification.

- [ ] **Step 6: Final commit if verification required fixes**

If no fixes were required, do not create an empty commit. If scoped fixes were required:

```bash
git add <only-the-files-fixed-during-verification>
git commit -m "fix: polish personal signal atlas acceptance issues"
```

- [ ] **Step 7: Push the completed branch**

Run: `git push`

Expected: `main` is pushed to `origin/main`; Vercel starts the production deployment.
