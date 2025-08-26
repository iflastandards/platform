/**
 * Intelligent Recommendation Engine
 * Generates actionable recommendations for script quality improvements
 */

import { ScriptDatabase } from '../database/connection';
import { MetricsCalculator } from './metrics-calculator';
import { MLQualityScorer } from './ml-quality-scorer';
import { RiskAssessor, type ScriptRisk } from './risk-assessor';
import type { Script } from '../types';

export interface Recommendation {
  id?: number;
  scriptId?: number; // null for global recommendations
  recommendationType: 'code_improvement' | 'documentation' | 'refactoring' | 'testing' | 'security' | 'performance';
  priority: 1 | 2 | 3 | 4 | 5; // 1=low, 5=critical
  title: string;
  description: string;
  suggestedActions: RecommendationAction[];
  expectedBenefit: ExpectedBenefit;
  effortEstimate: 'low' | 'medium' | 'high';
  confidenceScore: number; // 0-1
  generatedBy: 'ml_engine' | 'rule_engine' | 'manual';
  status: 'pending' | 'accepted' | 'rejected' | 'implemented';
  feedbackScore?: number; // user rating 1-5
  feedbackNotes?: string;
  createdAt: Date;
  updatedAt: Date;
  implementedAt?: Date;
}

export interface RecommendationAction {
  action: string;
  description: string;
  example?: string;
  toolsNeeded?: string[];
  estimatedTime: number; // minutes
}

export interface ExpectedBenefit {
  qualityImprovement: number; // 0-1 scale
  maintainabilityGain: number; // 0-1 scale  
  performanceGain?: number; // 0-1 scale
  securityImprovement?: number; // 0-1 scale
  riskReduction: number; // 0-1 scale
  description: string;
}

export interface RecommendationContext {
  script: Script;
  metrics: any[];
  risks: ScriptRisk[];
  predictions: any[];
  similarScripts?: Script[];
  codebasePatterns?: any[];
}

export class RecommendationEngine {
  private db: ScriptDatabase;
  private metricsCalculator: MetricsCalculator;
  private mlScorer: MLQualityScorer;
  private riskAssessor: RiskAssessor;

  // Recommendation templates and rules
  private recommendationRules: Map<string, any> = new Map();

  constructor(
    db: ScriptDatabase, 
    metricsCalculator: MetricsCalculator,
    mlScorer: MLQualityScorer,
    riskAssessor: RiskAssessor
  ) {
    this.db = db;
    this.metricsCalculator = metricsCalculator;
    this.mlScorer = mlScorer;
    this.riskAssessor = riskAssessor;
    this.initializeRecommendationRules();
  }

  /**
   * Generate comprehensive recommendations for a script
   */
  async generateRecommendations(script: Script): Promise<Recommendation[]> {
    const context = await this.buildRecommendationContext(script);
    const recommendations: Recommendation[] = [];

    // Generate different types of recommendations
    recommendations.push(...await this.generateCodeQualityRecommendations(context));
    recommendations.push(...await this.generateDocumentationRecommendations(context));
    recommendations.push(...await this.generateTestingRecommendations(context));
    recommendations.push(...await this.generateRefactoringRecommendations(context));
    recommendations.push(...await this.generateSecurityRecommendations(context));
    recommendations.push(...await this.generatePerformanceRecommendations(context));

    // Generate ML-powered recommendations
    recommendations.push(...await this.generateMLRecommendations(context));

    // Sort by priority and confidence
    return recommendations.sort((a, b) => {
      if (a.priority !== b.priority) return b.priority - a.priority;
      return b.confidenceScore - a.confidenceScore;
    });
  }

  /**
   * Build comprehensive context for recommendation generation
   */
  private async buildRecommendationContext(script: Script): Promise<RecommendationContext> {
    const metrics = await this.metricsCalculator.getScriptMetrics(script.id!);
    const risks = await this.riskAssessor.getScriptRisks(script.id!, ['open', 'acknowledged']);
    const predictions = await this.mlScorer.getPredictions(script.id!);
    
    // Find similar scripts for pattern-based recommendations
    const similarScripts = await this.findSimilarScripts(script);

    return {
      script,
      metrics,
      risks,
      predictions,
      similarScripts
    };
  }

