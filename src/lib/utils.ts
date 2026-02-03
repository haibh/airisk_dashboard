import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format date based on locale
 */
export function formatDate(date: Date | string, locale: string = 'en'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d);
}

/**
 * Format number based on locale
 */
export function formatNumber(num: number, locale: string = 'en'): string {
  return new Intl.NumberFormat(locale).format(num);
}

/**
 * Calculate risk score
 * Formula: Risk Score = (Likelihood × Impact) × (1 - Control Effectiveness)
 */
export function calculateRiskScore(
  likelihood: number,
  impact: number,
  controlEffectiveness: number = 0
): number {
  const inherentRisk = likelihood * impact;
  const residualRisk = inherentRisk * (1 - controlEffectiveness / 100);
  return Math.round(residualRisk * 10) / 10;
}

/**
 * Get risk level from score
 */
export function getRiskLevel(
  score: number
): 'low' | 'medium' | 'high' | 'critical' {
  if (score <= 4) return 'low';
  if (score <= 9) return 'medium';
  if (score <= 15) return 'high';
  return 'critical';
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}
