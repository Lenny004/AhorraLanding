/** Metadatos globales del sitio para SEO y Open Graph. */
export const site = {
  name: 'Ahorra Sin Líos',
  defaultTitle: 'Ahorra Sin Líos — Ahorra en tus facturas',
  defaultDescription:
    'Comparamos luz, gas, internet y móvil por ti para ayudarte a ahorrar sin líos, ' +
    'sin coste y sin compromiso.',
  defaultKeywords:
    'Ahorra Sin Líos, ahorrar luz, comparar tarifas gas, fibra barata, móvil ahorro, ' +
    'comparador facturas, cambiar compañía luz',
  locale: 'es_ES',
  ogImage: '/logo.png',
  twitterCard: 'summary_large_image' as const,
};

/** Créditos del desarrollador en el código fuente. */
export const developer = {
  name: 'Lenny Sánchez',
  url: 'https://lennyx004.com',
  comment: 'Sitio web desarrollado por Lenny Sánchez — https://lennyx004.com',
};

/** Propiedades SEO opcionales que puede sobrescribir cada página. */
export type SeoProps = {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  noindex?: boolean;
};

/** Metadatos SEO ya resueltos con valores por defecto y URLs absolutas. */
export type ResolvedSeo = {
  title: string;
  description: string;
  keywords: string;
  canonicalUrl: string;
  ogImageUrl: string;
  ogType: 'website' | 'article';
  robots: string;
};

/**
 * Combina props de página con valores por defecto del sitio y genera URLs canónicas.
 *
 * @param props - Overrides opcionales de título, descripción, etc.
 * @param pathname - Ruta relativa de la página actual.
 * @param origin - Origen absoluto del sitio (protocolo + host).
 * @returns Objeto con todos los metadatos listos para el layout.
 */
export function resolveSeo(
  props: SeoProps,
  pathname: string,
  origin: string,
): ResolvedSeo {
  const title = props.title ?? site.defaultTitle;
  const description = props.description ?? site.defaultDescription;
  const keywords = props.keywords ?? site.defaultKeywords;
  const ogImage = props.ogImage ?? site.ogImage;
  const canonicalUrl = new URL(pathname, origin).href;
  const ogImageUrl = new URL(ogImage, origin).href;

  return {
    title,
    description,
    keywords,
    canonicalUrl,
    ogImageUrl,
    ogType: props.ogType ?? 'website',
    robots: props.noindex ? 'noindex, nofollow' : 'index, follow',
  };
}
