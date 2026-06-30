const RANGE_PATTERN = /^(\d+)-(\d+)(.*)$/;
const PREFIX_NUMBER_PATTERN = /^(\D*)(\d+)$/;
const PREFIX_NUMBER_SUFFIX_PATTERN = /^(\D*)(\d+)(.*)$/;
const RANGE_TICK_MS = 35;
const SINGLE_TICK_MS = 40;
const SINGLE_STEPS = 40;

function animateRange(element: HTMLElement, target: string): boolean {
  const rangeMatch = target.match(RANGE_PATTERN);

  if (!rangeMatch) {
    return false;
  }

  const maxA = Number(rangeMatch[1]);
  const maxB = Number(rangeMatch[2]);
  const suffix = rangeMatch[3];
  let currentA = 0;
  let currentB = 0;

  element.textContent = target.replace(/\d+/g, '0');

  const timer = window.setInterval(() => {
    currentA = Math.min(currentA + 1, maxA);
    currentB = Math.min(currentB + 1, maxB);
    element.textContent = `${currentA}-${currentB}${suffix}`;

    if (currentA >= maxA && currentB >= maxB) {
      window.clearInterval(timer);
    }
  }, RANGE_TICK_MS);

  return true;
}

function animateSingleValue(
  element: HTMLElement,
  prefix: string,
  max: number,
  suffix: string,
): void {
  const step = Math.max(1, Math.round(max / SINGLE_STEPS));
  let current = 0;

  element.textContent = `${prefix}0${suffix}`;

  const timer = window.setInterval(() => {
    current = Math.min(current + step, max);
    element.textContent = `${prefix}${current}${suffix}`;

    if (current >= max) {
      window.clearInterval(timer);
    }
  }, SINGLE_TICK_MS);
}

function animateCountElement(element: HTMLElement): void {
  const target = element.dataset.count ?? '';

  if (animateRange(element, target)) {
    return;
  }

  const withSuffix = target.match(PREFIX_NUMBER_SUFFIX_PATTERN);

  if (withSuffix) {
    animateSingleValue(element, withSuffix[1], Number(withSuffix[2]), withSuffix[3]);
    return;
  }

  const withoutSuffix = target.match(PREFIX_NUMBER_PATTERN);

  if (!withoutSuffix) {
    return;
  }

  animateSingleValue(element, withoutSuffix[1], Number(withoutSuffix[2]), '');
}

export function initHeroCounter(): void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  document.querySelectorAll<HTMLElement>('[data-count]').forEach((element) => {
    animateCountElement(element);
  });
}
