# PLAN — Ahorra Sin Líos Landing Page con Astro 7

## Resumen

Landing page estática para Ahorra Sin Líos, construida con Astro 7 y CSS vanilla. La base visual y estructural sigue el patrón de NovaluxLanding: tokens globales, componentes `.astro`, estilos scoped por sección y scripts pequeños solo donde aportan interacción.

## Paleta base

Definida en `src/styles/global.css`:

```css
:root {
  --color-night: #15171B;
  --color-green: #79B82A;
  --color-gold: #E7B82E;
  --color-cream: #FFF8DC;
  --color-bg: #F7F7F4;
}
```

## Estructura

```text
src/
├── components/
├── layouts/
├── pages/
└── styles/
```

## Criterios

- Sin Tailwind en runtime.
- Manrope y Material Symbols cargados desde `BaseLayout.astro`.
- `global.css` para reset, tokens, tipografías, utilidades, botones y reveal.
- CSS de cada sección dentro del propio componente.
- `src/pages/index.astro` solo compone secciones.
