export const CALC_STORAGE_KEY = 'landing_calculator_data';
export const COOKIE_SESSION_KEY = '_calc_session';
export const COOKIE_DATA_KEY = '_calc_data';

export const CRM_RESPONSE_STATUS = {
  SUCCESS: 1,
} as const;

const SESSION_TOKEN_PATTERN = /^[a-f0-9]{64}$/;
const COOKIE_MAX_AGE_SECONDS = 3600;
const CALC_DATA_COOKIE_MAX_BYTES = 3000;

const CALCULATOR_SERVICE_TYPE = {
  LUZ: 'luz',
  LUZ_GAS: 'luz-gas',
} as const;

export type CalculatorResult = {
  percent: number;
  bill: number;
  newBill: number;
  monthlySaving: number;
  yearlySaving: number;
};

export type CalculatorPayload = {
  answers: Record<string, string>;
  result: CalculatorResult;
  sessionToken?: string;
  submittedToCrm?: boolean;
  submittedAt?: string;
};

export type LeadOrigin = 'calculator' | 'contact' | 'both';

export type BuildLeadBodyOptions = {
  source: string;
  leadOrigin: LeadOrigin;
  fullName: string;
  phone: string;
  email?: string;
  clientType?: string;
  approximateConsumption?: string;
  serviceLuz?: boolean;
  serviceGas?: boolean;
  serviceInternet?: boolean;
  serviceMovil?: boolean;
  vertical?: string;
  sourcePage?: string;
  postalCode?: string;
  monthlyBill?: number;
  savingsPercent?: number;
  monthlySaving?: number;
  calculatorData?: CalculatorPayload | null;
  invoice?: File;
  sessionToken?: string;
};

export type CreateCalculatorSessionOptions = {
  endpoint: string;
  apiKey: string;
  source: string;
  vertical: string;
  answers: Record<string, string>;
  result: CalculatorResult;
};

type CalculatorSessionResponse = {
  id_session: number;
  session_token: string;
};

type CalculatorLeadFields = {
  fullName: string;
  phone: string;
  postalCode: string;
  monthlyBill: number;
  savingsPercent: number;
  monthlySaving: number;
  approximateConsumption: string;
  serviceLuz: boolean;
  serviceGas: boolean;
};

function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string, maxAgeSeconds: number): void {
  document.cookie =
    `${name}=${encodeURIComponent(value)}; max-age=${maxAgeSeconds}; path=/; SameSite=Strict`;
}

function removeCookie(name: string): void {
  document.cookie = `${name}=; max-age=0; path=/; SameSite=Strict`;
}

export function getSessionToken(): string {
  const existing = getCookie(COOKIE_SESSION_KEY);

  if (existing && SESSION_TOKEN_PATTERN.test(existing)) {
    return existing;
  }

  const token = generateToken();
  setCookie(COOKIE_SESSION_KEY, token, COOKIE_MAX_AGE_SECONDS);
  return token;
}

export function setSessionTokenOverride(token: string): void {
  setCookie(COOKIE_SESSION_KEY, token, COOKIE_MAX_AGE_SECONDS);
}

export function saveCalculatorData(calculatorPayload: CalculatorPayload): void {
  sessionStorage.setItem(CALC_STORAGE_KEY, JSON.stringify(calculatorPayload));
  const serializedPayload = JSON.stringify(calculatorPayload);

  if (serializedPayload.length <= CALC_DATA_COOKIE_MAX_BYTES) {
    setCookie(COOKIE_DATA_KEY, serializedPayload, COOKIE_MAX_AGE_SECONDS);
  }
}

export function getCalculatorData(): CalculatorPayload | null {
  const sessionRaw = sessionStorage.getItem(CALC_STORAGE_KEY);

  if (sessionRaw) {
    try {
      return JSON.parse(sessionRaw) as CalculatorPayload;
    } catch {
      // Datos corruptos en sessionStorage; se intenta recuperar desde cookie.
    }
  }

  const cookieRaw = getCookie(COOKIE_DATA_KEY);

  if (!cookieRaw) {
    return null;
  }

  try {
    const calculatorPayload = JSON.parse(cookieRaw) as CalculatorPayload;
    sessionStorage.setItem(CALC_STORAGE_KEY, cookieRaw);
    return calculatorPayload;
  } catch {
    return null;
  }
}

export function clearCalculatorData(): void {
  sessionStorage.removeItem(CALC_STORAGE_KEY);
  removeCookie(COOKIE_DATA_KEY);
}

