import {
  buildLeadBody,
  calculatorToLeadFields,
  getSessionToken,
  saveCalculatorData,
  submitLandingLead,
  type BuildLeadBodyOptions,
  type CalculatorPayload,
  type CalculatorResult,
} from '../lib/landingLead';

type CalculatorViewName = 'intro' | 'wizard' | 'results';

type CalculatorViews = Record<CalculatorViewName, HTMLElement>;

type CalculatorLeadFields = Omit<
  BuildLeadBodyOptions,
  'source' | 'leadOrigin' | 'sessionToken' | 'calculatorData'
>;

export type CalculatorWizardConfig = {
  calculateResult: (data: Record<string, string>) => CalculatorResult;
  buildLeadOptions: (
    payload: CalculatorPayload,
    root: HTMLElement,
    fields: ReturnType<typeof calculatorToLeadFields>,
  ) => CalculatorLeadFields;
  requireContactFields?: boolean;
};

const RADIO_AUTO_ADVANCE_MS = 280;
const DEFAULT_SOURCE = 'ahorrasinlios';

function formatEuro(value: number): string {
  return (
    value.toLocaleString('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + '€'
  );
}

function getFormData(root: HTMLElement): Record<string, string> {
  const data: Record<string, string> = {};

  root.querySelectorAll<HTMLInputElement>('input[name]').forEach((input) => {
    if (input.type === 'radio' && !input.checked) {
      return;
    }

    if (input.type === 'checkbox') {
      data[input.name] = input.checked ? 'yes' : 'no';
      return;
    }

    data[input.name] = input.value.trim();
  });

  return data;
}

function validateStep(steps: HTMLElement[], index: number): boolean {
  const step = steps[index];
  const inputs = step.querySelectorAll<HTMLInputElement>('input[name]');

  for (const input of inputs) {
    if (input.type === 'radio') {
      const group = step.querySelector<HTMLInputElement>(
        `input[name="${input.name}"]:checked`,
      );

      if (!group) {
        return false;
      }

      continue;
    }

    if (input.type === 'checkbox') {
      if (input.name === 'privacy' && !input.checked) {
        return false;
      }

      continue;
    }

    if (!input.value.trim()) {
      return false;
    }
  }

  return true;
}

function updateResultUi(root: HTMLElement, result: CalculatorResult): void {
  const percentNode = root.querySelector('[data-calc-result-percent]');
  const savingsNode = root.querySelector('[data-calc-result-savings]');
  const currentNode = root.querySelector('[data-calc-result-current]');
  const newNode = root.querySelector('[data-calc-result-new]');

  if (percentNode) {
    percentNode.textContent = `${result.percent}%`;
  }

  if (savingsNode) {
    savingsNode.textContent =
      `${formatEuro(result.monthlySaving)}/mes · ${formatEuro(result.yearlySaving)}/año`;
  }

  if (currentNode) {
    currentNode.textContent = formatEuro(result.bill);
  }

  if (newNode) {
    newNode.textContent = formatEuro(result.newBill);
  }

  const cta = root.querySelector<HTMLAnchorElement>('[data-calc-result-cta]');

  if (!cta) {
    return;
  }

  const ctaMain = cta.querySelector('.calc-cta-main');
  const ctaSub = cta.querySelector('.calc-cta-sub');

  if (ctaMain) {
    ctaMain.textContent = `Quiero ahorrar ${formatEuro(result.monthlySaving)}/mes →`;
  }

  if (ctaSub) {
    ctaSub.textContent = 'Gratis · Sin compromiso · 5 minutos';
  }
}

async function submitCalculatorLead(
  root: HTMLElement,
  payload: CalculatorPayload,
  config: CalculatorWizardConfig,
): Promise<void> {
  const endpoint = root.dataset.endpoint;
  const apiKey = root.dataset.apiKey;
  const source = root.dataset.source || DEFAULT_SOURCE;

  if (!endpoint || !apiKey) {
    return;
  }

  try {
    const fields = calculatorToLeadFields(payload);
    const leadOptions = config.buildLeadOptions(payload, root, fields);

    if (config.requireContactFields && !leadOptions.fullName && !leadOptions.phone) {
      return;
    }

    const body = buildLeadBody({
      ...leadOptions,
      sessionToken: getSessionToken(),
      source,
      leadOrigin: 'calculator',
      calculatorData: payload,
    });

    await submitLandingLead(endpoint, apiKey, body);

    saveCalculatorData({
      ...payload,
      submittedToCrm: true,
      submittedAt: new Date().toISOString(),
    });
  } catch {
    // El usuario ve el resultado aunque falle el envío; contacto puede reenviar los datos.
  }
}

export function initCalculatorWizard(config: CalculatorWizardConfig): void {
  const root = document.querySelector<HTMLElement>('[data-calc-root]');

  if (!root) {
    return;
  }

  const views: CalculatorViews = {
    intro: root.querySelector<HTMLElement>('[data-calc-view="intro"]')!,
    wizard: root.querySelector<HTMLElement>('[data-calc-view="wizard"]')!,
    results: root.querySelector<HTMLElement>('[data-calc-view="results"]')!,
  };

  const steps = Array.from(root.querySelectorAll<HTMLElement>('[data-calc-step]'));
  const progressFill = root.querySelector<HTMLElement>('[data-calc-progress]')!;
  const backBtn = root.querySelector<HTMLButtonElement>('[data-calc-back]')!;
  const totalSteps = steps.length;
  let currentStep = 0;

  const showView = (name: CalculatorViewName): void => {
    Object.entries(views).forEach(([key, element]) => {
      element.hidden = key !== name;
    });
  };

  const showStep = (index: number): void => {
    currentStep = index;

    steps.forEach((step, stepIndex) => {
      step.hidden = stepIndex !== index;
    });

    progressFill.style.width = `${((index + 1) / totalSteps) * 100}%`;
    backBtn.hidden = index === 0;
  };

  const finishWizard = async (): Promise<void> => {
    if (!validateStep(steps, currentStep)) {
      return;
    }

    const data = getFormData(root);
    const result = config.calculateResult(data);
    const payload: CalculatorPayload = { answers: data, result };

    updateResultUi(root, result);
    saveCalculatorData(payload);
    showView('results');

    await submitCalculatorLead(root, payload, config);
  };

  const goNext = (): void => {
    if (!validateStep(steps, currentStep)) {
      return;
    }

    if (currentStep < totalSteps - 1) {
      showStep(currentStep + 1);
      return;
    }

    void finishWizard();
  };

  root.querySelector('[data-calc-start]')?.addEventListener('click', () => {
    showView('wizard');
    showStep(0);
  });

  root.querySelector('[data-calc-restart]')?.addEventListener('click', () => {
    root.querySelectorAll('input').forEach((input) => {
      if (input.type === 'radio' || input.type === 'checkbox') {
        input.checked = false;
        return;
      }

      input.value = '';
    });
    showView('intro');
  });

  backBtn.addEventListener('click', () => {
    if (currentStep > 0) {
      showStep(currentStep - 1);
    }
  });

  root.querySelectorAll('[data-calc-next]').forEach((button) => {
    button.addEventListener('click', goNext);
  });

  root.querySelector('[data-calc-finish]')?.addEventListener('click', () => {
    void finishWizard();
  });

  root.querySelectorAll('.calc-option input[type="radio"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      window.setTimeout(() => {
        if (currentStep < totalSteps - 1 && validateStep(steps, currentStep)) {
          showStep(currentStep + 1);
        }
      }, RADIO_AUTO_ADVANCE_MS);
    });
  });

  root.querySelectorAll('.calc-input').forEach((input) => {
    input.addEventListener('keydown', (event) => {
      if (event instanceof KeyboardEvent && event.key === 'Enter') {
        goNext();
      }
    });
  });
}
