/**
 * Risk Assessment and Prediction System
 * Identifies, categorizes, and prioritizes risks in the script inventory
 */

import { ScriptDatabase } from '../database/connection';
import { MetricsCalculator } from './metrics-calculator';
import { MLQualityScorer } from './ml-quality-scorer';
import type { Script } from '../types';

export interface ScriptRisk {
  id?: number;
  scriptId: number;
  riskType: 'technical_debt' | 'security_vulnerability' | 'performance_issue' | 'maintainability_risk' | 'quality_degradation';
  riskLevel: 1 | 2 | 3 | 4 | 5; // 1=low, 5=critical
  riskCategory: 'code_quality' | 'security' | 'performance' | 'maintainability' | 'operational';
  description: string;
  impactAssessment: RiskImpact;
  mitigationSuggestions: string[];
  detectedBy: 'ml_analysis' | 'static_analysis' | 'manual_review' | 'pattern_detection';
  status: 'open' | 'acknowledged' | 'in_progress' | 'resolved' | 'false_positive';
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
}

export interface RiskImpact {
  severity: 'low' | 'medium' | 'high' | 'critical';
  likelihood: 'unlikely' | 'possible' | 'likely' | 'certain';
  affectedUsers: number; // estimated number of affected users
  businessImpact: 'minimal' | 'moderate' | 'significant' | 'severe';
  technicalComplexity: 'simple' | 'moderate' | 'complex' | 'very_complex';
  estimatedEffort: number; // hours to fix
}

export interface RiskAssessmentResult {
  script: Script;
  risks: ScriptRisk[];
  overallRiskScore: number; // 0-1 scale
  riskProfile: 'low_risk' | 'medium_risk' | 'high_risk' | 'critical_risk';
  recommendations: string[];
}

export class RiskAssessor {
  private db: ScriptDatabase;
  private metricsCalculator: MetricsCalculator;
  private mlScorer: MLQualityScorer;

  // Risk detection patterns and thresholds
  private riskThresholds = {
    complexity: {
      medium: 15,
      high: 25,
      critical: 40
    },
    linesOfCode: {
      medium: 300,
      high: 800,
      critical: 1500
    },
    age: {
      stale: 180, // days
      legacy: 365,
      ancient: 730
    },
    quality: {
      poor: 0.3,
      bad: 0.5,
      acceptable: 0.7
    }
  };

  constructor(db: ScriptDatabase, metricsCalculator: MetricsCalculator, mlScorer: MLQualityScorer) {
    this.db = db;
    this.metricsCalculator = metricsCalculator;
    this.mlScorer = mlScorer;
  }

  /**
   * Perform comprehensive risk assessment for a script
   */
  async assessScriptRisk(script: Script): Promise<RiskAssessmentResult> {
    const risks: ScriptRisk[] = [];

    // Get script metrics and ML predictions
    const metrics = await this.metricsCalculator.getScriptMetrics(script.id!);
    const predictions = await this.mlScorer.getPredictions(script.id!);

    // Run all risk detection methods
    const codeQualityRisks = await this.detectCodeQualityRisks(script, metrics);
    const securityRisks = await this.detectSecurityRisks(script);
    const performanceRisks = await this.detectPerformanceRisks(script, metrics);
    const maintainabilityRisks = await this.detectMaintainabilityRisks(script, metrics);
    const operationalRisks = await this.detectOperationalRisks(script, predictions);

    risks.push(...codeQualityRisks);
    risks.push(...securityRisks);
    risks.push(...performanceRisks);
    risks.push(...maintainabilityRisks);
    risks.push(...operationalRisks);

    // Calculate overall risk score
    const overallRiskScore = this.calculateOverallRiskScore(risks);
    const riskProfile = this.determineRiskProfile(overallRiskScore);

    // Generate recommendations
    const recommendations = this.generateRiskRecommendations(risks, script);

    return {
      script,
      risks,
      overallRiskScore,
      riskProfile,
      recommendations
    };
  }

