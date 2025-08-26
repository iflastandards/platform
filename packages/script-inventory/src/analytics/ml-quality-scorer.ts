/**
 * ML-Based Quality Scoring System
 * Uses machine learning models to predict and score script quality
 */

// Using simple-statistics for ML functionality
import * as ss from 'simple-statistics';
import { ScriptDatabase } from '../database/connection';
import { MetricsCalculator } from './metrics-calculator';
import type { Script } from '../types';

export interface QualityPrediction {
  scriptId: number;
  predictionType: 'quality_risk' | 'maintenance_required' | 'deprecation_candidate';
  predictedValue: number; // 0-1 scale
  confidenceScore: number; // 0-1 scale
  modelVersion: string;
  featuresUsed: string[];
  expiresAt: Date;
}

export interface ModelFeatures {
  // Static features from code analysis
  linesOfCode: number;
  cyclomaticComplexity: number;
  commentDensity: number;
  functionCount: number;
  dependencyCount: number;
  
  // Quality indicators
  hasDocumentation: number; // 0 or 1
  hasTests: number; // 0 or 1
  hasErrorHandling: number; // 0 or 1
  
  // Historical features
  ageInDays: number;
  changeFrequency: number; // changes per month
  bugReportCount: number;
  
  // Contextual features
  fileSize: number;
  isCliScript: number; // 0 or 1
  isTestScript: number; // 0 or 1
}

export interface TrainingData {
  features: ModelFeatures;
  qualityScore: number; // 0-1, actual quality score
  riskLevel: number; // 0-1, historical risk level
  maintenanceNeeded: number; // 0 or 1, binary outcome
}

export class MLQualityScorer {
  private db: ScriptDatabase;
  private metricsCalculator: MetricsCalculator;
  private qualityModel?: { predict: (features: number[]) => number; r2: number };
  private riskModel?: { predict: (features: number[]) => number; r2: number };
  private maintenanceModel?: { predict: (x: number) => number; r2: number };
  private modelVersion = '3.0.0';
  
  // Feature weights learned from training
  private featureWeights: Map<string, number> = new Map();

  constructor(db: ScriptDatabase, metricsCalculator: MetricsCalculator) {
    this.db = db;
    this.metricsCalculator = metricsCalculator;
    this.initializeFeatureWeights();
  }

  /**
   * Initialize default feature weights (can be overridden by training)
   */
  private initializeFeatureWeights(): void {
    this.featureWeights.set('hasDocumentation', 0.25);
    this.featureWeights.set('hasTests', 0.20);
    this.featureWeights.set('hasErrorHandling', 0.15);
    this.featureWeights.set('cyclomaticComplexity', -0.10); // negative weight
    this.featureWeights.set('commentDensity', 0.15);
    this.featureWeights.set('dependencyCount', -0.05); // too many deps is bad
    this.featureWeights.set('changeFrequency', -0.08); // high churn is risky
    this.featureWeights.set('ageInDays', -0.02); // older scripts might need attention
    this.featureWeights.set('linesOfCode', -0.05); // complexity penalty
  }

