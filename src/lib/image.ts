export function optimizeCover(url: string, width = 300): string {
  if (!url) return '';
  if (url.includes('.heic')) {
    return `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=${width}&output=webp&q=80`;
  }
  return url;
}

export function optimizeHero(url: string): string {
  if (!url) return '';
  if (url.includes('.heic')) {
    return `https://wsrv.nl/?url=${encodeURIComponent(url)}&output=webp&q=85`;
  }
  return url;
}
