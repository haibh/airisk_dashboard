/**
 * Gap Analysis Engine
 * Identifies compliance gaps across frameworks and control mappings
 */

import { prisma } from '@/lib/db';
import { Control, Framework, ControlMapping, Prisma } from '@prisma/client';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface FrameworkGap {
  controlId: string;
  controlCode: string;
  controlTitle: string;
  frameworkId: string;
  frameworkName: string;
  hasAssessment: boolean;
  hasEvidence: boolean;
  complianceStatus: 'COMPLIANT' | 'PARTIAL' | 'NON_COMPLIANT' | 'NOT_ASSESSED';
  mappedControls: Array<{
    controlId: string;
    controlCode: string;
    frameworkId: string;
    confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  }>;
}

export interface FrameworkScore {
  id: string;
  name: string;
  shortName: string;
  totalControls: number;
  compliantControls: number;
  partialControls: number;
  nonCompliantControls: number;
  notAssessedControls: number;
  complianceScore: number; // 0-100
}

export interface GapAnalysisResult {
  frameworks: FrameworkScore[];
  gaps: FrameworkGap[];
  matrix: Record<string, Record<string, 'MAPPED' | 'PARTIAL' | 'UNMAPPED'>>;
  generatedAt: Date;
}

export interface DirectionCoverage {
  sourceId: string;
  sourceName: string;
  sourceShortName: string;
  targetId: string;
  targetName: string;
  targetShortName: string;
  totalSourceControls: number;
  mappedControls: number;
  unmappedControls: number;
  coveragePercentage: number;
  mappedDetails: Array<{
    sourceCode: string;
    sourceTitle: string;
    targetCode: string;
    targetTitle: string;
    confidence: string;
    mappingType: string;
  }>;
  unmappedDetails: Array<{
    code: string;
    title: string;
  }>;
}

export interface PairwiseComparisonResult {
  sourceToTarget: DirectionCoverage;
  targetToSource: DirectionCoverage;
  generatedAt: Date;
}

interface ControlWithFramework extends Control {
  framework: Framework;
}

interface MappingWithControls extends ControlMapping {
  sourceControl: ControlWithFramework;
  targetControl: ControlWithFramework;
}

interface AssessmentData {
  frameworkId: string;
  controlId: string;
  hasRiskControl: boolean;
  hasEvidence: boolean;
  effectiveness: number;
}

// ============================================================================
// CORE FUNCTIONS
// ============================================================================

/**
 * Load all controls for given frameworks
 */
export async function loadFrameworkControls(
  frameworkIds: string[]
): Promise<Map<string, Control[]>> {
  const controls = await prisma.control.findMany({
    where: {
      frameworkId: { in: frameworkIds },
    },
    orderBy: [{ sortOrder: 'asc' }, { code: 'asc' }],
  });

  const controlMap = new Map<string, Control[]>();
  for (const control of controls) {
    if (!controlMap.has(control.frameworkId)) {
      controlMap.set(control.frameworkId, []);
    }
    controlMap.get(control.frameworkId)!.push(control);
  }

  return controlMap;
}

/**
 * Load control mappings between frameworks
 */
export async function loadControlMappings(
  frameworkIds: string[]
): Promise<MappingWithControls[]> {
  const mappings = await prisma.controlMapping.findMany({
    where: {
      OR: [
        { sourceFrameworkId: { in: frameworkIds } },
        { targetFrameworkId: { in: frameworkIds } },
      ],
    },
    include: {
      sourceControl: {
        include: {
          framework: true,
        },
      },
      targetControl: {
        include: {
          framework: true,
        },
      },
    },
  });

  return mappings as MappingWithControls[];
}

/**
 * Calculate compliance scores for each framework
 */
export async function calculateComplianceScores(
  orgId: string,
  frameworkIds: string[]
): Promise<Map<string, FrameworkScore>> {
  const frameworks = await prisma.framework.findMany({
    where: { id: { in: frameworkIds } },
  });

  const controlsMap = await loadFrameworkControls(frameworkIds);
  const scoreMap = new Map<string, FrameworkScore>();

  // Get assessment data for organization
  const assessmentData = await loadAssessmentData(orgId, frameworkIds);

  for (const framework of frameworks) {
    const controls = controlsMap.get(framework.id) || [];
    const totalControls = controls.length;

    let compliantControls = 0;
    let partialControls = 0;
    let nonCompliantControls = 0;
    let notAssessedControls = 0;

    for (const control of controls) {
      const assessment = assessmentData.find(
        (a) => a.controlId === control.id && a.frameworkId === framework.id
      );

      if (!assessment) {
        notAssessedControls++;
      } else if (assessment.effectiveness >= 80) {
        compliantControls++;
      } else if (assessment.effectiveness >= 50) {
        partialControls++;
      } else {
        nonCompliantControls++;
      }
    }

    // Calculate compliance score (weighted)
    const complianceScore =
      totalControls > 0
        ? Math.round(
            ((compliantControls * 100 + partialControls * 50) / totalControls)
          )
        : 0;

    scoreMap.set(framework.id, {
      id: framework.id,
      name: framework.name,
      shortName: framework.shortName,
      totalControls,
      compliantControls,
      partialControls,
      nonCompliantControls,
      notAssessedControls,
      complianceScore,
    });
  }

  return scoreMap;
}

