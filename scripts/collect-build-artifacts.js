#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Parse command line arguments
const args = process.argv.slice(2);
const typeIndex = args.findIndex(arg => arg === '--type');
const artifactType = typeIndex !== -1 ? args[typeIndex + 1] : 'warnings';

console.log(`📋 Collecting ${artifactType} artifacts...`);

// Helper function to find files matching pattern
function findFiles(pattern, dir = '.') {
  try {
    const files = execSync(`find ${dir} -name "${pattern}" -type f 2>/dev/null`, { encoding: 'utf8' })
      .trim()
      .split('\n')
      .filter(Boolean);
    return files;
  } catch (e) {
    return [];
  }
}

// Helper function to read file safely
function readFileSafe(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (e) {
    return null;
  }
}

// Collect different types of artifacts
switch (artifactType) {
  case 'warnings':
    collectWarnings();
    break;
  case 'api-tests':
    collectApiTests();
    break;
  case 'health-checks':
    collectHealthChecks();
    break;
  default:
    console.error(`❌ Unknown artifact type: ${artifactType}`);
    process.exit(1);
}

function collectWarnings() {
  console.log('## 🚧 Build Warnings Summary\n');
  
  const sites = ['portal', 'isbdm', 'lrm', 'frbr', 'isbd', 'muldicat', 'unimarc', 'admin'];
  let totalWarnings = 0;
  let totalBrokenLinks = 0;
  
  for (const site of sites) {
    // Look for warning files
    const warningFiles = findFiles(`warnings-${site}.txt`);
    const buildLogs = findFiles(`build-${site}.log`);
    
    let siteWarnings = [];
    let siteBrokenLinks = [];
    
    // Collect from warning files
    for (const file of warningFiles) {
      const content = readFileSafe(file);
      if (content && content.trim()) {
        const lines = content.trim().split('\n');
        lines.forEach(line => {
          if (line.toLowerCase().includes('broken link')) {
            siteBrokenLinks.push(line);
          } else {
            siteWarnings.push(line);
          }
        });
      }
    }
    
    // Collect from build logs
    for (const file of buildLogs) {
      const content = readFileSafe(file);
      if (content) {
        // Extract warnings
        const warningMatches = content.match(/warning[:\s].*/gi) || [];
        const brokenLinkMatches = content.match(/broken link.*/gi) || [];
        
        siteWarnings.push(...warningMatches);
        siteBrokenLinks.push(...brokenLinkMatches);
      }
    }
    
    // Output site summary
    if (siteWarnings.length > 0 || siteBrokenLinks.length > 0) {
      console.log(`### ${site.toUpperCase()}\n`);
      
      if (siteWarnings.length > 0) {
        console.log(`**Warnings (${siteWarnings.length}):**`);
        // Show first 5 warnings
        siteWarnings.slice(0, 5).forEach((warning, i) => {
          console.log(`${i + 1}. ${warning.trim()}`);
        });
        if (siteWarnings.length > 5) {
          console.log(`... and ${siteWarnings.length - 5} more warnings\n`);
        }
        console.log('');
      }
      
      if (siteBrokenLinks.length > 0) {
        console.log(`**Broken Links (${siteBrokenLinks.length}):**`);
        // Show all broken links as they're critical
        siteBrokenLinks.forEach((link, i) => {
          console.log(`${i + 1}. ${link.trim()}`);
        });
        console.log('');
      }
      
      totalWarnings += siteWarnings.length;
      totalBrokenLinks += siteBrokenLinks.length;
    }
  }
  
  // Overall summary
  console.log('### 📊 Total Summary\n');
  console.log(`- Total Warnings: ${totalWarnings}`);
  console.log(`- Total Broken Links: ${totalBrokenLinks}`);
  console.log(`- Sites with Issues: ${sites.filter(s => {
    const wf = findFiles(`warnings-${s}.txt`);
    return wf.some(f => readFileSafe(f)?.trim());
  }).length}/${sites.length}`);
  
  if (totalBrokenLinks > 0) {
    console.log('\n⚠️ **Action Required**: Fix broken links before production deployment');
  }
}

function collectApiTests() {
  console.log('## 🧪 API Test Results\n');
  
  const testTypes = ['supabase', 'clerk', 'github', 'render'];
  const results = {};
  
  // Look for test result files
  for (const testType of testTypes) {
    const resultFiles = findFiles(`*${testType}*test*.json`);
    const logFiles = findFiles(`*${testType}*test*.log`);
    
    results[testType] = {
      passed: 0,
      failed: 0,
      errors: []
    };
    
    // Parse JSON results
    for (const file of resultFiles) {
      const content = readFileSafe(file);
      if (content) {
        try {
          const data = JSON.parse(content);
          if (data.success) {
            results[testType].passed++;
          } else {
            results[testType].failed++;
            results[testType].errors.push(data.error || 'Unknown error');
          }
        } catch (e) {
          // Not valid JSON
        }
      }
    }
    
    // Parse log files for results
    for (const file of logFiles) {
      const content = readFileSafe(file);
      if (content) {
        if (content.includes('✅') || content.includes('passed')) {
          results[testType].passed++;
        }
        if (content.includes('❌') || content.includes('failed')) {
          results[testType].failed++;
          const errorMatch = content.match(/error[:\s](.+)/i);
          if (errorMatch) {
            results[testType].errors.push(errorMatch[1]);
          }
        }
      }
    }
  }
  
  // Output results
  for (const [service, result] of Object.entries(results)) {
    console.log(`### ${service.toUpperCase()} API\n`);
    
    if (result.passed > 0 || result.failed > 0) {
      console.log(`- ✅ Passed: ${result.passed}`);
      console.log(`- ❌ Failed: ${result.failed}`);
      
      if (result.errors.length > 0) {
        console.log('\n**Errors:**');
        result.errors.forEach((error, i) => {
          console.log(`${i + 1}. ${error}`);
        });
      }
    } else {
      console.log('No test results found');
    }
    console.log('');
  }
  
  // Overall summary
  const totalPassed = Object.values(results).reduce((sum, r) => sum + r.passed, 0);
  const totalFailed = Object.values(results).reduce((sum, r) => sum + r.failed, 0);
  
  console.log('### 📊 Total API Test Summary\n');
  console.log(`- Total Tests Run: ${totalPassed + totalFailed}`);
  console.log(`- ✅ Passed: ${totalPassed}`);
  console.log(`- ❌ Failed: ${totalFailed}`);
  console.log(`- Success Rate: ${totalPassed + totalFailed > 0 ? Math.round(totalPassed / (totalPassed + totalFailed) * 100) : 0}%`);
}