  /**
   * Detect code quality risks
   */
  private async detectCodeQualityRisks(script: Script, metrics: any[]): Promise<ScriptRisk[]> {
    const risks: ScriptRisk[] = [];
    const now = new Date();

    // Get relevant metrics
    const complexity = this.getMetricValue(metrics, 'complexity', 'cyclomatic_complexity');
    const linesOfCode = this.getMetricValue(metrics, 'complexity', 'lines_of_code');
    const commentDensity = this.getMetricValue(metrics, 'quality', 'comment_density');
    const hasTests = this.getMetricValue(metrics, 'maintainability', 'test_coverage') > 0.3;
    const hasDocumentation = this.getMetricValue(metrics, 'quality', 'documentation_completeness') > 0.5;

    // High complexity risk
    if (complexity > this.riskThresholds.complexity.medium) {
      const level = complexity > this.riskThresholds.complexity.critical ? 5 :
                   complexity > this.riskThresholds.complexity.high ? 4 : 3;
      
      risks.push({
        scriptId: script.id!,
        riskType: 'technical_debt',
        riskLevel: level as 1 | 2 | 3 | 4 | 5,
        riskCategory: 'code_quality',
        description: `High cyclomatic complexity (${complexity}) makes code difficult to understand and maintain`,
        impactAssessment: {
          severity: level >= 5 ? 'critical' : level >= 4 ? 'high' : 'medium',
          likelihood: 'likely',
          affectedUsers: this.estimateAffectedUsers(script),
          businessImpact: level >= 4 ? 'significant' : 'moderate',
          technicalComplexity: 'complex',
          estimatedEffort: Math.ceil(complexity / 5) * 2
        },
        mitigationSuggestions: [
          'Break down large functions into smaller, focused functions',
          'Reduce nested conditional statements',
          'Consider using design patterns to simplify control flow',
          'Add unit tests to ensure refactoring safety'
        ],
        detectedBy: 'static_analysis',
        status: 'open',
        createdAt: now,
        updatedAt: now
      });
    }

    // Large file risk
    if (linesOfCode > this.riskThresholds.linesOfCode.medium) {
      const level = linesOfCode > this.riskThresholds.linesOfCode.critical ? 4 :
                   linesOfCode > this.riskThresholds.linesOfCode.high ? 3 : 2;

      risks.push({
        scriptId: script.id!,
        riskType: 'maintainability_risk',
        riskLevel: level as 1 | 2 | 3 | 4 | 5,
        riskCategory: 'maintainability',
        description: `Large file size (${linesOfCode} lines) indicates potential violation of single responsibility principle`,
        impactAssessment: {
          severity: level >= 4 ? 'high' : level >= 3 ? 'medium' : 'low',
          likelihood: 'possible',
          affectedUsers: this.estimateAffectedUsers(script),
          businessImpact: 'moderate',
          technicalComplexity: 'moderate',
          estimatedEffort: Math.ceil(linesOfCode / 100)
        },
        mitigationSuggestions: [
          'Split large file into smaller, focused modules',
          'Extract common functionality into utility functions',
          'Consider using composition over inheritance',
          'Implement proper module boundaries'
        ],
        detectedBy: 'static_analysis',
        status: 'open',
        createdAt: now,
        updatedAt: now
      });
    }

    // Low test coverage risk
    if (!hasTests) {
      risks.push({
        scriptId: script.id!,
        riskType: 'quality_degradation',
        riskLevel: 3,
        riskCategory: 'code_quality',
        description: 'No test coverage detected - increases risk of regression bugs',
        impactAssessment: {
          severity: 'medium',
          likelihood: 'likely',
          affectedUsers: this.estimateAffectedUsers(script),
          businessImpact: 'moderate',
          technicalComplexity: 'moderate',
          estimatedEffort: Math.ceil(linesOfCode / 20)
        },
        mitigationSuggestions: [
          'Add unit tests for core functionality',
          'Implement integration tests for critical paths',
          'Set up automated test execution in CI/CD',
          'Establish minimum test coverage requirements'
        ],
        detectedBy: 'static_analysis',
        status: 'open',
        createdAt: now,
        updatedAt: now
      });
    }

    // Poor documentation risk
    if (!hasDocumentation && commentDensity < 5) {
      risks.push({
        scriptId: script.id!,
        riskType: 'maintainability_risk',
        riskLevel: 2,
        riskCategory: 'maintainability',
        description: 'Insufficient documentation and comments increase maintenance difficulty',
        impactAssessment: {
          severity: 'low',
          likelihood: 'certain',
          affectedUsers: 1, // mainly affects developers
          businessImpact: 'minimal',
          technicalComplexity: 'simple',
          estimatedEffort: 2
        },
        mitigationSuggestions: [
          'Add function and class documentation',
          'Include usage examples',
          'Document complex business logic',
          'Add inline comments for tricky code sections'
        ],
        detectedBy: 'static_analysis',
        status: 'open',
        createdAt: now,
        updatedAt: now
      });
    }

    return risks;
  }

