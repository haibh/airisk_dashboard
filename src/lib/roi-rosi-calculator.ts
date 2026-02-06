/**
 * ROI/ROSI calculation utilities for risk investment analysis
 * Formulas: ALE, ROSI, payback period, annual savings
 */

/**
 * Calculate Annual Loss Expectancy (ALE)
 * @param sle - Single Loss Expectancy ($)
 * @param aro - Annual Rate of Occurrence (0-1)
 * @returns ALE in dollars
 */
export function calculateALE(sle: number, aro: number): number {
  return sle * aro;
}

/**
 * Calculate Return on Security Investment (ROSI)
 * @param totalALE - Total Annual Loss Expectancy before mitigation ($)
 * @param mitigationPercent - Expected risk reduction (0-100%)
 * @param totalInvestment - Total implementation + annual costs ($)
 * @returns ROSI as percentage (e.g., 0.25 = 25% return)
 */
export function calculateROSI(
  totalALE: number,
  mitigationPercent: number,
  totalInvestment: number
): number {
  if (totalInvestment === 0) return 0;
  const annualSavings = totalALE * (mitigationPercent / 100);
  return (annualSavings - totalInvestment) / totalInvestment;
}

/**
 * Calculate payback period in months
 * @param totalInvestment - Total implementation cost ($)
 * @param annualSavings - Annual savings from risk mitigation ($)
 * @returns Payback period in months (or Infinity if no savings)
 */
export function calculatePaybackPeriod(
  totalInvestment: number,
  annualSavings: number
): number {
  if (annualSavings <= 0) return Infinity;
  return (totalInvestment / annualSavings) * 12;
}

/**
 * Calculate annual savings from risk mitigation
 * @param totalALE - Total Annual Loss Expectancy ($)
 * @param mitigationPercent - Expected risk reduction (0-100%)
 * @param annualMaintenance - Annual maintenance cost ($)
 * @returns Net annual savings in dollars
 */
export function calculateAnnualSavings(
  totalALE: number,
  mitigationPercent: number,
  annualMaintenance: number
): number {
  const grossSavings = totalALE * (mitigationPercent / 100);
  return grossSavings - annualMaintenance;
}
