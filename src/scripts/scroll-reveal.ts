const REVEAL_THRESHOLD = 0.12;
const REVEAL_ROOT_MARGIN = '0px 0px -6% 0px';
const VISIBLE_CLASS = 'is-visible';

/**
 * Revela secciones al entrar en el viewport usando IntersectionObserver.
 *
 * Si el usuario prefiere movimiento reducido, marca todos los elementos como visibles
 * de inmediato sin animación.
 */
export function initScrollReveal(): void {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealElements = document.querySelectorAll('[data-reveal]');

  if (prefersReduced) {
    revealElements.forEach((element) => {
      element.classList.add(VISIBLE_CLASS);
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add(VISIBLE_CLASS);
        observer.unobserve(entry.target);
      });
    },
    { threshold: REVEAL_THRESHOLD, rootMargin: REVEAL_ROOT_MARGIN },
  );

  revealElements.forEach((element) => {
    observer.observe(element);
  });
}
