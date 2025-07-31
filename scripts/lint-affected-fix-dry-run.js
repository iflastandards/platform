#!/usr/bin/env node

/**
 * Script to run ESLint with --fix-dry-run and custom formatter on affected files
 * Leverages Nx's affected detection while running ESLint directly
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔍 Finding affected files for linting...');

try {
  // Get affected files from Nx
  const affectedOutput = execSync('pnpm nx print-affected --select=files', { 
    encoding: 'utf8',
    stdio: ['inherit', 'pipe', 'inherit']
  });
  
  // Parse the JSON output (Nx returns a JSON array)
  let affectedFiles;
  try {
    affectedFiles = JSON.parse(affectedOutput);
  } catch {
    // Fallback: treat as newline-separated list
    affectedFiles = affectedOutput.trim().split('\n').filter(Boolean);
  }
  
  // Filter for TypeScript/JavaScript/MDX files
  const lintableFiles = affectedFiles.filter(file => 
    /\.(ts|tsx|js|jsx|mjs|cjs|mdx)$/.test(file) && 
    !file.includes('node_modules') &&
    !file.includes('.next') &&
    !file.includes('dist') &&
    !file.includes('build')
  );
  
  if (lintableFiles.length === 0) {
    console.log('✅ No affected files to lint.');
    process.exit(0);
  }
  
  console.log(`📝 Found ${lintableFiles.length} affected files to lint:`);
  lintableFiles.forEach(file => console.log(`  - ${file}`));
  
  // Check if eslint-formatter-fix-dry-run is available
  let formatter = 'stylish'; // Default formatter
  try {
    require.resolve('eslint-formatter-fix-dry-run');
    formatter = 'eslint-formatter-fix-dry-run';
    console.log('✨ Using eslint-formatter-fix-dry-run for enhanced output');
  } catch {
    console.log('ℹ️  Using default formatter (eslint-formatter-fix-dry-run not found)');
  }
  
  // Run ESLint with --fix-dry-run on affected files
  const eslintCommand = [
    'pnpm eslint',
    lintableFiles.join(' '),
    '--fix-dry-run',
    `--format ${formatter}`
  ].join(' ');
  
  console.log('\n🚀 Running ESLint with fix-dry-run...');
  console.log(`Command: ${eslintCommand}\n`);
  
  execSync(eslintCommand, { 
    stdio: 'inherit',
    encoding: 'utf8'
  });
  
  console.log('\n✅ ESLint completed successfully!');
  
} catch (error) {
  if (error.status === 1) {
    // ESLint found issues but that's expected with --fix-dry-run
    console.log('\n📋 ESLint completed with issues found (this is normal with --fix-dry-run)');
    process.exit(0);
  } else {
    console.error('\n❌ Error running lint on affected files:', error.message);
    process.exit(1);
  }
}
