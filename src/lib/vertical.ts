/** Vertical de negocio de la landing (energía o telecomunicaciones). */
export type Vertical = 'energy' | 'telecom';

/** Rutas URL de cada vertical en el sitio. */
export const verticalPaths: Record<Vertical, string> = {
  energy: '/luz-gas',
  telecom: '/movil-internet',
};

/** Etiquetas legibles para navegación y UI. */
export const verticalLabels: Record<Vertical, string> = {
  energy: 'Luz y gas',
  telecom: 'Móvil e internet',
};

/** Metadatos SEO específicos por vertical para `resolveSeo`. */
export const verticalMeta: Record<
  Vertical,
  { title: string; description: string; keywords: string }
> = {
  energy: {
    title: 'Ahorra Sin Líos — Luz y gas',
    description:
      'Comparamos tarifas de luz y gas por ti. Te explicamos las opciones en claro y gestionamos el cambio sin líos, sin coste y sin compromiso.',
    keywords:
      'ahorrar luz, comparar tarifas gas, cambiar compañía eléctrica, potencia contratada, factura luz barata, Ahorra Sin Líos',
  },
  telecom: {
    title: 'Ahorra Sin Líos — Móvil e internet',
    description:
      'Comparamos fibra, internet y móvil por ti. Planes ajustados a tu consumo real, sin servicios de más y sin compromiso.',
    keywords:
      'fibra barata, comparar tarifas móvil, internet hogar, ahorrar telecomunicaciones, cambiar operador, Ahorra Sin Líos',
  },
};
