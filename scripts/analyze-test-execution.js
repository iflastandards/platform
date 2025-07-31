#!/usr/bin/env node

/**
 * Task 2.2: Test Execution Analysis - Identify Full Suite Issues
 * Analyzes current test scripts and identifies unnecessary full test runs
 */

const fs = require('fs');
const path = require('path');

class TestExecutionAnalyzer {
  constructor() {
    this.findings = {
      inefficientScripts: [],
      unnecessaryFullRuns: [],
      missingAffected: [],
      optimizationOpportunities: [],
      summary: {}
    };
  }

  async analyzeTestExecution() {
    console.log('🔍 TASK 2.2: Analyzing Test Execution Patterns\n');

    // Analyze package.json scripts
    await this.analyzePackageScripts();
    
    // Analyze nx configuration
    await this.analyzeNxConfig();
    
    // Analyze individual project configurations
    await this.analyzeProjectConfigs();
    
    // Generate optimization recommendations
    this.generateOptimizationPlan();
    
    this.printResults();
  }

  async analyzePackageScripts() {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const scripts = packageJson.scripts;

    console.log('📝 Analyzing package.json scripts...\n');

    // Identify scripts that run full test suites when they could use affected
    const fullSuitePatterns = [
      'run-many --target=test --all',
      'run-many --targets=typecheck,lint,test --all',
      'run-many --target=build --all'
    ];

    const affectedPatterns = [
      'affected --target=test',
      'affected --target=build',
      'affected --targets='
    ];

    for (const [scriptName, command] of Object.entries(scripts)) {
      if (typeof command !== 'string') continue;

      // Check for unnecessary full runs
      const hasFullRun = fullSuitePatterns.some(pattern => command.includes(pattern));
      const hasAffected = affectedPatterns.some(pattern => command.includes(pattern));

      if (hasFullRun && !scriptName.includes('all') && !scriptName.includes('comprehensive')) {
        this.findings.unnecessaryFullRuns.push({
          script: scriptName,
          command: command,
          issue: 'Runs full suite when affected might be sufficient',
          severity: 'medium'
        });
      }

      // Check for missing affected usage in development scripts
      if (scriptName.startsWith('test:') && !scriptName.includes('all') && 
          !scriptName.includes('comprehensive') && !scriptName.includes('ci') &&
          !hasAffected && command.includes('nx ')) {
        this.findings.missingAffected.push({
          script: scriptName,
          command: command,
          suggestion: 'Could use nx affected instead of running all projects'
        });
      }

      // Identify inefficient patterns
      if (command.includes('nx ') && !command.includes('--parallel')) {
        this.findings.inefficientScripts.push({
          script: scriptName,
          command: command,
          issue: 'Missing parallelization',
          suggestion: 'Add --parallel=3 or appropriate parallel count'
        });
      }
    }

    console.log(`✅ Analyzed ${Object.keys(scripts).length} scripts\n`);
  }

  async analyzeNxConfig() {
    const nxConfig = JSON.parse(fs.readFileSync('nx.json', 'utf8'));
    
    console.log('⚙️  Analyzing nx.json configuration...\n');

    // Check target defaults for optimization opportunities
    const targetDefaults = nxConfig.targetDefaults || {};
    
    // Check if test targets are properly configured for affected detection
    const testTargets = ['test', 'test:unit', 'test:integration', 'e2e'];
    
    testTargets.forEach(target => {
      if (targetDefaults[target]) {
        const config = targetDefaults[target];
        
        // Check for proper input configuration
        if (!config.inputs || !config.inputs.includes('testInputs')) {
          this.findings.optimizationOpportunities.push({
            target: target,
            issue: 'Missing testInputs in target configuration',
            impact: 'May cause unnecessary test runs due to poor change detection',
            suggestion: 'Add "testInputs" to inputs array'
          });
        }

        // Check for cache configuration
        if (!config.cache) {
          this.findings.optimizationOpportunities.push({
            target: target,
            issue: 'Caching not enabled',
            impact: 'Tests may run unnecessarily when results are cached',
            suggestion: 'Enable cache: true'
          });
        }
      }
    });

    // Check parallel configuration
    const parallelCount = nxConfig.parallel || nxConfig.defaultTasksRunnerOptions?.parallel;
    if (!parallelCount || parallelCount < 3) {
      this.findings.optimizationOpportunities.push({
        target: 'global',
        issue: `Low or missing parallel configuration (${parallelCount || 'none'})`,
        impact: 'Tests run sequentially, slower execution',
        suggestion: 'Set parallel to 3-8 based on CPU cores'
      });
    }

    console.log('✅ Analyzed nx configuration\n');
  }

