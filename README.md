# Ahorra Sin Líos — Landing

Landing page estática para **Ahorra Sin Líos**, enfocada en captar leads de usuarios que quieren ahorrar en luz, gas, internet y móvil. Construida con [Astro 7](https://docs.astro.build) y CSS vanilla, siguiendo el patrón arquitectónico de NovaluxLanding.

## Características

- Hub principal para elegir vertical (energía o telecomunicaciones)
- Landing dedicada de **luz y gas** (`/luz-gas`) y **móvil e internet** (`/movil-internet`)
- Calculadoras interactivas por vertical con envío de lead al CRM
- Formulario de contacto con subida de factura
- Metadatos SEO por página (Open Graph, Twitter Card, JSON-LD)
- Páginas legales (privacidad y aviso legal)
- Diseño responsive con animaciones `data-reveal` y soporte para `prefers-reduced-motion`

## Stack

| Tecnología | Uso |
|---|---|
| Astro 7 | Generación de sitio estático |
| CSS vanilla | Tokens en `global.css`, estilos scoped por componente |
| TypeScript | Lógica compartida en `src/lib/` |
| PTR-Sales API | Captación de leads (`api_landing_leads.php`) |

## Requisitos

- **Node.js** >= 22.12.0
- **pnpm** (recomendado) o npm

## Inicio rápido

```sh
# Clonar e instalar dependencias
pnpm install

# Configurar variables de entorno
cp .env.example .env

# Desarrollo (http://localhost:4321)
pnpm dev

# Build de producción
pnpm build

# Previsualizar el build
pnpm preview
```

### Servidor en segundo plano (Astro 7)

```sh
pnpm astro dev --background   # Iniciar
pnpm astro dev status         # Estado
pnpm astro dev logs           # Logs
pnpm astro dev stop           # Detener
```

## Variables de entorno

Copia `.env.example` a `.env` y rellena los valores:

| Variable | Descripción |
|---|---|
| `PUBLIC_CRM_LANDING_LEADS_ENDPOINT` | URL del endpoint de leads del CRM (PTR-Sales) |
| `PUBLIC_AHORRA_LANDING_API_KEY` | API key para autenticar las peticiones de la landing |

> Las variables con prefijo `PUBLIC_` están disponibles en el cliente. No incluyas secretos que no deban exponerse en el navegador.

## Rutas

| Ruta | Descripción |
|---|---|
| `/` | Hub — elige entre luz/gas o móvil/internet |
| `/luz-gas` | Landing de energía (luz y gas) |
| `/movil-internet` | Landing de telecomunicaciones |
| `/privacidad` | Política de privacidad |
| `/aviso-legal` | Aviso legal |

## Estructura del proyecto

```text
src/
├── components/
│   ├── Brand.astro
│   ├── Header.astro         # Navegación con contexto por vertical
│   ├── Hero.astro           # Copy dinámico según vertical
│   ├── Comparison.astro
│   ├── Savings.astro
│   ├── Services.astro
│   ├── HowItWorks.astro
│   ├── Testimonials.astro
│   ├── Calculator.astro     # Calculadora luz/gas
│   ├── CalculatorTelecom.astro
│   ├── ContactForm.astro
│   ├── Footer.astro
│   └── LegalCard.astro
├── layouts/
│   ├── BaseLayout.astro     # `<head>`, SEO, fuentes y scripts globales
│   └── LegalLayout.astro
├── lib/
│   ├── seo.ts               # Metadatos, Open Graph y datos del desarrollador
│   ├── vertical.ts          # Rutas, labels y SEO por vertical
│   └── landingLead.ts       # Helpers para envío de leads al CRM
├── pages/
│   ├── index.astro          # Hub
│   ├── luz-gas.astro
│   ├── movil-internet.astro
│   ├── privacidad.astro
│   └── aviso-legal.astro
└── styles/
    └── global.css           # Reset, tokens, tipografía y utilidades
public/                      # Assets estáticos (logo, imágenes)
```

## Convenciones de desarrollo

- Componentes Astro en `src/components/` con CSS scoped en el mismo archivo
- Tokens de diseño y utilidades globales en `src/styles/global.css`
- Interactividad solo donde aporta valor (menú móvil, calculadoras, formularios) mediante `<script>` vanilla
- No usar Tailwind salvo petición explícita
- Fuentes: Manrope y Material Symbols, cargadas desde `BaseLayout.astro`
- Verticales definidas en `src/lib/vertical.ts` (`energy` | `telecom`)

## SEO

Los metadatos se centralizan en `src/lib/seo.ts` y se inyectan desde `BaseLayout.astro`. Cada vertical tiene título, descripción y keywords propios en `vertical.ts`.

Incluye:

- `title`, `description`, `keywords`, `canonical`, `robots`
- Open Graph y Twitter Card
- Schema.org (`Organization`) en JSON-LD
- Comentario HTML y meta `author` / `developer` con atribución del desarrollador

Ejemplo para una página nueva:

```astro
<BaseLayout
  title="Ahorra Sin Líos — Mi página"
  description="Descripción para buscadores"
  keywords="ahorrar, luz, gas"
/>
```

## Integración con el CRM

Los formularios y calculadoras envían leads al endpoint configurado en `PUBLIC_CRM_LANDING_LEADS_ENDPOINT` con cabecera `X-API-Key`. El `source` de esta landing es `ahorrasinlios`.

La lógica compartida vive en `src/lib/landingLead.ts`. Los componentes `ContactForm.astro`, `Calculator.astro` y `CalculatorTelecom.astro` consumen las variables de entorno en build time.

## Despliegue

El comando `pnpm build` genera el sitio estático en `dist/`. Puede desplegarse en cualquier hosting de archivos estáticos (Netlify, Vercel, Cloudflare Pages, Apache, Nginx, etc.).

Opcional: define `site` en `astro.config.mjs` para fijar URLs canónicas en producción:

```js
export default defineConfig({
  site: 'https://tudominio.com',
});
```

## Scripts disponibles

| Comando | Acción |
|---|---|
| `pnpm dev` | Servidor de desarrollo |
| `pnpm build` | Build de producción en `dist/` |
| `pnpm preview` | Previsualiza el build localmente |
| `pnpm astro` | CLI de Astro (`astro check`, `astro add`, etc.) |

## Créditos

Desarrollado por [Lenny Sánchez](https://lennyx004.com).
