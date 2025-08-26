/**
 * Script Inventory Analytics Dashboard - Main App Component
 */

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from './components/DashboardLayout';
import { DashboardOverview } from './components/DashboardOverview';
import { ScriptAnalytics } from './components/ScriptAnalytics';
import { RiskDashboard } from './components/RiskDashboard';
import { RecommendationCenter } from './components/RecommendationCenter';
import { MLInsights } from './components/MLInsights';
import { useAnalyticsStore } from './store/analyticsStore';
import { fetchDashboardData } from './services/analyticsApi';

export type DashboardView = 'overview' | 'scripts' | 'risks' | 'recommendations' | 'ml-insights';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<DashboardView>('overview');
  const { isConnected, connectionStatus } = useAnalyticsStore();

  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboardData,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const renderCurrentView = () => {
    switch (currentView) {
      case 'overview':
        return <DashboardOverview data={dashboardData} />;
      case 'scripts':
        return <ScriptAnalytics />;
      case 'risks':
        return <RiskDashboard />;
      case 'recommendations':
        return <RecommendationCenter />;
      case 'ml-insights':
        return <MLInsights />;
      default:
        return <DashboardOverview data={dashboardData} />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading Analytics Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Dashboard Error</h1>
          <p className="text-gray-600 mb-4">
            Failed to load analytics data. Please check the server connection.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout
      currentView={currentView}
      onViewChange={setCurrentView}
      connectionStatus={connectionStatus}
      isConnected={isConnected}
    >
      {renderCurrentView()}
    </DashboardLayout>
  );
};