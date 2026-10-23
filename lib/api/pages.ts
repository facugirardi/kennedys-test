import axios from 'axios';
import { API_BASE_URL } from '@/lib/api/fetcher';

/** Respuesta mínima de GET /page/key/:pageKey para el sitio público. */
export type PublicPageConfig = {
  id?: string;
  pageKey?: string;
  heroBannerPath?: string | null;
  heroBannerPosition?: string | null;
  heroTitle?: string | null;
  heroSubtitle?: string | null;
  richContent?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaImageUrl?: string | null;
};

export async function fetchPageByKeyServer(pageKey: string): Promise<PublicPageConfig | null> {
  const key = encodeURIComponent(pageKey);
  try {
    const { data } = await axios.get<{ success?: boolean; data?: Record<string, unknown> }>(
      `${API_BASE_URL}/page/key/${key}`,
      { timeout: 12000 }
    );
    if (!data?.success || !data?.data) return null;
    const row = data.data;
    const heroRaw = row.heroBannerPath ?? row.hero_banner_path;
    let heroBannerPath: string | null | undefined;
    if (heroRaw === null) {
      heroBannerPath = null;
    } else if (heroRaw === undefined) {
      heroBannerPath = undefined;
    } else if (typeof heroRaw === 'string') {
      const t = heroRaw.trim();
      heroBannerPath = t === '' ? null : t;
    } else {
      heroBannerPath = undefined;
    }
    const posRaw = row.heroBannerPosition ?? row.hero_banner_position;
    const heroBannerPosition =
      typeof posRaw === 'string' && posRaw.trim() ? posRaw.trim() : null;
    const htRaw = row.heroTitle ?? row.hero_title;
    const heroTitle = typeof htRaw === 'string' && htRaw.trim() ? htRaw.trim() : null;
    const hsRaw = row.heroSubtitle ?? row.hero_subtitle;
    const heroSubtitle = typeof hsRaw === 'string' && hsRaw.trim() ? hsRaw.trim() : null;
    const richRaw = row.richContent ?? row.rich_content;
    const richContent = typeof richRaw === 'string' && richRaw.trim() ? richRaw.trim() : null;
    const mtRaw = row.metaTitle ?? row.meta_title;
    const metaTitle = typeof mtRaw === 'string' && mtRaw.trim() ? mtRaw.trim() : null;
    const mdRaw = row.metaDescription ?? row.meta_description;
    const metaDescription = typeof mdRaw === 'string' && mdRaw.trim() ? mdRaw.trim() : null;
    const miRaw = row.metaImageUrl ?? row.meta_image_url;
    const miStr = typeof miRaw === 'string' && miRaw.trim() ? miRaw.trim() : null;
    const metaImageUrl = miStr
      ? (/^https?:\/\//i.test(miStr) ? miStr : `${API_BASE_URL.replace(/\/api$/, '')}/${miStr.replace(/^\//, '')}`)
      : null;
    return {
      id: typeof row.id === 'string' ? row.id : undefined,
      pageKey:
        typeof row.pageKey === 'string'
          ? row.pageKey
          : typeof row.page_key === 'string'
            ? row.page_key
            : undefined,
      heroBannerPath,
      heroBannerPosition,
      heroTitle,
      heroSubtitle,
      richContent,
      metaTitle,
      metaDescription,
      metaImageUrl,
    };
  } catch {
    return null;
  }
}
