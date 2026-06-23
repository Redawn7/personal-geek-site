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
