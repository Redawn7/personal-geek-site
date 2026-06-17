import { SITE } from '../consts';

type SeoInput = {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
};

export function seo({
  title = SITE.title,
  description = SITE.description,
  path = '/',
  image
}: SeoInput = {}) {
  const canonical = new URL(path, SITE.url).toString();
  return {
    title: title === SITE.title ? title : `${title} | ${SITE.title}`,
    description,
    canonical,
    image
  };
}