  async analyzeProjectConfigs() {
    console.log('🏗️  Analyzing project configurations...\n');

    const projectDirs = ['apps/admin', 'packages/theme', 'scripts'];
    let projectsAnalyzed = 0;

    for (const projectDir of projectDirs) {
      const projectJsonPath = path.join(projectDir, 'project.json');
      if (fs.existsSync(projectJsonPath)) {
        const projectConfig = JSON.parse(fs.readFileSync(projectJsonPath, 'utf8'));
        const targets = projectConfig.targets || {};

        // Check test target configurations
        Object.entries(targets).forEach(([targetName, config]) => {
          if (targetName.includes('test') && config.executor === 'nx:run-commands') {
            const command = config.options?.command || '';
            
            // Check for hardcoded paths that could use affected
            if (command.includes('vitest run') && !command.includes('--changed')) {
              this.findings.optimizationOpportunities.push({
                project: projectConfig.name,
                target: targetName,
                issue: 'Hardcoded test execution, no affected detection',
                impact: 'All tests run regardless of changes',
                suggestion: 'Consider using vitest --changed or nx affected patterns'
              });
            }
          }
        });

        projectsAnalyzed++;
      }
    }

    console.log(`✅ Analyzed ${projectsAnalyzed} project configurations\n`);
  }

  generateOptimizationPlan() {
    console.log('📋 Generating optimization plan...\n');

    // Categorize findings by impact
    const highImpact = [
      ...this.findings.unnecessaryFullRuns.filter(f => f.severity === 'high'),
      ...this.findings.optimizationOpportunities.filter(f => f.impact?.includes('unnecessary'))
    ];

    const mediumImpact = [
      ...this.findings.unnecessaryFullRuns.filter(f => f.severity === 'medium'),
      ...this.findings.missingAffected,
      ...this.findings.inefficientScripts
    ];

    const lowImpact = [
      ...this.findings.optimizationOpportunities.filter(f => !f.impact?.includes('unnecessary'))
    ];

    this.findings.summary = {
      totalIssues: this.findings.unnecessaryFullRuns.length + 
                   this.findings.missingAffected.length + 
                   this.findings.inefficientScripts.length + 
                   this.findings.optimizationOpportunities.length,
      highImpactIssues: highImpact.length,
      mediumImpactIssues: mediumImpact.length,
      lowImpactIssues: lowImpact.length,
      categories: {
        unnecessaryFullRuns: this.findings.unnecessaryFullRuns.length,
        missingAffected: this.findings.missingAffected.length,
        inefficientScripts: this.findings.inefficientScripts.length,
        configurationIssues: this.findings.optimizationOpportunities.length
      }
    };
  }

