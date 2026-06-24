# Personal Content Seed Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Populate the personal site with believable bilingual drafts about Melbourne, Tokyo, skiing, Shanghai food, and recent reading.

**Architecture:** Add only Astro content collection files and one filesystem-level contract test. Existing collection schemas, routes, selectors, and components remain unchanged; Astro validates frontmatter during the production build.

**Tech Stack:** Astro 5 content collections, Markdown/MDX, Vitest 4, TypeScript.

---

## File Map

- Create four posts in `src/content/posts/`, one topic per file.
- Create one reading note in `src/content/notes/`.
- Create seven short entries in `src/content/life/`.
- Modify `src/content/now/index.mdx` to reflect the new stories.
- Create `tests/content-seed.test.ts` to lock titles, counts, publication state, and privacy constraints.

### Task 1: Add the content contract test

**Files:**
- Create: `tests/content-seed.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = join(process.cwd(), 'src/content');
const read = (collection: string, file: string) =>
  readFileSync(join(root, collection, file), 'utf8');

const expectedPosts = [
  '2026-06-20-melbourne-study-life.mdx',
  '2026-06-19-tokyo-in-small-details.mdx',
  '2026-06-18-first-honest-day-on-snow.mdx',
  '2026-06-17-eating-through-shanghai.mdx'
];

const expectedLife = [
  '2026-06-23-melbourne-tram-window.md',
  '2026-06-22-cooking-after-class.md',
  '2026-06-21-tokyo-first-train.md',
  '2026-06-20-tokyo-side-street.md',
  '2026-06-19-before-the-slope.md',
  '2026-06-18-shanghai-breakfast.md',
  '2026-06-17-late-night-noodles.md'
];

describe('personal content seed', () => {
  it('contains the approved published stories', () => {
    for (const file of expectedPosts) {
      const source = read('posts', file);
      expect(source).toContain('draft: false');
      expect(source).toMatch(/[\u4e00-\u9fff]/u);
    }

    const note = read('notes', '2026-06-23-reading-slowly-again.md');
    expect(note).toContain('title: "Reading Slowly Again"');
    expect(note).toContain('draft: false');
  });

  it('contains seven approved life postcards without coordinates', () => {
    const files = readdirSync(join(root, 'life'));
    for (const file of expectedLife) {
      expect(files).toContain(file);
      const source = read('life', file);
      expect(source).toContain('draft: false');
      expect(source).not.toMatch(/^coordinates:/m);
      expect(source).toMatch(/[\u4e00-\u9fff]/u);
    }
  });

  it('updates the Now signals', () => {
    const source = read('now', 'index.mdx');
    expect(source).toContain('Filling my Personal Signal Atlas with real stories');
    expect(source).toContain('Reading slowly and keeping fewer, better notes');
    expect(source).toContain('How places become memories through small repeated details');
  });
});
```

- [ ] **Step 2: Run the test and confirm RED**

Run: `npm test -- tests/content-seed.test.ts`

Expected: FAIL because the new content files do not exist.

- [ ] **Step 3: Commit the failing contract**

```bash
git add tests/content-seed.test.ts
git commit -m "test: define personal content seed"
```

### Task 2: Write the four life essays

**Files:**
- Create: `src/content/posts/2026-06-20-melbourne-study-life.mdx`
- Create: `src/content/posts/2026-06-19-tokyo-in-small-details.mdx`
- Create: `src/content/posts/2026-06-18-first-honest-day-on-snow.mdx`
- Create: `src/content/posts/2026-06-17-eating-through-shanghai.mdx`

- [ ] **Step 1: Create the Melbourne essay**

Use title `Learning to Live in Melbourne`, category `life`, tags `melbourne`, `study-abroad`, and `growing-up`. Describe tram-window mornings, changing weather, cooking after class, learning independence, and the point when an unfamiliar city starts feeling ordinary. End with a short Chinese paragraph explaining that studying abroad is not a constant adventure but learning to take care of ordinary days. Do not name a school or address.

- [ ] **Step 2: Create the Tokyo essay**

Use title `Tokyo in Small Details`, category `travel`, tags `tokyo`, `travel`, and `observation`. Structure the body under `## The city starts on the train`, `## Walking without a plan`, and `## What stayed with me`. Mention early trains, convenience stores, quiet side streets, clear signs, and noticing how a large city can still feel careful. Add a Chinese closing about remembering rhythms rather than landmarks.

- [ ] **Step 3: Create the skiing essay**

Use title `My First Honest Day on Snow`, category `life`, tags `skiing`, `learning`, and `winter`. Structure the body under `## Falling is part of the lesson`, `## One clean turn`, and `## What the mountain taught me`. Keep the narrator modest: fear, repeated falls, learning balance, and enjoying one controlled turn. Add a Chinese paragraph about progress being less dramatic than expected.

- [ ] **Step 4: Create the Shanghai food essay**