function collectHealthChecks() {
  console.log('## 🏥 Health Check Results\n');
  
  const services = [
    { name: 'GitHub Pages', type: 'site' },
    { name: 'Portal Homepage', type: 'site' },
    { name: 'ISBDM Site', type: 'site' },
    { name: 'Render Admin', type: 'admin' },
    { name: 'Supabase Connection', type: 'api' },
    { name: 'Clerk Auth', type: 'api' },
    { name: 'GitHub API Integration', type: 'api' }
  ];
  
  const results = [];
  
  // Look for health check results
  const healthFiles = findFiles('*health*.json');
  const healthLogs = findFiles('*health*.log');
  
  // Parse results
  for (const file of [...healthFiles, ...healthLogs]) {
    const content = readFileSafe(file);
    if (content) {
      services.forEach(service => {
        if (content.toLowerCase().includes(service.name.toLowerCase())) {
          const passed = content.includes('✅') || content.includes('healthy') || content.includes('200');
          const failed = content.includes('❌') || content.includes('failed') || content.includes('error');
          
          if (passed || failed) {
            results.push({
              service: service.name,
              type: service.type,
              status: passed ? 'healthy' : 'unhealthy',
              details: extractHealthDetails(content, service.name)
            });
          }
        }
      });
    }
  }
  
  // Group by type
  const siteChecks = results.filter(r => r.type === 'site');
  const apiChecks = results.filter(r => r.type === 'api');
  const adminChecks = results.filter(r => r.type === 'admin');
  
  // Output results
  if (siteChecks.length > 0) {
    console.log('### 🌐 Site Health\n');
    siteChecks.forEach(check => {
      const icon = check.status === 'healthy' ? '✅' : '❌';
      console.log(`- ${icon} ${check.service}: ${check.status}`);
      if (check.details) {
        console.log(`  Details: ${check.details}`);
      }
    });
    console.log('');
  }
  
  if (adminChecks.length > 0) {
    console.log('### 🔧 Admin Portal Health\n');
    adminChecks.forEach(check => {
      const icon = check.status === 'healthy' ? '✅' : '❌';
      console.log(`- ${icon} ${check.service}: ${check.status}`);
      if (check.details) {
        console.log(`  Details: ${check.details}`);
      }
    });
    console.log('');
  }
  
  if (apiChecks.length > 0) {
    console.log('### 🔌 API Health\n');
    apiChecks.forEach(check => {
      const icon = check.status === 'healthy' ? '✅' : '❌';
      console.log(`- ${icon} ${check.service}: ${check.status}`);
      if (check.details) {
        console.log(`  Details: ${check.details}`);
      }
    });
    console.log('');
  }
  
  // Overall summary
  const healthyCount = results.filter(r => r.status === 'healthy').length;
  const unhealthyCount = results.filter(r => r.status === 'unhealthy').length;
  
  console.log('### 📊 Overall Health Summary\n');
  console.log(`- Total Services Checked: ${results.length}`);
  console.log(`- ✅ Healthy: ${healthyCount}`);
  console.log(`- ❌ Unhealthy: ${unhealthyCount}`);
  console.log(`- Health Score: ${results.length > 0 ? Math.round(healthyCount / results.length * 100) : 0}%`);
  
  if (unhealthyCount > 0) {
    console.log('\n⚠️ **Action Required**: Some services are unhealthy');
  }
}

function extractHealthDetails(content, serviceName) {
  // Try to extract relevant details from the content
  const lines = content.split('\n');
  const serviceIndex = lines.findIndex(line => 
    line.toLowerCase().includes(serviceName.toLowerCase())
  );
  
  if (serviceIndex !== -1 && serviceIndex < lines.length - 1) {
    // Look for status codes, response times, etc.
    const nextLines = lines.slice(serviceIndex, serviceIndex + 3).join(' ');
    const statusMatch = nextLines.match(/status[:\s]+(\d+)/i);
    const timeMatch = nextLines.match(/(\d+)ms/);
    
    const details = [];
    if (statusMatch) details.push(`Status: ${statusMatch[1]}`);
    if (timeMatch) details.push(`Response time: ${timeMatch[1]}ms`);
    
    return details.join(', ') || null;
  }
  
  return null;
}