export async function createCalculatorSession(
  options: CreateCalculatorSessionOptions,
): Promise<CalculatorSessionResponse | null> {
  const { endpoint, apiKey, source, vertical, answers, result } = options;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      body: JSON.stringify({ source, vertical, answers, result }),
    });
    const responseBody: unknown = await response.json();

    if (
      response.ok &&
      typeof responseBody === 'object' &&
      responseBody !== null &&
      'estado' in responseBody &&
      (responseBody as Record<string, unknown>).estado === CRM_RESPONSE_STATUS.SUCCESS
    ) {
      const dataset = (responseBody as Record<string, unknown>).dataset;

      if (
        typeof dataset === 'object' &&
        dataset !== null &&
        'session_token' in dataset
      ) {
        return dataset as CalculatorSessionResponse;
      }
    }

    return null;
  } catch {
    return null;
  }
}

export function calculatorToLeadFields(
  calculatorPayload: CalculatorPayload,
): CalculatorLeadFields {
  const { answers, result } = calculatorPayload;
  const fullName = [answers.firstName, answers.lastName]
    .filter(Boolean)
    .join(' ')
    .trim();
  const serviceType = answers.serviceType ?? CALCULATOR_SERVICE_TYPE.LUZ;
  const approximateConsumption = answers.monthlyBill
    ? `${answers.monthlyBill}€/mes`
    : `${result.bill}€/mes`;

  return {
    fullName,
    phone: answers.phone ?? '',
    postalCode: answers.postalCode ?? '',
    monthlyBill: result.bill,
    savingsPercent: result.percent,
    monthlySaving: result.monthlySaving,
    approximateConsumption,
    serviceLuz:
      serviceType === CALCULATOR_SERVICE_TYPE.LUZ ||
      serviceType === CALCULATOR_SERVICE_TYPE.LUZ_GAS,
    serviceGas: serviceType === CALCULATOR_SERVICE_TYPE.LUZ_GAS,
  };
}

export function buildLeadBody(options: BuildLeadBodyOptions): FormData {
  const body = new FormData();

  body.set('source', options.source);
  body.set('full_name', options.fullName);
  body.set('phone', options.phone);
  body.set('lead_origin', options.leadOrigin);
  body.set('calculator_completed', options.calculatorData ? '1' : '0');

  if (options.sessionToken) {
    body.set('session_token', options.sessionToken);
  }

  if (options.email) {
    body.set('email', options.email);
  }

  if (options.clientType) {
    body.set('client_type', options.clientType);
  }

  if (options.approximateConsumption) {
    body.set('approximate_consumption', options.approximateConsumption);
  }

  if (options.serviceLuz) {
    body.set('service_luz', '1');
  }

  if (options.serviceGas) {
    body.set('service_gas', '1');
  }

  if (options.postalCode) {
    body.set('postal_code', options.postalCode);
  }

  if (options.monthlyBill != null) {
    body.set('monthly_bill', String(options.monthlyBill));
  }

  if (options.savingsPercent != null) {
    body.set('estimated_savings_percent', String(options.savingsPercent));
  }

  if (options.monthlySaving != null) {
    body.set('estimated_monthly_saving', options.monthlySaving.toFixed(2));
  }

  const extraFields: Record<string, unknown> = {};

  if (options.vertical) {
    extraFields.vertical = options.vertical;
  }

  if (options.sourcePage) {
    extraFields.source_page = options.sourcePage;
  }

  if (options.serviceInternet) {
    extraFields.service_internet = true;
  }

  if (options.serviceMovil) {
    extraFields.service_movil = true;
  }

  if (options.calculatorData) {
    extraFields.calculator = {
      answers: options.calculatorData.answers,
      result: options.calculatorData.result,
    };
  }

  if (Object.keys(extraFields).length > 0) {
    body.set('extra_data', JSON.stringify(extraFields));
  }

  if (options.invoice) {
    body.set('invoice', options.invoice);
  }

  return body;
}

export async function submitLandingLead(
  endpoint: string,
  apiKey: string,
  body: FormData,
): Promise<unknown> {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'X-API-Key': apiKey },
    body,
  });
  const responseBody = await response.json().catch(() => null);

  if (!response.ok || responseBody?.estado !== CRM_RESPONSE_STATUS.SUCCESS) {
    const errorMessage =
      responseBody?.exception ||
      responseBody?.message ||
      'No se pudo enviar el formulario';
    throw new Error(errorMessage);
  }

  return responseBody;
}
