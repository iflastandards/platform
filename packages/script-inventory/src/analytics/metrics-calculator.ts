/**
 * Advanced Analytics Engine - Metrics Calculator
 * Calculates comprehensive quality, complexity, and performance metrics
 */

import { promises as fs } from 'fs';
import * as path from 'path';
import { ScriptDatabase } from '../database/connection';
import type { Script } from '../types';

export interface ScriptMetric {
  scriptId: number;
  metricType: 'quality' | 'complexity' | 'maintainability' | 'usage' | 'performance';
  metricName: string;
  value: number;
  maxValue?: number;
  recordedAt: Date;
  analysisVersion: string;
}

export interface QualityMetrics {
  documentationCompleteness: number; // 0-1
  commentDensity: number; // comments per 100 lines
  codeToCommentRatio: number;
  hasExamples: boolean;
  hasUsageInfo: boolean;
  hasErrorHandling: boolean;
}

export interface ComplexityMetrics {
  linesOfCode: number;
  cyclomaticComplexity: number;
  cognitiveComplexity: number;
  nestingDepth: number;
  functionCount: number;
  averageFunctionLength: number;
}

export interface MaintainabilityMetrics {
  duplicatedCode: number; // percentage
  testCoverage: number; // percentage (estimated)
  dependencyCount: number;
  coupling: number; // 0-1 scale
  cohesion: number; // 0-1 scale
  technicalDebt: number; // estimated hours
}

export interface UsageMetrics {
  executionCount: number;
  lastExecuted?: Date;
  averageExecutionTime?: number;
  errorRate: number; // percentage
  popularityScore: number; // 0-1 scale
}

export interface PerformanceMetrics {
  memoryUsage?: number; // estimated MB
  cpuIntensity: number; // 0-1 scale
  ioOperations: number;
  asyncOperations: number;
  bottleneckScore: number; // 0-1 scale
}

export class MetricsCalculator {
  private db: ScriptDatabase;
  private analysisVersion = '3.0.0';

  constructor(db: ScriptDatabase) {
    this.db = db;
  }

  /**
   * Calculate all metrics for a script
   */
  async calculateAllMetrics(script: Script): Promise<ScriptMetric[]> {
    const metrics: ScriptMetric[] = [];
    
    try {
      const content = await fs.readFile(script.path, 'utf-8');
      
      // Calculate different metric categories
      const quality = await this.calculateQualityMetrics(script, content);
      const complexity = await this.calculateComplexityMetrics(script, content);
      const maintainability = await this.calculateMaintainabilityMetrics(script, content);
      const usage = await this.calculateUsageMetrics(script);
      const performance = await this.calculatePerformanceMetrics(script, content);

      // Convert to ScriptMetric format
      metrics.push(...this.convertQualityMetrics(script.id!, quality));
      metrics.push(...this.convertComplexityMetrics(script.id!, complexity));
      metrics.push(...this.convertMaintainabilityMetrics(script.id!, maintainability));
      metrics.push(...this.convertUsageMetrics(script.id!, usage));
      metrics.push(...this.convertPerformanceMetrics(script.id!, performance));

    } catch (error) {
      console.warn(`Failed to calculate metrics for ${script.path}:`, error);
    }

    return metrics;
  }

  /**
   * Calculate quality metrics
   */
  private async calculateQualityMetrics(script: Script, content: string): Promise<QualityMetrics> {
    const lines = content.split('\n');
    const totalLines = lines.length;
    const commentLines = lines.filter(line => 
      line.trim().startsWith('//') || 
      line.trim().startsWith('#') ||
      line.trim().startsWith('*') ||
      line.includes('/*') || line.includes('*/')
    ).length;

    const hasShebang = content.startsWith('#!');
    const hasUsageFunction = content.includes('usage()') || content.includes('--help') || content.includes('-h');
    const hasExamples = content.toLowerCase().includes('example') || content.toLowerCase().includes('usage:');
    const hasErrorHandling = content.includes('try') || content.includes('catch') || content.includes('except') || content.includes('error');

    return {
      documentationCompleteness: this.calculateDocumentationCompleteness(script, content),
      commentDensity: totalLines > 0 ? (commentLines / totalLines) * 100 : 0,
      codeToCommentRatio: commentLines > 0 ? (totalLines - commentLines) / commentLines : totalLines,
      hasExamples: hasExamples,
      hasUsageInfo: hasUsageFunction || hasShebang,
      hasErrorHandling: hasErrorHandling
    };
  }

