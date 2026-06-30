const DESKTOP_MEDIA_QUERY = '(min-width: 769px)';
const OPEN_CLASS = 'open';

/**
 * Inicializa el menú móvil del header: toggle, cierre al navegar y en desktop.
 *
 * Espera encontrar `[data-header]`, `[data-menu-toggle]`, `[data-mobile-menu]`
 * y `[data-menu-icon]` en el DOM.
 */
export function initSiteHeader(): void {
  const header = document.querySelector<HTMLElement>('[data-header]');
  const toggle = header?.querySelector<HTMLButtonElement>('[data-menu-toggle]');
  const menu = header?.querySelector<HTMLElement>('[data-mobile-menu]');
  const icon = header?.querySelector<HTMLElement>('[data-menu-icon]');

  if (!toggle || !menu || !icon) {
    return;
  }

  const setOpen = (open: boolean): void => {
    menu.classList.toggle(OPEN_CLASS, open);
    menu.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    icon.textContent = open ? 'close' : 'menu';
  };

  toggle.addEventListener('click', () => {
    setOpen(!menu.classList.contains(OPEN_CLASS));
  });

  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      setOpen(false);
    });
  });

  window.addEventListener('resize', () => {
    if (window.matchMedia(DESKTOP_MEDIA_QUERY).matches) {
      setOpen(false);
    }
  });
}
