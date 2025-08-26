/**
 * Analytics API Client
 */

const BASE_URL = 'http://localhost:3001/api/v3/analytics';

export interface DashboardData {
  timestamp: string;
  overview: {
    totalScripts: number;
    highRiskScripts: number;
    pendingRecommendations: number;
    avgQualityScore: number;
  };
  qualityDistribution: Array<{
    quality_level: string;
    count: number;
  }>;
  recentTrends: {
    risks: Array<{
      risk_type: string;
      risk_category: string;
      count: number;
    }>;
    recommendations: Array<{
      recommendation_type: string;
      count: number;
      avg_priority: number;
    }>;
  };
}

export interface ScriptMetrics {
  scriptId: number;
  metrics: Array<{
    metricType: string;
    metricName: string;
    value: number;
    maxValue?: number;
    recordedAt: string;
  }>;
}

export interface ScriptRisks {
  scriptId: number;
  risks: Array<{
    id: number;
    riskType: string;
    riskLevel: number;
    riskCategory: string;
    description: string;
    status: string;
    createdAt: string;
  }>;
}

export interface ScriptRecommendations {
  scriptId: number;
  recommendations: Array<{
    id: number;
    recommendationType: string;
    priority: number;
    title: string;
    description: string;
    status: string;
    confidenceScore: number;
  }>;
}

class AnalyticsApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Dashboard endpoints
  async fetchDashboardData(): Promise<DashboardData> {
    return this.request<DashboardData>('/dashboard');
  }

  async fetchRealtimeData(): Promise<any> {
    return this.request('/dashboard/realtime');
  }

  // Script analysis endpoints
  async fetchScriptMetrics(scriptId: number, types?: string[]): Promise<ScriptMetrics> {
    const query = types ? `?types=${types.join(',')}` : '';
    return this.request<ScriptMetrics>(`/scripts/${scriptId}/metrics${query}`);
  }

  async analyzeScript(scriptId: number): Promise<any> {
    return this.request(`/scripts/${scriptId}/analyze`);
  }

  async calculateMetrics(scriptId: number): Promise<any> {
    return this.request(`/scripts/${scriptId}/metrics/calculate`, {
      method: 'POST',
    });
  }

  // ML and predictions
  async fetchPredictions(scriptId: number): Promise<any> {
    return this.request(`/scripts/${scriptId}/predictions`);
  }

  async predictQuality(scriptId: number): Promise<any> {
    return this.request(`/scripts/${scriptId}/predict`, {
      method: 'POST',
    });
  }

  async trainMLModels(): Promise<any> {
    return this.request('/ml/train', {
      method: 'POST',
    });
  }

  async getMLStatus(): Promise<any> {
    return this.request('/ml/status');
  }

  // Risk assessment
  async fetchScriptRisks(scriptId: number, status?: string[]): Promise<ScriptRisks> {
    const query = status ? `?status=${status.join(',')}` : '';
    return this.request<ScriptRisks>(`/scripts/${scriptId}/risks${query}`);
  }

  async assessRisk(scriptId: number): Promise<any> {
    return this.request(`/scripts/${scriptId}/assess-risk`, {
      method: 'POST',
    });
  }

  async getRiskSummary(): Promise<any> {
    return this.request('/risks/summary');
  }

  async updateRiskStatus(riskId: number, status: string, assignedTo?: string): Promise<any> {
    return this.request(`/risks/${riskId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, assignedTo }),
    });
  }

  // Recommendations
  async fetchRecommendations(scriptId: number, status?: string[]): Promise<ScriptRecommendations> {
    const query = status ? `?status=${status.join(',')}` : '';
    return this.request<ScriptRecommendations>(`/scripts/${scriptId}/recommendations${query}`);
  }

  async generateRecommendations(scriptId: number): Promise<any> {
    return this.request(`/scripts/${scriptId}/generate-recommendations`, {
      method: 'POST',
    });
  }

  async submitFeedback(recId: number, feedbackScore: number, feedbackNotes?: string): Promise<any> {
    return this.request(`/recommendations/${recId}/feedback`, {
      method: 'PUT',
      body: JSON.stringify({ feedbackScore, feedbackNotes }),
    });
  }

  async updateRecommendationStatus(recId: number, status: string): Promise<any> {
    return this.request(`/recommendations/${recId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Batch operations
  async batchAnalyze(scriptIds: number[], analysisTypes?: string[]): Promise<any> {
    return this.request('/batch/analyze', {
      method: 'POST',
      body: JSON.stringify({ scriptIds, analysisTypes }),
    });
  }
}

// Create singleton instance
const apiClient = new AnalyticsApiClient();

// Export individual functions for use with React Query
export const fetchDashboardData = () => apiClient.fetchDashboardData();
export const fetchRealtimeData = () => apiClient.fetchRealtimeData();
export const fetchScriptMetrics = (scriptId: number, types?: string[]) => 
  apiClient.fetchScriptMetrics(scriptId, types);
export const analyzeScript = (scriptId: number) => apiClient.analyzeScript(scriptId);
export const fetchScriptRisks = (scriptId: number, status?: string[]) => 
  apiClient.fetchScriptRisks(scriptId, status);
export const fetchRecommendations = (scriptId: number, status?: string[]) => 
  apiClient.fetchRecommendations(scriptId, status);
export const getRiskSummary = () => apiClient.getRiskSummary();
export const getMLStatus = () => apiClient.getMLStatus();

export default apiClient;