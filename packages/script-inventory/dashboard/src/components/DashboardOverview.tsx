/**
 * Dashboard Overview Component
 */

import React from 'react';
import type { DashboardData } from '../services/analyticsApi';

interface DashboardOverviewProps {
  data?: DashboardData;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ data }) => {
  if (!data) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500">Loading overview data...</div>
      </div>
    );
  }

  const { overview, qualityDistribution, recentTrends } = data;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Analytics Overview</h1>
        <div className="text-sm text-gray-500">
          Last updated: {new Date(data.timestamp).toLocaleString()}
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="text-2xl">📝</div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Scripts</p>
              <p className="text-2xl font-semibold text-gray-900">{overview.totalScripts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="text-2xl text-red-500">⚠️</div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">High Risk Scripts</p>
              <p className="text-2xl font-semibold text-red-600">{overview.highRiskScripts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="text-2xl text-blue-500">💡</div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Pending Recommendations</p>
              <p className="text-2xl font-semibold text-blue-600">{overview.pendingRecommendations}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="text-2xl text-green-500">⭐</div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Avg Quality Score</p>
              <p className="text-2xl font-semibold text-green-600">
                {overview.avgQualityScore.toFixed(1)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quality Distribution Chart */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quality Distribution</h2>
        <div className="space-y-3">
          {qualityDistribution.map((item) => {
            const percentage = overview.totalScripts > 0 
              ? (item.count / overview.totalScripts * 100).toFixed(1)
              : '0';
            
            const getQualityColor = (level: string) => {
              switch (level.toLowerCase()) {
                case 'excellent': return 'bg-green-500';
                case 'good': return 'bg-blue-500';
                case 'fair': return 'bg-yellow-500';
                case 'poor': return 'bg-red-500';
                default: return 'bg-gray-400';
              }
            };

            return (
              <div key={item.quality_level} className="flex items-center">
                <div className="flex-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium capitalize">{item.quality_level}</span>
                    <span>{item.count} ({percentage}%)</span>
                  </div>
                  <div className="mt-1 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getQualityColor(item.quality_level)}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Risk Trends */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Risk Trends</h2>
          <div className="space-y-3">
            {recentTrends.risks.length > 0 ? (
              recentTrends.risks.slice(0, 5).map((risk, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                  <div>
                    <div className="font-medium text-sm">{risk.risk_type}</div>
                    <div className="text-xs text-gray-500">{risk.risk_category}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">{risk.count}</div>
                    <div className="text-xs text-gray-500">instances</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-500">No recent risks detected</div>
            )}
          </div>
        </div>

        {/* Recent Recommendations */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Recommendations</h2>
          <div className="space-y-3">
            {recentTrends.recommendations.length > 0 ? (
              recentTrends.recommendations.slice(0, 5).map((rec, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                  <div>
                    <div className="font-medium text-sm">{rec.recommendation_type}</div>
                    <div className="text-xs text-gray-500">Priority: {rec.avg_priority.toFixed(1)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">{rec.count}</div>
                    <div className="text-xs text-gray-500">scripts</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-500">No recommendations available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};