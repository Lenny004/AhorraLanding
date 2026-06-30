import { initCalculatorWizard } from './calculator-wizard';

function calculateTelecomSavings(data: Record<string, string>) {
  const bill = Math.max(parseFloat(data.monthlyBill) || 50, 1);
  let percent = 15;

  if (data.telecomType === 'movil-fibra') {
    percent += 5;
  }

  if (data.provider === 'Movistar' || data.provider === 'Vodafone') {
    percent += 5;
  }

  if (data.provider === 'Orange') {
    percent += 3;
  }

  if (data.hasPermanence === 'no') {
    percent += 2;
  }

  if (data.dataUsageGb === 'menos-de-10-gb') {
    percent += 2;
  }

  if (data.connectionType === 'adsl') {
    percent += 4;
  }

  percent = Math.min(Math.round(percent), 35);

  const newBill = bill * (1 - percent / 100);
  const monthlySaving = bill - newBill;

  return {
    percent,
    bill,
    newBill,
    monthlySaving,
    yearlySaving: monthlySaving * 12,
  };
}

export function initTelecomCalculator(): void {
  initCalculatorWizard({
    calculateResult: calculateTelecomSavings,
    requireContactFields: true,
    buildLeadOptions: (payload, _root, fields) => ({
      fullName: fields.fullName,
      phone: fields.phone,
      vertical: 'telecom',
      postalCode: payload.answers.postalCode,
      monthlyBill: payload.result.bill,
      savingsPercent: payload.result.percent,
      monthlySaving: payload.result.monthlySaving,
      approximateConsumption: `${payload.result.bill}€/mes`,
    }),
  });
}
