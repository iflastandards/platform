/**
 * Advanced Analytics API Routes (Phase 3)
 * Real-time analytics endpoints with WebSocket support
 */

import { Router, type Request, type Response } from 'express';
import { WebSocketServer, type WebSocket } from 'ws';
import { ScriptInventory } from '../../core/script-inventory';
import { MetricsCalculator } from '../../analytics/metrics-calculator';
import { MLQualityScorer } from '../../analytics/ml-quality-scorer';
import { RiskAssessor } from '../../analytics/risk-assessor';
import { RecommendationEngine } from '../../analytics/recommendation-engine';
import type { Script } from '../../types';

export interface AnalyticsRouteOptions {
  inventory: ScriptInventory;
  enableWebSocket?: boolean;
  port?: number;
}

export class AnalyticsRouter {
  private router: Router;
  private inventory: ScriptInventory;
  private metricsCalculator: MetricsCalculator;
  private mlScorer: MLQualityScorer;
  private riskAssessor: RiskAssessor;
  private recommendationEngine: RecommendationEngine;
  private wss?: WebSocketServer;
  private clients: Set<WebSocket> = new Set();

  constructor(options: AnalyticsRouteOptions) {
    this.router = Router();
    this.inventory = options.inventory;

    // Initialize analytics components
    this.metricsCalculator = new MetricsCalculator(this.inventory.getDatabase());
    this.mlScorer = new MLQualityScorer(this.inventory.getDatabase(), this.metricsCalculator);
    this.riskAssessor = new RiskAssessor(this.inventory.getDatabase(), this.metricsCalculator, this.mlScorer);
    this.recommendationEngine = new RecommendationEngine(
      this.inventory.getDatabase(), 
      this.metricsCalculator, 
      this.mlScorer, 
      this.riskAssessor
    );

    this.setupRoutes();
    
    if (options.enableWebSocket) {
      this.setupWebSocket(options.port);
    }
  }

  /**
   * Set up all analytics routes
   */
  private setupRoutes(): void {
    // Dashboard overview
    this.router.get('/dashboard', this.getDashboardData.bind(this));
    this.router.get('/dashboard/realtime', this.getRealtimeData.bind(this));

    // Script metrics
    this.router.get('/scripts/:id/metrics', this.getScriptMetrics.bind(this));
    this.router.get('/scripts/:id/analyze', this.analyzeScript.bind(this));
    this.router.post('/scripts/:id/metrics/calculate', this.calculateMetrics.bind(this));

    // ML predictions
    this.router.get('/scripts/:id/predictions', this.getScriptPredictions.bind(this));
    this.router.post('/scripts/:id/predict', this.predictScriptQuality.bind(this));
    this.router.post('/ml/train', this.trainMLModels.bind(this));
    this.router.get('/ml/status', this.getMLStatus.bind(this));

    // Risk assessment
    this.router.get('/scripts/:id/risks', this.getScriptRisks.bind(this));
    this.router.post('/scripts/:id/assess-risk', this.assessScriptRisk.bind(this));
    this.router.get('/risks/summary', this.getRiskSummary.bind(this));
    this.router.put('/risks/:riskId/status', this.updateRiskStatus.bind(this));

    // Recommendations
    this.router.get('/scripts/:id/recommendations', this.getScriptRecommendations.bind(this));
    this.router.post('/scripts/:id/generate-recommendations', this.generateRecommendations.bind(this));
    this.router.put('/recommendations/:recId/feedback', this.submitRecommendationFeedback.bind(this));
    this.router.put('/recommendations/:recId/status', this.updateRecommendationStatus.bind(this));

    // Analytics aggregations
    this.router.get('/metrics/trends', this.getMetricTrends.bind(this));
    this.router.get('/quality/overview', this.getQualityOverview.bind(this));
    this.router.get('/performance/insights', this.getPerformanceInsights.bind(this));

    // Batch operations
    this.router.post('/batch/analyze', this.batchAnalyze.bind(this));
    this.router.post('/batch/predict', this.batchPredict.bind(this));
    this.router.post('/batch/recommend', this.batchRecommend.bind(this));

    // Export endpoints
    this.router.get('/export/metrics', this.exportMetrics.bind(this));
    this.router.get('/export/risks', this.exportRisks.bind(this));
    this.router.get('/export/recommendations', this.exportRecommendations.bind(this));
  }

