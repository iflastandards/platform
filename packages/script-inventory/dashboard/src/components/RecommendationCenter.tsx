/**
 * Recommendation Center Component
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../services/analyticsApi';

interface Recommendation {
  id: number;
  scriptId: number;
  recommendationType: string;
  priority: number;
  title: string;
  description: string;
  status: 'pending' | 'accepted' | 'dismissed' | 'implemented';
  confidenceScore: number;
  createdAt: string;
  feedbackScore?: number;
  feedbackNotes?: string;
}

interface RecommendationStats {
  total: number;
  pending: number;
  accepted: number;
  implemented: number;
  dismissed: number;
  avgPriority: number;
  avgConfidence: number;
  byType: Array<{ type: string; count: number; avgPriority: number }>;
}

export const RecommendationCenter: React.FC = () => {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'confidence' | 'date'>('priority');
  const queryClient = useQueryClient();

  const { data: recommendations, isLoading } = useQuery({
    queryKey: ['all-recommendations', selectedStatus, selectedType, sortBy],
    queryFn: async () => {
      // Mock data for now - would be replaced with actual API call
      return mockRecommendations.filter(rec => 
        (selectedStatus === 'all' || rec.status === selectedStatus) &&
        (selectedType === 'all' || rec.recommendationType === selectedType)
      ).sort((a, b) => {
        switch (sortBy) {
          case 'priority': return b.priority - a.priority;
          case 'confidence': return b.confidenceScore - a.confidenceScore;
          case 'date': return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          default: return 0;
        }
      });
    },
    refetchInterval: 30000,
  });

  const { data: stats } = useQuery({
    queryKey: ['recommendation-stats'],
    queryFn: async () => {
      // Mock stats calculation
      const total = mockRecommendations.length;
      const pending = mockRecommendations.filter(r => r.status === 'pending').length;
      const accepted = mockRecommendations.filter(r => r.status === 'accepted').length;
      const implemented = mockRecommendations.filter(r => r.status === 'implemented').length;
      const dismissed = mockRecommendations.filter(r => r.status === 'dismissed').length;
      
      return {
        total,
        pending,
        accepted,
        implemented,
        dismissed,
        avgPriority: mockRecommendations.reduce((sum, r) => sum + r.priority, 0) / total,
        avgConfidence: mockRecommendations.reduce((sum, r) => sum + r.confidenceScore, 0) / total,
        byType: Object.entries(
          mockRecommendations.reduce((acc, rec) => {
            if (!acc[rec.recommendationType]) acc[rec.recommendationType] = [];
            acc[rec.recommendationType].push(rec);
            return acc;
          }, {} as Record<string, Recommendation[]>)
        ).map(([type, recs]) => ({
          type,
          count: recs.length,
          avgPriority: recs.reduce((sum, r) => sum + r.priority, 0) / recs.length,
        })),
      } as RecommendationStats;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ recId, status }: { recId: number; status: string }) => {
      return apiClient.updateRecommendationStatus(recId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-recommendations'] });
      queryClient.invalidateQueries({ queryKey: ['recommendation-stats'] });
    },
  });

  const submitFeedbackMutation = useMutation({
    mutationFn: async ({ recId, score, notes }: { recId: number; score: number; notes?: string }) => {
      return apiClient.submitFeedback(recId, score, notes);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-recommendations'] });
    },
  });

  const handleStatusChange = (recId: number, newStatus: string) => {
    updateStatusMutation.mutate({ recId, status: newStatus });
  };

  const handleFeedback = (recId: number, score: number, notes?: string) => {
    submitFeedbackMutation.mutate({ recId, score, notes });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading recommendations...</p>
        </div>
      </div>
    );
  }

  const getPriorityColor = (priority: number) => {
    if (priority >= 8) return 'text-red-600 bg-red-50 border-l-red-500';
    if (priority >= 6) return 'text-orange-600 bg-orange-50 border-l-orange-500';
    if (priority >= 4) return 'text-yellow-600 bg-yellow-50 border-l-yellow-500';
    return 'text-blue-600 bg-blue-50 border-l-blue-500';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'implemented': return 'bg-green-100 text-green-800';
      case 'dismissed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const uniqueTypes = [...new Set(mockRecommendations.map(r => r.recommendationType))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recommendation Center</h1>
          <p className="text-gray-600">Manage and track improvement recommendations</p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="text-2xl mr-3">📋</div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Recommendations</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="text-2xl mr-3 text-yellow-500">⏳</div>
              <div>
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-2xl font-semibold text-yellow-600">{stats.pending}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="text-2xl mr-3 text-green-500">✅</div>
              <div>
                <p className="text-sm font-medium text-gray-500">Implemented</p>
                <p className="text-2xl font-semibold text-green-600">{stats.implemented}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="text-2xl mr-3 text-blue-500">🎯</div>
              <div>
                <p className="text-sm font-medium text-gray-500">Avg Priority</p>
                <p className="text-2xl font-semibold text-blue-600">{stats.avgPriority.toFixed(1)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="implemented">Implemented</option>
              <option value="dismissed">Dismissed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              {uniqueTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort by</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="priority">Priority</option>
              <option value="confidence">Confidence</option>
              <option value="date">Date</option>
            </select>
          </div>
        </div>
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        {recommendations && recommendations.length > 0 ? (
          recommendations.map((rec) => (
            <div key={rec.id} className={`border-l-4 rounded-lg p-6 bg-white shadow ${getPriorityColor(rec.priority)}`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{rec.title}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(rec.status)}`}>
                      {rec.status}
                    </span>
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                      {rec.recommendationType}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-3">{rec.description}</p>
                  <div className="flex items-center space-x-6 text-sm text-gray-600">
                    <span>Script #{rec.scriptId}</span>
                    <span>Priority: {rec.priority}/10</span>
                    <span>Confidence: {rec.confidenceScore.toFixed(1)}%</span>
                    <span>{new Date(rec.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  {rec.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleStatusChange(rec.id, 'accepted')}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                        disabled={updateStatusMutation.isPending}
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleStatusChange(rec.id, 'dismissed')}
                        className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                        disabled={updateStatusMutation.isPending}
                      >
                        Dismiss
                      </button>
                    </>
                  )}
                  {rec.status === 'accepted' && (
                    <button
                      onClick={() => handleStatusChange(rec.id, 'implemented')}
                      className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                      disabled={updateStatusMutation.isPending}
                    >
                      Mark Implemented
                    </button>
                  )}
                </div>
                
                {/* Feedback Section */}
                {rec.status === 'implemented' && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Rate:</span>
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => handleFeedback(rec.id, rating)}
                        className={`text-lg ${
                          rec.feedbackScore && rec.feedbackScore >= rating 
                            ? 'text-yellow-500' 
                            : 'text-gray-300 hover:text-yellow-400'
                        }`}
                        disabled={submitFeedbackMutation.isPending}
                      >
                        ⭐
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">✨</div>
            <h3 className="text-lg font-semibold text-gray-700">No Recommendations Found</h3>
            <p className="text-gray-500">Try adjusting your filters or check back later.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Mock data for development
