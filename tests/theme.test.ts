import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

const projectFile = (path: string) => new URL(`../${path}`, import.meta.url);

describe('theme switcher', () => {
  it('renders an accessible Paper and Terminal theme control', async () => {
    const layout = await readFile(projectFile('src/layouts/BaseLayout.astro'), 'utf8');

    expect(layout).toContain('data-theme-toggle');
    expect(layout).toContain('aria-label="Switch color theme"');
    expect(layout).toContain('Paper');
    expect(layout).toContain('Terminal');
  });

  it('remembers the selected theme and defines a terminal palette', async () => {
    const [layout, styles] = await Promise.all([
      readFile(projectFile('src/layouts/BaseLayout.astro'), 'utf8'),
      readFile(projectFile('src/styles/global.css'), 'utf8')
    ]);

    expect(layout).toContain("localStorage.getItem('lux-theme')");
    expect(layout).toContain("localStorage.setItem('lux-theme'");
    expect(styles).toContain('html[data-theme="terminal"]');
    expect(styles).toContain('color-scheme: dark');
  });
});
