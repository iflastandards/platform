/**
 * Script Analytics Component
 */

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAnalyticsStore } from '../store/analyticsStore';
import { fetchScriptMetrics, fetchScriptRisks, fetchRecommendations, type ScriptMetrics, type ScriptRisks, type ScriptRecommendations } from '../services/analyticsApi';

export const ScriptAnalytics: React.FC = () => {
  const { selectedScript, setSelectedScript } = useAnalyticsStore();
  const [activeTab, setActiveTab] = useState<'metrics' | 'risks' | 'recommendations'>('metrics');

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['script-metrics', selectedScript],
    queryFn: () => selectedScript ? fetchScriptMetrics(selectedScript) : null,
    enabled: !!selectedScript,
  });

  const { data: risks, isLoading: risksLoading } = useQuery({
    queryKey: ['script-risks', selectedScript],
    queryFn: () => selectedScript ? fetchScriptRisks(selectedScript) : null,
    enabled: !!selectedScript,
  });

  const { data: recommendations, isLoading: recommendationsLoading } = useQuery({
    queryKey: ['script-recommendations', selectedScript],
    queryFn: () => selectedScript ? fetchRecommendations(selectedScript) : null,
    enabled: !!selectedScript,
  });

  if (!selectedScript) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-4xl mb-4">📊</div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Select a Script to Analyze</h2>
          <p className="text-gray-500">
            Enter a script ID to view detailed analytics, metrics, risks, and recommendations.
          </p>
          <div className="mt-4">
            <input
              type="number"
              placeholder="Enter Script ID"
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  const value = parseInt((e.target as HTMLInputElement).value);
                  if (value > 0) {
                    setSelectedScript(value);
                  }
                }
              }}
            />
            <button
              onClick={() => {
                const input = document.querySelector('input[placeholder="Enter Script ID"]') as HTMLInputElement;
                const value = parseInt(input.value);
                if (value > 0) {
                  setSelectedScript(value);
                }
              }}
              className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Analyze
            </button>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'metrics' as const, label: 'Metrics', icon: '📈' },
    { id: 'risks' as const, label: 'Risks', icon: '⚠️' },
    { id: 'recommendations' as const, label: 'Recommendations', icon: '💡' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Script Analytics</h1>
          <p className="text-gray-600">Analyzing Script ID: {selectedScript}</p>
        </div>
        <button
          onClick={() => setSelectedScript(undefined)}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Change Script
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'metrics' && (
          <MetricsView metrics={metrics} loading={metricsLoading} />
        )}
        {activeTab === 'risks' && (
          <RisksView risks={risks} loading={risksLoading} />
        )}
        {activeTab === 'recommendations' && (
          <RecommendationsView recommendations={recommendations} loading={recommendationsLoading} />
        )}
      </div>
    </div>
  );
};

const MetricsView: React.FC<{ metrics?: ScriptMetrics; loading: boolean }> = ({ metrics, loading }) => {
  if (loading) {
    return <div className="text-center py-8">Loading metrics...</div>;
  }

  if (!metrics || !metrics.metrics.length) {
    return <div className="text-center py-8 text-gray-500">No metrics available</div>;
  }

  const metricsByType = metrics.metrics.reduce((acc, metric) => {
    if (!acc[metric.metricType]) acc[metric.metricType] = [];
    acc[metric.metricType].push(metric);
    return acc;
  }, {} as Record<string, typeof metrics.metrics>);

  return (
    <div className="space-y-6">
      {Object.entries(metricsByType).map(([type, typeMetrics]) => (
        <div key={type} className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 capitalize">{type} Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {typeMetrics.map((metric, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm text-gray-900">{metric.metricName}</h4>
                    <div className="mt-1">
                      <span className="text-2xl font-bold text-blue-600">{metric.value.toFixed(2)}</span>
                      {metric.maxValue && (
                        <span className="text-sm text-gray-500 ml-1">/ {metric.maxValue}</span>
                      )}
                    </div>
                  </div>
                  {metric.maxValue && (
                    <div className="ml-2 w-16">
                      <div className="bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${Math.min((metric.value / metric.maxValue) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  {new Date(metric.recordedAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const RisksView: React.FC<{ risks?: ScriptRisks; loading: boolean }> = ({ risks, loading }) => {
  if (loading) {
    return <div className="text-center py-8">Loading risks...</div>;
  }

  if (!risks || !risks.risks.length) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-4">✅</div>
        <h3 className="text-lg font-semibold text-green-600">No Risks Detected</h3>
        <p className="text-gray-500">This script appears to be low risk.</p>
      </div>
    );
  }

  const getRiskLevelColor = (level: number) => {
    if (level >= 8) return 'text-red-600 bg-red-100 border-red-200';
    if (level >= 6) return 'text-orange-600 bg-orange-100 border-orange-200';
    if (level >= 4) return 'text-yellow-600 bg-yellow-100 border-yellow-200';
    return 'text-blue-600 bg-blue-100 border-blue-200';
  };

  const getRiskIcon = (level: number) => {
    if (level >= 8) return '🚨';
    if (level >= 6) return '⚠️';
    if (level >= 4) return '⚡';
    return 'ℹ️';
  };

  return (
    <div className="space-y-4">
      {risks.risks.map((risk) => (
        <div key={risk.id} className={`border rounded-lg p-4 ${getRiskLevelColor(risk.riskLevel)}`}>
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className="text-2xl">{getRiskIcon(risk.riskLevel)}</div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold">{risk.riskType}</h3>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-200 text-gray-700">
                    {risk.riskCategory}
                  </span>
                </div>
                <p className="text-sm mt-1">{risk.description}</p>
                <div className="flex items-center space-x-4 mt-2 text-xs">
                  <span>Risk Level: {risk.riskLevel}/10</span>
                  <span>Status: {risk.status}</span>
                  <span>{new Date(risk.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const RecommendationsView: React.FC<{ recommendations?: ScriptRecommendations; loading: boolean }> = ({ recommendations, loading }) => {
  if (loading) {
    return <div className="text-center py-8">Loading recommendations...</div>;
  }

  if (!recommendations || !recommendations.recommendations.length) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-4">✨</div>
        <h3 className="text-lg font-semibold text-green-600">No Recommendations</h3>
        <p className="text-gray-500">This script is already well-optimized.</p>
      </div>
    );
  }

  const getPriorityColor = (priority: number) => {
    if (priority >= 8) return 'text-red-600 bg-red-50 border-red-200';
    if (priority >= 6) return 'text-orange-600 bg-orange-50 border-orange-200';
    if (priority >= 4) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-blue-600 bg-blue-50 border-blue-200';
  };

  return (
    <div className="space-y-4">
      {recommendations.recommendations.map((rec) => (
        <div key={rec.id} className={`border rounded-lg p-4 ${getPriorityColor(rec.priority)}`}>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="font-semibold">{rec.title}</h3>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-200 text-gray-700">
                  {rec.recommendationType}
                </span>
              </div>
              <p className="text-sm text-gray-700 mb-3">{rec.description}</p>
              <div className="flex items-center space-x-4 text-xs text-gray-600">
                <span>Priority: {rec.priority}/10</span>
                <span>Confidence: {rec.confidenceScore.toFixed(1)}%</span>
                <span>Status: {rec.status}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};