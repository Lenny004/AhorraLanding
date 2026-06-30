import {
  buildLeadBody,
  calculatorToLeadFields,
  clearCalculatorData,
  createCalculatorSession,
  getCalculatorData,
  getSessionToken,
  setSessionTokenOverride,
  submitLandingLead,
  type BuildLeadBodyOptions,
  type CalculatorPayload,
} from '../lib/landingLead';

type StatusType = 'error' | 'success';

const DEFAULT_SUBMIT_LABEL = 'Solicitar revisión';
const DEFAULT_SOURCE = 'ahorrasinlios';
const CALC_SESSION_ENDPOINT = 'api_calculator_session.php';
const LEADS_ENDPOINT = 'api_landing_leads.php';

function getInvoiceFile(formData: FormData): File | undefined {
  const invoice = formData.get('invoice');

  if (invoice instanceof File && invoice.size > 0) {
    return invoice;
  }

  return undefined;
}

function prefillFromCalculator(form: HTMLFormElement, calcData: CalculatorPayload): void {
  const calcBadge = form.querySelector('[data-calc-badge]');

  if (calcBadge instanceof HTMLElement) {
    calcBadge.hidden = false;
  }

  const fields = calculatorToLeadFields(calcData);
  const nameInput = form.querySelector<HTMLInputElement>('[name="name"]');
  const phoneInput = form.querySelector<HTMLInputElement>('[name="phone"]');
  const consumptionInput = form.querySelector<HTMLInputElement>(
    '[name="approximate_consumption"]',
  );
  const luzCheck = form.querySelector<HTMLInputElement>('[name="service_luz"]');
  const gasCheck = form.querySelector<HTMLInputElement>('[name="service_gas"]');

  if (nameInput && fields.fullName && !nameInput.value) {
    nameInput.value = fields.fullName;
  }

  if (phoneInput && fields.phone && !phoneInput.value) {
    phoneInput.value = fields.phone;
  }

  if (consumptionInput && fields.approximateConsumption && !consumptionInput.value) {
    consumptionInput.value = fields.approximateConsumption;
  }

  if (luzCheck && fields.serviceLuz) {
    luzCheck.checked = true;
  }

  if (gasCheck && fields.serviceGas) {
    gasCheck.checked = true;
  }
}

async function resolveSessionToken(
  endpoint: string,
  apiKey: string,
  source: string,
  vertical: string,
  calculatorData: CalculatorPayload,
): Promise<string> {
  let sessionToken = calculatorData.sessionToken || getSessionToken();

  if (!calculatorData.sessionToken) {
    const calcSessionEndpoint = endpoint.replace(LEADS_ENDPOINT, CALC_SESSION_ENDPOINT);
    const sessionData = await createCalculatorSession(
      calcSessionEndpoint,
      apiKey,
      source,
      vertical,
      calculatorData.answers,
      calculatorData.result,
    );

    if (sessionData?.session_token) {
      sessionToken = sessionData.session_token;
      setSessionTokenOverride(sessionToken);
    }
  }

  return sessionToken;
}