  /**
   * Train ML models with historical data
   */
  async trainModels(): Promise<void> {
    console.log('🤖 Training ML quality models...');
    
    const trainingData = await this.collectTrainingData();
    
    if (trainingData.length < 10) {
      console.warn('⚠️ Not enough training data, using rule-based scoring');
      return;
    }

    // Prepare data for different models
    const qualityData = this.prepareQualityTrainingData(trainingData);
    const riskData = this.prepareRiskTrainingData(trainingData);
    const maintenanceData = this.prepareMaintenanceTrainingData(trainingData);

    // Train quality prediction model using simple linear regression
    if (qualityData.features.length > 0) {
      const compositeFeatures = qualityData.features.map(f => 
        f[0] * 0.2 + f[1] * 0.3 + f[2] * 0.2 + f[5] * 0.3 // weighted combination
      );
      const regression = ss.linearRegression(compositeFeatures.map((x, i) => [x, qualityData.outputs[i]]));
      this.qualityModel = {
        predict: (features: number[]) => {
          const composite = features[0] * 0.2 + features[1] * 0.3 + features[2] * 0.2 + features[5] * 0.3;
          return regression.m * composite + regression.b;
        },
        r2: ss.rSquared(compositeFeatures.map((x, i) => [x, qualityData.outputs[i]]), regression)
      };
      console.log(`✅ Quality model trained with ${qualityData.features.length} samples, R² = ${this.qualityModel.r2.toFixed(3)}`);
    }

    // Train risk prediction model
    if (riskData.features.length > 0) {
      const riskComposite = riskData.features.map(f => 
        f[1] * 0.4 + f[3] * 0.2 + f[9] * 0.2 + f[10] * 0.2 // complexity, functions, age, bugs
      );
      const riskRegression = ss.linearRegression(riskComposite.map((x, i) => [x, riskData.outputs[i]]));
      this.riskModel = {
        predict: (features: number[]) => {
          const composite = features[1] * 0.4 + features[3] * 0.2 + features[9] * 0.2 + features[10] * 0.2;
          return riskRegression.m * composite + riskRegression.b;
        },
        r2: ss.rSquared(riskComposite.map((x, i) => [x, riskData.outputs[i]]), riskRegression)
      };
      console.log(`✅ Risk model trained with ${riskData.features.length} samples, R² = ${this.riskModel.r2.toFixed(3)}`);
    }

    // Train maintenance prediction model
    if (maintenanceData.x.length > 0) {
      const maintenanceRegression = ss.linearRegression(maintenanceData.x.map((x, i) => [x, maintenanceData.y[i]]));
      this.maintenanceModel = {
        predict: (x: number) => maintenanceRegression.m * x + maintenanceRegression.b,
        r2: ss.rSquared(maintenanceData.x.map((x, i) => [x, maintenanceData.y[i]]), maintenanceRegression)
      };
      console.log(`✅ Maintenance model trained with ${maintenanceData.x.length} samples, R² = ${this.maintenanceModel.r2.toFixed(3)}`);
    }

    // Update feature weights based on model coefficients
    this.updateFeatureWeights();
    
    console.log('🎯 ML model training completed');
  }

  /**
   * Predict quality score for a script
   */
  async predictQuality(script: Script): Promise<QualityPrediction[]> {
    const features = await this.extractFeatures(script);
    const predictions: QualityPrediction[] = [];
    
    // Quality risk prediction
    const qualityRisk = await this.predictQualityRisk(script, features);
    if (qualityRisk) {
      predictions.push(qualityRisk);
    }
    
    // Maintenance requirement prediction
    const maintenanceRequired = await this.predictMaintenanceRequired(script, features);
    if (maintenanceRequired) {
      predictions.push(maintenanceRequired);
    }
    
    // Deprecation candidate prediction
    const deprecationCandidate = await this.predictDeprecationCandidate(script, features);
    if (deprecationCandidate) {
      predictions.push(deprecationCandidate);
    }
    
    return predictions;
  }

