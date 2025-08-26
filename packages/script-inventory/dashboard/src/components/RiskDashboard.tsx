/**
 * Risk Dashboard Component
 */

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getRiskSummary } from '../services/analyticsApi';
import { useAnalyticsStore } from '../store/analyticsStore';

interface RiskSummary {
  totalRisks: number;
  risksByLevel: Array<{ level: number; count: number }>;
  risksByCategory: Array<{ category: string; count: number; avgLevel: number }>;
  risksByType: Array<{ type: string; count: number; avgLevel: number }>;
  recentRisks: Array<{
    id: number;
    scriptId: number;
    riskType: string;
    riskLevel: number;
    riskCategory: string;
    description: string;
    status: string;
    createdAt: string;
  }>;
  trends: {
    daily: Array<{ date: string; count: number; avgLevel: number }>;
    weekly: Array<{ week: string; count: number; avgLevel: number }>;
  };
}

export const RiskDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { updateFilters } = useAnalyticsStore();

  const { data: riskSummary, isLoading, error } = useQuery({
    queryKey: ['risk-summary', timeRange, selectedCategory],
    queryFn: getRiskSummary,
    refetchInterval: 60000, // Refresh every minute
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading risk analysis...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-4">⚠️</div>
        <h3 className="text-lg font-semibold text-red-600">Failed to Load Risk Data</h3>
        <p className="text-gray-500">Please try refreshing the page.</p>
      </div>
    );
  }

  if (!riskSummary) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-4">✅</div>
        <h3 className="text-lg font-semibold text-green-600">No Risk Data Available</h3>
        <p className="text-gray-500">Risk analysis will appear here once scripts are scanned.</p>
      </div>
    );
  }

  const getRiskLevelLabel = (level: number) => {
    if (level >= 8) return 'Critical';
    if (level >= 6) return 'High';
    if (level >= 4) return 'Medium';
    return 'Low';
  };

  const getRiskLevelColor = (level: number) => {
    if (level >= 8) return 'bg-red-500';
    if (level >= 6) return 'bg-orange-500';
    if (level >= 4) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  const getRiskIcon = (level: number) => {
    if (level >= 8) return '🚨';
    if (level >= 6) return '⚠️';
    if (level >= 4) return '⚡';
    return 'ℹ️';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Risk Dashboard</h1>
          <p className="text-gray-600">Monitor and manage script security and quality risks</p>
        </div>
        <div className="flex space-x-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            {riskSummary.risksByCategory.map((cat) => (
              <option key={cat.category} value={cat.category}>
                {cat.category} ({cat.count})
              </option>
            ))}
          </select>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Risk Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="text-2xl">📊</div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Risks</p>
              <p className="text-2xl font-semibold text-gray-900">{riskSummary.totalRisks}</p>
            </div>
          </div>
        </div>

        {riskSummary.risksByLevel.map((levelData) => (
          <div key={levelData.level} className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-2xl">{getRiskIcon(levelData.level)}</div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">
                  {getRiskLevelLabel(levelData.level)} Risk
                </p>
                <p className="text-2xl font-semibold text-gray-900">{levelData.count}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk by Category */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Risks by Category</h2>
          <div className="space-y-3">
            {riskSummary.risksByCategory.map((category) => (
              <div key={category.category} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{category.category}</span>
                    <span>{category.count} risks</span>
                  </div>
                  <div className="flex items-center">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                      <div
                        className={`h-2 rounded-full ${getRiskLevelColor(category.avgLevel)}`}
                        style={{ width: `${(category.count / riskSummary.totalRisks) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500">
                      Avg: {category.avgLevel.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Risk by Type */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Risks by Type</h2>
          <div className="space-y-3">
            {riskSummary.risksByType.slice(0, 8).map((type) => (
              <div key={type.type} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{type.type}</span>
                    <span>{type.count}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="flex-1 bg-gray-200 rounded-full h-1.5 mr-2">
                      <div
                        className={`h-1.5 rounded-full ${getRiskLevelColor(type.avgLevel)}`}
                        style={{ width: `${(type.count / riskSummary.totalRisks) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {type.avgLevel.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent High-Risk Items */}
      <div className="bg-white rounded-lg shadow border">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent High-Risk Items</h2>
          <p className="text-sm text-gray-600">Risk level 6+ from the last 7 days</p>
        </div>
        <div className="divide-y divide-gray-200">
          {riskSummary.recentRisks
            .filter(risk => risk.riskLevel >= 6)
            .slice(0, 10)
            .map((risk) => (
            <div key={risk.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-start space-x-4">
                <div className="text-2xl">{getRiskIcon(risk.riskLevel)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Script #{risk.scriptId} - {risk.riskType}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">{risk.description}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        risk.status === 'open' ? 'bg-red-100 text-red-800' :
                        risk.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {risk.status}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {risk.riskLevel}/10
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                    <span>{risk.riskCategory}</span>
                    <span>{new Date(risk.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {riskSummary.recentRisks.filter(risk => risk.riskLevel >= 6).length === 0 && (
            <div className="p-6 text-center text-gray-500">
              <div className="text-4xl mb-2">✅</div>
              <p>No high-risk items in recent activity</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};