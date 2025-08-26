/**
 * Analytics Dashboard State Management
 */

import { create } from 'zustand';

export interface AnalyticsState {
  isConnected: boolean;
  connectionStatus: 'connected' | 'connecting' | 'disconnected' | 'error';
  selectedScript?: number;
  filters: {
    riskLevel?: number[];
    recommendationType?: string[];
    dateRange?: [Date, Date];
  };
  realTimeData: {
    recentActivity: any[];
    metrics: Record<string, number>;
    alerts: any[];
  };
}

export interface AnalyticsActions {
  setConnectionStatus: (status: AnalyticsState['connectionStatus']) => void;
  setSelectedScript: (scriptId?: number) => void;
  updateFilters: (filters: Partial<AnalyticsState['filters']>) => void;
  updateRealTimeData: (data: Partial<AnalyticsState['realTimeData']>) => void;
  addAlert: (alert: any) => void;
  clearAlerts: () => void;
}

export const useAnalyticsStore = create<AnalyticsState & AnalyticsActions>((set, get) => ({
  // Initial state
  isConnected: false,
  connectionStatus: 'disconnected',
  selectedScript: undefined,
  filters: {},
  realTimeData: {
    recentActivity: [],
    metrics: {},
    alerts: []
  },

  // Actions
  setConnectionStatus: (status) => set({ 
    connectionStatus: status, 
    isConnected: status === 'connected' 
  }),

  setSelectedScript: (scriptId) => set({ selectedScript: scriptId }),

  updateFilters: (filters) => set((state) => ({
    filters: { ...state.filters, ...filters }
  })),

  updateRealTimeData: (data) => set((state) => ({
    realTimeData: { ...state.realTimeData, ...data }
  })),

  addAlert: (alert) => set((state) => ({
    realTimeData: {
      ...state.realTimeData,
      alerts: [...state.realTimeData.alerts, alert]
    }
  })),

  clearAlerts: () => set((state) => ({
    realTimeData: {
      ...state.realTimeData,
      alerts: []
    }
  }))
}));