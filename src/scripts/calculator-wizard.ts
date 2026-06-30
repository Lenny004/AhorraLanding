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

const WIZARD_CHECKBOX_ANSWER = { YES: 'yes', NO: 'no' } as const;
const WIZARD_FIELD_NAMES = { PRIVACY: 'privacy' } as const;
const RADIO_AUTO_ADVANCE_MS = 280;
const DEFAULT_CALCULATOR_SOURCE = 'ahorrasinlios';
const RESULT_CTA_SUBTITLE = 'Gratis · Sin compromiso · 5 minutos';

export const ENERGY_SERVICE_TYPE = {
  LUZ: 'luz',
  LUZ_GAS: 'luz-gas',
} as const;

export const ENERGY_TARIFF_TYPE = {
  PVPC: 'pvpc',
  UNKNOWN: 'unknown',
  LIBRE: 'libre',
} as const;

export const ENERGY_KNOWLEDGE_ANSWER = { NO: 'no' } as const;

export const ENERGY_SAVINGS = {
  DEFAULT_MONTHLY_BILL_EUR: 80,
  MIN_MONTHLY_BILL_EUR: 1,
  BASE_PERCENT: 35,
  MAX_PERCENT: 44,
  PERCENT_DIVISOR: 100,
  MONTHS_PER_YEAR: 12,
  BONUS: {
    LUZ_GAS: 4,
    UNKNOWN_POWER: 4,
    UNKNOWN_KWH: 4,
    PVPC_TARIFF: 6,
    UNKNOWN_TARIFF: 8,
    LIBRE_TARIFF: 2,
  },
} as const;

export const TELECOM_PACKAGE_TYPE = { MOVIL_FIBRA: 'movil-fibra' } as const;

export const TELECOM_PROVIDER = {
  MOVISTAR: 'Movistar',
  VODAFONE: 'Vodafone',
  ORANGE: 'Orange',
} as const;

export const TELECOM_PERMANENCE_ANSWER = { NO: 'no' } as const;
export const TELECOM_DATA_USAGE = { LESS_THAN_10_GB: 'menos-de-10-gb' } as const;
export const TELECOM_CONNECTION_TYPE = { ADSL: 'adsl' } as const;

export const TELECOM_SAVINGS = {
  DEFAULT_MONTHLY_BILL_EUR: 50,
  MIN_MONTHLY_BILL_EUR: 1,
  BASE_PERCENT: 35,
  MAX_PERCENT: 44,
  PERCENT_DIVISOR: 100,
  MONTHS_PER_YEAR: 12,
  BONUS: {
    MOVIL_FIBRA: 10,
    PREMIUM_PROVIDER: 10,
    ORANGE_PROVIDER: 6,
    NO_PERMANENCE: 4,
    LOW_DATA_USAGE: 4,
    ADSL_CONNECTION: 8,
  },
} as const;

export const VERTICAL = { TELECOM: 'telecom' } as const;

type WizardViewName = 'intro' | 'wizard' | 'results';
type WizardViews = Record<WizardViewName, HTMLElement>;
export type WizardAnswers = Record<string, string>;

type CalculatorLeadFields = Omit<
  BuildLeadBodyOptions,
  'source' | 'leadOrigin' | 'sessionToken' | 'calculatorData'
>;

export type CalculatorWizardConfig = {
  calculateSavings: (answers: WizardAnswers) => CalculatorResult;
  buildLeadFields: (
    calculatorPayload: CalculatorPayload,
    wizardRoot: HTMLElement,
    leadFields: ReturnType<typeof calculatorToLeadFields>,
  ) => CalculatorLeadFields;
  requireContactFields?: boolean;
};

