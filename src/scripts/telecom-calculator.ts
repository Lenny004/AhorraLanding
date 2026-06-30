import {
  initCalculatorWizard,
  TELECOM_CONNECTION_TYPE,
  TELECOM_DATA_USAGE,
  TELECOM_PACKAGE_TYPE,
  TELECOM_PERMANENCE_ANSWER,
  TELECOM_PROVIDER,
  TELECOM_SAVINGS,
  VERTICAL,
  type WizardAnswers,
} from './calculator-wizard';

/**
 * Calcula el porcentaje y importe de ahorro estimado en telecom según respuestas.
 *
 * @param answers - Respuestas del wizard de móvil e internet.
 * @returns Resultado con factura actual, nueva factura y ahorro mensual/anual.
 */
function calculateTelecomSavings(answers: WizardAnswers) {
  const monthlyBill = Math.max(
    parseFloat(answers.monthlyBill) || TELECOM_SAVINGS.DEFAULT_MONTHLY_BILL_EUR,
    TELECOM_SAVINGS.MIN_MONTHLY_BILL_EUR,
  );
  let savingsPercent = TELECOM_SAVINGS.BASE_PERCENT;

  if (answers.telecomType === TELECOM_PACKAGE_TYPE.MOVIL_FIBRA) {
    savingsPercent += TELECOM_SAVINGS.BONUS.MOVIL_FIBRA;
  }

  if (
    answers.provider === TELECOM_PROVIDER.MOVISTAR ||
    answers.provider === TELECOM_PROVIDER.VODAFONE
  ) {
    savingsPercent += TELECOM_SAVINGS.BONUS.PREMIUM_PROVIDER;
  }

  if (answers.provider === TELECOM_PROVIDER.ORANGE) {
    savingsPercent += TELECOM_SAVINGS.BONUS.ORANGE_PROVIDER;
  }

  if (answers.hasPermanence === TELECOM_PERMANENCE_ANSWER.NO) {
    savingsPercent += TELECOM_SAVINGS.BONUS.NO_PERMANENCE;
  }

  if (answers.dataUsageGb === TELECOM_DATA_USAGE.LESS_THAN_10_GB) {
    savingsPercent += TELECOM_SAVINGS.BONUS.LOW_DATA_USAGE;
  }

  if (answers.connectionType === TELECOM_CONNECTION_TYPE.ADSL) {
    savingsPercent += TELECOM_SAVINGS.BONUS.ADSL_CONNECTION;
  }

  savingsPercent = Math.min(Math.round(savingsPercent), TELECOM_SAVINGS.MAX_PERCENT);

  const newMonthlyBill =
    monthlyBill * (1 - savingsPercent / TELECOM_SAVINGS.PERCENT_DIVISOR);
  const monthlySaving = monthlyBill - newMonthlyBill;

  return {
    percent: savingsPercent,
    bill: monthlyBill,
    newBill: newMonthlyBill,
    monthlySaving,
    yearlySaving: monthlySaving * TELECOM_SAVINGS.MONTHS_PER_YEAR,
  };
}

/**
 * Arranca el wizard de calculadora para el vertical de móvil e internet.
 */
export function initTelecomCalculator(): void {
  initCalculatorWizard({
    calculateSavings: calculateTelecomSavings,
    requireContactFields: true,
    buildLeadFields: (calculatorPayload, _wizardRoot, leadFields) => ({
      fullName: leadFields.fullName,
      phone: leadFields.phone,
      vertical: VERTICAL.TELECOM,
      postalCode: calculatorPayload.answers.postalCode,
      monthlyBill: calculatorPayload.result.bill,
      savingsPercent: calculatorPayload.result.percent,
      monthlySaving: calculatorPayload.result.monthlySaving,
      approximateConsumption: `${calculatorPayload.result.bill}€/mes`,
    }),
  });
}
