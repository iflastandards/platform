#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const SITES = ['portal', 'isbdm', 'lrm', 'frbr', 'isbd', 'muldicat', 'unimarc'];
const WARNING_PATTERNS = [
  // Docusaurus warnings
  /\[WARNING\]/i,
  /\[WARN\]/i,
  /Warning:/i,
  /⚠️/,
  /yellow/i,
  
  // Common build warnings
  /deprecated/i,
  /obsolete/i,
  /broken link/i,
  /missing file/i,
  /not found/i,
  /unresolved/i,
  /invalid/i,
  
  // MDX/React warnings
  /React does not recognize/i,
  /Invalid prop/i,
  /Unknown prop/i,
  /Each child in a list/i,
  
  // Asset warnings
  /Failed to load/i,
  /404/i,
  /cannot resolve/i,
  
  // Accessibility warnings
  /aria-/i,
  /alt text/i,
  /heading order/i,
];

class BuildWarningCollector {
  constructor() {
    this.warnings = {};
    this.summary = {
      totalWarnings: 0,
      warningsBySite: {},
      warningsByType: {},
      criticalWarnings: [],
    };
  }

  /**
   * Capture build output and extract warnings
   */
  buildSiteAndCollectWarnings(site) {
    console.log(`\n🏗️  Building ${site}...`);
    
    const warnings = [];
    const startTime = Date.now();
    
    try {
      // Run build and capture both stdout and stderr
      const output = execSync(`pnpm nx build ${site} 2>&1`, {
        encoding: 'utf8',
        stdio: 'pipe',
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
      });
      
      // Split output into lines and check each for warnings
      const lines = output.split('\n');
      
      lines.forEach((line, index) => {
        const isWarning = WARNING_PATTERNS.some(pattern => pattern.test(line));
        
        if (isWarning) {
          // Capture context (2 lines before and after)
          const context = [];
          for (let i = Math.max(0, index - 2); i <= Math.min(lines.length - 1, index + 2); i++) {
            context.push(lines[i]);
          }
          
          warnings.push({
            line: line.trim(),
            lineNumber: index + 1,
            context: context.join('\n'),
            type: this.categorizeWarning(line),
            severity: this.assessSeverity(line),
          });
        }
      });
      
      const buildTime = ((Date.now() - startTime) / 1000).toFixed(2);
      
      this.warnings[site] = {
        warnings,
        buildTime,
        success: true,
      };
      
      console.log(`✅ ${site} built in ${buildTime}s with ${warnings.length} warnings`);
      
    } catch (error) {
      const buildTime = ((Date.now() - startTime) / 1000).toFixed(2);
      
      // Even on build failure, try to extract warnings from error output
      const errorOutput = error.stdout || error.stderr || error.toString();
      const lines = errorOutput.split('\n');
      
      lines.forEach((line, index) => {
        const isWarning = WARNING_PATTERNS.some(pattern => pattern.test(line));
        
        if (isWarning) {
          warnings.push({
            line: line.trim(),
            lineNumber: index + 1,
            context: line,
            type: this.categorizeWarning(line),
            severity: this.assessSeverity(line),
          });
        }
      });
      
      this.warnings[site] = {
        warnings,
        buildTime,
        success: false,
        error: error.message,
      };
      
      console.log(`❌ ${site} build failed after ${buildTime}s with ${warnings.length} warnings`);
    }
  }

  /**
   * Categorize warning by type
   */
  categorizeWarning(line) {
    if (/broken link|404|not found/i.test(line)) return 'broken-link';
    if (/deprecated|obsolete/i.test(line)) return 'deprecation';
    if (/React|prop|component/i.test(line)) return 'react';
    if (/aria-|alt text|heading/i.test(line)) return 'accessibility';
    if (/missing file|cannot resolve/i.test(line)) return 'missing-asset';
    if (/invalid|error/i.test(line)) return 'validation';
    return 'other';
  }

