import { RegulatoryStatus, ImpactLevel, ComplianceStatus } from './regulatory-tracker-constants';

export interface RegulatoryChange {
  id: string;
  title: string;
  description: string;
  status: RegulatoryStatus;
  impactLevel: ImpactLevel;
  effectiveDate: string;
  source: string;
  publishedDate: string;
}

export interface AffectedFramework {
  id: string;
  name: string;
  code: string;
}

export interface AffectedControl {
  id: string;
  code: string;
  title: string;
  complianceStatus: ComplianceStatus;
}

export interface ControlCategory {
  name: string;
  controls: AffectedControl[];
}

export interface FrameworkChange {
  frameworkId: string;
  frameworkName: string;
  frameworkCode: string;
  categories: ControlCategory[];
  totalControls: number;
}

export interface RegulatoryChangeDetail extends RegulatoryChange {
  acknowledged: boolean;
  affectedFrameworks: AffectedFramework[];
  affectedControlsCount: number;
  impactScore?: number;
  recommendedActions?: string[];
  frameworkChanges?: FrameworkChange[];
}

export interface ChangeFeedFilters {
  status?: RegulatoryStatus;
  impactLevel?: ImpactLevel;
  dateFrom?: string;
  dateTo?: string;
}
