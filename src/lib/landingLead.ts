export const CALC_STORAGE_KEY = 'landing_calculator_data';

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
  submittedToCrm?: boolean;
  submittedAt?: string;
};

export function saveCalculatorData(payload: CalculatorPayload) {
  sessionStorage.setItem(CALC_STORAGE_KEY, JSON.stringify(payload));
}

export function getCalculatorData(): CalculatorPayload | null {
  const raw = sessionStorage.getItem(CALC_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CalculatorPayload;
  } catch {
    return null;
  }
}

export function clearCalculatorData() {
  sessionStorage.removeItem(CALC_STORAGE_KEY);
}

export function calculatorToLeadFields(data: CalculatorPayload) {
  const { answers, result } = data;
  const fullName = [answers.firstName, answers.lastName].filter(Boolean).join(' ').trim();
  const serviceType = answers.serviceType ?? 'luz';

  return {
    fullName,
    phone: answers.phone ?? '',
    postalCode: answers.postalCode ?? '',
    monthlyBill: result.bill,
    savingsPercent: result.percent,
    monthlySaving: result.monthlySaving,
    approximateConsumption: answers.monthlyBill ? `${answers.monthlyBill}€/mes` : `${result.bill}€/mes`,
    serviceLuz: serviceType === 'luz' || serviceType === 'luz-gas',
    serviceGas: serviceType === 'luz-gas',
  };
}

export function buildLeadBody(options: {
  source: string;
  leadOrigin: 'calculator' | 'contact' | 'both';
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
  postalCode?: string;
  monthlyBill?: number;
  savingsPercent?: number;
  monthlySaving?: number;
  calculatorData?: CalculatorPayload | null;
  invoice?: File;
}): FormData {
  const body = new FormData();
  body.set('source', options.source);
  body.set('full_name', options.fullName);
  body.set('phone', options.phone);
  body.set('lead_origin', options.leadOrigin);
  body.set('calculator_completed', options.calculatorData ? '1' : '0');

  if (options.email) body.set('email', options.email);
  if (options.clientType) body.set('client_type', options.clientType);
  if (options.approximateConsumption) body.set('approximate_consumption', options.approximateConsumption);
  if (options.serviceLuz) body.set('service_luz', '1');
  if (options.serviceGas) body.set('service_gas', '1');
  if (options.postalCode) body.set('postal_code', options.postalCode);
  if (options.monthlyBill != null) body.set('monthly_bill', String(options.monthlyBill));
  if (options.savingsPercent != null) body.set('estimated_savings_percent', String(options.savingsPercent));
  if (options.monthlySaving != null) body.set('estimated_monthly_saving', options.monthlySaving.toFixed(2));

  const extra: Record<string, unknown> = {};
  if (options.vertical) extra.vertical = options.vertical;
  if (options.serviceInternet) extra.service_internet = true;
  if (options.serviceMovil) extra.service_movil = true;
  if (options.calculatorData) {
    extra.calculator = options.calculatorData;
    if (options.leadOrigin === 'both' && options.calculatorData.submittedToCrm) {
      extra.calculator_already_submitted = true;
    }
  }
  if (Object.keys(extra).length > 0) {
    body.set('extra_data', JSON.stringify(extra));
  }

  if (options.invoice) body.set('invoice', options.invoice);

  return body;
}

export async function submitLandingLead(endpoint: string, apiKey: string, body: FormData) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'X-API-Key': apiKey },
    body,
  });
  const result = await response.json().catch(() => null);

  if (!response.ok || result?.estado !== 1) {
    throw new Error(result?.exception || result?.message || 'No se pudo enviar el formulario');
  }

  return result;
}
