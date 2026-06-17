import { describe, expect, it } from 'vitest';
import { mediaUrl } from '../src/lib/media';

describe('mediaUrl', () => {
  it('keeps absolute URLs unchanged', () => {
    expect(mediaUrl('https://cdn.example.com/a.jpg')).toBe('https://cdn.example.com/a.jpg');
  });

  it('joins relative media paths to the configured base URL', () => {
    expect(mediaUrl('/covers/a.jpg', 'https://media.example.com')).toBe('https://media.example.com/covers/a.jpg');
  });
});
