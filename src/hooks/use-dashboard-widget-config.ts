'use client';

import { useState, useCallback, useEffect } from 'react';
import type { WidgetConfig } from '@/components/dashboard/dashboard-widget-wrapper';

const STORAGE_KEY = 'airm-dashboard-widget-config';
const ORDER_STORAGE_KEY = 'airm-dashboard-widget-order';
const VIEW_MODE_STORAGE_KEY = 'airm-dashboard-view-mode';

export type DashboardViewMode = 'simple' | 'advanced';

// Simple mode consolidated widget IDs
export const SIMPLE_MODE_WIDGETS: WidgetConfig[] = [
  { id: 'risk-pulse-strip', title: 'Risk Pulse Strip', visible: true, minimized: false },
  { id: 'unified-risk-view', title: 'Risk Intelligence', visible: true, minimized: false },
  { id: 'compliance-status', title: 'Compliance Status', visible: true, minimized: false },
  { id: 'next-best-actions', title: 'What Needs Attention', visible: true, minimized: false },
  { id: 'activity-feed', title: 'Recent Activity', visible: true, minimized: false },
  { id: 'ai-model-registry', title: 'AI Model Registry', visible: true, minimized: false },
];

export const SIMPLE_MODE_ORDER = SIMPLE_MODE_WIDGETS.map((w) => w.id);

// Advanced mode (original) widget configuration
export const DEFAULT_WIDGETS: WidgetConfig[] = [
  { id: 'stat-cards', title: 'Statistics Cards', visible: true, minimized: false },
  { id: 'risk-score', title: 'Overall Risk Score', visible: true, minimized: false },
  { id: 'compliance-overview', title: 'Compliance Overview', visible: true, minimized: false },
  { id: 'top-risks', title: 'Top Risks', visible: true, minimized: false },
  { id: 'risk-alerts', title: 'Risk Alerts', visible: true, minimized: false },
  { id: 'risk-heatmap', title: 'Risk Heatmap', visible: true, minimized: false },
  { id: 'compliance-radar', title: 'Compliance Radar', visible: true, minimized: false },
  { id: 'action-queue', title: 'Action Queue', visible: true, minimized: false },
  { id: 'assessment-progress', title: 'Assessment Progress', visible: true, minimized: false },
  { id: 'ai-model-registry', title: 'AI Model Registry', visible: true, minimized: false },
  { id: 'framework-treemap', title: 'Framework Coverage Treemap', visible: true, minimized: false },
  { id: 'framework-bars', title: 'Framework Coverage Bars', visible: true, minimized: false },
  { id: 'cross-framework-mapping', title: 'Cross-Framework Mapping', visible: true, minimized: false },
  { id: 'framework-rag', title: 'Framework RAG Status', visible: true, minimized: false },
  { id: 'activity-feed', title: 'Recent Activity', visible: true, minimized: false },
];

// Default widget order (for drag-and-drop)
export const DEFAULT_WIDGET_ORDER = DEFAULT_WIDGETS.map((w) => w.id);

// All widget configs (simple + advanced combined for settings panel)
export const ALL_WIDGETS: WidgetConfig[] = [...SIMPLE_MODE_WIDGETS, ...DEFAULT_WIDGETS];

