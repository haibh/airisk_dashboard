import { AISystemType, DataClassification, LifecycleStatus, RiskTier } from '@prisma/client';

/**
 * Form data structure for creating/editing AI systems
 */
export interface AISystemFormData {
  name: string;
  description?: string;
  systemType: AISystemType;
  dataClassification: DataClassification;
  lifecycleStatus: LifecycleStatus;
  riskTier?: RiskTier;
  purpose?: string;
  dataInputs?: string;
  dataOutputs?: string;
  thirdPartyAPIs: string[];
  baseModels: string[];
  trainingDataSources: string[];
}

/**
 * Filters for AI systems list
 */
export interface AISystemFilters {
  search?: string;
  systemType?: AISystemType;
  lifecycleStatus?: LifecycleStatus;
  riskTier?: RiskTier;
  page?: number;
  pageSize?: number;
}

/**
 * AI System with owner information
 */
export interface AISystemWithOwner {
  id: string;
  name: string;
  description: string | null;
  systemType: AISystemType;
  dataClassification: DataClassification;
  lifecycleStatus: LifecycleStatus;
  riskTier: RiskTier | null;
  purpose: string | null;
  dataInputs: string | null;
  dataOutputs: string | null;
  thirdPartyAPIs: string[];
  baseModels: string[];
  trainingDataSources: string[];
  organizationId: string;
  ownerId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  owner: {
    id: string;
    name: string | null;
    email: string;
  };
}

/**
 * List response with pagination
 */
export interface AISystemListResponse {
  systems: AISystemWithOwner[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
