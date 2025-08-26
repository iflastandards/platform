/**
 * ML Insights Component
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMLStatus } from '../services/analyticsApi';
import apiClient from '../services/analyticsApi';

interface MLModelStatus {
  modelId: string;
  modelName: string;
  status: 'training' | 'ready' | 'error' | 'outdated';
  accuracy: number;
  lastTrained: string;
  trainingDataSize: number;
  predictions: number;
  features: string[];
}

interface MLInsightData {
  qualityPredictions: {
    totalPredictions: number;
    avgConfidence: number;
    accuracyTrend: Array<{ date: string; accuracy: number }>;
  };
  patterns: {
    mostImportantFeatures: Array<{ feature: string; importance: number }>;
    qualityDistribution: Array<{ predicted: string; actual: string; count: number }>;
    anomalies: Array<{ scriptId: number; reason: string; severity: number }>;
  };
  models: MLModelStatus[];
  recommendations: {
    modelImprovement: string[];
    dataQuality: string[];
  };
}

export const MLInsights: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<string>('quality-predictor');
  const [viewMode, setViewMode] = useState<'overview' | 'models' | 'predictions' | 'patterns'>('overview');
  const queryClient = useQueryClient();

  const { data: mlStatus, isLoading, error } = useQuery({
    queryKey: ['ml-status'],
    queryFn: getMLStatus,
    refetchInterval: 30000,
  });

  const { data: insights } = useQuery({
    queryKey: ['ml-insights', selectedModel],
    queryFn: async () => {
      // Mock data for development - would be replaced with actual API
      return mockInsightsData;
    },
    enabled: !!selectedModel,
  });

  const trainModelMutation = useMutation({
    mutationFn: async () => {
      return apiClient.trainMLModels();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ml-status'] });
      queryClient.invalidateQueries({ queryKey: ['ml-insights'] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading ML insights...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-4">⚠️</div>
        <h3 className="text-lg font-semibold text-red-600">ML Service Unavailable</h3>
        <p className="text-gray-500">The machine learning service is currently unavailable.</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const getModelStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'text-green-600 bg-green-50 border-green-200';
      case 'training': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      case 'outdated': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getModelStatusIcon = (status: string) => {
    switch (status) {
      case 'ready': return '✅';
      case 'training': return '🔄';
      case 'error': return '❌';
      case 'outdated': return '⚠️';
      default: return '❓';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ML Insights</h1>
          <p className="text-gray-600">Machine learning model performance and predictions</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => trainModelMutation.mutate()}
            disabled={trainModelMutation.isPending}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {trainModelMutation.isPending ? 'Training...' : 'Train Models'}
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'models', label: 'Models', icon: '🤖' },
            { id: 'predictions', label: 'Predictions', icon: '🎯' },
            { id: 'patterns', label: 'Patterns', icon: '🔍' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setViewMode(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                viewMode === tab.id
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

      {/* Content */}
      <div className="mt-6">
        {viewMode === 'overview' && insights && (
          <OverviewView insights={insights} />
        )}
        {viewMode === 'models' && insights && (
          <ModelsView models={insights.models} onModelSelect={setSelectedModel} />
        )}
        {viewMode === 'predictions' && insights && (
          <PredictionsView predictions={insights.qualityPredictions} />
        )}
        {viewMode === 'patterns' && insights && (
          <PatternsView patterns={insights.patterns} />
        )}
      </div>
    </div>
  );
};