  /**
   * Generate code quality recommendations
   */
  private async generateCodeQualityRecommendations(context: RecommendationContext): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];
    const { script, metrics } = context;
    const now = new Date();

    const complexity = this.getMetricValue(metrics, 'complexity', 'cyclomatic_complexity');
    const linesOfCode = this.getMetricValue(metrics, 'complexity', 'lines_of_code');
    const functionCount = this.getMetricValue(metrics, 'complexity', 'function_count');
    const hasErrorHandling = this.getMetricValue(metrics, 'quality', 'has_error_handling');

    // High complexity recommendation
    if (complexity > 15) {
      const priority = complexity > 30 ? 5 : complexity > 20 ? 4 : 3;
      recommendations.push({
        scriptId: script.id!,
        recommendationType: 'refactoring',
        priority: priority as 1 | 2 | 3 | 4 | 5,
        title: 'Reduce Cyclomatic Complexity',
        description: `Current complexity (${complexity}) exceeds recommended threshold. Break down complex logic into smaller, testable functions.`,
        suggestedActions: [
          {
            action: 'Extract method',
            description: 'Break large functions into smaller, focused functions',
            example: 'function processData() { validateInput(); transformData(); saveResults(); }',
            estimatedTime: Math.ceil(complexity / 5) * 30
          },
          {
            action: 'Reduce nesting',
            description: 'Use early returns and guard clauses to reduce nesting levels',
            example: 'if (!isValid) return; // instead of nested if-else',
            estimatedTime: 60
          },
          {
            action: 'Apply design patterns',
            description: 'Use strategy or state patterns for complex conditional logic',
            toolsNeeded: ['refactoring tools', 'design pattern library'],
            estimatedTime: 120
          }
        ],
        expectedBenefit: {
          qualityImprovement: 0.4,
          maintainabilityGain: 0.5,
          riskReduction: 0.3,
          description: 'Improved readability, easier testing, reduced bug likelihood'
        },
        effortEstimate: priority >= 4 ? 'high' : 'medium',
        confidenceScore: 0.9,
        generatedBy: 'rule_engine',
        status: 'pending',
        createdAt: now,
        updatedAt: now
      });
    }

    // Large file recommendation
    if (linesOfCode > 300) {
      recommendations.push({
        scriptId: script.id!,
        recommendationType: 'refactoring',
        priority: linesOfCode > 800 ? 4 : 3,
        title: 'Split Large File',
        description: `File has ${linesOfCode} lines. Consider breaking into smaller, focused modules.`,
        suggestedActions: [
          {
            action: 'Module extraction',
            description: 'Extract related functions into separate modules',
            example: 'Create utils.js, validators.js, formatters.js',
            estimatedTime: Math.ceil(linesOfCode / 100) * 45
          },
          {
            action: 'Class decomposition',
            description: 'If using classes, apply Single Responsibility Principle',
            estimatedTime: 90
          }
        ],
        expectedBenefit: {
          qualityImprovement: 0.3,
          maintainabilityGain: 0.4,
          riskReduction: 0.2,
          description: 'Better organization, easier navigation, improved testability'
        },
        effortEstimate: 'medium',
        confidenceScore: 0.8,
        generatedBy: 'rule_engine',
        status: 'pending',
        createdAt: now,
        updatedAt: now
      });
    }

    // Missing error handling
    if (!hasErrorHandling) {
      recommendations.push({
        scriptId: script.id!,
        recommendationType: 'code_improvement',
        priority: 3,
        title: 'Add Error Handling',
        description: 'No error handling detected. Add try-catch blocks for robust error management.',
        suggestedActions: [
          {
            action: 'Add try-catch blocks',
            description: 'Wrap risky operations in try-catch blocks',
            example: 'try { riskyOperation(); } catch (error) { handleError(error); }',
            estimatedTime: 30
          },
          {
            action: 'Input validation',
            description: 'Validate function parameters and external inputs',
            estimatedTime: 45
          },
          {
            action: 'Error logging',
            description: 'Implement structured error logging',
            toolsNeeded: ['logging library'],
            estimatedTime: 20
          }
        ],
        expectedBenefit: {
          qualityImprovement: 0.3,
          maintainabilityGain: 0.2,
          riskReduction: 0.4,
          description: 'Improved reliability, better debugging, graceful failure handling'
        },
        effortEstimate: 'low',
        confidenceScore: 0.85,
        generatedBy: 'rule_engine',
        status: 'pending',
        createdAt: now,
        updatedAt: now
      });
    }

    return recommendations;
  }

  /**
   * Generate documentation recommendations
   */
  private async generateDocumentationRecommendations(context: RecommendationContext): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];
    const { script, metrics } = context;
    const now = new Date();

    const docCompleteness = this.getMetricValue(metrics, 'quality', 'documentation_completeness');
    const commentDensity = this.getMetricValue(metrics, 'quality', 'comment_density');
    const hasExamples = this.getMetricValue(metrics, 'quality', 'has_examples');

    // Poor documentation
    if (docCompleteness < 0.6) {
      const priority = docCompleteness < 0.3 ? 4 : 3;
      recommendations.push({
        scriptId: script.id!,
        recommendationType: 'documentation',
        priority: priority as 1 | 2 | 3 | 4 | 5,
        title: 'Improve Documentation Coverage',
        description: `Documentation completeness is ${(docCompleteness * 100).toFixed(0)}%. Add comprehensive documentation.`,
        suggestedActions: [
          {
            action: 'Add function documentation',
            description: 'Document all public functions with JSDoc or similar',
            example: '/** @description Process user data @param {Object} data @returns {Object} */',
            estimatedTime: 15 * this.getMetricValue(metrics, 'complexity', 'function_count')
          },
          {
            action: 'Create usage guide',
            description: 'Add usage examples and common scenarios',
            estimatedTime: 45
          },
          {
            action: 'Document dependencies',
            description: 'Explain external dependencies and their purposes',
            estimatedTime: 20
          }
        ],
        expectedBenefit: {
          qualityImprovement: 0.5,
          maintainabilityGain: 0.4,
          riskReduction: 0.2,
          description: 'Better code understanding, easier onboarding, reduced support requests'
        },
        effortEstimate: priority >= 4 ? 'medium' : 'low',
        confidenceScore: 0.9,
        generatedBy: 'rule_engine',
        status: 'pending',
        createdAt: now,
        updatedAt: now
      });
    }

    // Low comment density
    if (commentDensity < 10 && !hasExamples) {
      recommendations.push({
        scriptId: script.id!,
        recommendationType: 'documentation',
        priority: 2,
        title: 'Add Code Comments',
        description: `Comment density is ${commentDensity.toFixed(1)}%. Add inline comments for complex logic.`,
        suggestedActions: [
          {
            action: 'Add inline comments',
            description: 'Comment complex algorithms and business logic',
            estimatedTime: 30
          },
          {
            action: 'Explain magic numbers',
            description: 'Replace magic numbers with named constants and comments',
            example: 'const MAX_RETRIES = 3; // API retry limit',
            estimatedTime: 15
          }
        ],
        expectedBenefit: {
          qualityImprovement: 0.2,
          maintainabilityGain: 0.3,
          riskReduction: 0.1,
          description: 'Improved code readability and maintainability'
        },
        effortEstimate: 'low',
        confidenceScore: 0.7,
        generatedBy: 'rule_engine',
        status: 'pending',
        createdAt: now,
        updatedAt: now
      });
    }

    return recommendations;
  }

  /**
   * Generate testing recommendations
   */
  private async generateTestingRecommendations(context: RecommendationContext): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];
    const { script, metrics } = context;
    const now = new Date();

    const testCoverage = this.getMetricValue(metrics, 'maintainability', 'test_coverage');

    // Low test coverage
    if (testCoverage < 70 && !script.isTest) {
      const priority = testCoverage < 30 ? 4 : testCoverage < 50 ? 3 : 2;
      
      recommendations.push({
        scriptId: script.id!,
        recommendationType: 'testing',
        priority: priority as 1 | 2 | 3 | 4 | 5,
        title: 'Increase Test Coverage',
        description: `Current test coverage is ${testCoverage.toFixed(0)}%. Add comprehensive tests.`,
        suggestedActions: [
          {
            action: 'Add unit tests',
            description: 'Create unit tests for all public functions',
            example: 'describe("processData", () => { it("should handle valid input", ...) })',
            toolsNeeded: ['testing framework', 'assertion library'],
            estimatedTime: this.getMetricValue(metrics, 'complexity', 'function_count') * 20
          },
          {
            action: 'Add integration tests',
            description: 'Test interactions between components',
            estimatedTime: 60
          },
          {
            action: 'Add edge case tests',
            description: 'Test error conditions and boundary values',
            estimatedTime: 45
          }
        ],
        expectedBenefit: {
          qualityImprovement: 0.4,
          maintainabilityGain: 0.3,
          riskReduction: 0.5,
          description: 'Catch bugs early, enable safe refactoring, improve reliability'
        },
        effortEstimate: priority >= 4 ? 'high' : 'medium',
        confidenceScore: 0.85,
        generatedBy: 'rule_engine',
        status: 'pending',
        createdAt: now,
        updatedAt: now
      });
    }

    return recommendations;
  }

  /**
   * Generate refactoring recommendations
   */
  private async generateRefactoringRecommendations(context: RecommendationContext): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];
    const { script, metrics } = context;
    const now = new Date();

    const technicalDebt = this.getMetricValue(metrics, 'maintainability', 'technical_debt');
    const duplicatedCode = this.getMetricValue(metrics, 'maintainability', 'duplicated_code');

    // High technical debt
    if (technicalDebt > 8) {
      recommendations.push({
        scriptId: script.id!,
        recommendationType: 'refactoring',
        priority: technicalDebt > 20 ? 4 : 3,
        title: 'Reduce Technical Debt',
        description: `Estimated technical debt is ${technicalDebt.toFixed(1)} hours. Address TODO items and code smells.`,
        suggestedActions: [
          {
            action: 'Fix TODO items',
            description: 'Address all TODO and FIXME comments',
            estimatedTime: technicalDebt * 60 * 0.6 // 60% of estimated debt
          },
          {
            action: 'Remove deprecated code',
            description: 'Clean up deprecated functions and unused code',
            estimatedTime: 30
          },
          {
            action: 'Improve naming',
            description: 'Use descriptive names for variables and functions',
            estimatedTime: 45
          }
        ],
        expectedBenefit: {
          qualityImprovement: 0.3,
          maintainabilityGain: 0.5,
          riskReduction: 0.2,
          description: 'Cleaner codebase, easier maintenance, reduced confusion'
        },
        effortEstimate: technicalDebt > 20 ? 'high' : 'medium',
        confidenceScore: 0.8,
        generatedBy: 'rule_engine',
        status: 'pending',
        createdAt: now,
        updatedAt: now
      });
    }

    // Code duplication
    if (duplicatedCode > 15) {
      recommendations.push({
        scriptId: script.id!,
        recommendationType: 'refactoring',
        priority: 3,
        title: 'Eliminate Code Duplication',
        description: `${duplicatedCode.toFixed(0)}% code duplication detected. Extract common functionality.`,
        suggestedActions: [
          {
            action: 'Extract common functions',
            description: 'Create utility functions for repeated code',
            estimatedTime: 90
          },
          {
            action: 'Use constants',
            description: 'Replace repeated values with named constants',
            estimatedTime: 30
          }
        ],
        expectedBenefit: {
          qualityImprovement: 0.25,
          maintainabilityGain: 0.35,
          riskReduction: 0.15,
          description: 'DRY principle compliance, easier updates, consistent behavior'
        },
        effortEstimate: 'medium',
        confidenceScore: 0.75,
        generatedBy: 'rule_engine',
        status: 'pending',
        createdAt: now,
        updatedAt: now
      });
    }

    return recommendations;
  }

  /**
   * Generate security recommendations
   */
  private async generateSecurityRecommendations(context: RecommendationContext): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];
    const { script, risks } = context;
    const now = new Date();

    // Convert security risks to recommendations
    for (const risk of risks.filter(r => r.riskCategory === 'security')) {
      recommendations.push({
        scriptId: script.id!,
        recommendationType: 'security',
        priority: risk.riskLevel,
        title: `Fix Security Issue: ${risk.riskType.replace(/_/g, ' ')}`,
        description: risk.description,
        suggestedActions: risk.mitigationSuggestions.map((suggestion, index) => ({
          action: `Security fix ${index + 1}`,
          description: suggestion,
          estimatedTime: risk.impactAssessment.estimatedEffort * 60 / risk.mitigationSuggestions.length
        })),
        expectedBenefit: {
          qualityImprovement: 0.2,
          maintainabilityGain: 0.1,
          securityImprovement: 0.8,
          riskReduction: 0.7,
          description: 'Improved security posture, reduced vulnerability risk'
        },
        effortEstimate: risk.impactAssessment.technicalComplexity === 'complex' ? 'high' : 
                       risk.impactAssessment.technicalComplexity === 'moderate' ? 'medium' : 'low',
        confidenceScore: 0.9,
        generatedBy: 'rule_engine',
        status: 'pending',
        createdAt: now,
        updatedAt: now
      });
    }

    return recommendations;
  }

  /**
   * Generate performance recommendations
   */
  private async generatePerformanceRecommendations(context: RecommendationContext): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];
    const { script, metrics } = context;
    const now = new Date();

    const cpuIntensity = this.getMetricValue(metrics, 'performance', 'cpu_intensity');
    const ioOperations = this.getMetricValue(metrics, 'performance', 'io_operations');
    const bottleneckScore = this.getMetricValue(metrics, 'performance', 'bottleneck_score');

    // High CPU usage
    if (cpuIntensity > 0.7) {
      recommendations.push({
        scriptId: script.id!,
        recommendationType: 'performance',
        priority: cpuIntensity > 0.9 ? 4 : 3,
        title: 'Optimize CPU-Intensive Operations',
        description: `High CPU intensity detected (${(cpuIntensity * 100).toFixed(0)}%). Consider optimization.`,
        suggestedActions: [
          {
            action: 'Profile performance',
            description: 'Use profiling tools to identify bottlenecks',
            toolsNeeded: ['profiler', 'performance monitoring'],
            estimatedTime: 60
          },
          {
            action: 'Optimize algorithms',
            description: 'Review and optimize computational complexity',
            estimatedTime: 120
          },
          {
            action: 'Add caching',
            description: 'Cache expensive calculations and results',
            estimatedTime: 90
          }
        ],
        expectedBenefit: {
          qualityImprovement: 0.2,
          performanceGain: 0.6,
          riskReduction: 0.3,
          maintainabilityGain: 0.1,
          description: 'Improved response times, reduced server load, better user experience'
        },
        effortEstimate: 'high',
        confidenceScore: 0.8,
        generatedBy: 'rule_engine',
        status: 'pending',
        createdAt: now,
        updatedAt: now
      });
    }

    return recommendations;
  }

  /**
   * Generate ML-powered recommendations
   */
  private async generateMLRecommendations(context: RecommendationContext): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];
    const { script, predictions } = context;
    const now = new Date();

    // Convert ML predictions to actionable recommendations
    for (const prediction of predictions) {
      if (prediction.confidenceScore > 0.7 && prediction.predictedValue > 0.6) {
        let recommendationType: Recommendation['recommendationType'];
        let title: string;
        let description: string;
        let actions: RecommendationAction[];

        switch (prediction.predictionType) {
          case 'quality_risk':
            recommendationType = 'code_improvement';
            title = 'Address ML-Predicted Quality Risk';
            description = `ML model predicts quality risk (${(prediction.predictedValue * 100).toFixed(0)}% likelihood)`;
            actions = [
              {
                action: 'Code review',
                description: 'Conduct thorough code review focusing on quality metrics',
                estimatedTime: 60
              },
              {
                action: 'Refactor high-risk areas',
                description: 'Focus on areas identified by ML features',
                estimatedTime: 120
              }
            ];
            break;

          case 'maintenance_required':
            recommendationType = 'refactoring';
            title = 'Schedule Predictive Maintenance';
            description = `ML model suggests maintenance needed (${(prediction.predictedValue * 100).toFixed(0)}% likelihood)`;
            actions = [
              {
                action: 'Proactive maintenance',
                description: 'Schedule maintenance before issues occur',
                estimatedTime: 90
              },
              {
                action: 'Update dependencies',
                description: 'Check and update dependencies',
                toolsNeeded: ['dependency checker'],
                estimatedTime: 30
              }
            ];
            break;

          default:
            continue;
        }

        recommendations.push({
          scriptId: script.id!,
          recommendationType,
          priority: prediction.predictedValue > 0.8 ? 4 : 3,
          title,
          description,
          suggestedActions: actions,
          expectedBenefit: {
            qualityImprovement: 0.3,
            maintainabilityGain: 0.4,
            riskReduction: 0.5,
            description: 'Proactive improvement based on ML insights'
          },
          effortEstimate: prediction.predictedValue > 0.8 ? 'high' : 'medium',
          confidenceScore: prediction.confidenceScore,
          generatedBy: 'ml_engine',
          status: 'pending',
          createdAt: now,
          updatedAt: now
        });
      }
    }

    return recommendations;
  }

  /**
   * Helper methods
   */
  private getMetricValue(metrics: any[], type: string, name: string): number {
    const metric = metrics.find(m => m.metricType === type && m.metricName === name);
    return metric?.value || 0;
  }

  private async findSimilarScripts(script: Script): Promise<Script[]> {
    // Simple similarity based on type and size
    const query = `
      SELECT * FROM scripts 
      WHERE type = ? AND id != ? 
      AND ABS(file_size - ?) < ? 
      ORDER BY ABS(file_size - ?) 
      LIMIT 5
    `;
    
    const similarSize = script.fileSize || 1000;
    const tolerance = similarSize * 0.5;
    
    return await this.db.all(query, [
      script.type, script.id, similarSize, tolerance, similarSize
    ]);
  }

  private initializeRecommendationRules(): void {
    // Initialize rule-based recommendation templates
    // This could be expanded with more sophisticated rules
  }

  /**
   * Store recommendations in database
   */
  async storeRecommendations(recommendations: Recommendation[]): Promise<void> {
    if (recommendations.length === 0) return;

    const insertQuery = `
      INSERT OR REPLACE INTO recommendations 
      (script_id, recommendation_type, priority, title, description, suggested_actions, 
       expected_benefit, effort_estimate, confidence_score, generated_by, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await this.db.beginTransaction();
    try {
      for (const rec of recommendations) {
        await this.db.run(insertQuery, [
          rec.scriptId,
          rec.recommendationType,
          rec.priority,
          rec.title,
          rec.description,
          JSON.stringify(rec.suggestedActions),
          JSON.stringify(rec.expectedBenefit),
          rec.effortEstimate,
          rec.confidenceScore,
          rec.generatedBy,
          rec.status,
          rec.createdAt.toISOString(),
          rec.updatedAt.toISOString()
        ]);
      }
      await this.db.commitTransaction();
    } catch (error) {
      await this.db.rollbackTransaction();
      throw error;
    }
  }

  /**
   * Get recommendations for a script
   */
  async getScriptRecommendations(scriptId: number, status?: string[]): Promise<Recommendation[]> {
    let query = `
      SELECT id, script_id, recommendation_type, priority, title, description, 
             suggested_actions, expected_benefit, effort_estimate, confidence_score,
             generated_by, status, feedback_score, feedback_notes, created_at, updated_at, implemented_at
      FROM recommendations 
      WHERE script_id = ?
    `;
    
    const params = [scriptId];
    
    if (status && status.length > 0) {
      query += ` AND status IN (${status.map(() => '?').join(', ')})`;
      params.push(...status);
    }
    
    query += ` ORDER BY priority DESC, confidence_score DESC, created_at DESC`;

    const rows = await this.db.all(query, params);
    
    return rows.map(row => ({
      id: row.id,
      scriptId: row.script_id,
      recommendationType: row.recommendation_type,
      priority: row.priority,
      title: row.title,
      description: row.description,
      suggestedActions: JSON.parse(row.suggested_actions),
      expectedBenefit: JSON.parse(row.expected_benefit),
      effortEstimate: row.effort_estimate,
      confidenceScore: row.confidence_score,
      generatedBy: row.generated_by,
      status: row.status,
      feedbackScore: row.feedback_score,
      feedbackNotes: row.feedback_notes,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      implementedAt: row.implemented_at ? new Date(row.implemented_at) : undefined
    }));
  }
}