export function useDashboardWidgetConfig() {
  const [viewMode, setViewMode] = useState<DashboardViewMode>('simple');
  const [widgets, setWidgets] = useState<WidgetConfig[]>(DEFAULT_WIDGETS);
  const [simpleWidgets, setSimpleWidgets] = useState<WidgetConfig[]>(SIMPLE_MODE_WIDGETS);
  const [widgetOrder, setWidgetOrder] = useState<string[]>(DEFAULT_WIDGET_ORDER);
  const [simpleWidgetOrder, setSimpleWidgetOrder] = useState<string[]>(SIMPLE_MODE_ORDER);
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      // Load view mode
      const storedMode = localStorage.getItem(VIEW_MODE_STORAGE_KEY);
      if (storedMode === 'simple' || storedMode === 'advanced') {
        setViewMode(storedMode);
      }

      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as WidgetConfig[];
        // Merge with defaults to handle new widgets
        const merged = DEFAULT_WIDGETS.map((defaultWidget) => {
          const storedWidget = parsed.find((w) => w.id === defaultWidget.id);
          return storedWidget || defaultWidget;
        });
        setWidgets(merged);
      }
      // Load widget order
      const storedOrder = localStorage.getItem(ORDER_STORAGE_KEY);
      if (storedOrder) {
        const parsedOrder = JSON.parse(storedOrder) as string[];
        // Ensure all widget IDs are present (handle new widgets)
        const allIds = DEFAULT_WIDGETS.map((w) => w.id);
        const validOrder = parsedOrder.filter((id) => allIds.includes(id));
        const missingIds = allIds.filter((id) => !validOrder.includes(id));
        setWidgetOrder([...validOrder, ...missingIds]);
      }
    } catch {
      // Use defaults if localStorage fails
    }
    setIsInitialized(true);
  }, []);

  // Save to localStorage when widgets change
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(widgets));
      } catch {
        // Ignore storage errors
      }
    }
  }, [widgets, isInitialized]);

  // Save widget order to localStorage
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(widgetOrder));
      } catch {
        // Ignore storage errors
      }
    }
  }, [widgetOrder, isInitialized]);

  // Toggle widget visibility (mode-aware)
  const toggleVisibility = useCallback((id: string) => {
    const setter = SIMPLE_MODE_ORDER.includes(id) ? setSimpleWidgets : setWidgets;
    setter((prev) =>
      prev.map((w) => (w.id === id ? { ...w, visible: !w.visible } : w))
    );
  }, []);

  // Toggle widget minimized state (mode-aware)
  const toggleMinimize = useCallback((id: string) => {
    const setter = SIMPLE_MODE_ORDER.includes(id) ? setSimpleWidgets : setWidgets;
    setter((prev) =>
      prev.map((w) => (w.id === id ? { ...w, minimized: !w.minimized } : w))
    );
  }, []);

  // Close/hide widget (mode-aware)
  const closeWidget = useCallback((id: string) => {
    const setter = SIMPLE_MODE_ORDER.includes(id) ? setSimpleWidgets : setWidgets;
    setter((prev) =>
      prev.map((w) => (w.id === id ? { ...w, visible: false } : w))
    );
  }, []);

  // Reset all widgets to default
  const resetAll = useCallback(() => {
    setWidgets(DEFAULT_WIDGETS);
    setSimpleWidgets(SIMPLE_MODE_WIDGETS);
    setWidgetOrder(DEFAULT_WIDGET_ORDER);
    setSimpleWidgetOrder(SIMPLE_MODE_ORDER);
    setSelectedWidgetId(null);
  }, []);

  // Reorder widgets (for drag-and-drop) — mode-aware
  const reorderWidgets = useCallback((newOrder: string[]) => {
    if (viewMode === 'simple') {
      setSimpleWidgetOrder(newOrder);
    } else {
      setWidgetOrder(newOrder);
    }
  }, [viewMode]);

  // Get widget by ID
  const getWidget = useCallback(
    (id: string) => widgets.find((w) => w.id === id),
    [widgets]
  );

  // Get ordered widgets (visible ones only, in drag order)
  const orderedWidgets = widgetOrder
    .map((id) => widgets.find((w) => w.id === id))
    .filter((w): w is WidgetConfig => w !== undefined && w.visible);

  // Show all widgets (mode-aware)
  const showAll = useCallback(() => {
    const setter = viewMode === 'simple' ? setSimpleWidgets : setWidgets;
    setter((prev) => prev.map((w) => ({ ...w, visible: true, minimized: false })));
  }, [viewMode]);

  // Hide all widgets (mode-aware)
  const hideAll = useCallback(() => {
    const setter = viewMode === 'simple' ? setSimpleWidgets : setWidgets;
    setter((prev) => prev.map((w) => ({ ...w, visible: false })));
  }, [viewMode]);

  // Select a widget (for highlighting)
  const selectWidget = useCallback((id: string | null) => {
    setSelectedWidgetId((prev) => (prev === id ? null : id));
  }, []);

  // Check if a specific widget is visible (mode-aware)
  const isVisible = useCallback(
    (id: string) => {
      const list = SIMPLE_MODE_ORDER.includes(id) ? simpleWidgets : widgets;
      return list.find((w) => w.id === id)?.visible ?? true;
    },
    [widgets, simpleWidgets]
  );

  // Check if a specific widget is minimized (mode-aware)
  const isMinimized = useCallback(
    (id: string) => {
      const list = SIMPLE_MODE_ORDER.includes(id) ? simpleWidgets : widgets;
      return list.find((w) => w.id === id)?.minimized ?? false;
    },
    [widgets, simpleWidgets]
  );

  // Check if a specific widget is selected
  const isSelected = useCallback(
    (id: string) => selectedWidgetId === id,
    [selectedWidgetId]
  );

  // Toggle view mode
  const toggleViewMode = useCallback(() => {
    setViewMode((prev) => {
      const next = prev === 'simple' ? 'advanced' : 'simple';
      try {
        localStorage.setItem(VIEW_MODE_STORAGE_KEY, next);
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  }, []);

  // Active widgets/order based on current view mode
  const activeWidgets = viewMode === 'simple' ? simpleWidgets : widgets;
  const activeWidgetOrder = viewMode === 'simple' ? simpleWidgetOrder : widgetOrder;

  return {
    viewMode,
    toggleViewMode,
    widgets: activeWidgets,
    widgetOrder: activeWidgetOrder,
    orderedWidgets,
    selectedWidgetId,
    toggleVisibility,
    toggleMinimize,
    closeWidget,
    resetAll,
    showAll,
    hideAll,
    selectWidget,
    reorderWidgets,
    getWidget,
    isVisible,
    isMinimized,
    isSelected,
    isInitialized,
  };
}
