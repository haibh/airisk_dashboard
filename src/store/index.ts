import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { AISystem, RiskAssessment, Risk, Framework } from '@/types';

// ============================================================================
// UI STORE
// ============================================================================

interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  locale: 'en' | 'vi';
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setLocale: (locale: 'en' | 'vi') => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set) => ({
        sidebarOpen: true,
        theme: 'system',
        locale: 'en',
        toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
        setSidebarOpen: (open) => set({ sidebarOpen: open }),
        setTheme: (theme) => set({ theme }),
        setLocale: (locale) => set({ locale }),
      }),
      {
        name: 'airm-ui-storage',
      }
    )
  )
);

// ============================================================================
// AI SYSTEMS STORE
// ============================================================================

interface AISystemsState {
  systems: AISystem[];
  selectedSystem: AISystem | null;
  isLoading: boolean;
  error: string | null;
  setSystems: (systems: AISystem[]) => void;
  setSelectedSystem: (system: AISystem | null) => void;
  addSystem: (system: AISystem) => void;
  updateSystem: (id: string, updates: Partial<AISystem>) => void;
  removeSystem: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAISystemsStore = create<AISystemsState>()(
  devtools((set) => ({
    systems: [],
    selectedSystem: null,
    isLoading: false,
    error: null,
    setSystems: (systems) => set({ systems }),
    setSelectedSystem: (system) => set({ selectedSystem: system }),
    addSystem: (system) =>
      set((state) => ({ systems: [...state.systems, system] })),
    updateSystem: (id, updates) =>
      set((state) => ({
        systems: state.systems.map((s) =>
          s.id === id ? { ...s, ...updates } : s
        ),
      })),
    removeSystem: (id) =>
      set((state) => ({
        systems: state.systems.filter((s) => s.id !== id),
      })),
    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),
  }))
);

// ============================================================================
// RISK ASSESSMENT STORE
// ============================================================================

interface RiskAssessmentState {
  assessments: RiskAssessment[];
  currentAssessment: RiskAssessment | null;
  risks: Risk[];
  isLoading: boolean;
  error: string | null;
  setAssessments: (assessments: RiskAssessment[]) => void;
  setCurrentAssessment: (assessment: RiskAssessment | null) => void;
  setRisks: (risks: Risk[]) => void;
  addRisk: (risk: Risk) => void;
  updateRisk: (id: string, updates: Partial<Risk>) => void;
  removeRisk: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useRiskAssessmentStore = create<RiskAssessmentState>()(
  devtools((set) => ({
    assessments: [],
    currentAssessment: null,
    risks: [],
    isLoading: false,
    error: null,
    setAssessments: (assessments) => set({ assessments }),
    setCurrentAssessment: (assessment) => set({ currentAssessment: assessment }),
    setRisks: (risks) => set({ risks }),
    addRisk: (risk) => set((state) => ({ risks: [...state.risks, risk] })),
    updateRisk: (id, updates) =>
      set((state) => ({
        risks: state.risks.map((r) => (r.id === id ? { ...r, ...updates } : r)),
      })),
    removeRisk: (id) =>
      set((state) => ({ risks: state.risks.filter((r) => r.id !== id) })),
    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),
  }))
);

// ============================================================================
// FRAMEWORKS STORE
// ============================================================================

interface FrameworksState {
  frameworks: Framework[];
  selectedFramework: Framework | null;
  isLoading: boolean;
  setFrameworks: (frameworks: Framework[]) => void;
  setSelectedFramework: (framework: Framework | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useFrameworksStore = create<FrameworksState>()(
  devtools((set) => ({
    frameworks: [],
    selectedFramework: null,
    isLoading: false,
    setFrameworks: (frameworks) => set({ frameworks }),
    setSelectedFramework: (framework) => set({ selectedFramework: framework }),
    setLoading: (isLoading) => set({ isLoading }),
  }))
);