  /**
   * Dashboard Data Endpoints
   */
  private async getDashboardData(req: Request, res: Response): Promise<void> {
    try {
      const db = this.inventory.getDatabase();
      
      // Get overview statistics
      const totalScripts = await db.get('SELECT COUNT(*) as count FROM scripts');
      const highRiskScripts = await db.get(`
        SELECT COUNT(DISTINCT script_id) as count 
        FROM script_risks 
        WHERE risk_level >= 4 AND status IN ('open', 'acknowledged')
      `);
      
      const pendingRecommendations = await db.get(`
        SELECT COUNT(*) as count 
        FROM recommendations 
        WHERE status = 'pending' AND priority >= 3
      `);

      // Get quality distribution
      const qualityDistribution = await db.all(`
        SELECT 
          CASE 
            WHEN avg_quality_score >= 0.8 THEN 'excellent'
            WHEN avg_quality_score >= 0.6 THEN 'good' 
            WHEN avg_quality_score >= 0.4 THEN 'fair'
            ELSE 'poor'
          END as quality_level,
          COUNT(*) as count
        FROM v_script_quality
        GROUP BY quality_level
      `);

      // Get recent trends
      const recentRisks = await db.all(`
        SELECT risk_type, risk_category, COUNT(*) as count
        FROM script_risks 
        WHERE created_at > datetime('now', '-7 days')
        GROUP BY risk_type, risk_category
        ORDER BY count DESC
        LIMIT 10
      `);

      // Get top recommendations
      const topRecommendations = await db.all(`
        SELECT recommendation_type, COUNT(*) as count, AVG(priority) as avg_priority
        FROM recommendations 
        WHERE status = 'pending' AND created_at > datetime('now', '-30 days')
        GROUP BY recommendation_type
        ORDER BY count DESC, avg_priority DESC
        LIMIT 5
      `);

      res.json({
        timestamp: new Date().toISOString(),
        overview: {
          totalScripts: totalScripts?.count || 0,
          highRiskScripts: highRiskScripts?.count || 0,
          pendingRecommendations: pendingRecommendations?.count || 0,
          avgQualityScore: await this.calculateAverageQuality()
        },
        qualityDistribution,
        recentTrends: {
          risks: recentRisks,
          recommendations: topRecommendations
        }
      });

      // Broadcast to WebSocket clients
      this.broadcastUpdate('dashboard', { overview: true });

    } catch (error) {
      res.status(500).json({
        error: 'Failed to fetch dashboard data',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  }

  private async getRealtimeData(req: Request, res: Response): Promise<void> {
    // Set up Server-Sent Events for real-time updates
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const sendUpdate = async () => {
      try {
        const recentActivity = await this.inventory.getDatabase().all(`
          SELECT 'risk' as type, script_id, created_at, description 
          FROM script_risks 
          WHERE created_at > datetime('now', '-1 hour')
          UNION ALL
          SELECT 'recommendation' as type, script_id, created_at, title as description
          FROM recommendations 
          WHERE created_at > datetime('now', '-1 hour')
          ORDER BY created_at DESC
          LIMIT 10
        `);

        res.write(`data: ${JSON.stringify({ recentActivity, timestamp: new Date().toISOString() })}\n\n`);
      } catch (error) {
        console.error('Real-time data error:', error);
      }
    };

    // Send initial data
    await sendUpdate();

    // Send updates every 30 seconds
    const interval = setInterval(sendUpdate, 30000);

    req.on('close', () => {
      clearInterval(interval);
    });
  }

  /**
   * Script Analysis Endpoints
   */
  private async getScriptMetrics(req: Request, res: Response): Promise<void> {
    try {
      const scriptId = parseInt(req.params.id);
      const metricTypes = req.query.types as string | undefined;
      
      const types = metricTypes ? metricTypes.split(',') : undefined;
      const metrics = await this.metricsCalculator.getScriptMetrics(scriptId, types);
      
      res.json({ scriptId, metrics });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to fetch script metrics',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  }

  private async analyzeScript(req: Request, res: Response): Promise<void> {
    try {
      const scriptId = parseInt(req.params.id);
      const script = await this.getScriptById(scriptId);
      
      if (!script) {
        res.status(404).json({ error: 'Script not found' });
        return;
      }

      // Parallel analysis
      const [metrics, risks, predictions, recommendations] = await Promise.all([
        this.metricsCalculator.calculateAllMetrics(script),
        this.riskAssessor.assessScriptRisk(script),
        this.mlScorer.predictQuality(script),
        this.recommendationEngine.generateRecommendations(script)
      ]);

      // Store results
      await Promise.all([
        this.metricsCalculator.storeMetrics(metrics),
        this.riskAssessor.storeRisks(risks.risks),
        this.mlScorer.storePredictions(predictions),
        this.recommendationEngine.storeRecommendations(recommendations)
      ]);

      res.json({
        scriptId,
        analysis: {
          metrics: metrics.length,
          risks: risks.risks.length,
          predictions: predictions.length,
          recommendations: recommendations.length,
          overallRiskScore: risks.overallRiskScore,
          riskProfile: risks.riskProfile
        },
        timestamp: new Date().toISOString()
      });

      // Broadcast analysis completion
      this.broadcastUpdate('analysis', { scriptId, completed: true });

    } catch (error) {
      res.status(500).json({
        error: 'Script analysis failed',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  }

  private async calculateMetrics(req: Request, res: Response): Promise<void> {
    try {
      const scriptId = parseInt(req.params.id);
      const script = await this.getScriptById(scriptId);
      
      if (!script) {
        res.status(404).json({ error: 'Script not found' });
        return;
      }

      const metrics = await this.metricsCalculator.calculateAllMetrics(script);
      await this.metricsCalculator.storeMetrics(metrics);
      
      res.json({ 
        scriptId, 
        metricsCalculated: metrics.length, 
        timestamp: new Date().toISOString() 
      });
    } catch (error) {
      res.status(500).json({
        error: 'Metric calculation failed',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * ML Prediction Endpoints
   */
  private async getScriptPredictions(req: Request, res: Response): Promise<void> {
    try {
      const scriptId = parseInt(req.params.id);
      const predictions = await this.mlScorer.getPredictions(scriptId);
      
      res.json({ scriptId, predictions });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to fetch predictions',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  }

  private async predictScriptQuality(req: Request, res: Response): Promise<void> {
    try {
      const scriptId = parseInt(req.params.id);
      const script = await this.getScriptById(scriptId);
      
      if (!script) {
        res.status(404).json({ error: 'Script not found' });
        return;
      }

      const predictions = await this.mlScorer.predictQuality(script);
      await this.mlScorer.storePredictions(predictions);
      
      res.json({ scriptId, predictions });
    } catch (error) {
      res.status(500).json({
        error: 'Quality prediction failed',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  }

  private async trainMLModels(req: Request, res: Response): Promise<void> {
    try {
      console.log('Starting ML model training...');
      await this.mlScorer.trainModels();
      
      res.json({ 
        message: 'ML models trained successfully', 
        timestamp: new Date().toISOString() 
      });
    } catch (error) {
      res.status(500).json({
        error: 'ML training failed',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  }

  private async getMLStatus(req: Request, res: Response): Promise<void> {
    try {
      const featureImportance = this.mlScorer.getFeatureImportance();
      
      res.json({
        status: 'operational',
        modelVersion: '3.0.0',
        featureImportance: Object.fromEntries(featureImportance),
        lastTrained: new Date().toISOString() // Would be stored in actual implementation
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to get ML status',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * Risk Assessment Endpoints
   */
  private async getScriptRisks(req: Request, res: Response): Promise<void> {
    try {
      const scriptId = parseInt(req.params.id);
      const status = req.query.status as string | undefined;
      const statusFilter = status ? status.split(',') : undefined;
      
      const risks = await this.riskAssessor.getScriptRisks(scriptId, statusFilter);
      
      res.json({ scriptId, risks });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to fetch script risks',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  }

  private async assessScriptRisk(req: Request, res: Response): Promise<void> {
    try {
      const scriptId = parseInt(req.params.id);
      const script = await this.getScriptById(scriptId);
      
      if (!script) {
        res.status(404).json({ error: 'Script not found' });
        return;
      }

      const assessment = await this.riskAssessor.assessScriptRisk(script);
      await this.riskAssessor.storeRisks(assessment.risks);
      
      res.json({ scriptId, assessment });
    } catch (error) {
      res.status(500).json({
        error: 'Risk assessment failed',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  }

  private async getRiskSummary(req: Request, res: Response): Promise<void> {
    try {
      const riskSummary = await this.inventory.getDatabase().all(`
        SELECT * FROM v_risk_dashboard
        ORDER BY risk_count DESC
      `);
      
      res.json({ riskSummary });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to fetch risk summary',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  }

  private async updateRiskStatus(req: Request, res: Response): Promise<void> {
    try {
      const riskId = parseInt(req.params.riskId);
      const { status, assignedTo } = req.body;
      
      const db = this.inventory.getDatabase();
      await db.run(`
        UPDATE script_risks 
        SET status = ?, assigned_to = ?, updated_at = datetime('now')
        WHERE id = ?
      `, [status, assignedTo, riskId]);
      
      res.json({ riskId, status: 'updated' });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to update risk status',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * Recommendation Endpoints
   */
  private async getScriptRecommendations(req: Request, res: Response): Promise<void> {
    try {
      const scriptId = parseInt(req.params.id);
      const status = req.query.status as string | undefined;
      const statusFilter = status ? status.split(',') : undefined;
      
      const recommendations = await this.recommendationEngine.getScriptRecommendations(scriptId, statusFilter);
      
      res.json({ scriptId, recommendations });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to fetch recommendations',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  }

  private async generateRecommendations(req: Request, res: Response): Promise<void> {
    try {
      const scriptId = parseInt(req.params.id);
      const script = await this.getScriptById(scriptId);
      
      if (!script) {
        res.status(404).json({ error: 'Script not found' });
        return;
      }

      const recommendations = await this.recommendationEngine.generateRecommendations(script);
      await this.recommendationEngine.storeRecommendations(recommendations);
      
      res.json({ scriptId, recommendations });
    } catch (error) {
      res.status(500).json({
        error: 'Recommendation generation failed',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  }

  private async submitRecommendationFeedback(req: Request, res: Response): Promise<void> {
    try {
      const recId = parseInt(req.params.recId);
      const { feedbackScore, feedbackNotes } = req.body;
      
      const db = this.inventory.getDatabase();
      await db.run(`
        UPDATE recommendations 
        SET feedback_score = ?, feedback_notes = ?, updated_at = datetime('now')
        WHERE id = ?
      `, [feedbackScore, feedbackNotes, recId]);
      
      res.json({ recId, status: 'feedback_recorded' });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to submit feedback',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  }

  private async updateRecommendationStatus(req: Request, res: Response): Promise<void> {
    try {
      const recId = parseInt(req.params.recId);
      const { status } = req.body;
      
      const db = this.inventory.getDatabase();
      const updateFields = ['status = ?', 'updated_at = datetime("now")'];
      const params = [status];
      
      if (status === 'implemented') {
        updateFields.push('implemented_at = datetime("now")');
      }
      
      params.push(recId);
      
      await db.run(`
        UPDATE recommendations 
        SET ${updateFields.join(', ')}
        WHERE id = ?
      `, params);
      
      res.json({ recId, status: 'updated' });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to update recommendation status',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * Batch Operation Endpoints
   */
  private async batchAnalyze(req: Request, res: Response): Promise<void> {
    try {
      const { scriptIds, analysisTypes } = req.body;
      const results = [];
      
      for (const scriptId of scriptIds) {
        const script = await this.getScriptById(scriptId);
        if (!script) continue;
        
        const result = { scriptId, completed: [] as string[], errors: [] as string[] };
        
        try {
          if (!analysisTypes || analysisTypes.includes('metrics')) {
            const metrics = await this.metricsCalculator.calculateAllMetrics(script);
            await this.metricsCalculator.storeMetrics(metrics);
            result.completed.push('metrics');
          }
          
          if (!analysisTypes || analysisTypes.includes('risks')) {
            const risks = await this.riskAssessor.assessScriptRisk(script);
            await this.riskAssessor.storeRisks(risks.risks);
            result.completed.push('risks');
          }
          
          if (!analysisTypes || analysisTypes.includes('recommendations')) {
            const recommendations = await this.recommendationEngine.generateRecommendations(script);
            await this.recommendationEngine.storeRecommendations(recommendations);
            result.completed.push('recommendations');
          }
        } catch (error) {
          result.errors.push(error instanceof Error ? error.message : String(error));
        }
        
        results.push(result);
      }
      
      res.json({ results, timestamp: new Date().toISOString() });
    } catch (error) {
      res.status(500).json({
        error: 'Batch analysis failed',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * Helper Methods
   */
  private async getScriptById(id: number): Promise<Script | null> {
    const db = this.inventory.getDatabase();
    const row = await db.get('SELECT * FROM scripts WHERE id = ?', [id]);
    return row ? this.mapRowToScript(row) : null;
  }

  private mapRowToScript(row: any): Script {
    return {
      id: row.id,
      path: row.path,
      name: row.name,
      type: row.type,
      purpose: row.purpose,
      fileHash: row.file_hash,
      fileSize: row.file_size,
      isCli: row.is_cli === 1,
      isTest: row.is_test === 1,
      isDeprecated: row.is_deprecated === 1,
      hasHelpOption: row.has_help_option === 1,
      hasManOption: row.has_man_option === 1,
      docScore: row.doc_score,
      lastModified: row.last_modified ? new Date(row.last_modified) : undefined,
      lastAnalyzed: row.last_analyzed ? new Date(row.last_analyzed) : undefined
    };
  }

  private async calculateAverageQuality(): Promise<number> {
    const result = await this.inventory.getDatabase().get(`
      SELECT AVG(doc_score) as avg_score FROM scripts WHERE doc_score > 0
    `);
    return (result?.avg_score || 0) / 100; // Convert to 0-1 scale
  }

  /**
   * WebSocket Setup and Broadcasting
   */
  private setupWebSocket(port?: number): void {
    this.wss = new WebSocketServer({ port: port || 3002 });
    
    this.wss.on('connection', (ws: WebSocket) => {
      this.clients.add(ws);
      console.log('Analytics WebSocket client connected');
      
      ws.on('close', () => {
        this.clients.delete(ws);
        console.log('Analytics WebSocket client disconnected');
      });
      
      // Send initial connection message
      ws.send(JSON.stringify({
        type: 'connection',
        timestamp: new Date().toISOString(),
        message: 'Connected to Analytics WebSocket'
      }));
    });
  }

  private broadcastUpdate(type: string, data: any): void {
    if (!this.wss || this.clients.size === 0) return;
    
    const message = JSON.stringify({
      type,
      timestamp: new Date().toISOString(),
      data
    });
    
    this.clients.forEach(client => {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(message);
      }
    });
  }

  // Export all missing methods that are referenced but not implemented
  private async batchPredict(req: Request, res: Response): Promise<void> {
    // Implementation for batch predictions
    res.status(501).json({ error: 'Not implemented yet' });
  }

  private async batchRecommend(req: Request, res: Response): Promise<void> {
    // Implementation for batch recommendations
    res.status(501).json({ error: 'Not implemented yet' });
  }

  private async getMetricTrends(req: Request, res: Response): Promise<void> {
    // Implementation for metric trends
    res.status(501).json({ error: 'Not implemented yet' });
  }

  private async getQualityOverview(req: Request, res: Response): Promise<void> {
    // Implementation for quality overview
    res.status(501).json({ error: 'Not implemented yet' });
  }

  private async getPerformanceInsights(req: Request, res: Response): Promise<void> {
    // Implementation for performance insights
    res.status(501).json({ error: 'Not implemented yet' });
  }

  private async exportMetrics(req: Request, res: Response): Promise<void> {
    // Implementation for metrics export
    res.status(501).json({ error: 'Not implemented yet' });
  }

  private async exportRisks(req: Request, res: Response): Promise<void> {
    // Implementation for risks export
    res.status(501).json({ error: 'Not implemented yet' });
  }

  private async exportRecommendations(req: Request, res: Response): Promise<void> {
    // Implementation for recommendations export
    res.status(501).json({ error: 'Not implemented yet' });
  }

  getRouter(): Router {
    return this.router;
  }

  getWebSocketServer(): WebSocketServer | undefined {
    return this.wss;
  }
}

// Factory function for easy integration
export function analyticsRoutes(inventory: ScriptInventory, options: { enableWebSocket?: boolean; port?: number } = {}): Router {
  const analyticsRouter = new AnalyticsRouter({
    inventory,
    enableWebSocket: options.enableWebSocket,
    port: options.port
  });
  
  return analyticsRouter.getRouter();
}

export default analyticsRoutes;