  /**
   * Assess warning severity
   */
  assessSeverity(line) {
    if (/error|failed|critical/i.test(line)) return 'critical';
    if (/deprecated|obsolete/i.test(line)) return 'high';
    if (/warning|warn/i.test(line)) return 'medium';
    return 'low';
  }

  /**
   * Generate summary statistics
   */
  generateSummary() {
    let totalWarnings = 0;
    
    Object.entries(this.warnings).forEach(([site, data]) => {
      const siteWarningCount = data.warnings.length;
      totalWarnings += siteWarningCount;
      
      this.summary.warningsBySite[site] = {
        count: siteWarningCount,
        buildTime: data.buildTime,
        success: data.success,
      };
      
      // Count by type
      data.warnings.forEach(warning => {
        if (!this.summary.warningsByType[warning.type]) {
          this.summary.warningsByType[warning.type] = 0;
        }
        this.summary.warningsByType[warning.type]++;
        
        // Collect critical warnings
        if (warning.severity === 'critical') {
          this.summary.criticalWarnings.push({
            site,
            warning: warning.line,
          });
        }
      });
    });
    
    this.summary.totalWarnings = totalWarnings;
  }

  /**
   * Generate markdown report
   */
  generateMarkdownReport() {
    let report = '# Docusaurus Build Warnings Report\n\n';
    report += `Generated: ${new Date().toISOString()}\n\n`;
    
    // Summary
    report += '## Summary\n\n';
    report += `- **Total Warnings**: ${this.summary.totalWarnings}\n`;
    report += `- **Sites Checked**: ${Object.keys(this.warnings).length}\n`;
    report += `- **Critical Warnings**: ${this.summary.criticalWarnings.length}\n\n`;
    
    // Warnings by Site
    report += '## Warnings by Site\n\n';
    report += '| Site | Warnings | Build Time | Status |\n';
    report += '|------|----------|------------|--------|\n';
    
    Object.entries(this.summary.warningsBySite).forEach(([site, data]) => {
      const status = data.success ? '✅' : '❌';
      report += `| ${site} | ${data.count} | ${data.buildTime}s | ${status} |\n`;
    });
    
    // Warnings by Type
    report += '\n## Warnings by Type\n\n';
    report += '| Type | Count |\n';
    report += '|------|-------|\n';
    
    Object.entries(this.summary.warningsByType)
      .sort(([, a], [, b]) => b - a)
      .forEach(([type, count]) => {
        report += `| ${type} | ${count} |\n`;
      });
    
    // Critical Warnings
    if (this.summary.criticalWarnings.length > 0) {
      report += '\n## ⚠️ Critical Warnings\n\n';
      this.summary.criticalWarnings.forEach(({ site, warning }) => {
        report += `- **${site}**: ${warning}\n`;
      });
    }
    
    // Detailed Warnings per Site
    report += '\n## Detailed Warnings\n\n';
    
    Object.entries(this.warnings).forEach(([site, data]) => {
      if (data.warnings.length === 0) return;
      
      report += `### ${site}\n\n`;
      
      // Group by type
      const warningsByType = {};
      data.warnings.forEach(warning => {
        if (!warningsByType[warning.type]) {
          warningsByType[warning.type] = [];
        }
        warningsByType[warning.type].push(warning);
      });
      
      Object.entries(warningsByType).forEach(([type, warnings]) => {
        report += `#### ${type} (${warnings.length})\n\n`;
        
        warnings.forEach((warning, index) => {
          report += `${index + 1}. Line ${warning.lineNumber}: \`${warning.line}\`\n`;
          
          if (warning.severity === 'critical' || warning.severity === 'high') {
            report += `   - **Severity**: ${warning.severity}\n`;
          }
        });
        
        report += '\n';
      });
    });
    
    return report;
  }

  /**
   * Generate JSON report for programmatic access
   */
  generateJsonReport() {
    return {
      metadata: {
        timestamp: new Date().toISOString(),
        sites: SITES,
      },
      summary: this.summary,
      details: this.warnings,
    };
  }

