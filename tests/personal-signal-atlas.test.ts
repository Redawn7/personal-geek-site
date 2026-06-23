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

  it('keeps Life postcards private by design and supports photo fallback', async () => {
    const source = await readRequiredSource('src/components/LifePostcards.astro');

    expect(source).toContain('entry.data.photos[0]');
    expect(source).toContain('postcard-fallback');
    expect(source).toContain('alt={entry.data.title}');
    expect(source).not.toContain('coordinates');
  });

  it('renders status, stack, media fallback, and one project action', async () => {
    const source = await readRequiredSource('src/components/FeaturedProject.astro');

    expect(source).toContain('project.data.status');
    expect(source).toContain('project.data.stack');
    expect(source).toContain('project-blueprint');
    expect(source).toContain('action.label');
  });

  it('composes real Now, Life, and Lab content on the homepage', async () => {
    const source = await readRequiredSource('src/pages/index.astro');

    expect(source).toContain("getCollection('now')");
    expect(source).toContain('<NowDashboard');
    expect(source).toContain('<LifePostcards');
    expect(source).toContain('<FeaturedProject');
    expect(source).not.toContain('LifeStrip');
    expect(source).not.toContain('LabTile');
  });
});
