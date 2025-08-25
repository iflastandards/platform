#!/usr/bin/env tsx
/**
 * Code Discovery Script
 * Analyzes existing scripts and functionality that can be refactored into admin UI
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { execSync } from 'child_process';

export interface DiscoveredScript {
  path: string;
  functionality: string;
  refactorPotential: 'high' | 'medium' | 'low';
  dependencies: string[];
}

/**
 * Searches the codebase for existing scripts that match feature keywords
 * and analyzes their potential for UI integration
 */
export async function discoverRefactorableCode(
  keywords: string[],
  resourceName: string
): Promise<DiscoveredScript[]> {
  const discovered: DiscoveredScript[] = [];
  
  // Search patterns for different types of scripts
  const searchPatterns = [
    ...keywords,
    resourceName,
    `${resourceName.slice(0, -1)}`, // singular form
    'process',
    'generate',
    'import',
    'export',
    'validate',
    'transform'
  ];
  
  // Directories to search
  const searchDirs = [
    'scripts/',
    'packages/',
    'apps/admin/src/lib/',
    'apps/admin/src/scripts/',
  ];
  
  try {
    // Use ripgrep to find files containing keywords
    const searchQuery = searchPatterns.join('|');
    const grepCommand = `rg -l -i "${searchQuery}" --type ts --type js --type tsx --type jsx ${searchDirs.join(' ')}`;
    
    let files: string[] = [];
    try {
      const output = execSync(grepCommand, { encoding: 'utf-8' });
      files = output.split('\n').filter(Boolean);
    } catch (error) {
      // No files found or rg not available, fall back to manual search
      files = await findScriptFiles(searchDirs);
    }
    
    // Analyze each file
    for (const filePath of files) {
      if (await fileExists(filePath)) {
        const analysis = await analyzeScript(filePath, keywords, resourceName);
        if (analysis) {
          discovered.push(analysis);
        }
      }
    }
    
    // Sort by refactor potential (high -> medium -> low)
    const potentialOrder = { 'high': 3, 'medium': 2, 'low': 1 };
    discovered.sort((a, b) => potentialOrder[b.refactorPotential] - potentialOrder[a.refactorPotential]);
    
    return discovered;
    
  } catch (error) {
    console.warn('Discovery error:', error);
    return [];
  }
}

/**
 * Analyzes a single script file for refactoring potential
 */
async function analyzeScript(
  filePath: string,
  keywords: string[],
  resourceName: string
): Promise<DiscoveredScript | null> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const lines = content.split('\n');
    
    // Skip test files and config files
    if (filePath.includes('.test.') || filePath.includes('.spec.') || filePath.includes('.config.')) {
      return null;
    }
    
    // Skip very short files (likely not substantial scripts)
    if (lines.length < 20) {
      return null;
    }
    
    // Extract imports to understand dependencies
    const dependencies = extractDependencies(content);
    
    // Determine functionality from file content
    const functionality = inferFunctionality(content, filePath, keywords);
    
    // Assess refactor potential
    const refactorPotential = assessRefactorPotential(content, filePath, keywords, resourceName);
    
    if (!functionality) {
      return null; // Could not determine what this script does
    }
    
    return {
      path: filePath,
      functionality,
      refactorPotential,
      dependencies
    };
    
  } catch (error) {
    console.warn(`Error analyzing ${filePath}:`, error);
    return null;
  }
}

/**
 * Extract dependencies from import/require statements
 */