  /**
   * Calculate complexity metrics
   */
  private async calculateComplexityMetrics(script: Script, content: string): Promise<ComplexityMetrics> {
    const lines = content.split('\n');
    const codeLines = lines.filter(line => line.trim() && !line.trim().startsWith('//') && !line.trim().startsWith('#')).length;
    
    // Simple cyclomatic complexity calculation
    const complexityKeywords = ['if', 'else', 'for', 'while', 'switch', 'case', 'catch', 'try', '?', '&&', '||'];
    const cyclomaticComplexity = this.countOccurrences(content, complexityKeywords) + 1;

    // Function counting
    const functionPatterns = [/function\s+\w+/g, /def\s+\w+/g, /\w+\s*=\s*function/g, /=>\s*\{/g];
    const functionCount = functionPatterns.reduce((count, pattern) => 
      count + (content.match(pattern)?.length || 0), 0);

    // Nesting depth estimation
    const maxNesting = this.calculateMaxNestingDepth(content);

    return {
      linesOfCode: codeLines,
      cyclomaticComplexity: cyclomaticComplexity,
      cognitiveComplexity: this.calculateCognitiveComplexity(content),
      nestingDepth: maxNesting,
      functionCount: functionCount,
      averageFunctionLength: functionCount > 0 ? codeLines / functionCount : codeLines
    };
  }

  /**
   * Calculate maintainability metrics
   */
  private async calculateMaintainabilityMetrics(script: Script, content: string): Promise<MaintainabilityMetrics> {
    const duplicatedCode = await this.estimateDuplicatedCode(content);
    const testCoverage = await this.estimateTestCoverage(script);
    const dependencyCount = this.countDependencies(content);
    const coupling = this.calculateCoupling(content);
    const technicalDebt = this.estimateTechnicalDebt(content);

    return {
      duplicatedCode: duplicatedCode,
      testCoverage: testCoverage,
      dependencyCount: dependencyCount,
      coupling: coupling,
      cohesion: 1 - coupling, // Simple inverse relationship
      technicalDebt: technicalDebt
    };
  }

  /**
   * Calculate usage metrics (from database history)
   */
  private async calculateUsageMetrics(script: Script): Promise<UsageMetrics> {
    try {
      // Query execution history from database
      const historyQuery = `
        SELECT 
          COUNT(*) as execution_count,
          MAX(recorded_at) as last_executed,
          AVG(CASE WHEN event_type = 'execution_error' THEN 1 ELSE 0 END) as error_rate
        FROM script_history 
        WHERE script_id = ? AND event_type IN ('executed', 'execution_error')
        AND recorded_at > datetime('now', '-30 days')
      `;
      
      const history = await this.db.get(historyQuery, [script.id]);
      
      // Calculate popularity based on recent interactions
      const interactionQuery = `
        SELECT COUNT(*) as interaction_count
        FROM user_interactions 
        WHERE object_type = 'script' AND object_id = ?
        AND created_at > datetime('now', '-30 days')
      `;
      
      const interactions = await this.db.get(interactionQuery, [script.id]);

      const popularityScore = Math.min(1, (interactions?.interaction_count || 0) / 100);

      return {
        executionCount: history?.execution_count || 0,
        lastExecuted: history?.last_executed ? new Date(history.last_executed) : undefined,
        averageExecutionTime: undefined, // Would need execution timing data
        errorRate: (history?.error_rate || 0) * 100,
        popularityScore: popularityScore
      };
    } catch (error) {
      return {
        executionCount: 0,
        errorRate: 0,
        popularityScore: 0
      };
    }
  }

  /**
   * Calculate performance metrics
   */
  private async calculatePerformanceMetrics(script: Script, content: string): Promise<PerformanceMetrics> {
    // Estimate CPU intensity based on code patterns
    const cpuIntensivePatterns = ['for', 'while', 'recursive', 'sort', 'filter', 'map', 'reduce'];
    const cpuIntensity = Math.min(1, this.countOccurrences(content, cpuIntensivePatterns) / 20);

    // Count I/O operations
    const ioPatterns = ['fs.', 'readFile', 'writeFile', 'fetch', 'http', 'request', 'database', 'db.'];
    const ioOperations = this.countOccurrences(content, ioPatterns);

    // Count async operations
    const asyncPatterns = ['async', 'await', 'Promise', '.then', 'callback', 'setTimeout'];
    const asyncOperations = this.countOccurrences(content, asyncPatterns);

    // Estimate memory usage based on data structures
    const memoryIntensivePatterns = ['new Array', 'new Map', 'new Set', 'Buffer', 'large', 'cache'];
    const memoryUsage = this.countOccurrences(content, memoryIntensivePatterns) * 5; // rough MB estimate

    // Calculate bottleneck score
    const bottleneckScore = Math.min(1, (cpuIntensity + (ioOperations / 10) + (asyncOperations / 15)) / 3);

    return {
      memoryUsage: memoryUsage,
      cpuIntensity: cpuIntensity,
      ioOperations: ioOperations,
      asyncOperations: asyncOperations,
      bottleneckScore: bottleneckScore
    };
  }

  /**
   * Helper methods for metric calculations
   */
  private calculateDocumentationCompleteness(script: Script, content: string): number {
    let score = 0;
    const maxScore = 10;

    // Check for various documentation elements
    if (script.purpose) score += 2;
    if (content.includes('usage') || content.includes('Usage')) score += 2;
    if (content.includes('example') || content.includes('Example')) score += 2;
    if (content.includes('param') || content.includes('@param')) score += 1;
    if (content.includes('return') || content.includes('@return')) score += 1;
    if (content.includes('TODO') || content.includes('FIXME')) score -= 1; // penalty
    if (content.startsWith('/**') || content.includes('"""')) score += 2; // proper doc comments

    return Math.max(0, Math.min(1, score / maxScore));
  }

  private calculateCognitiveComplexity(content: string): number {
    // Simplified cognitive complexity - weights different constructs
    const complexityMap = {
      'if': 1, 'else': 1, 'switch': 1, 'for': 1, 'while': 1,
      'try': 1, 'catch': 1, 'finally': 1, '?': 1,
      '&&': 1, '||': 1, 'break': 1, 'continue': 1
    };

    let complexity = 0;
    let nestingLevel = 0;

    const lines = content.split('\n');
    for (const line of lines) {
      // Track nesting level
      const openBraces = (line.match(/\{/g) || []).length;
      const closeBraces = (line.match(/\}/g) || []).length;
      nestingLevel += openBraces - closeBraces;

      // Add complexity for keywords
      Object.entries(complexityMap).forEach(([keyword, weight]) => {
        if (line.includes(keyword)) {
          complexity += weight * (1 + nestingLevel * 0.5); // nesting penalty
        }
      });
    }

    return complexity;
  }

  private calculateMaxNestingDepth(content: string): number {
    let maxDepth = 0;
    let currentDepth = 0;

    for (const char of content) {
      if (char === '{' || char === '(' || char === '[') {
        currentDepth++;
        maxDepth = Math.max(maxDepth, currentDepth);
      } else if (char === '}' || char === ')' || char === ']') {
        currentDepth--;
      }
    }

    return maxDepth;
  }

  private async estimateDuplicatedCode(content: string): Promise<number> {
    // Simple duplication detection - look for repeated blocks
    const lines = content.split('\n').filter(line => line.trim().length > 10);
    const lineSet = new Set(lines);
    const uniqueLines = lineSet.size;
    const totalLines = lines.length;

    return totalLines > 0 ? ((totalLines - uniqueLines) / totalLines) * 100 : 0;
  }

  private async estimateTestCoverage(script: Script): Promise<number> {
    try {
      // Look for test files with similar names
      const scriptDir = path.dirname(script.path);
      const scriptName = path.basename(script.path, path.extname(script.path));
      
      const testPatterns = [
        `${scriptName}.test.js`, `${scriptName}.spec.js`,
        `${scriptName}.test.ts`, `${scriptName}.spec.ts`,
        `test_${scriptName}.py`, `${scriptName}_test.py`
      ];

      for (const testPattern of testPatterns) {
        const testPath = path.join(scriptDir, testPattern);
        try {
          await fs.access(testPath);
          return 0.8; // Assume 80% coverage if test file exists
        } catch {
          continue;
        }
      }

      // Check for inline tests
      const content = await fs.readFile(script.path, 'utf-8');
      if (content.includes('test(') || content.includes('describe(') || content.includes('it(')) {
        return 0.6; // Assume 60% coverage for inline tests
      }

      return 0.1; // Minimal coverage if no tests found
    } catch {
      return 0;
    }
  }

  private countDependencies(content: string): number {
    const importPatterns = [
      /import\s+.*from\s+['"][^'"]+['"]/g,
      /require\s*\(\s*['"][^'"]+['"]\s*\)/g,
      /from\s+\w+\s+import/g,
      /#include\s*<[^>]+>/g
    ];

    return importPatterns.reduce((count, pattern) => 
      count + (content.match(pattern)?.length || 0), 0);
  }

  private calculateCoupling(content: string): number {
    // Estimate coupling based on external references
    const externalRefs = this.countOccurrences(content, [
      'import', 'require', 'from', 'global', 'window', 'process'
    ]);
    
    const internalRefs = this.countOccurrences(content, [
      'this.', 'self.', 'function', 'def', 'class'
    ]);

    const totalRefs = externalRefs + internalRefs;
    return totalRefs > 0 ? externalRefs / totalRefs : 0;
  }

  private estimateTechnicalDebt(content: string): number {
    // Estimate technical debt in hours based on code smells
    let debtHours = 0;

    const debtIndicators = {
      'TODO': 0.5,
      'FIXME': 1,
      'HACK': 2,
      'XXX': 1.5,
      'DEPRECATED': 3,
      'console.log': 0.1,
      'debugger': 0.2,
      'eval(': 4,
      '// @ts-ignore': 0.5
    };

    Object.entries(debtIndicators).forEach(([indicator, hours]) => {
      const count = (content.match(new RegExp(indicator, 'g')) || []).length;
      debtHours += count * hours;
    });

    return debtHours;
  }

  private countOccurrences(content: string, patterns: string[]): number {
    return patterns.reduce((count, pattern) => {
      const regex = new RegExp(pattern, 'gi');
      return count + (content.match(regex)?.length || 0);
    }, 0);
  }

  /**
   * Convert metric objects to ScriptMetric format
   */
  private convertQualityMetrics(scriptId: number, metrics: QualityMetrics): ScriptMetric[] {
    const now = new Date();
    return [
      { scriptId, metricType: 'quality', metricName: 'documentation_completeness', value: metrics.documentationCompleteness, maxValue: 1, recordedAt: now, analysisVersion: this.analysisVersion },
      { scriptId, metricType: 'quality', metricName: 'comment_density', value: metrics.commentDensity, maxValue: 100, recordedAt: now, analysisVersion: this.analysisVersion },
      { scriptId, metricType: 'quality', metricName: 'has_examples', value: metrics.hasExamples ? 1 : 0, maxValue: 1, recordedAt: now, analysisVersion: this.analysisVersion },
      { scriptId, metricType: 'quality', metricName: 'has_error_handling', value: metrics.hasErrorHandling ? 1 : 0, maxValue: 1, recordedAt: now, analysisVersion: this.analysisVersion }
    ];
  }

  private convertComplexityMetrics(scriptId: number, metrics: ComplexityMetrics): ScriptMetric[] {
    const now = new Date();
    return [
      { scriptId, metricType: 'complexity', metricName: 'lines_of_code', value: metrics.linesOfCode, recordedAt: now, analysisVersion: this.analysisVersion },
      { scriptId, metricType: 'complexity', metricName: 'cyclomatic_complexity', value: metrics.cyclomaticComplexity, recordedAt: now, analysisVersion: this.analysisVersion },
      { scriptId, metricType: 'complexity', metricName: 'cognitive_complexity', value: metrics.cognitiveComplexity, recordedAt: now, analysisVersion: this.analysisVersion },
      { scriptId, metricType: 'complexity', metricName: 'nesting_depth', value: metrics.nestingDepth, recordedAt: now, analysisVersion: this.analysisVersion },
      { scriptId, metricType: 'complexity', metricName: 'function_count', value: metrics.functionCount, recordedAt: now, analysisVersion: this.analysisVersion }
    ];
  }

  private convertMaintainabilityMetrics(scriptId: number, metrics: MaintainabilityMetrics): ScriptMetric[] {
    const now = new Date();
    return [
      { scriptId, metricType: 'maintainability', metricName: 'duplicated_code', value: metrics.duplicatedCode, maxValue: 100, recordedAt: now, analysisVersion: this.analysisVersion },
      { scriptId, metricType: 'maintainability', metricName: 'test_coverage', value: metrics.testCoverage, maxValue: 100, recordedAt: now, analysisVersion: this.analysisVersion },
      { scriptId, metricType: 'maintainability', metricName: 'dependency_count', value: metrics.dependencyCount, recordedAt: now, analysisVersion: this.analysisVersion },
      { scriptId, metricType: 'maintainability', metricName: 'coupling', value: metrics.coupling, maxValue: 1, recordedAt: now, analysisVersion: this.analysisVersion },
      { scriptId, metricType: 'maintainability', metricName: 'technical_debt', value: metrics.technicalDebt, recordedAt: now, analysisVersion: this.analysisVersion }
    ];
  }

  private convertUsageMetrics(scriptId: number, metrics: UsageMetrics): ScriptMetric[] {
    const now = new Date();
    return [
      { scriptId, metricType: 'usage', metricName: 'execution_count', value: metrics.executionCount, recordedAt: now, analysisVersion: this.analysisVersion },
      { scriptId, metricType: 'usage', metricName: 'error_rate', value: metrics.errorRate, maxValue: 100, recordedAt: now, analysisVersion: this.analysisVersion },
      { scriptId, metricType: 'usage', metricName: 'popularity_score', value: metrics.popularityScore, maxValue: 1, recordedAt: now, analysisVersion: this.analysisVersion }
    ];
  }

  private convertPerformanceMetrics(scriptId: number, metrics: PerformanceMetrics): ScriptMetric[] {
    const now = new Date();
    return [
      { scriptId, metricType: 'performance', metricName: 'cpu_intensity', value: metrics.cpuIntensity, maxValue: 1, recordedAt: now, analysisVersion: this.analysisVersion },
      { scriptId, metricType: 'performance', metricName: 'io_operations', value: metrics.ioOperations, recordedAt: now, analysisVersion: this.analysisVersion },
      { scriptId, metricType: 'performance', metricName: 'async_operations', value: metrics.asyncOperations, recordedAt: now, analysisVersion: this.analysisVersion },
      { scriptId, metricType: 'performance', metricName: 'bottleneck_score', value: metrics.bottleneckScore, maxValue: 1, recordedAt: now, analysisVersion: this.analysisVersion }
    ];
  }

  /**
   * Store metrics in database
   */
  async storeMetrics(metrics: ScriptMetric[]): Promise<void> {
    if (metrics.length === 0) return;

    const insertQuery = `
      INSERT OR REPLACE INTO script_metrics 
      (script_id, metric_type, metric_name, value, max_value, recorded_at, analysis_version)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    await this.db.beginTransaction();
    try {
      for (const metric of metrics) {
        await this.db.run(insertQuery, [
          metric.scriptId,
          metric.metricType,
          metric.metricName,
          metric.value,
          metric.maxValue,
          metric.recordedAt.toISOString(),
          metric.analysisVersion
        ]);
      }
      await this.db.commitTransaction();
    } catch (error) {
      await this.db.rollbackTransaction();
      throw error;
    }
  }

  /**
   * Get latest metrics for a script
   */
  async getScriptMetrics(scriptId: number, metricTypes?: string[]): Promise<ScriptMetric[]> {
    let query = `
      SELECT script_id, metric_type, metric_name, value, max_value, recorded_at, analysis_version
      FROM script_metrics 
      WHERE script_id = ?
    `;
    
    const params = [scriptId];
    
    if (metricTypes && metricTypes.length > 0) {
      query += ` AND metric_type IN (${metricTypes.map(() => '?').join(', ')})`;
      params.push(...metricTypes);
    }
    
    query += ` ORDER BY recorded_at DESC`;

    const rows = await this.db.all(query, params);
    
    return rows.map(row => ({
      scriptId: row.script_id,
      metricType: row.metric_type,
      metricName: row.metric_name,
      value: row.value,
      maxValue: row.max_value,
      recordedAt: new Date(row.recorded_at),
      analysisVersion: row.analysis_version
    }));
  }
}