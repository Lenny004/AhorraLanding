## Development

When starting the dev server, use background mode:

```sh
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Project Conventions

- Astro components live in `src/components/`.
- Shared tokens and utilities live in `src/styles/global.css`.
- Prefer CSS vanilla scoped in each `.astro` component.
- Do not add Tailwind unless explicitly requested.
