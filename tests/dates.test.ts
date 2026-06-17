import { describe, expect, it } from 'vitest';
import { formatDate, sortByDateDesc } from '../src/lib/dates';

describe('formatDate', () => {
  it('formats dates as yyyy-mm-dd', () => {
    expect(formatDate(new Date('2026-06-17T00:00:00Z'))).toBe('2026-06-17');
  });
});

describe('sortByDateDesc', () => {
  it('sorts newest first', () => {
    const entries = [
      { data: { date: new Date('2024-01-01') } },
      { data: { date: new Date('2026-01-01') } }
    ];

    expect(sortByDateDesc(entries)[0].data.date.getFullYear()).toBe(2026);
  });

  it('does not mutate the original array', () => {
    const entries = [
      { data: { date: new Date('2024-01-01') } },
      { data: { date: new Date('2026-01-01') } }
    ];
    const originalFirst = entries[0].data.date.getFullYear();
    sortByDateDesc(entries);
    expect(entries[0].data.date.getFullYear()).toBe(originalFirst);
  });
});
