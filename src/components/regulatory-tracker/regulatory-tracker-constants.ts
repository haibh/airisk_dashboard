export type RegulatoryStatus = 'PROPOSED' | 'ENACTED' | 'ACTIVE' | 'SUPERSEDED';
export type ImpactLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ComplianceStatus = 'COMPLIANT' | 'PARTIAL' | 'NON_COMPLIANT' | 'NOT_ASSESSED';

export const statusColors: Record<RegulatoryStatus, string> = {
  PROPOSED: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  ENACTED: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  ACTIVE: 'bg-green-500/10 text-green-500 border-green-500/20',
  SUPERSEDED: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
};

export const impactColors: Record<ImpactLevel, string> = {
  LOW: 'bg-green-500/10 text-green-500 border-green-500/20',
  MEDIUM: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  HIGH: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  CRITICAL: 'bg-red-500/10 text-red-500 border-red-500/20',
};

export const impactLevelColors: Record<ImpactLevel, string> = {
  LOW: 'text-green-500',
  MEDIUM: 'text-yellow-500',
  HIGH: 'text-orange-500',
  CRITICAL: 'text-red-500',
};

export const impactLevelBg: Record<ImpactLevel, string> = {
  LOW: 'bg-green-500',
  MEDIUM: 'bg-yellow-500',
  HIGH: 'bg-orange-500',
  CRITICAL: 'bg-red-500',
};

export const complianceStatusColors: Record<ComplianceStatus, string> = {
  COMPLIANT: 'bg-green-500/10 text-green-500 border-green-500/20',
  PARTIAL: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  NON_COMPLIANT: 'bg-red-500/10 text-red-500 border-red-500/20',
  NOT_ASSESSED: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
};

export const complianceStatusLabels: Record<ComplianceStatus, string> = {
  COMPLIANT: 'Compliant',
  PARTIAL: 'Partial',
  NON_COMPLIANT: 'Non-Compliant',
  NOT_ASSESSED: 'Not Assessed',
};
