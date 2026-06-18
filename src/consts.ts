export const SITE = {
  title: 'Lux Personal OS',
  description: 'A simple personal site for writing, life, notes, and small projects. 记录生活，也记录想法。',
  author: 'Luxuan Chen',
  url: import.meta.env.PUBLIC_SITE_URL ?? 'https://example.com'
};

export const NAV_ITEMS = [
  { href: '/', label: 'OS' },
  { href: '/blog', label: 'Blog 写作' },
  { href: '/life', label: 'Life 生活' },
  { href: '/notes', label: 'Notes 笔记' },
  { href: '/lab', label: 'Lab 实验' },
  { href: '/archive', label: 'Archive 归档' },
  { href: '/about', label: 'About 关于' }
];
