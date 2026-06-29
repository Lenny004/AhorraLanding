export type Vertical = 'energy' | 'telecom';

export const verticalPaths: Record<Vertical, string> = {
  energy: '/luz-gas',
  telecom: '/movil-internet',
};

export const verticalLabels: Record<Vertical, string> = {
  energy: 'Luz y gas',
  telecom: 'Móvil e internet',
};

export const verticalMeta: Record<
  Vertical,
  { title: string; description: string }
> = {
  energy: {
    title: 'Ahorra Sin Líos - Luz y gas',
    description:
      'Comparamos tarifas de luz y gas por ti. Te explicamos las opciones en claro y gestionamos el cambio sin líos, sin coste y sin compromiso.',
  },
  telecom: {
    title: 'Ahorra Sin Líos - Móvil e internet',
    description:
      'Comparamos fibra, internet y móvil por ti. Planes ajustados a tu consumo real, sin servicios de más y sin compromiso.',
  },
};
