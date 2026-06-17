import type { CollectionEntry } from 'astro:content';
import { sortByDateDesc } from './dates';

type Draftable = {
  data: {
    draft?: boolean;
  };
};

type Dated = {
  data: {
    date: Date;
  };
};

export function isPublished<T extends Draftable>(entry: T): boolean {
  return entry.data.draft !== true;
}

export function normalizeTag(tag: string): string {
  return tag.trim().toLowerCase().replace(/\s+/g, '-');
}

export function publishedNewestFirst<T extends Draftable & Dated>(entries: T[]): T[] {
  return sortByDateDesc(entries.filter(isPublished));
}

export type SiteEntry =
  | CollectionEntry<'posts'>
  | CollectionEntry<'notes'>
  | CollectionEntry<'life'>
  | CollectionEntry<'lab'>
  | CollectionEntry<'books'>;
