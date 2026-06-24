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