function formatEuroAmount(value: number): string {
  return (
    value.toLocaleString('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + '€'
  );
}

function getWizardViews(wizardRoot: HTMLElement): WizardViews {
  return {
    intro: wizardRoot.querySelector<HTMLElement>('[data-calc-view="intro"]')!,
    wizard: wizardRoot.querySelector<HTMLElement>('[data-calc-view="wizard"]')!,
    results: wizardRoot.querySelector<HTMLElement>('[data-calc-view="results"]')!,
  };
}

function collectWizardAnswers(wizardRoot: HTMLElement): WizardAnswers {
  const answers: WizardAnswers = {};

  wizardRoot.querySelectorAll<HTMLInputElement>('input[name]').forEach((input) => {
    if (input.type === 'radio' && !input.checked) {
      return;
    }

    if (input.type === 'checkbox') {
      answers[input.name] = input.checked
        ? WIZARD_CHECKBOX_ANSWER.YES
        : WIZARD_CHECKBOX_ANSWER.NO;
      return;
    }

    answers[input.name] = input.value.trim();
  });

  return answers;
}

function isWizardStepValid(steps: HTMLElement[], stepIndex: number): boolean {
  const stepElement = steps[stepIndex];
  const inputs = stepElement.querySelectorAll<HTMLInputElement>('input[name]');

  for (const input of inputs) {
    if (input.type === 'radio') {
      const selectedOption = stepElement.querySelector<HTMLInputElement>(
        `input[name="${input.name}"]:checked`,
      );

      if (!selectedOption) {
        return false;
      }

      continue;
    }

    if (input.type === 'checkbox') {
      if (input.name === WIZARD_FIELD_NAMES.PRIVACY && !input.checked) {
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

function updateCalculatorResultUi(
  wizardRoot: HTMLElement,
  savingsResult: CalculatorResult,
): void {
  const percentNode = wizardRoot.querySelector('[data-calc-result-percent]');
  const savingsNode = wizardRoot.querySelector('[data-calc-result-savings]');
  const currentBillNode = wizardRoot.querySelector('[data-calc-result-current]');
  const newBillNode = wizardRoot.querySelector('[data-calc-result-new]');

  if (percentNode) {
    percentNode.textContent = `${savingsResult.percent}%`;
  }

  if (savingsNode) {
    savingsNode.textContent =
      `${formatEuroAmount(savingsResult.monthlySaving)}/mes · ` +
      `${formatEuroAmount(savingsResult.yearlySaving)}/año`;
  }

  if (currentBillNode) {
    currentBillNode.textContent = formatEuroAmount(savingsResult.bill);
  }

  if (newBillNode) {
    newBillNode.textContent = formatEuroAmount(savingsResult.newBill);
  }

  const resultCta = wizardRoot.querySelector<HTMLAnchorElement>('[data-calc-result-cta]');

  if (!resultCta) {
    return;
  }

  const ctaMain = resultCta.querySelector('.calc-cta-main');
  const ctaSub = resultCta.querySelector('.calc-cta-sub');

  if (ctaMain) {
    ctaMain.textContent =
      `Quiero ahorrar ${formatEuroAmount(savingsResult.monthlySaving)}/mes →`;
  }

  if (ctaSub) {
    ctaSub.textContent = RESULT_CTA_SUBTITLE;
  }
}

async function submitCalculatorLeadToCrm(
  wizardRoot: HTMLElement,
  calculatorPayload: CalculatorPayload,
  config: CalculatorWizardConfig,
): Promise<void> {
  const endpoint = wizardRoot.dataset.endpoint;
  const apiKey = wizardRoot.dataset.apiKey;
  const leadSource = wizardRoot.dataset.source || DEFAULT_CALCULATOR_SOURCE;

  if (!endpoint || !apiKey) {
    return;
  }

  try {
    const leadFields = calculatorToLeadFields(calculatorPayload);
    const partialLeadOptions = config.buildLeadFields(
      calculatorPayload,
      wizardRoot,
      leadFields,
    );

    if (
      config.requireContactFields &&
      !partialLeadOptions.fullName &&
      !partialLeadOptions.phone
    ) {
      return;
    }

    const body = buildLeadBody({
      ...partialLeadOptions,
      sessionToken: getSessionToken(),
      source: leadSource,
      leadOrigin: 'calculator',
      calculatorData: calculatorPayload,
    });

    await submitLandingLead(endpoint, apiKey, body);

    saveCalculatorData({
      ...calculatorPayload,
      submittedToCrm: true,
      submittedAt: new Date().toISOString(),
    });
  } catch {
    // El usuario ve el resultado aunque falle el envío; contacto puede reenviar los datos.
  }
}

function bindWizardNavigation(
  wizardRoot: HTMLElement,
  steps: HTMLElement[],
  getCurrentStepIndex: () => number,
  showStep: (stepIndex: number) => void,
  goToNextStep: () => void,
): void {
  const backButton = wizardRoot.querySelector<HTMLButtonElement>('[data-calc-back]');

  backButton?.addEventListener('click', () => {
    const currentStepIndex = getCurrentStepIndex();

    if (currentStepIndex > 0) {
      showStep(currentStepIndex - 1);
    }
  });

  wizardRoot.querySelectorAll('[data-calc-next]').forEach((nextButton) => {
    nextButton.addEventListener('click', goToNextStep);
  });

  wizardRoot.querySelectorAll('.calc-option input[type="radio"]').forEach((radioInput) => {
    radioInput.addEventListener('change', () => {
      window.setTimeout(() => {
        const currentStepIndex = getCurrentStepIndex();

        if (
          currentStepIndex < steps.length - 1 &&
          isWizardStepValid(steps, currentStepIndex)
        ) {
          showStep(currentStepIndex + 1);
        }
      }, RADIO_AUTO_ADVANCE_MS);
    });
  });

  wizardRoot.querySelectorAll('.calc-input').forEach((textInput) => {
    textInput.addEventListener('keydown', (event) => {
      if (event instanceof KeyboardEvent && event.key === 'Enter') {
        goToNextStep();
      }
    });
  });
}

export function initCalculatorWizard(config: CalculatorWizardConfig): void {
  const wizardRoot = document.querySelector<HTMLElement>('[data-calc-root]');

  if (!wizardRoot) {
    return;
  }

  const views = getWizardViews(wizardRoot);
  const steps = Array.from(wizardRoot.querySelectorAll<HTMLElement>('[data-calc-step]'));
  const progressFill = wizardRoot.querySelector<HTMLElement>('[data-calc-progress]')!;
  const backButton = wizardRoot.querySelector<HTMLButtonElement>('[data-calc-back]')!;
  const totalSteps = steps.length;
  let currentStepIndex = 0;

  const showView = (viewName: WizardViewName): void => {
    Object.entries(views).forEach(([key, viewElement]) => {
      viewElement.hidden = key !== viewName;
    });
  };

  const showStep = (stepIndex: number): void => {
    currentStepIndex = stepIndex;

    steps.forEach((stepElement, index) => {
      stepElement.hidden = index !== stepIndex;
    });

    progressFill.style.width = `${((stepIndex + 1) / totalSteps) * 100}%`;
    backButton.hidden = stepIndex === 0;
  };

  const finishWizard = async (): Promise<void> => {
    if (!isWizardStepValid(steps, currentStepIndex)) {
      return;
    }

    const answers = collectWizardAnswers(wizardRoot);
    const savingsResult = config.calculateSavings(answers);
    const calculatorPayload: CalculatorPayload = { answers, result: savingsResult };

    updateCalculatorResultUi(wizardRoot, savingsResult);
    saveCalculatorData(calculatorPayload);
    showView('results');

    await submitCalculatorLeadToCrm(wizardRoot, calculatorPayload, config);
  };

  const goToNextStep = (): void => {
    if (!isWizardStepValid(steps, currentStepIndex)) {
      return;
    }

    if (currentStepIndex < totalSteps - 1) {
      showStep(currentStepIndex + 1);
      return;
    }

    void finishWizard();
  };

  wizardRoot.querySelector('[data-calc-start]')?.addEventListener('click', () => {
    showView('wizard');
    showStep(0);
  });

  wizardRoot.querySelector('[data-calc-restart]')?.addEventListener('click', () => {
    wizardRoot.querySelectorAll('input').forEach((input) => {
      if (input.type === 'radio' || input.type === 'checkbox') {
        input.checked = false;
        return;
      }

      input.value = '';
    });
    showView('intro');
  });

  wizardRoot.querySelector('[data-calc-finish]')?.addEventListener('click', () => {
    void finishWizard();
  });

  bindWizardNavigation(wizardRoot, steps, () => currentStepIndex, showStep, goToNextStep);
}
