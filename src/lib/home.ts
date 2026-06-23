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