/**
 * Load assessment data for organization
 */
async function loadAssessmentData(
  orgId: string,
  frameworkIds: string[]
): Promise<AssessmentData[]> {
  const assessments = await prisma.riskAssessment.findMany({
    where: {
      organizationId: orgId,
      frameworkId: { in: frameworkIds },
      status: { in: ['APPROVED', 'UNDER_REVIEW'] },
    },
    include: {
      risks: {
        include: {
          controls: {
            include: {
              control: true,
            },
          },
          evidenceLinks: true,
        },
      },
    },
  });

  const assessmentData: AssessmentData[] = [];

  for (const assessment of assessments) {
    for (const risk of assessment.risks) {
      for (const riskControl of risk.controls) {
        assessmentData.push({
          frameworkId: assessment.frameworkId,
          controlId: riskControl.controlId,
          hasRiskControl: true,
          hasEvidence: risk.evidenceLinks.length > 0,
          effectiveness: riskControl.effectiveness,
        });
      }
    }
  }

  return assessmentData;
}

/**
 * Identify gaps in compliance coverage
 */
export async function identifyGaps(
  orgId: string,
  frameworkIds: string[],
  mappings: MappingWithControls[]
): Promise<FrameworkGap[]> {
  const controlsMap = await loadFrameworkControls(frameworkIds);
  const assessmentData = await loadAssessmentData(orgId, frameworkIds);
  const gaps: FrameworkGap[] = [];

  // Convert Map to array to avoid downlevelIteration requirement
  const frameworkEntries = Array.from(controlsMap.entries());

  for (const [frameworkId, controls] of frameworkEntries) {
    for (const control of controls) {
      const assessment = assessmentData.find(
        (a) => a.controlId === control.id && a.frameworkId === frameworkId
      );

      // Determine compliance status
      let complianceStatus: FrameworkGap['complianceStatus'] = 'NOT_ASSESSED';
      if (assessment) {
        if (assessment.effectiveness >= 80) {
          complianceStatus = 'COMPLIANT';
        } else if (assessment.effectiveness >= 50) {
          complianceStatus = 'PARTIAL';
        } else {
          complianceStatus = 'NON_COMPLIANT';
        }
      }

      // Find mapped controls
      const mappedControls = mappings
        .filter(
          (m) =>
            m.sourceControlId === control.id || m.targetControlId === control.id
        )
        .map((m) => {
          const isSource = m.sourceControlId === control.id;
          const targetControl = isSource ? m.targetControl : m.sourceControl;

          return {
            controlId: targetControl.id,
            controlCode: targetControl.code,
            frameworkId: targetControl.frameworkId,
            confidence: m.confidenceScore as 'HIGH' | 'MEDIUM' | 'LOW',
          };
        });

      // Only include gaps (non-compliant or not assessed)
      if (complianceStatus !== 'COMPLIANT') {
        const framework = await prisma.framework.findUnique({
          where: { id: frameworkId },
        });

        gaps.push({
          controlId: control.id,
          controlCode: control.code,
          controlTitle: control.title,
          frameworkId,
          frameworkName: framework?.name || 'Unknown',
          hasAssessment: !!assessment,
          hasEvidence: assessment?.hasEvidence || false,
          complianceStatus,
          mappedControls,
        });
      }
    }
  }

  return gaps;
}

/**
 * Generate cross-framework mapping matrix
 */
