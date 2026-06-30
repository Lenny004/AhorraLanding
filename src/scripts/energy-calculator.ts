import { calculatorToLeadFields } from '../lib/landingLead';
import { initCalculatorWizard } from './calculator-wizard';

type EnergyLeadFields = ReturnType<typeof calculatorToLeadFields>;

function calculateEnergySavings(data: Record<string, string>) {
  const bill = Math.max(parseFloat(data.monthlyBill) || 80, 1);
  let percent = 10;

  if (data.serviceType === 'luz-gas') {
    percent += 2;
  }

  if (data.knowsPower === 'no') {
    percent += 2;
  }

  if (data.knowsKwh === 'no') {
    percent += 2;
  }

  if (data.tariffType === 'pvpc') {
    percent += 3;
  }

  if (data.tariffType === 'unknown') {
    percent += 4;
  }

  if (data.tariffType === 'libre') {
    percent += 1;
  }

  percent = Math.min(Math.round(percent), 25);

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

export function initEnergyCalculator(): void {
  initCalculatorWizard({
    calculateResult: calculateEnergySavings,
    buildLeadOptions: (_payload, _root, fields: EnergyLeadFields) => ({
      fullName: fields.fullName,
      phone: fields.phone,
      postalCode: fields.postalCode,
      monthlyBill: fields.monthlyBill,
      savingsPercent: fields.savingsPercent,
      monthlySaving: fields.monthlySaving,
      approximateConsumption: fields.approximateConsumption,
      serviceLuz: fields.serviceLuz,
      serviceGas: fields.serviceGas,
    }),
  });
}