  /**
   * Generate GitHub Actions summary
   */
  generateGitHubSummary() {
    let summary = '## 📊 Build Warnings Summary\n\n';
    
    if (this.summary.totalWarnings === 0) {
      summary += '✅ **No warnings found!** All builds completed successfully.\n';
      return summary;
    }
    
    summary += `Found **${this.summary.totalWarnings}** warnings across ${Object.keys(this.warnings).length} sites.\n\n`;
    
    // Quick stats table
    summary += '### Sites Overview\n\n';
    summary += '| Site | Warnings | Status |\n';
    summary += '|------|----------|--------|\n';
    
    Object.entries(this.summary.warningsBySite).forEach(([site, data]) => {
      const status = data.success ? '✅ Success' : '❌ Failed';
      const warningBadge = data.count > 0 ? `⚠️ ${data.count}` : '✅ 0';
      summary += `| ${site} | ${warningBadge} | ${status} |\n`;
    });
    
    // Critical warnings alert
    if (this.summary.criticalWarnings.length > 0) {
      summary += `\n### 🚨 Critical Warnings (${this.summary.criticalWarnings.length})\n\n`;
      this.summary.criticalWarnings.slice(0, 5).forEach(({ site, warning }) => {
        summary += `- **${site}**: ${warning}\n`;
      });
      
      if (this.summary.criticalWarnings.length > 5) {
        summary += `\n_...and ${this.summary.criticalWarnings.length - 5} more critical warnings_\n`;
      }
    }
    
    summary += '\n📄 See artifact for full report.\n';
    
    return summary;
  }

  /**
   * Run the collection process
   */
  async run() {
    console.log('🔍 Collecting Docusaurus build warnings...\n');
    
    // Build each site and collect warnings
    for (const site of SITES) {
      this.buildSiteAndCollectWarnings(site);
    }
    
    // Generate summary
    this.generateSummary();
    
    // Create reports directory
    const reportsDir = path.join(process.cwd(), 'output', '_reports');
    fs.mkdirSync(reportsDir, { recursive: true });
    
    // Save reports
    const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
    
    // Markdown report
    const markdownReport = this.generateMarkdownReport();
    const markdownPath = path.join(reportsDir, `build-warnings-${timestamp}.md`);
    fs.writeFileSync(markdownPath, markdownReport);
    console.log(`\n📄 Markdown report saved to: ${markdownPath}`);
    
    // JSON report
    const jsonReport = this.generateJsonReport();
    const jsonPath = path.join(reportsDir, `build-warnings-${timestamp}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(jsonReport, null, 2));
    console.log(`📊 JSON report saved to: ${jsonPath}`);
    
    // GitHub summary (if in CI)
    if (process.env.GITHUB_STEP_SUMMARY) {
      const githubSummary = this.generateGitHubSummary();
      fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, githubSummary);
      console.log('📝 GitHub Actions summary updated');
    }
    
    // Console summary
    console.log('\n' + '='.repeat(50));
    console.log(`Total warnings found: ${this.summary.totalWarnings}`);
    console.log(`Critical warnings: ${this.summary.criticalWarnings.length}`);
    console.log('='.repeat(50) + '\n');
    
    // Exit with error if critical warnings found
    if (this.summary.criticalWarnings.length > 0) {
      console.error('❌ Critical warnings found! Check the report for details.');
      process.exit(1);
    }
    
    // Exit with warning status if any warnings found
    if (this.summary.totalWarnings > 0) {
      console.warn('⚠️  Warnings found. Check the report for details.');
      process.exit(0);
    }
    
    console.log('✅ No warnings found!');
  }
}

// Run if called directly
if (require.main === module) {
  const collector = new BuildWarningCollector();
  collector.run().catch(error => {
    console.error('Error collecting warnings:', error);
    process.exit(1);
  });
}

module.exports = BuildWarningCollector;