const OverviewView: React.FC<{ insights: MLInsightData }> = ({ insights }) => (
  <div className="space-y-6">
    {/* Key Metrics */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white p-6 rounded-lg shadow border">
        <div className="flex items-center">
          <div className="text-2xl mr-3">🎯</div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Predictions</p>
            <p className="text-2xl font-semibold text-gray-900">{insights.qualityPredictions.totalPredictions}</p>
          </div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow border">
        <div className="flex items-center">
          <div className="text-2xl mr-3">📈</div>
          <div>
            <p className="text-sm font-medium text-gray-500">Avg Confidence</p>
            <p className="text-2xl font-semibold text-blue-600">{insights.qualityPredictions.avgConfidence.toFixed(1)}%</p>
          </div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow border">
        <div className="flex items-center">
          <div className="text-2xl mr-3">🤖</div>
          <div>
            <p className="text-sm font-medium text-gray-500">Active Models</p>
            <p className="text-2xl font-semibold text-green-600">{insights.models.filter(m => m.status === 'ready').length}</p>
          </div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow border">
        <div className="flex items-center">
          <div className="text-2xl mr-3">⚠️</div>
          <div>
            <p className="text-sm font-medium text-gray-500">Anomalies</p>
            <p className="text-2xl font-semibold text-red-600">{insights.patterns.anomalies.length}</p>
          </div>
        </div>
      </div>
    </div>

    {/* Feature Importance */}
    <div className="bg-white p-6 rounded-lg shadow border">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Most Important Features</h2>
      <div className="space-y-3">
        {insights.patterns.mostImportantFeatures.map((feature, index) => (
          <div key={feature.feature} className="flex items-center">
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium">{feature.feature}</span>
                <span>{(feature.importance * 100).toFixed(1)}%</span>
              </div>
              <div className="bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${feature.importance * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const ModelsView: React.FC<{ models: MLModelStatus[]; onModelSelect: (id: string) => void }> = ({ models, onModelSelect }) => (
  <div className="space-y-4">
    {models.map((model) => (
      <div key={model.modelId} className="bg-white p-6 rounded-lg shadow border">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{model.modelName}</h3>
              <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getModelStatusColor(model.status)}`}>
                {getModelStatusIcon(model.status)} {model.status}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Accuracy:</span>
                <span className="ml-2 font-medium">{(model.accuracy * 100).toFixed(1)}%</span>
              </div>
              <div>
                <span className="text-gray-500">Training Data:</span>
                <span className="ml-2 font-medium">{model.trainingDataSize.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-500">Predictions:</span>
                <span className="ml-2 font-medium">{model.predictions.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-500">Last Trained:</span>
                <span className="ml-2 font-medium">{new Date(model.lastTrained).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="mt-3">
              <span className="text-gray-500 text-sm">Features:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {model.features.map(feature => (
                  <span key={feature} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <button
            onClick={() => onModelSelect(model.modelId)}
            className="ml-4 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            View Details
          </button>
        </div>
      </div>
    ))}
  </div>
);

const PredictionsView: React.FC<{ predictions: MLInsightData['qualityPredictions'] }> = ({ predictions }) => (
  <div className="space-y-6">
    <div className="bg-white p-6 rounded-lg shadow border">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Prediction Accuracy Trend</h2>
      <div className="h-64 flex items-end space-x-2">
        {predictions.accuracyTrend.map((point, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div
              className="bg-blue-500 w-full rounded-t"
              style={{ height: `${point.accuracy * 100}%` }}
            ></div>
            <span className="text-xs text-gray-500 mt-1">
              {new Date(point.date).toLocaleDateString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const PatternsView: React.FC<{ patterns: MLInsightData['patterns'] }> = ({ patterns }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Quality Distribution */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Predicted vs Actual Quality</h2>
        <div className="space-y-3">
          {patterns.qualityDistribution.map((item, index) => (
            <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <div>
                <span className="font-medium">Predicted: {item.predicted}</span>
                <span className="text-gray-500 ml-2">→ Actual: {item.actual}</span>
              </div>
              <span className="font-semibold">{item.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Anomalies */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Detected Anomalies</h2>
        <div className="space-y-3">
          {patterns.anomalies.map((anomaly, index) => (
            <div key={index} className={`p-3 rounded border-l-4 ${
              anomaly.severity >= 8 ? 'border-red-500 bg-red-50' :
              anomaly.severity >= 6 ? 'border-orange-500 bg-orange-50' :
              'border-yellow-500 bg-yellow-50'
            }`}>
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-medium">Script #{anomaly.scriptId}</span>
                  <p className="text-sm text-gray-700 mt-1">{anomaly.reason}</p>
                </div>
                <span className="text-sm font-semibold">
                  Severity: {anomaly.severity}/10
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Mock data for development
const mockInsightsData: MLInsightData = {
  qualityPredictions: {
    totalPredictions: 1247,
    avgConfidence: 84.3,
    accuracyTrend: [
      { date: '2024-01-01', accuracy: 0.78 },
      { date: '2024-01-02', accuracy: 0.81 },
      { date: '2024-01-03', accuracy: 0.83 },
      { date: '2024-01-04', accuracy: 0.85 },
      { date: '2024-01-05', accuracy: 0.84 },
    ],
  },
  patterns: {
    mostImportantFeatures: [
      { feature: 'Code Complexity', importance: 0.85 },
      { feature: 'Function Length', importance: 0.72 },
      { feature: 'Test Coverage', importance: 0.68 },
      { feature: 'Documentation Ratio', importance: 0.54 },
      { feature: 'Dependency Count', importance: 0.41 },
    ],
    qualityDistribution: [
      { predicted: 'High', actual: 'High', count: 245 },
      { predicted: 'High', actual: 'Medium', count: 32 },
      { predicted: 'Medium', actual: 'Medium', count: 156 },
      { predicted: 'Medium', actual: 'Low', count: 18 },
      { predicted: 'Low', actual: 'Low', count: 89 },
    ],
    anomalies: [
      { scriptId: 101, reason: 'Predicted high quality but has security vulnerabilities', severity: 8 },
      { scriptId: 203, reason: 'Low complexity score but high maintainability', severity: 6 },
      { scriptId: 304, reason: 'Perfect test coverage but poor performance metrics', severity: 7 },
    ],
  },
  models: [
    {
      modelId: 'quality-predictor',
      modelName: 'Quality Score Predictor',
      status: 'ready',
      accuracy: 0.847,
      lastTrained: '2024-01-15T10:30:00Z',
      trainingDataSize: 2543,
      predictions: 1247,
      features: ['complexity', 'coverage', 'documentation', 'dependencies'],
    },
    {
      modelId: 'risk-classifier',
      modelName: 'Risk Level Classifier',
      status: 'training',
      accuracy: 0.792,
      lastTrained: '2024-01-14T14:20:00Z',
      trainingDataSize: 1892,
      predictions: 856,
      features: ['security', 'performance', 'maintainability'],
    },
  ],
  recommendations: {
    modelImprovement: [
      'Increase training data size for better accuracy',
      'Add more feature engineering for code patterns',
    ],
    dataQuality: [
      'Collect more examples of edge cases',
      'Improve labeling consistency',
    ],
  },
};