Use title `Eating My Way Through Shanghai`, category `city`, tags `shanghai`, `food`, and `daily-life`. Structure the body under `## Breakfast is a city clock`, `## A bowl after dark`, and `## Food as a map`. Discuss warm breakfast, noodles, small local shops, and how repeated meals make a city personal. Do not invent restaurant names, rankings, or prices. Add a Chinese closing about taste carrying memory.

- [ ] **Step 5: Run the focused test**

Run: `npm test -- tests/content-seed.test.ts`

Expected: still FAIL because the reading note, Life entries, and Now update are not complete; no post assertion should fail.

- [ ] **Step 6: Commit the essays**

```bash
git add src/content/posts/2026-06-20-melbourne-study-life.mdx src/content/posts/2026-06-19-tokyo-in-small-details.mdx src/content/posts/2026-06-18-first-honest-day-on-snow.mdx src/content/posts/2026-06-17-eating-through-shanghai.mdx
git commit -m "content: add travel and city essays"
```

### Task 3: Add the reading note and Life Postcards

**Files:**
- Create: `src/content/notes/2026-06-23-reading-slowly-again.md`
- Create: `src/content/life/2026-06-23-melbourne-tram-window.md`
- Create: `src/content/life/2026-06-22-cooking-after-class.md`
- Create: `src/content/life/2026-06-21-tokyo-first-train.md`
- Create: `src/content/life/2026-06-20-tokyo-side-street.md`
- Create: `src/content/life/2026-06-19-before-the-slope.md`
- Create: `src/content/life/2026-06-18-shanghai-breakfast.md`
- Create: `src/content/life/2026-06-17-late-night-noodles.md`

- [ ] **Step 1: Write the reading note**

Use title `Reading Slowly Again`, status `growing`, and tags `reading`, `notes`, `attention`. Explain three habits: highlighting less, keeping one idea after each reading session, and testing ideas in daily life. Include the Chinese sentence `读完一本书不是终点，真正重要的是它有没有改变第二天的一个小选择。` Do not claim a specific book was read.

- [ ] **Step 2: Write the two Melbourne postcards**

Create `A Morning Through the Tram Window` with location `Melbourne`, weather `cool and bright`, mood `awake`, and a short reflection on seeing the city wake up through glass.

Create `Dinner After Class` with location `Melbourne`, weather `windy`, mood `settled`, and a short reflection on cooking a simple meal and feeling capable. Each body ends with one natural Chinese sentence.

- [ ] **Step 3: Write the two Tokyo postcards**

Create `Before Tokyo Gets Loud` with location `Tokyo`, weather `clear`, mood `quiet`, describing an early station before the crowds.

Create `One More Side Street` with location `Tokyo`, weather `warm night`, mood `curious`, describing walking one block beyond the planned route. Each body ends with one natural Chinese sentence.

- [ ] **Step 4: Write the skiing postcard**

Create `Before the First Turn` with location `Snowfield`, weather `cold and clear`, mood `nervous`, describing the pause before pushing away and deciding to try once more. Use broad location only.

- [ ] **Step 5: Write the two Shanghai food postcards**

Create `Shanghai Breakfast Steam` with location `Shanghai`, weather `soft morning`, mood `hungry`, describing a warm breakfast and the street waking up.

Create `A Bowl After Dark` with location `Shanghai`, weather `late and humid`, mood `content`, describing noodles after a long day. Do not name shops or addresses.

- [ ] **Step 6: Run the focused test**

Run: `npm test -- tests/content-seed.test.ts`

Expected: only the Now assertion remains failing.

- [ ] **Step 7: Commit notes and postcards**

```bash
git add src/content/notes/2026-06-23-reading-slowly-again.md src/content/life
git commit -m "content: add reading and life signals"
```

### Task 4: Refresh Now and verify the whole site

**Files:**
- Modify: `src/content/now/index.mdx`

- [ ] **Step 1: Update the Now frontmatter**

Set:

```yaml
updated: 2026-06-24
making: "Filling my Personal Signal Atlas with real stories"
reading: "Reading slowly and keeping fewer, better notes"
thinking: "How places become memories through small repeated details"
```

Replace the body with a short bilingual paragraph explaining that the site is moving from an empty framework toward a collection of ordinary moments worth remembering.

- [ ] **Step 2: Run the content contract**

Run: `npm test -- tests/content-seed.test.ts`

Expected: 3 tests PASS.

- [ ] **Step 3: Run all tests**

Run: `npm test`

Expected: all test files PASS.

- [ ] **Step 4: Build the production site**

Run: `npm run build`

Expected: Astro check reports 0 errors and the static build plus Pagefind indexing complete successfully.

- [ ] **Step 5: Check formatting and scope**

Run: `git diff --check && git status --short`

Expected: no whitespace errors; only the planned Now change remains uncommitted.

- [ ] **Step 6: Commit the final update**

```bash
git add src/content/now/index.mdx
git commit -m "content: refresh current signals"
```

- [ ] **Step 7: Push the completed content seed**

Run: `git push origin main`

Expected: `main` is pushed successfully and Vercel starts a deployment.
