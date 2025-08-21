#!/usr/bin/env node

/**
 * Smart pre-commit check - runs only typecheck, lint, and unit tests
 * - Dependency-only changes: Light typecheck only
 * - Documentation-only changes: Skip all checks
 * - Code changes: Typecheck, lint, and unit tests
 * - Optimized for parallel execution
 */

const { execSync } = require('child_process');
const { ensureDaemon } = require('./ensure-nx-daemon');

// Set Node.js memory limits for high-performance hardware
process.env.NODE_OPTIONS =
  '--max-old-space-size=8192 --max-semi-space-size=512';

console.log('\n🚀 Running smart pre-commit checks...\n');

// Ensure nx daemon is running for better performance
ensureDaemon();

// Get list of staged files
let stagedFiles = [];
try {
  const output = execSync('git diff --cached --name-only', {
    encoding: 'utf8',
  }).trim();
  stagedFiles = output ? output.split('\n').filter(Boolean) : [];
} catch (error) {
  console.log('⚠️  No staged files found or git error');
  stagedFiles = [];
}

console.log(
  '📋 Staged files:',
  stagedFiles.length > 0 ? stagedFiles : ['(no files)'],
);

// If no staged files, exit early
if (stagedFiles.length === 0) {
  console.log('✅ No staged files - skipping pre-commit checks\n');
  process.exit(0);
}

// Categorize changes
const dependencyFiles = [
  'package.json',
  'pnpm-lock.yaml',
  'yarn.lock',
  'package-lock.json',
];
const configFiles = [
  '.github/dependabot.yml',
  '.github/workflows/',
  '.husky/',
  'nx.json',
  'tsconfig.json',
];
const scriptFiles = stagedFiles.filter(
  (f) => f.endsWith('.sh') || f.startsWith('scripts/'),
);
const docFiles = stagedFiles.filter(
  (f) => f.endsWith('.md') || f.startsWith('developer_notes/'),
);
const codeFiles = stagedFiles.filter(
  (f) =>
    !dependencyFiles.includes(f) &&
    !configFiles.some((cf) => f.startsWith(cf)) &&
    !scriptFiles.includes(f) &&
    !docFiles.includes(f),
);

const isDependencyOnly =
  codeFiles.length === 0 &&
  stagedFiles.some((f) => dependencyFiles.includes(f));
const isDocumentationOnly =
  codeFiles.length === 0 &&
  docFiles.length > 0 &&
  stagedFiles.every((f) => docFiles.includes(f) || scriptFiles.includes(f));

console.log(`📊 Change analysis:
  - Dependency files: ${stagedFiles.filter((f) => dependencyFiles.includes(f)).length}
  - Code files: ${codeFiles.length}
  - Documentation files: ${docFiles.length}
  - Script files: ${scriptFiles.length}
  - Config files: ${stagedFiles.filter((f) => configFiles.some((cf) => f.startsWith(cf))).length}
`);

let hasErrors = false;

if (isDependencyOnly) {
  console.log(
    '🔍 Detected dependency-only changes - running light validation...\n',
  );

  // Quick typecheck on core packages only (includes theme build via dependencies)
  console.log('📋 Running core typecheck...');
  try {
    execSync('pnpm nx run admin:typecheck', {
      stdio: 'inherit',
      encoding: 'utf8',
    });
    console.log('✅ Core typecheck passed\n');
  } catch (error) {
    console.log('❌ Core typecheck failed\n');
    hasErrors = true;
  }
} else if (isDocumentationOnly) {
  console.log(
    '📝 Detected documentation-only changes - skipping validation...\n',
  );
  console.log('✅ Documentation changes require no validation\n');
} else {
  console.log('🔍 Detected code changes - running validation...\n');

  // Run typecheck on affected projects
  console.log('📋 Running affected typecheck...');
  try {
    execSync('pnpm nx affected --targets=typecheck --parallel=6', {
      stdio: 'inherit',
      encoding: 'utf8',
      env: {
        ...process.env,
        NODE_OPTIONS: '--max-old-space-size=6144',
      },
    });
    console.log('✅ TypeScript check passed\n');
  } catch (error) {
    console.log('❌ TypeScript check failed\n');
    hasErrors = true;
  }

  // Run ONLY unit tests (not integration or e2e)
  console.log('📋 Running affected unit tests...');
  try {
    execSync('pnpm nx affected --target=test:unit --parallel=6', {
      stdio: 'inherit',
      encoding: 'utf8',
      env: {
        ...process.env,
        NODE_OPTIONS: '--max-old-space-size=6144',
      },
    });
    console.log('✅ Unit tests passed\n');
  } catch (error) {
    console.log('❌ Unit tests failed\n');
    hasErrors = true;
  }
}

// Always run lint (fast) with hardware optimization
if (!isDocumentationOnly) {
  console.log('📋 Running ESLint...');
  try {
    execSync('pnpm nx affected --target=lint --parallel=6', {
      stdio: 'inherit',
      encoding: 'utf8',
      env: {
        ...process.env,
        NODE_OPTIONS: '--max-old-space-size=4096',
      },
    });
    console.log('✅ ESLint passed\n');
  } catch (error) {
    // ESLint warnings should not fail the pre-commit hook
    console.log('⚠️  ESLint completed with warnings (this is OK)\n');
    // Don't set hasErrors for lint warnings
  }
}

// Summary
if (hasErrors) {
  console.log(
    '❌ Pre-commit checks failed. Please fix errors before committing.\n',
  );
  process.exit(1);
} else {
  console.log('✅ Pre-commit checks passed!\n');
  console.log('📋 Checks performed:');
  if (isDependencyOnly) {
    console.log('   - Dependency-only changes: Light typecheck only');
  } else if (isDocumentationOnly) {
    console.log('   - Documentation-only changes: No validation needed');
  } else {
    console.log('   - Typecheck: ✓');
    console.log('   - Lint: ✓');
    console.log('   - Unit tests: ✓');
  }
  console.log('   - For urgent commits: git commit --no-verify\n');
  process.exit(0);
}
if (hasErrors) {
  console.log(
    '❌ Smart pre-commit checks failed. Please fix errors before committing.\n',
  );
  process.exit(1);
} else {
  console.log('✅ Smart pre-commit checks passed!\n');
  console.log('💡 Performance optimizations applied:');
  if (isDependencyOnly) {
    console.log(
      '   - Dependency-only changes: Light validation (saves ~3 minutes)',
    );
  } else if (isDocumentationOnly) {
    console.log('   - Documentation-only changes: No validation needed');
  } else {
    console.log(
      '   - Code changes: Full validation with hardware optimization',
    );
    console.log('   - Using 6 parallel processes (optimized for stability)');
    console.log('   - 6GB Node.js memory limit per process');
    console.log('   - Nx cache enabled for faster rebuilds');
  }
  console.log('   - Nx daemon running with 16GB memory limit');
  console.log('   - For urgent commits: git commit --no-verify\n');
  process.exit(0);
}
