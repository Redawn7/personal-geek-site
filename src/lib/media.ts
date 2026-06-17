export function mediaUrl(path: string, baseUrl = import.meta.env.MEDIA_BASE_URL ?? ''): string {
  if (/^https?:\/\//.test(path)) {
    return path;
  }

  const cleanBase = baseUrl.replace(/\/$/, '');
  const cleanPath = path.replace(/^\//, '');

  if (!cleanBase) {
    return `/${cleanPath}`;
  }

  return `${cleanBase}/${cleanPath}`;
}
