#!/usr/bin/env node
/**
 * Script to identify and optionally clean up NextAuth and Cerbos references
 * 
 * Run with: pnpm tsx scripts/cleanup-old-auth.ts [--dry-run|--clean]
 */

import { readFile, writeFile } from 'fs/promises';
import { glob } from 'glob';

// Patterns to search for
const OLD_AUTH_PATTERNS = [
  /TODO:?\s*Implement proper role checking without Cerbos/gi,
  /getCerbosUser/g,
  /CerbosUser/g,
  /next-auth/gi,
  /NextAuth/g,
  /cerbos policy/gi,
];

// File patterns to search
const FILE_PATTERNS = [
  'apps/admin/src/**/*.{ts,tsx,js,jsx}',
  'packages/**/*.{ts,tsx,js,jsx}',
  'e2e/**/*.{ts,tsx,js,jsx}',
  '*.md',
  'docs/**/*.md',
  'developer_notes/**/*.md',
  'system-design-docs/**/*.md',
];

// Files to skip
const SKIP_FILES = [
  'node_modules',
  '.next',
  'dist',
  'build',
  '.git',
  'scripts/cleanup-old-auth.ts',
  'scripts/setup-clerk-organizations.ts',
  'docs/CLERK_MIGRATION_CLEANUP.md',
];

interface FileMatch {
  file: string;
  matches: Array<{
    line: number;
    text: string;
    pattern: RegExp;
  }>;
}

async function findOldReferences(): Promise<FileMatch[]> {
  const results: FileMatch[] = [];
  
  // Get all files matching patterns
  const files: string[] = [];
  for (const pattern of FILE_PATTERNS) {
    const matches = await glob(pattern, { 
      ignore: SKIP_FILES,
      nodir: true 
    });
    files.push(...matches);
  }
  
  // Search each file
  for (const file of files) {
    try {
      const content = await readFile(file, 'utf-8');
      const lines = content.split('\n');
      const fileMatches: FileMatch['matches'] = [];
      
      lines.forEach((line, index) => {
        for (const pattern of OLD_AUTH_PATTERNS) {
          if (pattern.test(line)) {
            fileMatches.push({
              line: index + 1,
              text: line.trim(),
              pattern
            });
          }
        }
      });
      
      if (fileMatches.length > 0) {
        results.push({ file, matches: fileMatches });
      }
    } catch (error) {
      console.error(`Error reading ${file}:`, error);
    }
  }
  
  return results;
}

async function cleanupFile(filePath: string, isDryRun: boolean): Promise<number> {
  const content = await readFile(filePath, 'utf-8');
  let updated = content;
  let changeCount = 0;
  
  // Replace TODO comments
  updated = updated.replace(
    /\/\/\s*TODO:?\s*Implement proper role checking without Cerbos[^\n]*/gi,
    '// Role checking implemented via Clerk organizations'
  );
  
  // Count changes
  if (updated !== content) {
    changeCount = (content.match(/TODO:?\s*Implement proper role checking without Cerbos/gi) || []).length;
    
    if (!isDryRun) {
      await writeFile(filePath, updated, 'utf-8');
      console.log(`✅ Updated ${filePath} (${changeCount} changes)`);
    } else {
      console.log(`Would update ${filePath} (${changeCount} changes)`);
    }
  }
  
  return changeCount;
}

async function main() {
  const args = process.argv.slice(2);
  const isDryRun = !args.includes('--clean');
  const shouldClean = args.includes('--clean') || args.includes('--dry-run');
  
  console.log('🔍 Searching for old authentication references...\n');
  
  const results = await findOldReferences();
  
  if (results.length === 0) {
    console.log('✨ No old authentication references found!');
    return;
  }
  
  // Group by type
  const codeFiles = results.filter(r => r.file.match(/\.(ts|tsx|js|jsx)$/));
  const docFiles = results.filter(r => r.file.match(/\.md$/));
  
  console.log(`Found references in ${results.length} files:\n`);
  console.log(`📝 Code files: ${codeFiles.length}`);
  console.log(`📚 Documentation files: ${docFiles.length}\n`);
  
  // Display findings
  console.log('=== Code Files ===');
  for (const result of codeFiles) {
    console.log(`\n📄 ${result.file}`);
    for (const match of result.matches) {
      console.log(`   Line ${match.line}: ${match.text.substring(0, 80)}...`);
    }
  }
  
  console.log('\n=== Documentation Files ===');
  for (const result of docFiles) {
    console.log(`\n📄 ${result.file}`);
    console.log(`   ${result.matches.length} references found`);
  }
  
  // Cleanup if requested
  if (shouldClean) {
    console.log('\n🧹 Starting cleanup...\n');
    console.log(isDryRun ? '(DRY RUN - no files will be modified)\n' : '');
    
    let totalChanges = 0;
    
    // Only clean TODO comments in code files
    for (const result of codeFiles) {
      if (result.matches.some(m => m.pattern.source.includes('TODO'))) {
        const changes = await cleanupFile(result.file, isDryRun);
        totalChanges += changes;
      }
    }
    
    console.log(`\n✨ Cleanup complete! ${totalChanges} changes ${isDryRun ? 'would be' : 'were'} made.`);
    
    if (isDryRun) {
      console.log('\nRun with --clean to apply changes.');
    }
  }
  
  // Summary
  console.log('\n📊 Summary:');
  console.log(`   Total files with references: ${results.length}`);
  console.log(`   Total matches: ${results.reduce((sum, r) => sum + r.matches.length, 0)}`);
  
  console.log('\n💡 Next steps:');
  console.log('   1. Review the findings above');
  console.log('   2. Run with --dry-run to preview automatic cleanups');
  console.log('   3. Run with --clean to apply automatic cleanups');
  console.log('   4. Manually update documentation files as needed');
  console.log('   5. See docs/CLERK_MIGRATION_CLEANUP.md for detailed instructions');
}

main().catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});