function extractDependencies(content: string): string[] {
  const dependencies: string[] = [];
  const importRegex = /(?:import.*from\s+['"`]([^'"`]+)['"`]|require\(['"`]([^'"`]+)['"`]\))/g;
  
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const dep = match[1] || match[2];
    if (dep && !dep.startsWith('.') && !dep.startsWith('/')) {
      dependencies.push(dep);
    }
  }
  
  return [...new Set(dependencies)]; // Remove duplicates
}

/**
 * Infer what the script does based on its content
 */
function inferFunctionality(content: string, filePath: string, keywords: string[]): string {
  const fileName = path.basename(filePath, path.extname(filePath));
  
  // Common patterns to identify functionality
  const patterns = [
    { regex: /spreadsheet|csv|excel/i, description: 'Spreadsheet/CSV processing' },
    { regex: /vocabulary|term|concept/i, description: 'Vocabulary management' },
    { regex: /generate.*site|scaffold.*site/i, description: 'Site generation' },
    { regex: /import|upload|ingest/i, description: 'Data import/ingestion' },
    { regex: /export|download|output/i, description: 'Data export' },
    { regex: /validate|check|verify/i, description: 'Data validation' },
    { regex: /transform|convert|process/i, description: 'Data transformation' },
    { regex: /template|generate.*page/i, description: 'Template generation' },
    { regex: /compare|diff|analyze/i, description: 'Data comparison/analysis' },
    { regex: /server|dev|start/i, description: 'Development server management' },
  ];
  
  // Check content against patterns
  for (const pattern of patterns) {
    if (pattern.regex.test(content) || pattern.regex.test(fileName)) {
      return pattern.description;
    }
  }
  
  // Check for keyword matches in content
  const contentLower = content.toLowerCase();
  const matchingKeywords = keywords.filter(keyword => 
    contentLower.includes(keyword.toLowerCase())
  );
  
  if (matchingKeywords.length > 0) {
    return `${matchingKeywords[0]} processing`;
  }
  
  // Fallback: use filename to guess functionality
  if (fileName.includes('generate')) return 'Generation script';
  if (fileName.includes('process')) return 'Processing script';
  if (fileName.includes('import')) return 'Import script';
  if (fileName.includes('export')) return 'Export script';
  if (fileName.includes('validate')) return 'Validation script';
  
  return `${fileName.replace(/[-_]/g, ' ')} utility`;
}

/**
 * Assess how suitable a script is for refactoring into admin UI
 */
function assessRefactorPotential(
  content: string,
  filePath: string,
  keywords: string[],
  resourceName: string
): 'high' | 'medium' | 'low' {
  let score = 0;
  const contentLower = content.toLowerCase();
  const filePathLower = filePath.toLowerCase();
  
  // High potential indicators
  if (keywords.some(k => contentLower.includes(k.toLowerCase()))) score += 3;
  if (contentLower.includes(resourceName.toLowerCase())) score += 3;
  if (contentLower.includes('csv') || contentLower.includes('spreadsheet')) score += 2;
  if (contentLower.includes('import') || contentLower.includes('export')) score += 2;
  if (contentLower.includes('validate')) score += 2;
  if (contentLower.includes('process')) score += 1;
  
  // Medium potential indicators
  if (filePath.includes('scripts/')) score += 1;
  if (content.includes('inquirer') || content.includes('commander')) score += 1; // CLI tools
  if (content.includes('fs.') || content.includes('readFile')) score += 1; // File operations
  
  // Low potential detractors
  if (filePath.includes('build') || filePath.includes('deploy')) score -= 2;
  if (filePath.includes('test') || filePath.includes('spec')) score -= 3;
  if (content.includes('execSync') && !content.includes('inquirer')) score -= 1; // Pure shell scripts
  
  if (score >= 4) return 'high';
  if (score >= 2) return 'medium';
  return 'low';
}

/**
 * Fallback method to find script files manually
 */
async function findScriptFiles(searchDirs: string[]): Promise<string[]> {
  const files: string[] = [];
  
  for (const dir of searchDirs) {
    try {
      await traverseDirectory(dir, files);
    } catch (error) {
      // Directory doesn't exist, skip
      continue;
    }
  }
  
  return files;
}

/**
 * Recursively traverse directory to find script files
 */
async function traverseDirectory(dirPath: string, files: string[]): Promise<void> {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
        await traverseDirectory(fullPath, files);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (['.ts', '.js', '.tsx', '.jsx'].includes(ext)) {
          files.push(fullPath);
        }
      }
    }
  } catch (error) {
    // Skip directories we can't read
  }
}

/**
 * Check if file exists
 */
async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

// CLI support if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const keywords = process.argv[2]?.split(',') || ['user'];
  const resource = process.argv[3] || 'users';
  
  console.log(`🔍 Discovering refactorable code for: ${keywords.join(', ')}`);
  
  discoverRefactorableCode(keywords, resource).then(results => {
    console.log(`\n📋 Found ${results.length} relevant scripts:`);
    
    results.forEach(script => {
      const potentialColor = script.refactorPotential === 'high' ? '\x1b[32m' : 
                            script.refactorPotential === 'medium' ? '\x1b[33m' : '\x1b[31m';
      console.log(`  • ${script.path} - ${script.functionality} ${potentialColor}(${script.refactorPotential} potential)\x1b[0m`);
      if (script.dependencies.length > 0) {
        console.log(`    Dependencies: ${script.dependencies.join(', ')}`);
      }
    });
  }).catch(console.error);
}