#!/usr/bin/env node

/**
 * Phase 3.1: CI/CD Testing Analysis
 * Analyze current GitHub Actions workflows to identify optimization opportunities
 * for phase-based test execution, smart test selection, and efficient resource usage.
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

class CICDTestingAnalyzer {
  constructor() {
    this.workflowsDir = '.github/workflows';
    this.results = {
      workflows: [],
      testingPatterns: [],
      optimizationOpportunities: [],
      tagUsage: [],
      affectedUsage: [],
      parallelization: [],
      phaseCompliance: []
    };
  }

  async analyze() {
    console.log('🔍 Analyzing CI/CD Testing Patterns...\n');

    // Analyze existing workflows
    await this.analyzeWorkflows();
    
    // Analyze test script usage in CI
    await this.analyzeTestScriptUsage();
    
    // Identify optimization opportunities
    await this.identifyOptimizations();
    
    // Generate comprehensive report
    await this.generateReport();
    
    console.log('✅ CI/CD Testing Analysis Complete\n');
  }

  async analyzeWorkflows() {
    console.log('📋 Analyzing GitHub Actions workflows...');
    
    const workflowFiles = fs.readdirSync(this.workflowsDir)
      .filter(file => file.endsWith('.yml') || file.endsWith('.yaml'));

    for (const file of workflowFiles) {
      const filePath = path.join(this.workflowsDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      try {
        const workflow = yaml.load(content);
        await this.analyzeWorkflow(file, workflow, content);
      } catch (error) {
        console.log(`⚠️  Error parsing ${file}: ${error.message}`);
      }
    }
  }

  async analyzeWorkflow(filename, workflow, rawContent) {
    const analysis = {
      filename,
      name: workflow.name || filename,
      triggers: workflow.on || {},
      jobs: Object.keys(workflow.jobs || {}),
      testCommands: [],
      usesAffected: false,
      usesParallel: false,
      usesTags: false,
      hasPhaseBasedTesting: false,
      optimizationScore: 0,
      issues: []
    };

    // Analyze test patterns in workflow content
    this.analyzeTestPatterns(rawContent, analysis);
    
    // Analyze job structure
    if (workflow.jobs) {
      for (const [jobName, job] of Object.entries(workflow.jobs)) {
        this.analyzeJob(jobName, job, analysis);
      }
    }

    // Calculate optimization score
    analysis.optimizationScore = this.calculateOptimizationScore(analysis);
    
    this.results.workflows.push(analysis);
  }

  analyzeTestPatterns(content, analysis) {
    // Look for test command patterns
    const testPatterns = [
      /pnpm test/g,
      /nx.*test/g,
      /playwright test/g,
      /vitest/g,
      /npm test/g
    ];

    const affectedPatterns = [
      /nx affected/g,
      /--affected/g
    ];

    const parallelPatterns = [
      /--parallel/g,
      /--maxParallel/g,
      /parallel=\d+/g
    ];

    const tagPatterns = [
      /@unit/g,
      /@integration/g,
      /@e2e/g,
      /@smoke/g,
      /@critical/g,
      /--grep.*@/g,
      /--tags/g
    ];

    // Count occurrences
    testPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        analysis.testCommands.push(...matches);
      }
    });

    analysis.usesAffected = affectedPatterns.some(pattern => pattern.test(content));
    analysis.usesParallel = parallelPatterns.some(pattern => pattern.test(content));
    analysis.usesTags = tagPatterns.some(pattern => pattern.test(content));

    // Check for phase-based testing
    const phasePatterns = [
      /smoke/i,
      /integration/i,
      /comprehensive/i,
      /pre-commit/i,
      /pre-push/i
    ];
    
    analysis.hasPhaseBasedTesting = phasePatterns.some(pattern => pattern.test(content));
  }

  analyzeJob(jobName, job, analysis) {
    if (!job.steps) return;

    for (const step of job.steps) {
      if (step.run) {
        // Check for test-related steps
        if (this.isTestStep(step.run)) {
          analysis.testCommands.push(step.run);
          
          // Check for optimization opportunities
          if (!step.run.includes('affected') && step.run.includes('test')) {
            analysis.issues.push({
              job: jobName,
              step: step.name || 'unnamed step',
              issue: 'Missing affected optimization',
              suggestion: 'Consider using nx affected for faster builds'
            });
          }

          if (!step.run.includes('parallel') && step.run.includes('nx')) {
            analysis.issues.push({
              job: jobName,
              step: step.name || 'unnamed step',
              issue: 'Missing parallelization',
              suggestion: 'Add --parallel flag for faster execution'
            });
          }
        }
      }
    }
  }

  isTestStep(command) {
    const testKeywords = ['test', 'e2e', 'playwright', 'vitest', 'lint', 'typecheck'];
    return testKeywords.some(keyword => command.toLowerCase().includes(keyword));
  }

  calculateOptimizationScore(analysis) {
    let score = 0;
    
    // Positive points
    if (analysis.usesAffected) score += 25;
    if (analysis.usesParallel) score += 20;
    if (analysis.usesTags) score += 20;
    if (analysis.hasPhaseBasedTesting) score += 15;
    if (analysis.issues.length === 0) score += 20;
    
    return Math.min(score, 100);
  }

  async analyzeTestScriptUsage() {
    console.log('📊 Analyzing test script usage patterns...');
    
    // Read package.json to understand available test scripts
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const testScripts = Object.keys(packageJson.scripts)
      .filter(script => script.includes('test') || script.includes('e2e'))
      .map(script => ({
        name: script,
        command: packageJson.scripts[script],
        usesAffected: packageJson.scripts[script].includes('affected'),
        usesParallel: packageJson.scripts[script].includes('parallel'),
        usesTags: packageJson.scripts[script].includes('@') || packageJson.scripts[script].includes('tags'),
        phase: this.identifyTestPhase(script)
      }));

    this.results.testingPatterns = testScripts;
  }

  identifyTestPhase(scriptName) {
    if (scriptName.includes('smoke')) return 'smoke';
    if (scriptName.includes('pre-commit')) return 'pre-commit';
    if (scriptName.includes('pre-push')) return 'pre-push';
    if (scriptName.includes('comprehensive')) return 'comprehensive';
    if (scriptName.includes('ci')) return 'ci';
    if (scriptName.includes('unit')) return 'selective';
    if (scriptName.includes('integration')) return 'comprehensive';
    if (scriptName.includes('e2e')) return 'comprehensive';
    return 'unknown';
  }

  async identifyOptimizations() {
    console.log('🎯 Identifying optimization opportunities...');
    
    const optimizations = [];

    // Workflow-level optimizations
    for (const workflow of this.results.workflows) {
      if (workflow.optimizationScore < 80) {
        optimizations.push({
          type: 'workflow',
          target: workflow.filename,
          currentScore: workflow.optimizationScore,
          improvements: workflow.issues.map(issue => issue.suggestion),
          priority: workflow.optimizationScore < 50 ? 'HIGH' : 'MEDIUM'
        });
      }
    }

    // Phase-based testing opportunities
    const hasPhaseBasedWorkflows = this.results.workflows.some(w => w.hasPhaseBasedTesting);
    if (!hasPhaseBasedWorkflows) {
      optimizations.push({
        type: 'phase-based',
        target: 'CI/CD workflows',
        improvements: [
          'Create phase-based test execution workflows',
          'Separate smoke, integration, and comprehensive test phases',
          'Use different triggers for different test phases'
        ],
        priority: 'HIGH'
      });
    }

    // Tag-based testing opportunities
    const usesTagTesting = this.results.workflows.some(w => w.usesTags);
    if (!usesTagTesting) {
      optimizations.push({
        type: 'tag-based',
        target: 'Test execution',
        improvements: [
          'Implement tag-based test filtering in CI',
          'Use @critical, @smoke, @unit tags for selective execution',
          'Create tag-specific CI workflows'
        ],
        priority: 'HIGH'
      });
    }

    // Smart test selection opportunities
    const usesAffected = this.results.workflows.some(w => w.usesAffected);
    if (!usesAffected) {
      optimizations.push({
        type: 'smart-selection',
        target: 'Test execution',
        improvements: [
          'Implement nx affected for changed file detection',
          'Only run tests for affected projects',
          'Combine affected detection with tag filtering'
        ],
        priority: 'HIGH'
      });
    }

    this.results.optimizationOpportunities = optimizations;
  }

  async generateReport() {
    const reportPath = 'docs/testing/ci-cd-analysis-report.md';
    const report = this.generateMarkdownReport();
    
    // Ensure directory exists
    const dir = path.dirname(reportPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(reportPath, report);
    console.log(`📄 Analysis report saved to: ${reportPath}`);
    
    // Also generate JSON for programmatic use
    const jsonPath = 'docs/testing/ci-cd-analysis.json';
    fs.writeFileSync(jsonPath, JSON.stringify(this.results, null, 2));
    console.log(`📊 Analysis data saved to: ${jsonPath}`);
  }

  generateMarkdownReport() {
    const now = new Date().toISOString();
    
    return `# CI/CD Testing Analysis Report

Generated: ${now}

## Executive Summary

This report analyzes the current GitHub Actions workflows and identifies opportunities for optimizing test execution through phase-based testing, smart test selection, and improved parallelization.

### Key Findings

- **Workflows Analyzed**: ${this.results.workflows.length}
- **Test Scripts Found**: ${this.results.testingPatterns.length}
- **Optimization Opportunities**: ${this.results.optimizationOpportunities.length}
- **Average Optimization Score**: ${Math.round(this.results.workflows.reduce((sum, w) => sum + w.optimizationScore, 0) / this.results.workflows.length)}%

## Workflow Analysis

${this.results.workflows.map(workflow => `
### ${workflow.name} (${workflow.filename})

- **Optimization Score**: ${workflow.optimizationScore}%
- **Uses Affected**: ${workflow.usesAffected ? '✅' : '❌'}
- **Uses Parallel**: ${workflow.usesParallel ? '✅' : '❌'}
- **Uses Tags**: ${workflow.usesTags ? '✅' : '❌'}
- **Phase-Based**: ${workflow.hasPhaseBasedTesting ? '✅' : '❌'}

**Test Commands Found**: ${workflow.testCommands.length}
${workflow.testCommands.slice(0, 3).map(cmd => `- \`${cmd}\``).join('\n')}
${workflow.testCommands.length > 3 ? `- ...and ${workflow.testCommands.length - 3} more` : ''}

**Issues Found**: ${workflow.issues.length}
${workflow.issues.map(issue => `- **${issue.issue}** (${issue.job}): ${issue.suggestion}`).join('\n')}
`).join('\n')}

## Test Script Patterns

### By Phase
${Object.entries(this.groupByPhase()).map(([phase, scripts]) => `
**${phase.toUpperCase()} (${scripts.length} scripts)**
${scripts.slice(0, 5).map(script => `- \`${script.name}\`: ${script.usesAffected ? '✅' : '❌'} affected, ${script.usesParallel ? '✅' : '❌'} parallel, ${script.usesTags ? '✅' : '❌'} tags`).join('\n')}
${scripts.length > 5 ? `- ...and ${scripts.length - 5} more` : ''}
`).join('\n')}

## Optimization Opportunities

${this.results.optimizationOpportunities.map((opt, index) => `
### ${index + 1}. ${opt.type.toUpperCase()} - ${opt.priority} Priority

**Target**: ${opt.target}

**Improvements**:
${opt.improvements.map(improvement => `- ${improvement}`).join('\n')}
`).join('\n')}

## Recommendations

### Immediate Actions (Phase 3)
1. **Create Phase-Based Workflows**: Implement separate workflows for smoke, integration, and comprehensive testing
2. **Smart Test Selection**: Add nx affected detection to all test workflows  
3. **Tag-Based Filtering**: Implement tag-based test execution in CI pipelines
4. **Parallel Optimization**: Increase parallelization where missing

### Implementation Priority
1. **HIGH**: ${this.results.optimizationOpportunities.filter(o => o.priority === 'HIGH').length} optimizations
2. **MEDIUM**: ${this.results.optimizationOpportunities.filter(o => o.priority === 'MEDIUM').length} optimizations
3. **LOW**: ${this.results.optimizationOpportunities.filter(o => o.priority === 'LOW').length} optimizations

### Expected Benefits
- **Faster CI/CD execution**: 40-60% reduction in average workflow time
- **Resource efficiency**: 50-70% reduction in unnecessary test runs
- **Better feedback loops**: Faster failure detection through smart selection
- **Improved developer experience**: Phase-appropriate test execution

## Next Steps

1. Review this analysis with the development team
2. Prioritize optimizations based on impact and effort
3. Begin implementation with highest-priority items
4. Monitor and measure improvements post-implementation

---
*This report was generated by the CI/CD Testing Analyzer as part of Phase 3: Automate via CI/CD*
`;
  }

  groupByPhase() {
    const groups = {};
    for (const script of this.results.testingPatterns) {
      const phase = script.phase;
      if (!groups[phase]) groups[phase] = [];
      groups[phase].push(script);
    }
    return groups;
  }
}

// Run the analysis
if (require.main === module) {
  const analyzer = new CICDTestingAnalyzer();
  analyzer.analyze().catch(console.error);
}

module.exports = CICDTestingAnalyzer;
