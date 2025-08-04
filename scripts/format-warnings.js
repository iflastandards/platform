#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Format warnings from JSON into various outputs
 */
class WarningFormatter {
  constructor(jsonPath) {
    this.data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  }

  /**
   * Group warnings by type and severity
   */
  analyzeWarnings() {
    const analysis = {
      byType: {},
      bySeverity: {},
      bySite: {},
      patterns: {},
    };

    this.data.forEach(({ site, warnings }) => {
      warnings.forEach(warning => {
        // Extract warning type
        let type = 'other';
        if (/broken link|404/i.test(warning.line)) {
          type = 'broken-link';
        } else if (/deprecated/i.test(warning.line)) {
          type = 'deprecation';
        } else if (/React|prop/i.test(warning.line)) {
          type = 'react';
        } else if (/missing|not found/i.test(warning.line)) {
          type = 'missing-file';
        }

        // Count by type
        analysis.byType[type] = (analysis.byType[type] || 0) + 1;

        // Group by site
        if (!analysis.bySite[site]) {
          analysis.bySite[site] = [];
        }
        analysis.bySite[site].push({ type, warning: warning.line });

        // Find common patterns
        const pattern = this.extractPattern(warning.line);
        if (pattern) {
          analysis.patterns[pattern] = (analysis.patterns[pattern] || 0) + 1;
        }
      });
    });

    return analysis;
  }

  /**
   * Extract common warning patterns
   */
  extractPattern(line) {
    // Remove specific file paths and IDs to find patterns
    return line
      .replace(/\/[^\s]+\.(mdx?|tsx?|jsx?)/g, '/[FILE]')
      .replace(/P\d+/g, '[ID]')
      .replace(/line \d+/g, 'line [N]')
      .replace(/:\d+:\d+/g, ':[LINE]:[COL]');
  }

  /**
   * Generate actionable report
   */
  generateActionableReport() {
    const analysis = this.analyzeWarnings();
    let report = '# Actionable Warning Report\n\n';

    // Priority issues
    report += '## 🎯 Priority Issues\n\n';
    
    // Broken links are high priority
    const brokenLinks = [];
    this.data.forEach(({ site, warnings }) => {
      warnings.forEach(w => {
        if (/broken link|404/i.test(w.line)) {
          brokenLinks.push({ site, warning: w.line });
        }
      });
    });

    if (brokenLinks.length > 0) {
      report += `### Broken Links (${brokenLinks.length})\n\n`;
      report += 'These need immediate attention:\n\n';
      brokenLinks.forEach(({ site, warning }) => {
        const match = warning.match(/to "([^"]+)"/);
        const url = match ? match[1] : 'unknown';
        report += `- [ ] **${site}**: Fix broken link to \`${url}\`\n`;
      });
      report += '\n';
    }

    // Common patterns
    report += '## 📊 Common Patterns\n\n';
    const sortedPatterns = Object.entries(analysis.patterns)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    if (sortedPatterns.length > 0) {
      report += 'Most frequent warning patterns:\n\n';
      sortedPatterns.forEach(([pattern, count]) => {
        report += `- **${count}x**: \`${pattern}\`\n`;
      });
      report += '\n';
    }

    // By site breakdown
    report += '## 📁 By Site\n\n';
    Object.entries(analysis.bySite).forEach(([site, warnings]) => {
      if (warnings.length === 0) return;
      
      report += `### ${site} (${warnings.length} warnings)\n\n`;
      
      // Group by type for this site
      const typeGroups = {};
      warnings.forEach(({ type, warning }) => {
        if (!typeGroups[type]) typeGroups[type] = [];
        typeGroups[type].push(warning);
      });

      Object.entries(typeGroups).forEach(([type, items]) => {
        report += `**${type}** (${items.length}):\n`;
        items.slice(0, 3).forEach(item => {
          report += `- ${item}\n`;
        });
        if (items.length > 3) {
          report += `- _...and ${items.length - 3} more_\n`;
        }
        report += '\n';
      });
    });

    // Action items
    report += '## ✅ Recommended Actions\n\n';
    report += '1. **Fix broken links**: Update or remove broken references\n';
    report += '2. **Update deprecated code**: Replace deprecated APIs\n';
    report += '3. **Add missing files**: Create missing assets or update references\n';
    report += '4. **Review React warnings**: Update component props and patterns\n';

    return report;
  }

  /**
   * Generate CSV for spreadsheet analysis
   */
  generateCSV() {
    let csv = 'Site,Warning Type,Warning,Timestamp\n';
    
    this.data.forEach(({ site, warnings }) => {
      warnings.forEach(warning => {
        let type = 'other';
        if (/broken link/i.test(warning.line)) type = 'broken-link';
        else if (/deprecated/i.test(warning.line)) type = 'deprecation';
        else if (/React/i.test(warning.line)) type = 'react';
        else if (/missing/i.test(warning.line)) type = 'missing-file';
        
        const line = warning.line.replace(/"/g, '""'); // Escape quotes
        csv += `"${site}","${type}","${line}","${warning.timestamp || ''}"\n`;
      });
    });
    
    return csv;
  }

  /**
   * Generate team-specific reports
   */
  generateTeamReport(team) {
    const teamFilters = {
      frontend: ['react', 'component', 'prop', 'jsx'],
      content: ['broken-link', 'missing-file', 'mdx'],
      infrastructure: ['build', 'webpack', 'dependency'],
    };

    const keywords = teamFilters[team] || [];
    let report = `# ${team.charAt(0).toUpperCase() + team.slice(1)} Team Warnings\n\n`;

    const relevantWarnings = [];
    this.data.forEach(({ site, warnings }) => {
      warnings.forEach(warning => {
        if (keywords.some(kw => warning.line.toLowerCase().includes(kw))) {
          relevantWarnings.push({ site, warning: warning.line });
        }
      });
    });

    if (relevantWarnings.length === 0) {
      report += '✅ No warnings relevant to your team!\n';
    } else {
      report += `Found ${relevantWarnings.length} warnings relevant to your team:\n\n`;
      relevantWarnings.forEach(({ site, warning }) => {
        report += `- **${site}**: ${warning}\n`;
      });
    }

    return report;
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const jsonPath = args[0] || 'output/_reports/build-warnings.json';
  const outputType = args[1] || 'actionable';

  if (!fs.existsSync(jsonPath)) {
    console.error(`Error: ${jsonPath} not found`);
    process.exit(1);
  }

  const formatter = new WarningFormatter(jsonPath);

  switch (outputType) {
    case 'actionable':
      console.log(formatter.generateActionableReport());
      break;
    case 'csv':
      console.log(formatter.generateCSV());
      break;
    case 'frontend':
    case 'content':
    case 'infrastructure':
      console.log(formatter.generateTeamReport(outputType));
      break;
    default:
      console.log('Usage: node format-warnings.js [json-path] [actionable|csv|frontend|content|infrastructure]');
  }
}

module.exports = WarningFormatter;