export function initContactForm(): void {
  const form = document.querySelector('[data-contact-form]');

  if (!(form instanceof HTMLFormElement)) {
    return;
  }

  const status = form.querySelector('[data-form-status]');
  const success = form.parentElement?.querySelector('[data-contact-success]');
  const submit = form.querySelector('button[type="submit"]');
  const submitLabel =
    submit instanceof HTMLButtonElement ? submit.textContent : 'Enviar';
  const fileInput = form.querySelector('[data-contact-file]');
  const fileWrap = form.querySelector('[data-file-wrap]');
  const fileName = form.querySelector('[data-file-name]');
  const filePlaceholder =
    fileName instanceof HTMLElement ? fileName.textContent : 'o arrastra aquí';

  const calcData = getCalculatorData();

  if (calcData) {
    prefillFromCalculator(form, calcData);
  }

  const showSuccess = (): void => {
    form.classList.add('is-hidden');

    if (success instanceof HTMLElement) {
      success.hidden = false;
    }

    form.parentElement?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const syncFileField = (): void => {
    if (!(fileInput instanceof HTMLInputElement) || !(fileWrap instanceof HTMLElement)) {
      return;
    }

    const file = fileInput.files?.[0];
    fileWrap.classList.toggle('is-filled', Boolean(file));

    if (fileName instanceof HTMLElement) {
      fileName.textContent = file ? file.name : filePlaceholder;
    }
  };

  if (fileInput instanceof HTMLInputElement && fileWrap instanceof HTMLElement) {
    fileInput.addEventListener('change', syncFileField);

    ['dragenter', 'dragover'].forEach((eventName) => {
      fileWrap.addEventListener(eventName, (event) => {
        event.preventDefault();
        fileWrap.classList.add('is-dragover');
      });
    });

    ['dragleave', 'drop'].forEach((eventName) => {
      fileWrap.addEventListener(eventName, () => {
        fileWrap.classList.remove('is-dragover');
      });
    });

    fileWrap.addEventListener('drop', (event) => {
      event.preventDefault();
      const file = event.dataTransfer?.files?.[0];

      if (!file) {
        return;
      }

      const transfer = new DataTransfer();
      transfer.items.add(file);
      fileInput.files = transfer.files;
      syncFileField();
    });

    form.addEventListener('reset', () => {
      window.requestAnimationFrame(syncFileField);
    });
  }

  const setStatus = (message: string, type: StatusType): void => {
    if (!(status instanceof HTMLElement)) {
      return;
    }

    status.textContent = message;
    status.className = `label-s contact-status is-visible is-${type}`;
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const endpoint = form.dataset.endpoint;
    const apiKey = form.dataset.apiKey;
    const source = form.dataset.source || DEFAULT_SOURCE;

    if (!endpoint || !apiKey) {
      setStatus('El formulario no está configurado. Inténtalo más tarde.', 'error');
      return;
    }

    const formData = new FormData(form);
    const calculatorData = getCalculatorData();
    const calcFields = calculatorData ? calculatorToLeadFields(calculatorData) : null;
    const consumption = String(formData.get('approximate_consumption') ?? '').trim();
    const vertical = form.dataset.vertical || 'energy';

    const sessionToken = calculatorData
      ? await resolveSessionToken(endpoint, apiKey, source, vertical, calculatorData)
      : getSessionToken();

    const leadOptions: BuildLeadBodyOptions = {
      source,
      leadOrigin: calculatorData ? 'both' : 'contact',
      fullName: String(formData.get('name') ?? '').trim(),
      phone: String(formData.get('phone') ?? '').trim(),
      email: String(formData.get('email') ?? '').trim(),
      clientType: String(formData.get('client_type') ?? '').trim(),
      approximateConsumption: consumption || calcFields?.approximateConsumption,
      serviceLuz: Boolean(formData.get('service_luz')) || Boolean(calcFields?.serviceLuz),
      serviceGas: Boolean(formData.get('service_gas')) || Boolean(calcFields?.serviceGas),
      serviceInternet: Boolean(formData.get('service_internet')),
      serviceMovil: Boolean(formData.get('service_movil')),
      vertical,
      sourcePage: form.dataset.sourcePage,
      postalCode: calcFields?.postalCode,
      monthlyBill: calcFields?.monthlyBill,
      savingsPercent: calcFields?.savingsPercent,
      monthlySaving: calcFields?.monthlySaving,
      calculatorData,
      sessionToken,
      invoice: getInvoiceFile(formData),
    };

    const body = buildLeadBody(leadOptions);

    if (submit instanceof HTMLButtonElement) {
      submit.disabled = true;
      submit.textContent = 'Enviando...';
    }

    try {
      await submitLandingLead(endpoint, apiKey, body);
      form.reset();
      syncFileField();
      clearCalculatorData();
      showSuccess();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'No se pudo enviar el formulario';
      setStatus(message, 'error');
    } finally {
      if (submit instanceof HTMLButtonElement) {
        submit.disabled = false;
        submit.textContent = submitLabel ?? DEFAULT_SUBMIT_LABEL;
      }
    }
  });
}