  /**
   * Predict quality risk (0 = low risk, 1 = high risk)
   */
  private async predictQualityRisk(script: Script, features: ModelFeatures): Promise<QualityPrediction | null> {
    let predictedValue: number;
    let confidence: number;
    const featuresUsed: string[] = [];

    if (this.qualityModel) {
      // Use trained ML model
      const featureArray = this.featuresToArray(features);
      featuresUsed.push(...Object.keys(features));
      
      predictedValue = this.qualityModel.predict([featureArray])[0];
      confidence = this.calculateModelConfidence(featureArray);
    } else {
      // Use rule-based scoring
      predictedValue = this.ruleBasedQualityRisk(features);
      confidence = 0.7; // Lower confidence for rule-based
      featuresUsed.push('hasDocumentation', 'hasTests', 'cyclomaticComplexity');
    }

    // Normalize to 0-1 range and clamp
    predictedValue = Math.max(0, Math.min(1, predictedValue));
    
    // Set expiration (predictions valid for 7 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    return {
      scriptId: script.id!,
      predictionType: 'quality_risk',
      predictedValue,
      confidenceScore: confidence,
      modelVersion: this.modelVersion,
      featuresUsed,
      expiresAt
    };
  }

  /**
   * Predict maintenance requirement (0 = no maintenance, 1 = needs maintenance)
   */
  private async predictMaintenanceRequired(script: Script, features: ModelFeatures): Promise<QualityPrediction | null> {
    let predictedValue: number;
    let confidence: number;
    const featuresUsed: string[] = [];

    if (this.maintenanceModel) {
      // Use composite feature for simple linear regression
      const compositeFeature = features.cyclomaticComplexity * 0.3 + 
                              features.ageInDays * 0.0001 + 
                              features.changeFrequency * 0.4;
      
      predictedValue = this.maintenanceModel.predict(compositeFeature);
      confidence = this.maintenanceModel.r2 || 0.6;
      featuresUsed.push('cyclomaticComplexity', 'ageInDays', 'changeFrequency');
    } else {
      // Rule-based maintenance prediction
      predictedValue = this.ruleBasedMaintenanceNeeded(features);
      confidence = 0.65;
      featuresUsed.push('ageInDays', 'bugReportCount', 'hasTests');
    }

    predictedValue = Math.max(0, Math.min(1, predictedValue));
    
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 14); // Valid for 2 weeks

    return {
      scriptId: script.id!,
      predictionType: 'maintenance_required',
      predictedValue,
      confidenceScore: confidence,
      modelVersion: this.modelVersion,
      featuresUsed,
      expiresAt
    };
  }

  /**
   * Predict deprecation candidate (0 = keep, 1 = candidate for deprecation)
   */
  private async predictDeprecationCandidate(script: Script, features: ModelFeatures): Promise<QualityPrediction | null> {
    // Rule-based deprecation prediction (could be ML in future)
    let score = 0;
    
    // High age penalty
    if (features.ageInDays > 365) score += 0.3;
    if (features.ageInDays > 730) score += 0.2;
    
    // Low usage penalty
    if (features.changeFrequency < 0.1) score += 0.2; // rarely changed
    
    // Quality issues penalty
    if (!features.hasDocumentation) score += 0.15;
    if (!features.hasTests) score += 0.1;
    if (features.cyclomaticComplexity > 20) score += 0.15;
    
    // Bug reports penalty
    if (features.bugReportCount > 3) score += 0.1;
    
    const predictedValue = Math.max(0, Math.min(1, score));
    const confidence = 0.6; // Lower confidence for rule-based
    
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // Valid for 30 days

    return {
      scriptId: script.id!,
      predictionType: 'deprecation_candidate',
      predictedValue,
      confidenceScore: confidence,
      modelVersion: this.modelVersion,
      featuresUsed: ['ageInDays', 'changeFrequency', 'hasDocumentation', 'hasTests', 'bugReportCount'],
      expiresAt
    };
  }

  /**
   * Extract ML features from a script
   */
  private async extractFeatures(script: Script): Promise<ModelFeatures> {
    // Get recent metrics
    const metrics = await this.metricsCalculator.getScriptMetrics(script.id!);
    
    // Get historical data
    const historyQuery = `
      SELECT 
        COUNT(*) as change_count,
        MIN(recorded_at) as first_seen,
        COUNT(CASE WHEN event_type LIKE '%error%' OR event_type LIKE '%bug%' THEN 1 END) as bug_count
      FROM script_history 
      WHERE script_id = ?
    `;
    
    const history = await this.db.get(historyQuery, [script.id]);
    
    // Calculate age in days
    const firstSeen = history?.first_seen ? new Date(history.first_seen) : new Date();
    const ageInDays = (Date.now() - firstSeen.getTime()) / (1000 * 60 * 60 * 24);
    
    // Calculate change frequency (changes per month)
    const changeFrequency = ageInDays > 0 ? (history?.change_count || 0) / (ageInDays / 30) : 0;

    // Extract metric values
    const getMetricValue = (type: string, name: string): number => {
      const metric = metrics.find(m => m.metricType === type && m.metricName === name);
      return metric?.value || 0;
    };

    return {
      // Static features
      linesOfCode: getMetricValue('complexity', 'lines_of_code'),
      cyclomaticComplexity: getMetricValue('complexity', 'cyclomatic_complexity'),
      commentDensity: getMetricValue('quality', 'comment_density'),
      functionCount: getMetricValue('complexity', 'function_count'),
      dependencyCount: getMetricValue('maintainability', 'dependency_count'),
      
      // Quality indicators
      hasDocumentation: getMetricValue('quality', 'documentation_completeness') > 0.5 ? 1 : 0,
      hasTests: getMetricValue('maintainability', 'test_coverage') > 0.3 ? 1 : 0,
      hasErrorHandling: getMetricValue('quality', 'has_error_handling'),
      
      // Historical features
      ageInDays: ageInDays,
      changeFrequency: changeFrequency,
      bugReportCount: history?.bug_count || 0,
      
      // Contextual features
      fileSize: script.fileSize || 0,
      isCliScript: script.isCli ? 1 : 0,
      isTestScript: script.isTest ? 1 : 0
    };
  }

  /**
   * Rule-based quality risk calculation (fallback)
   */
  private ruleBasedQualityRisk(features: ModelFeatures): number {
    let risk = 0;
    
    // Documentation penalties
    if (!features.hasDocumentation) risk += 0.3;
    if (!features.hasTests) risk += 0.25;
    if (!features.hasErrorHandling) risk += 0.15;
    
    // Complexity penalties
    if (features.cyclomaticComplexity > 15) risk += 0.2;
    if (features.cyclomaticComplexity > 25) risk += 0.1;
    
    // Size penalties
    if (features.linesOfCode > 500) risk += 0.1;
    if (features.linesOfCode > 1000) risk += 0.05;
    
    // Comment density bonus
    if (features.commentDensity > 15) risk -= 0.1;
    
    return Math.max(0, Math.min(1, risk));
  }

  /**
   * Rule-based maintenance needed calculation
   */
  private ruleBasedMaintenanceNeeded(features: ModelFeatures): number {
    let score = 0;
    
    // Age factor
    if (features.ageInDays > 180) score += 0.2;
    if (features.ageInDays > 365) score += 0.2;
    
    // Bug reports
    if (features.bugReportCount > 0) score += features.bugReportCount * 0.15;
    
    // Quality issues
    if (!features.hasTests) score += 0.2;
    if (features.cyclomaticComplexity > 20) score += 0.15;
    
    // High change frequency might indicate instability
    if (features.changeFrequency > 2) score += 0.1;
    
    return Math.max(0, Math.min(1, score));
  }

  /**
   * Collect training data from historical metrics and outcomes
   */
  private async collectTrainingData(): Promise<TrainingData[]> {
    const query = `
      SELECT DISTINCT s.id, s.path, s.doc_score, s.is_cli, s.is_test, s.file_size,
        COUNT(sr.id) as risk_count,
        AVG(sr.risk_level) as avg_risk_level,
        COUNT(CASE WHEN r.recommendation_type = 'code_improvement' THEN 1 END) as improvement_recs
      FROM scripts s
      LEFT JOIN script_risks sr ON s.id = sr.script_id
      LEFT JOIN recommendations r ON s.id = r.script_id
      WHERE s.last_analyzed IS NOT NULL
      GROUP BY s.id
      LIMIT 1000
    `;

    const rows = await this.db.all(query);
    const trainingData: TrainingData[] = [];

    for (const row of rows) {
      try {
        const script: Script = {
          id: row.id,
          path: row.path,
          docScore: row.doc_score,
          isCli: row.is_cli === 1,
          isTest: row.is_test === 1,
          fileSize: row.file_size
        } as Script;

        const features = await this.extractFeatures(script);
        
        // Create training labels
        const qualityScore = (row.doc_score || 0) / 100; // Convert to 0-1
        const riskLevel = (row.avg_risk_level || 0) / 5; // Convert to 0-1
        const maintenanceNeeded = row.improvement_recs > 2 ? 1 : 0; // Binary

        trainingData.push({
          features,
          qualityScore,
          riskLevel,
          maintenanceNeeded
        });
      } catch (error) {
        // Skip problematic entries
        continue;
      }
    }

    return trainingData;
  }

  /**
   * Prepare training data for quality model
   */
  private prepareQualityTrainingData(data: TrainingData[]) {
    const features = data.map(d => this.featuresToArray(d.features));
    const outputs = data.map(d => d.qualityScore);
    
    return { features, outputs };
  }

  /**
   * Prepare training data for risk model
   */
  private prepareRiskTrainingData(data: TrainingData[]) {
    const features = data.map(d => this.featuresToArray(d.features));
    const outputs = data.map(d => d.riskLevel);
    
    return { features, outputs };
  }

  /**
   * Prepare training data for maintenance model
   */
  private prepareMaintenanceTrainingData(data: TrainingData[]) {
    // Use composite feature for simple linear regression
    const x = data.map(d => 
      d.features.cyclomaticComplexity * 0.3 + 
      d.features.ageInDays * 0.0001 + 
      d.features.changeFrequency * 0.4
    );
    const y = data.map(d => d.maintenanceNeeded);
    
    return { x, y };
  }

  /**
   * Convert features object to array for ML models
   */
  private featuresToArray(features: ModelFeatures): number[] {
    return [
      features.linesOfCode / 1000, // normalize
      features.cyclomaticComplexity / 50, // normalize
      features.commentDensity / 100, // normalize
      features.functionCount / 20, // normalize
      features.dependencyCount / 50, // normalize
      features.hasDocumentation,
      features.hasTests,
      features.hasErrorHandling,
      features.ageInDays / 1000, // normalize
      features.changeFrequency / 10, // normalize
      features.bugReportCount / 10, // normalize
      features.fileSize / 100000, // normalize
      features.isCliScript,
      features.isTestScript
    ];
  }

  /**
   * Calculate model confidence based on feature values
   */
  private calculateModelConfidence(features: number[]): number {
    // Higher confidence for features in normal ranges
    let confidence = 0.8;
    
    // Reduce confidence for extreme values
    features.forEach(feature => {
      if (feature > 2 || feature < -1) confidence -= 0.05;
    });
    
    return Math.max(0.3, Math.min(1, confidence));
  }

  /**
   * Update feature weights based on trained model performance
   */
  private updateFeatureWeights(): void {
    // Update weights based on model R² values
    if (this.qualityModel && this.qualityModel.r2 > 0.6) {
      this.featureWeights.set('hasDocumentation', 0.3 * this.qualityModel.r2);
      this.featureWeights.set('hasTests', 0.25 * this.qualityModel.r2);
    }
    
    if (this.riskModel && this.riskModel.r2 > 0.5) {
      this.featureWeights.set('cyclomaticComplexity', -0.15 * this.riskModel.r2);
      this.featureWeights.set('changeFrequency', -0.1 * this.riskModel.r2);
    }
  }

  /**
   * Store predictions in database
   */
  async storePredictions(predictions: QualityPrediction[]): Promise<void> {
    if (predictions.length === 0) return;

    const insertQuery = `
      INSERT OR REPLACE INTO script_predictions 
      (script_id, prediction_type, predicted_value, confidence_score, model_version, features_used, expires_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    await this.db.beginTransaction();
    try {
      for (const prediction of predictions) {
        await this.db.run(insertQuery, [
          prediction.scriptId,
          prediction.predictionType,
          prediction.predictedValue,
          prediction.confidenceScore,
          prediction.modelVersion,
          JSON.stringify(prediction.featuresUsed),
          prediction.expiresAt.toISOString()
        ]);
      }
      await this.db.commitTransaction();
    } catch (error) {
      await this.db.rollbackTransaction();
      throw error;
    }
  }

  /**
   * Get stored predictions for a script
   */
  async getPredictions(scriptId: number): Promise<QualityPrediction[]> {
    const query = `
      SELECT script_id, prediction_type, predicted_value, confidence_score, 
             model_version, features_used, expires_at, created_at
      FROM script_predictions 
      WHERE script_id = ? AND expires_at > datetime('now')
      ORDER BY created_at DESC
    `;

    const rows = await this.db.all(query, [scriptId]);
    
    return rows.map(row => ({
      scriptId: row.script_id,
      predictionType: row.prediction_type,
      predictedValue: row.predicted_value,
      confidenceScore: row.confidence_score,
      modelVersion: row.model_version,
      featuresUsed: JSON.parse(row.features_used),
      expiresAt: new Date(row.expires_at)
    }));
  }

  /**
   * Get feature importance scores
   */
  getFeatureImportance(): Map<string, number> {
    return new Map(this.featureWeights);
  }
}