const mockRecommendations: Recommendation[] = [
  {
    id: 1,
    scriptId: 101,
    recommendationType: 'Performance',
    priority: 9,
    title: 'Optimize Database Query',
    description: 'The main query in getUserData() is scanning the entire users table. Consider adding an index on the email column.',
    status: 'pending',
    confidenceScore: 92.5,
    createdAt: '2024-01-15T10:30:00Z',
  },
  {
    id: 2,
    scriptId: 102,
    recommendationType: 'Security',
    priority: 8,
    title: 'Add Input Validation',
    description: 'User input is not being sanitized before database insertion. This could lead to SQL injection vulnerabilities.',
    status: 'accepted',
    confidenceScore: 88.3,
    createdAt: '2024-01-14T14:20:00Z',
  },
  {
    id: 3,
    scriptId: 103,
    recommendationType: 'Code Quality',
    priority: 6,
    title: 'Refactor Large Function',
    description: 'The processData() function is 150 lines long. Consider breaking it into smaller, more focused functions.',
    status: 'implemented',
    confidenceScore: 76.8,
    createdAt: '2024-01-13T09:15:00Z',
    feedbackScore: 4,
  },
  {
    id: 4,
    scriptId: 104,
    recommendationType: 'Documentation',
    priority: 4,
    title: 'Add Function Documentation',
    description: 'Several public functions lack proper documentation. Consider adding JSDoc comments.',
    status: 'dismissed',
    confidenceScore: 65.2,
    createdAt: '2024-01-12T16:45:00Z',
  },
];