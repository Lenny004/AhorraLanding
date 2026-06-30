import { calculatorToLeadFields } from '../lib/landingLead';
import {
  ENERGY_KNOWLEDGE_ANSWER,
  ENERGY_SAVINGS,
  ENERGY_SERVICE_TYPE,
  ENERGY_TARIFF_TYPE,
  initCalculatorWizard,
  type WizardAnswers,
} from './calculator-wizard';

type EnergyLeadFields = ReturnType<typeof calculatorToLeadFields>;

function calculateEnergySavings(answers: WizardAnswers) {
  const monthlyBill = Math.max(
    parseFloat(answers.monthlyBill) || ENERGY_SAVINGS.DEFAULT_MONTHLY_BILL_EUR,
    ENERGY_SAVINGS.MIN_MONTHLY_BILL_EUR,
  );
  let savingsPercent = ENERGY_SAVINGS.BASE_PERCENT;

  if (answers.serviceType === ENERGY_SERVICE_TYPE.LUZ_GAS) {
    savingsPercent += ENERGY_SAVINGS.BONUS.LUZ_GAS;
  }

  if (answers.knowsPower === ENERGY_KNOWLEDGE_ANSWER.NO) {
    savingsPercent += ENERGY_SAVINGS.BONUS.UNKNOWN_POWER;
  }

  if (answers.knowsKwh === ENERGY_KNOWLEDGE_ANSWER.NO) {
    savingsPercent += ENERGY_SAVINGS.BONUS.UNKNOWN_KWH;
  }

  if (answers.tariffType === ENERGY_TARIFF_TYPE.PVPC) {
    savingsPercent += ENERGY_SAVINGS.BONUS.PVPC_TARIFF;
  }

  if (answers.tariffType === ENERGY_TARIFF_TYPE.UNKNOWN) {
    savingsPercent += ENERGY_SAVINGS.BONUS.UNKNOWN_TARIFF;
  }

  if (answers.tariffType === ENERGY_TARIFF_TYPE.LIBRE) {
    savingsPercent += ENERGY_SAVINGS.BONUS.LIBRE_TARIFF;
  }

  savingsPercent = Math.min(Math.round(savingsPercent), ENERGY_SAVINGS.MAX_PERCENT);

  const newMonthlyBill =
    monthlyBill * (1 - savingsPercent / ENERGY_SAVINGS.PERCENT_DIVISOR);
  const monthlySaving = monthlyBill - newMonthlyBill;

  return {
    percent: savingsPercent,
    bill: monthlyBill,
    newBill: newMonthlyBill,
    monthlySaving,
    yearlySaving: monthlySaving * ENERGY_SAVINGS.MONTHS_PER_YEAR,
  };
}

export function initEnergyCalculator(): void {
  initCalculatorWizard({
    calculateSavings: calculateEnergySavings,
    buildLeadFields: (_calculatorPayload, _wizardRoot, leadFields: EnergyLeadFields) => ({
      fullName: leadFields.fullName,
      phone: leadFields.phone,
      postalCode: leadFields.postalCode,
      monthlyBill: leadFields.monthlyBill,
      savingsPercent: leadFields.savingsPercent,
      monthlySaving: leadFields.monthlySaving,
      approximateConsumption: leadFields.approximateConsumption,
      serviceLuz: leadFields.serviceLuz,
      serviceGas: leadFields.serviceGas,
    }),
  });
}
