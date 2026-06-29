# AhorraLanding

Landing page moderna y responsive para Ahorra Sin Líos, desarrollada con Astro 7 y CSS vanilla. El sitio está enfocado en captar leads de usuarios interesados en ahorrar en sus facturas de luz, gas, internet y móvil mediante una experiencia clara, cercana y optimizada.

## Estructura

```text
src/
├── components/
│   ├── Header.astro
│   ├── Hero.astro
│   ├── Comparison.astro
│   ├── Savings.astro
│   ├── Services.astro
│   ├── HowItWorks.astro
│   ├── Testimonials.astro
│   ├── ContactForm.astro
│   ├── Footer.astro
│   └── LegalCard.astro
├── layouts/
│   ├── BaseLayout.astro
│   └── LegalLayout.astro
├── pages/
│   ├── index.astro
│   ├── privacidad.astro
│   └── aviso-legal.astro
└── styles/
    └── global.css
```

## Comandos

| Comando | Acción |
|---|---|
| `pnpm install` | Instala dependencias |
| `pnpm dev` | Inicia servidor local |
| `pnpm build` | Genera producción en `dist/` |
| `pnpm preview` | Previsualiza el build |

## Diseño

Los tokens principales viven en `src/styles/global.css`. La paleta base viene de `codigo_ejemplo.html` y la estructura replica el patrón de Novalux: componentes Astro, CSS scoped por componente, utilidades globales pequeñas y animaciones reutilizables con `data-reveal`.