export async function generateGapMatrix(
  frameworkIds: string[],
  mappings: MappingWithControls[]
): Promise<Record<string, Record<string, 'MAPPED' | 'PARTIAL' | 'UNMAPPED'>>> {
  const matrix: Record<string, Record<string, 'MAPPED' | 'PARTIAL' | 'UNMAPPED'>> = {};
  const controlsMap = await loadFrameworkControls(frameworkIds);

  // Initialize matrix
  for (const frameworkId of frameworkIds) {
    matrix[frameworkId] = {};
    for (const otherFrameworkId of frameworkIds) {
      if (frameworkId !== otherFrameworkId) {
        matrix[frameworkId][otherFrameworkId] = 'UNMAPPED';
      }
    }
  }

  // Fill matrix based on mappings
  for (const mapping of mappings) {
    const sourceFrameworkId = mapping.sourceFrameworkId;
    const targetFrameworkId = mapping.targetFrameworkId;

    if (frameworkIds.includes(sourceFrameworkId) && frameworkIds.includes(targetFrameworkId)) {
      const mappingStatus =
        mapping.mappingType === 'EQUIVALENT'
          ? 'MAPPED'
          : mapping.mappingType === 'PARTIAL'
          ? 'PARTIAL'
          : mapping.confidenceScore === 'HIGH'
          ? 'MAPPED'
          : 'PARTIAL';

      // Update both directions
      if (!matrix[sourceFrameworkId]) matrix[sourceFrameworkId] = {};
      if (!matrix[targetFrameworkId]) matrix[targetFrameworkId] = {};

      matrix[sourceFrameworkId][targetFrameworkId] = mappingStatus;
      matrix[targetFrameworkId][sourceFrameworkId] = mappingStatus;
    }
  }

  return matrix;
}

/**
 * Run complete gap analysis
 */
export async function runGapAnalysis(
  orgId: string,
  frameworkIds: string[]
): Promise<GapAnalysisResult> {
  // Load all required data in parallel
  const [mappings, scoresMap] = await Promise.all([
    loadControlMappings(frameworkIds),
    calculateComplianceScores(orgId, frameworkIds),
  ]);

  // Identify gaps
  const gaps = await identifyGaps(orgId, frameworkIds, mappings);

  // Generate matrix
  const matrix = await generateGapMatrix(frameworkIds, mappings);

  // Convert scores map to array
  const frameworks = Array.from(scoresMap.values());

  return {
    frameworks,
    gaps,
    matrix,
    generatedAt: new Date(),
  };
}

/**
 * Build directional coverage from source → target
 */
function buildDirectionCoverage(
  source: Framework,
  target: Framework,
  sourceControls: Control[],
  mappings: MappingWithControls[]
): DirectionCoverage {
  // Only leaf controls (non-parent) for coverage
  const leafControls = sourceControls.filter((c) => c.parentId !== null);
  const effectiveControls = leafControls.length > 0 ? leafControls : sourceControls;

  const mappedDetails: DirectionCoverage['mappedDetails'] = [];
  const mappedControlIds = new Set<string>();

  for (const control of effectiveControls) {
    const mapping = mappings.find(
      (m) =>
        (m.sourceControlId === control.id && m.targetFrameworkId === target.id) ||
        (m.targetControlId === control.id && m.sourceFrameworkId === target.id)
    );

    if (mapping) {
      mappedControlIds.add(control.id);
      const isSource = mapping.sourceControlId === control.id;
      const targetCtrl = isSource ? mapping.targetControl : mapping.sourceControl;

      mappedDetails.push({
        sourceCode: control.code,
        sourceTitle: control.title,
        targetCode: targetCtrl.code,
        targetTitle: targetCtrl.title,
        confidence: mapping.confidenceScore,
        mappingType: mapping.mappingType,
      });
    }
  }

  const unmappedDetails = effectiveControls
    .filter((c) => !mappedControlIds.has(c.id))
    .map((c) => ({ code: c.code, title: c.title }));

  const coveragePercentage =
    effectiveControls.length > 0
      ? Math.round((mappedDetails.length / effectiveControls.length) * 100)
      : 0;

  return {
    sourceId: source.id,
    sourceName: source.name,
    sourceShortName: source.shortName,
    targetId: target.id,
    targetName: target.name,
    targetShortName: target.shortName,
    totalSourceControls: effectiveControls.length,
    mappedControls: mappedDetails.length,
    unmappedControls: unmappedDetails.length,
    coveragePercentage,
    mappedDetails,
    unmappedDetails,
  };
}

/**
 * Run pairwise bidirectional comparison between two frameworks
 */
export async function runPairwiseComparison(
  sourceId: string,
  targetId: string
): Promise<PairwiseComparisonResult> {
  const frameworkIds = [sourceId, targetId];

  const [frameworks, mappings, controlsMap] = await Promise.all([
    prisma.framework.findMany({ where: { id: { in: frameworkIds } } }),
    loadControlMappings(frameworkIds),
    loadFrameworkControls(frameworkIds),
  ]);

  const source = frameworks.find((f) => f.id === sourceId);
  const target = frameworks.find((f) => f.id === targetId);

  if (!source || !target) {
    throw new Error('One or both frameworks not found');
  }

  const sourceControls = controlsMap.get(sourceId) || [];
  const targetControls = controlsMap.get(targetId) || [];

  const sourceToTarget = buildDirectionCoverage(source, target, sourceControls, mappings);
  const targetToSource = buildDirectionCoverage(target, source, targetControls, mappings);

  return {
    sourceToTarget,
    targetToSource,
    generatedAt: new Date(),
  };
}
