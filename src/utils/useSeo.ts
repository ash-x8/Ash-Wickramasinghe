import { useEffect } from 'react';

interface SeoOptions {
  title: string;
  description?: string;
  canonicalPath?: string;
  type?: 'website' | 'article';
}

const SITE_ORIGIN = 'https://ash-wickramasinghe.site';

export const useSeo = ({ title, description, canonicalPath = '/', type = 'website' }: SeoOptions) => {
  useEffect(() => {
    const fullTitle = title.includes('Ash Wickramasinghe')
      ? title
      : `${title} — Ash Wickramasinghe`;
    document.title = fullTitle;

    const cleanPath = canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`;
    const canonicalUrl = `${SITE_ORIGIN}${cleanPath === '/' ? '/' : cleanPath}`;

    const setMeta = (selector: string, attrName: 'name' | 'property', key: string, value: string) => {
      let el = document.querySelector<HTMLMetaElement>(selector);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attrName, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', value);
    };

    if (description) {
      setMeta('meta[name="description"]', 'name', 'description', description);
      setMeta('meta[property="og:description"]', 'property', 'og:description', description);
      setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    }

    setMeta('meta[property="og:title"]', 'property', 'og:title', fullTitle);
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', fullTitle);
    setMeta('meta[property="og:type"]', 'property', 'og:type', type);
    setMeta('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);

    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', canonicalUrl);
  }, [title, description, canonicalPath, type]);
};