  printResults() {
    console.log('📊 TEST EXECUTION ANALYSIS RESULTS');
    console.log('==================================\n');

    console.log(`📈 SUMMARY:`);
    console.log(`   Total issues found: ${this.findings.summary.totalIssues}`);
    console.log(`   🔴 High impact: ${this.findings.summary.highImpactIssues}`);
    console.log(`   🟡 Medium impact: ${this.findings.summary.mediumImpactIssues}`);
    console.log(`   🔵 Low impact: ${this.findings.summary.lowImpactIssues}\n`);

    if (this.findings.unnecessaryFullRuns.length > 0) {
      console.log('🚨 UNNECESSARY FULL TEST RUNS:');
      this.findings.unnecessaryFullRuns.forEach(finding => {
        console.log(`   Script: ${finding.script}`);
        console.log(`   Issue: ${finding.issue}`);
        console.log(`   Command: ${finding.command.substring(0, 100)}...`);
        console.log();
      });
    }

    if (this.findings.missingAffected.length > 0) {
      console.log('⚡ MISSING AFFECTED USAGE:');
      this.findings.missingAffected.slice(0, 5).forEach(finding => {
        console.log(`   Script: ${finding.script}`);
        console.log(`   Suggestion: ${finding.suggestion}`);
        console.log();
      });
      if (this.findings.missingAffected.length > 5) {
        console.log(`   ... and ${this.findings.missingAffected.length - 5} more scripts\n`);
      }
    }

    if (this.findings.inefficientScripts.length > 0) {
      console.log('🐌 INEFFICIENT EXECUTION PATTERNS:');
      this.findings.inefficientScripts.slice(0, 3).forEach(finding => {
        console.log(`   Script: ${finding.script}`);
        console.log(`   Issue: ${finding.issue}`);
        console.log(`   Suggestion: ${finding.suggestion}`);
        console.log();
      });
      if (this.findings.inefficientScripts.length > 3) {
        console.log(`   ... and ${this.findings.inefficientScripts.length - 3} more scripts\n`);
      }
    }

    if (this.findings.optimizationOpportunities.length > 0) {
      console.log('💡 OPTIMIZATION OPPORTUNITIES:');
      this.findings.optimizationOpportunities.slice(0, 5).forEach(finding => {
        console.log(`   Target: ${finding.target || finding.project}`);
        console.log(`   Issue: ${finding.issue}`);
        console.log(`   Impact: ${finding.impact}`);
        console.log(`   Suggestion: ${finding.suggestion}`);
        console.log();
      });
    }

    console.log('🎯 NEXT STEPS:');
    console.log('   1. Update scripts to use nx affected where appropriate');
    console.log('   2. Add parallelization to sequential test runs');
    console.log('   3. Configure proper test inputs for better change detection');
    console.log('   4. Enable caching for test targets');
    console.log('   5. Create tag-based test execution scripts\n');
  }

  async generateReport() {
    const report = `# Test Execution Analysis Report - Task 2.2

## Summary
- **Total Issues**: ${this.findings.summary.totalIssues}
- **High Impact**: ${this.findings.summary.highImpactIssues} issues
- **Medium Impact**: ${this.findings.summary.mediumImpactIssues} issues  
- **Low Impact**: ${this.findings.summary.lowImpactIssues} issues

## Issue Categories
- **Unnecessary Full Runs**: ${this.findings.summary.categories.unnecessaryFullRuns}
- **Missing Affected Usage**: ${this.findings.summary.categories.missingAffected}
- **Inefficient Scripts**: ${this.findings.summary.categories.inefficientScripts}
- **Configuration Issues**: ${this.findings.summary.categories.configurationIssues}

## Detailed Findings

### Unnecessary Full Test Runs
${this.findings.unnecessaryFullRuns.map(f => 
  `- **${f.script}**: ${f.issue}\n  - Command: \`${f.command}\``
).join('\n')}

### Missing Affected Usage
${this.findings.missingAffected.slice(0, 10).map(f => 
  `- **${f.script}**: ${f.suggestion}`
).join('\n')}

### Optimization Opportunities
${this.findings.optimizationOpportunities.slice(0, 10).map(f => 
  `- **${f.target || f.project}**: ${f.issue}\n  - Impact: ${f.impact}\n  - Suggestion: ${f.suggestion}`
).join('\n')}

## Optimization Priority
1. **High Impact**: Fix unnecessary full runs in development scripts
2. **Medium Impact**: Add affected usage to frequently used scripts  
3. **Low Impact**: Enable caching and improve configuration

## Next Steps
Ready to proceed to Task 2.3: Configure targeted test execution based on affected projects.
`;

    const reportPath = 'docs/testing/task-2-2-analysis-report.md';
    fs.writeFileSync(reportPath, report);
    console.log(`📄 Analysis report generated: ${reportPath}\n`);
  }
}

// Run analysis
if (require.main === module) {
  const analyzer = new TestExecutionAnalyzer();
  analyzer.analyzeTestExecution().then(() => {
    analyzer.generateReport();
  }).catch(console.error);
}

module.exports = { TestExecutionAnalyzer };