  /**
   * Detect security risks
   */
  private async detectSecurityRisks(script: Script): Promise<ScriptRisk[]> {
    const risks: ScriptRisk[] = [];
    const now = new Date();

    try {
      const content = await import('fs').then(fs => fs.promises.readFile(script.path, 'utf-8'));

      // Security anti-patterns
      const securityPatterns = [
        {
          pattern: /eval\s*\(/gi,
          risk: 'Code injection vulnerability through eval() usage',
          level: 5,
          effort: 4
        },
        {
          pattern: /password\s*=\s*['"][^'"]*['"]/gi,
          risk: 'Hardcoded password detected in source code',
          level: 5,
          effort: 1
        },
        {
          pattern: /process\.env\.\w+\s*\|\|\s*['"][^'"]*['"]/gi,
          risk: 'Environment variable with hardcoded fallback',
          level: 3,
          effort: 1
        },
        {
          pattern: /document\.write\s*\(/gi,
          risk: 'XSS vulnerability through document.write usage',
          level: 4,
          effort: 2
        },
        {
          pattern: /innerHTML\s*=/gi,
          risk: 'Potential XSS vulnerability through innerHTML assignment',
          level: 3,
          effort: 2
        }
      ];

      for (const { pattern, risk, level, effort } of securityPatterns) {
        if (content.match(pattern)) {
          risks.push({
            scriptId: script.id!,
            riskType: 'security_vulnerability',
            riskLevel: level as 1 | 2 | 3 | 4 | 5,
            riskCategory: 'security',
            description: risk,
            impactAssessment: {
              severity: level >= 5 ? 'critical' : level >= 4 ? 'high' : 'medium',
              likelihood: 'possible',
              affectedUsers: this.estimateAffectedUsers(script) * 10, // security affects more users
              businessImpact: level >= 4 ? 'severe' : 'significant',
              technicalComplexity: level >= 4 ? 'complex' : 'moderate',
              estimatedEffort: effort
            },
            mitigationSuggestions: this.getSecurityMitigation(pattern.source),
            detectedBy: 'pattern_detection',
            status: 'open',
            createdAt: now,
            updatedAt: now
          });
        }
      }

    } catch (error) {
      // File read error - add as operational risk
      risks.push({
        scriptId: script.id!,
        riskType: 'technical_debt',
        riskLevel: 2,
        riskCategory: 'operational',
        description: 'Script file is not accessible for security analysis',
        impactAssessment: {
          severity: 'low',
          likelihood: 'certain',
          affectedUsers: 1,
          businessImpact: 'minimal',
          technicalComplexity: 'simple',
          estimatedEffort: 0.5
        },
        mitigationSuggestions: ['Verify file permissions and path'],
        detectedBy: 'static_analysis',
        status: 'open',
        createdAt: now,
        updatedAt: now
      });
    }

    return risks;
  }

  /**
   * Detect performance risks
   */
  private async detectPerformanceRisks(script: Script, metrics: any[]): Promise<ScriptRisk[]> {
    const risks: ScriptRisk[] = [];
    const now = new Date();

    const cpuIntensity = this.getMetricValue(metrics, 'performance', 'cpu_intensity');
    const bottleneckScore = this.getMetricValue(metrics, 'performance', 'bottleneck_score');
    const ioOperations = this.getMetricValue(metrics, 'performance', 'io_operations');

    // High CPU intensity risk
    if (cpuIntensity > 0.7) {
      risks.push({
        scriptId: script.id!,
        riskType: 'performance_issue',
        riskLevel: cpuIntensity > 0.9 ? 4 : 3,
        riskCategory: 'performance',
        description: `High CPU intensity (${(cpuIntensity * 100).toFixed(1)}%) may cause performance bottlenecks`,
        impactAssessment: {
          severity: cpuIntensity > 0.9 ? 'high' : 'medium',
          likelihood: 'likely',
          affectedUsers: this.estimateAffectedUsers(script),
          businessImpact: 'moderate',
          technicalComplexity: 'complex',
          estimatedEffort: 8
        },
        mitigationSuggestions: [
          'Profile code to identify bottlenecks',
          'Optimize algorithms and data structures',
          'Consider caching for expensive operations',
          'Implement async processing where appropriate'
        ],
        detectedBy: 'static_analysis',
        status: 'open',
        createdAt: now,
        updatedAt: now
      });
    }

    // High I/O operations risk
    if (ioOperations > 10) {
      risks.push({
        scriptId: script.id!,
        riskType: 'performance_issue',
        riskLevel: 3,
        riskCategory: 'performance',
        description: `High number of I/O operations (${ioOperations}) may cause latency issues`,
        impactAssessment: {
          severity: 'medium',
          likelihood: 'possible',
          affectedUsers: this.estimateAffectedUsers(script),
          businessImpact: 'moderate',
          technicalComplexity: 'moderate',
          estimatedEffort: 4
        },
        mitigationSuggestions: [
          'Batch I/O operations where possible',
          'Implement connection pooling for database operations',
          'Use async I/O patterns',
          'Consider caching frequently accessed data'
        ],
        detectedBy: 'static_analysis',
        status: 'open',
        createdAt: now,
        updatedAt: now
      });
    }

    return risks;
  }

  /**
   * Detect maintainability risks
   */
  private async detectMaintainabilityRisks(script: Script, metrics: any[]): Promise<ScriptRisk[]> {
    const risks: ScriptRisk[] = [];
    const now = new Date();

    const technicalDebt = this.getMetricValue(metrics, 'maintainability', 'technical_debt');
    const coupling = this.getMetricValue(metrics, 'maintainability', 'coupling');
    const duplicatedCode = this.getMetricValue(metrics, 'maintainability', 'duplicated_code');

    // High technical debt
    if (technicalDebt > 8) {
      risks.push({
        scriptId: script.id!,
        riskType: 'technical_debt',
        riskLevel: technicalDebt > 20 ? 4 : 3,
        riskCategory: 'maintainability',
        description: `High technical debt (${technicalDebt.toFixed(1)} hours estimated) requires attention`,
        impactAssessment: {
          severity: technicalDebt > 20 ? 'high' : 'medium',
          likelihood: 'certain',
          affectedUsers: 2, // primarily affects developers
          businessImpact: 'moderate',
          technicalComplexity: 'complex',
          estimatedEffort: technicalDebt
        },
        mitigationSuggestions: [
          'Address TODO and FIXME comments',
          'Refactor complex functions',
          'Remove deprecated code',
          'Improve error handling'
        ],
        detectedBy: 'static_analysis',
        status: 'open',
        createdAt: now,
        updatedAt: now
      });
    }

    // High coupling
    if (coupling > 0.7) {
      risks.push({
        scriptId: script.id!,
        riskType: 'maintainability_risk',
        riskLevel: 3,
        riskCategory: 'maintainability',
        description: `High coupling (${(coupling * 100).toFixed(1)}%) makes changes risky`,
        impactAssessment: {
          severity: 'medium',
          likelihood: 'likely',
          affectedUsers: 3,
          businessImpact: 'moderate',
          technicalComplexity: 'complex',
          estimatedEffort: 6
        },
        mitigationSuggestions: [
          'Reduce dependencies on external modules',
          'Use dependency injection',
          'Extract interfaces for better testability',
          'Apply SOLID principles'
        ],
        detectedBy: 'static_analysis',
        status: 'open',
        createdAt: now,
        updatedAt: now
      });
    }

    return risks;
  }

  /**
   * Detect operational risks based on ML predictions
   */
  private async detectOperationalRisks(script: Script, predictions: any[]): Promise<ScriptRisk[]> {
    const risks: ScriptRisk[] = [];
    const now = new Date();

    // Check ML predictions for high-risk indicators
    for (const prediction of predictions) {
      if (prediction.predictedValue > 0.7 && prediction.confidenceScore > 0.6) {
        let riskType: ScriptRisk['riskType'];
        let description: string;
        let suggestions: string[];

        switch (prediction.predictionType) {
          case 'quality_risk':
            riskType = 'quality_degradation';
            description = `ML model predicts high quality risk (${(prediction.predictedValue * 100).toFixed(1)}%)`;
            suggestions = [
              'Review and improve code documentation',
              'Add comprehensive test coverage',
              'Reduce code complexity',
              'Follow coding standards'
            ];
            break;

          case 'maintenance_required':
            riskType = 'maintainability_risk';
            description = `ML model predicts maintenance needed (${(prediction.predictedValue * 100).toFixed(1)}% likelihood)`;
            suggestions = [
              'Schedule proactive maintenance',
              'Update dependencies',
              'Refactor complex code sections',
              'Improve error handling'
            ];
            break;

          case 'deprecation_candidate':
            riskType = 'technical_debt';
            description = `ML model identifies as deprecation candidate (${(prediction.predictedValue * 100).toFixed(1)}% likelihood)`;
            suggestions = [
              'Evaluate if script is still needed',
              'Document deprecation timeline if applicable',
              'Identify replacement solutions',
              'Notify stakeholders of potential changes'
            ];
            break;

          default:
            continue;
        }

        const riskLevel = prediction.predictedValue > 0.9 ? 4 : 3;

        risks.push({
          scriptId: script.id!,
          riskType,
          riskLevel: riskLevel as 1 | 2 | 3 | 4 | 5,
          riskCategory: 'operational',
          description,
          impactAssessment: {
            severity: riskLevel >= 4 ? 'high' : 'medium',
            likelihood: prediction.predictedValue > 0.8 ? 'likely' : 'possible',
            affectedUsers: this.estimateAffectedUsers(script),
            businessImpact: riskLevel >= 4 ? 'significant' : 'moderate',
            technicalComplexity: 'moderate',
            estimatedEffort: 4
          },
          mitigationSuggestions: suggestions,
          detectedBy: 'ml_analysis',
          status: 'open',
          createdAt: now,
          updatedAt: now
        });
      }
    }

    return risks;
  }

  /**
   * Calculate overall risk score from individual risks
   */
  private calculateOverallRiskScore(risks: ScriptRisk[]): number {
    if (risks.length === 0) return 0;

    // Weight risks by level and category
    let totalScore = 0;
    let totalWeight = 0;

    const categoryWeights = {
      security: 1.0,
      operational: 0.9,
      performance: 0.8,
      code_quality: 0.7,
      maintainability: 0.6
    };

    for (const risk of risks) {
      const categoryWeight = categoryWeights[risk.riskCategory] || 0.5;
      const riskScore = risk.riskLevel / 5; // normalize to 0-1
      const weight = categoryWeight * riskScore;
      
      totalScore += riskScore * weight;
      totalWeight += weight;
    }

    return totalWeight > 0 ? totalScore / totalWeight : 0;
  }

  /**
   * Determine risk profile based on overall score
   */
  private determineRiskProfile(score: number): RiskAssessmentResult['riskProfile'] {
    if (score >= 0.8) return 'critical_risk';
    if (score >= 0.6) return 'high_risk';
    if (score >= 0.3) return 'medium_risk';
    return 'low_risk';
  }

  /**
   * Generate recommendations based on identified risks
   */
  private generateRiskRecommendations(risks: ScriptRisk[], script: Script): string[] {
    const recommendations: string[] = [];
    
    // Count risks by category
    const risksByCategory = risks.reduce((acc, risk) => {
      acc[risk.riskCategory] = (acc[risk.riskCategory] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Generate category-specific recommendations
    if (risksByCategory.security > 0) {
      recommendations.push('🔒 Conduct security review and implement security best practices');
    }

    if (risksByCategory.performance > 0) {
      recommendations.push('⚡ Profile and optimize performance bottlenecks');
    }

    if (risksByCategory.code_quality > 2) {
      recommendations.push('📋 Implement code quality improvements and establish quality gates');
    }

    if (risksByCategory.maintainability > 1) {
      recommendations.push('🔧 Schedule technical debt reduction and refactoring');
    }

    // Add general recommendations based on risk count
    if (risks.length > 5) {
      recommendations.push('⚠️ Consider breaking this script into smaller, focused modules');
    }

    if (risks.filter(r => r.riskLevel >= 4).length > 0) {
      recommendations.push('🚨 Address critical risks immediately before deployment');
    }

    return recommendations.length > 0 ? recommendations : ['✅ No major risks identified'];
  }

  /**
   * Helper methods
   */
  private getMetricValue(metrics: any[], type: string, name: string): number {
    const metric = metrics.find(m => m.metricType === type && m.metricName === name);
    return metric?.value || 0;
  }

  private estimateAffectedUsers(script: Script): number {
    // Simple estimation based on script type and usage
    if (script.isCli) return 10; // CLI scripts affect developers
    if (script.isTest) return 2; // Test scripts mainly affect QA
    return 5; // Default estimation
  }

  private getSecurityMitigation(pattern: string): string[] {
    const mitigations: Record<string, string[]> = {
      'eval': [
        'Replace eval() with safer alternatives like JSON.parse()',
        'Use Function constructor if dynamic code execution is necessary',
        'Validate and sanitize all input before evaluation',
        'Consider using a template engine for dynamic content'
      ],
      'password': [
        'Move passwords to environment variables',
        'Use secure credential management systems',
        'Implement proper secret rotation',
        'Never commit credentials to source control'
      ],
      'innerHTML': [
        'Use textContent or createTextNode for text content',
        'Sanitize HTML content before assignment',
        'Use secure templating libraries',
        'Validate and escape user input'
      ]
    };

    for (const [key, suggestions] of Object.entries(mitigations)) {
      if (pattern.includes(key)) {
        return suggestions;
      }
    }

    return ['Review and fix security vulnerability'];
  }

  /**
   * Store risks in database
   */
  async storeRisks(risks: ScriptRisk[]): Promise<void> {
    if (risks.length === 0) return;

    const insertQuery = `
      INSERT OR REPLACE INTO script_risks 
      (script_id, risk_type, risk_level, risk_category, description, impact_assessment, 
       mitigation_suggestions, detected_by, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await this.db.beginTransaction();
    try {
      for (const risk of risks) {
        await this.db.run(insertQuery, [
          risk.scriptId,
          risk.riskType,
          risk.riskLevel,
          risk.riskCategory,
          risk.description,
          JSON.stringify(risk.impactAssessment),
          JSON.stringify(risk.mitigationSuggestions),
          risk.detectedBy,
          risk.status,
          risk.createdAt.toISOString(),
          risk.updatedAt.toISOString()
        ]);
      }
      await this.db.commitTransaction();
    } catch (error) {
      await this.db.rollbackTransaction();
      throw error;
    }
  }

  /**
   * Get risks for a script
   */
  async getScriptRisks(scriptId: number, status?: string[]): Promise<ScriptRisk[]> {
    let query = `
      SELECT id, script_id, risk_type, risk_level, risk_category, description, 
             impact_assessment, mitigation_suggestions, detected_by, status, 
             assigned_to, created_at, updated_at, resolved_at
      FROM script_risks 
      WHERE script_id = ?
    `;
    
    const params = [scriptId];
    
    if (status && status.length > 0) {
      query += ` AND status IN (${status.map(() => '?').join(', ')})`;
      params.push(...status);
    }
    
    query += ` ORDER BY risk_level DESC, created_at DESC`;

    const rows = await this.db.all(query, params);
    
    return rows.map(row => ({
      id: row.id,
      scriptId: row.script_id,
      riskType: row.risk_type,
      riskLevel: row.risk_level,
      riskCategory: row.risk_category,
      description: row.description,
      impactAssessment: JSON.parse(row.impact_assessment),
      mitigationSuggestions: JSON.parse(row.mitigation_suggestions),
      detectedBy: row.detected_by,
      status: row.status,
      assignedTo: row.assigned_to,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      resolvedAt: row.resolved_at ? new Date(row.resolved_at) : undefined
    }));
  }
}