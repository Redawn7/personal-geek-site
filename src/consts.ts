export const SITE = {
  title: 'Lux Personal OS',
  description: 'A personal operating system for writing, life, notes, and experiments.',
  author: 'Luxuan Chen',
  url: import.meta.env.PUBLIC_SITE_URL ?? 'https://example.com'
};

export const NAV_ITEMS = [
  { href: '/', label: 'OS' },
  { href: '/blog', label: 'Blog' },
  { href: '/life', label: 'Life' },
  { href: '/notes', label: 'Notes' },
  { href: '/lab', label: 'Lab' },
  { href: '/archive', label: 'Archive' },
  { href: '/about', label: 'About' }
];
