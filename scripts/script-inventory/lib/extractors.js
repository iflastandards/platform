#!/usr/bin/env node

/**
 * File Extractors Module
 * Identifies script relationships and package.json references
 * Documentation: scripts/script-inventory/README.md
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class FileExtractor {
  constructor(rootDir = process.cwd()) {
    this.rootDir = rootDir;
    this.packageJsonCache = new Map();
  }

  /**
   * Extract comprehensive file information
   */
  async extractFileInfo(filePath) {
    const absolutePath = path.isAbsolute(filePath)
      ? filePath
      : path.join(this.rootDir, filePath);

    const stats = await fs.stat(absolutePath);
    const content = await fs.readFile(absolutePath, 'utf-8');

    return {
      absolutePath,
      relativePath: path.relative(this.rootDir, absolutePath),
      directory: path.dirname(absolutePath),
      fileName: path.basename(absolutePath),
      extension: path.extname(absolutePath),
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
      hash: this.calculateHash(content),
      lineCount: content.split('\n').length,
      isSymlink: stats.isSymbolicLink(),
      permissions: this.formatPermissions(stats.mode),
    };
  }

  /**
   * Find package.json references to this script
   */
  async findPackageJsonReferences(scriptPath) {
    const references = [];
    const scriptName = path.basename(scriptPath);
    const relativeFromRoot = path.relative(this.rootDir, scriptPath);

    // Find all package.json files
    const packageJsonFiles = await this.findPackageJsonFiles();

    for (const pkgPath of packageJsonFiles) {
      const pkg = await this.loadPackageJson(pkgPath);

      if (!pkg) {continue;}

      // Check scripts section
      if (pkg.scripts) {
        for (const [name, command] of Object.entries(pkg.scripts)) {
          if (
            this.commandReferencesScript(command, scriptName, relativeFromRoot)
          ) {
            references.push({
              packageJson: pkgPath,
              section: 'scripts',
              name,
              command,
              type: 'npm-script',
            });
          }
        }
      }

      // Check bin section
      if (pkg.bin) {
        const bins =
          typeof pkg.bin === 'string' ? { [pkg.name]: pkg.bin } : pkg.bin;

        for (const [name, binPath] of Object.entries(bins)) {
          if (this.pathsMatch(binPath, relativeFromRoot)) {
            references.push({
              packageJson: pkgPath,
              section: 'bin',
              name,
              path: binPath,
              type: 'cli-tool',
            });
          }
        }
      }

      // Check main/module/exports
      const entryPoints = [
        pkg.main && { field: 'main', value: pkg.main },
        pkg.module && { field: 'module', value: pkg.module },
        pkg.exports && { field: 'exports', value: pkg.exports },
      ].filter(Boolean);

      for (const entry of entryPoints) {
        if (this.pathsMatch(entry.value, relativeFromRoot)) {
          references.push({
            packageJson: pkgPath,
            section: entry.field,
            path: entry.value,
            type: 'entry-point',
          });
        }
      }

      // Check nx project.json targets
      const projectJsonPath = path.join(path.dirname(pkgPath), 'project.json');
      try {
        const projectJson = JSON.parse(
          await fs.readFile(projectJsonPath, 'utf-8'),
        );
        if (projectJson.targets) {
          for (const [targetName, target] of Object.entries(
            projectJson.targets,
          )) {
            if (target.executor && target.options) {
              const command = target.options.command || target.options.script;
              if (
                command &&
                this.commandReferencesScript(
                  command,
                  scriptName,
                  relativeFromRoot,
                )
              ) {
                references.push({
                  packageJson: projectJsonPath,
                  section: 'nx-targets',
                  name: targetName,
                  command,
                  type: 'nx-target',
                });
              }
            }
          }
        }
      } catch {
        // No project.json or error reading it
      }
    }

    return references;
  }

  /**
   * Find related scripts (imports, calls, etc.)
   */
  async findRelatedScripts(scriptPath, content) {
    const related = new Set();
    const scriptDir = path.dirname(scriptPath);

    // Patterns for finding script references
    const patterns = [
      // Direct execution
      /(?:node|npm|npx|pnpm|yarn|tsx|ts-node)\s+([^\s]+\.(?:js|ts|mjs|cjs))/g,
      /exec(?:Sync)?\(['"]([^'"]+\.(?:js|ts|sh|py))['"]/g,
      /spawn(?:Sync)?\(['"]([^'"]+)['"]/g,

      // Shell execution
      /\$\(([^)]+\.(?:js|sh|py))\)/g,
      /`([^`]+\.(?:js|sh|py))`/g,
      /bash\s+([^\s]+\.sh)/g,
      /sh\s+([^\s]+\.sh)/g,
      /python\s+([^\s]+\.py)/g,

      // Imports/requires
      /require\(['"]\.\.?\/([^'"]+)['"]\)/g,
      /import\s+.*?\s+from\s+['"]\.\.?\/([^'"]+)['"]/g,

      // Source (bash)
      /source\s+([^\s]+)/g,
      /\.\s+([^\s]+)/g,
    ];

    for (const pattern of patterns) {
      const matches = [...content.matchAll(pattern)];
      for (const match of matches) {
        const referencedPath = match[1];

        // Resolve relative paths
        let resolvedPath;
        if (
          referencedPath.startsWith('./') ||
          referencedPath.startsWith('../')
        ) {
          resolvedPath = path.resolve(scriptDir, referencedPath);
        } else if (referencedPath.startsWith('/')) {
          resolvedPath = referencedPath;
        } else {
          // Could be in scripts/ or node_modules/
          resolvedPath = path.join(this.rootDir, 'scripts', referencedPath);
        }

        // Check if file exists
        try {
          await fs.access(resolvedPath);
          related.add(path.relative(this.rootDir, resolvedPath));
        } catch {
          // File doesn't exist, might be a package or dynamic
        }
      }
    }

    return Array.from(related);
  }

  /**
   * Analyze script for test relationships
   */
  async findTestRelationships(scriptPath, content) {
    const relationships = {
      isTest: false,
      testsFor: null,
      hasTests: null,
      testFiles: [],
    };

    const basename = path.basename(scriptPath);
    const dir = path.dirname(scriptPath);

    // Check if this is a test file
    if (
      basename.match(/\.(test|spec|e2e)\.(js|ts|mjs|cjs)$/) ||
      dir.includes('test') ||
      dir.includes('__tests__') ||
      dir.includes('specs')
    ) {
      relationships.isTest = true;

      // Try to find what it tests
      const targetName = basename
        .replace(/\.(test|spec|e2e)/, '')
        .replace(/\.(js|ts|mjs|cjs)$/, '');

      const possibleTargets = [
        path.join(dir, '..', targetName + '.js'),
        path.join(dir, '..', targetName + '.ts'),
        path.join(dir, '..', 'src', targetName + '.js'),
        path.join(dir, '..', 'lib', targetName + '.js'),
      ];

      for (const target of possibleTargets) {
        try {
          await fs.access(target);
          relationships.testsFor = path.relative(this.rootDir, target);
          break;
        } catch {
          // Not found
        }
      }
    } else {
      // Look for test files for this script
      const scriptName = basename.replace(/\.(js|ts|mjs|cjs)$/, '');
      const testPatterns = [
        path.join(dir, scriptName + '.test.js'),
        path.join(dir, scriptName + '.spec.js'),
        path.join(dir, '__tests__', scriptName + '.test.js'),
        path.join(dir, 'test', scriptName + '.test.js'),
        path.join(dir, '..', 'test', scriptName + '.test.js'),
      ];

      for (const testPath of testPatterns) {
        try {
          await fs.access(testPath);
          relationships.testFiles.push(path.relative(this.rootDir, testPath));
        } catch {
          // Not found
        }
      }

      relationships.hasTests = relationships.testFiles.length > 0;
    }

    return relationships;
  }

  /**
   * Calculate file hash for change detection
   */
  calculateHash(content) {
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  /**
   * Format file permissions
   */
  formatPermissions(mode) {
    const perms = [];
    const flags = [
      { mask: 0o400, char: 'r' },
      { mask: 0o200, char: 'w' },
      { mask: 0o100, char: 'x' },
    ];

    // Owner permissions
    for (const flag of flags) {
      perms.push(mode & flag.mask ? flag.char : '-');
    }

    // Group permissions
    for (const flag of flags) {
      perms.push(mode & (flag.mask >> 3) ? flag.char : '-');
    }

    // Other permissions
    for (const flag of flags) {
      perms.push(mode & (flag.mask >> 6) ? flag.char : '-');
    }

    return perms.join('');
  }

  /**
   * Find all package.json files in the repository
   */
  async findPackageJsonFiles() {
    const packageJsons = [];

    async function walk(dir) {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        // Skip node_modules and hidden directories
        if (entry.name === 'node_modules' || entry.name.startsWith('.')) {
          continue;
        }

        if (entry.isDirectory()) {
          await walk(fullPath);
        } else if (entry.name === 'package.json') {
          packageJsons.push(fullPath);
        }
      }
    }

    await walk(this.rootDir);
    return packageJsons;
  }

  /**
   * Load and cache package.json content
   */
  async loadPackageJson(pkgPath) {
    if (this.packageJsonCache.has(pkgPath)) {
      return this.packageJsonCache.get(pkgPath);
    }

    try {
      const content = await fs.readFile(pkgPath, 'utf-8');
      const pkg = JSON.parse(content);
      this.packageJsonCache.set(pkgPath, pkg);
      return pkg;
    } catch (error) {
      console.error(`Error loading ${pkgPath}:`, error.message);
      return null;
    }
  }

  /**
   * Check if a command references a script
   */
  commandReferencesScript(command, scriptName, relativePath) {
    if (!command) {return false;}

    // Direct reference
    if (command.includes(scriptName) || command.includes(relativePath)) {
      return true;
    }

    // Node execution patterns
    const patterns = [
      new RegExp(`node\\s+[^\\s]*${scriptName.replace('.', '\\.')}`),
      new RegExp(`tsx\\s+[^\\s]*${scriptName.replace('.', '\\.')}`),
      new RegExp(`ts-node\\s+[^\\s]*${scriptName.replace('.', '\\.')}`),
    ];

    return patterns.some((p) => p.test(command));
  }

  /**
   * Check if paths match (handling different formats)
   */
  pathsMatch(path1, path2) {
    if (!path1 || !path2) {return false;}

    // Normalize paths
    const norm1 = path.normalize(path1).replace(/\\/g, '/');
    const norm2 = path.normalize(path2).replace(/\\/g, '/');

    // Direct match
    if (norm1 === norm2) {return true;}

    // Check if one is relative version of the other
    if (norm1.endsWith(norm2) || norm2.endsWith(norm1)) {return true;}

    // Check without extension
    const withoutExt1 = norm1.replace(/\.[^.]+$/, '');
    const withoutExt2 = norm2.replace(/\.[^.]+$/, '');

    return (
      withoutExt1 === withoutExt2 ||
      withoutExt1.endsWith(withoutExt2) ||
      withoutExt2.endsWith(withoutExt1)
    );
  }
}

module.exports = FileExtractor;

// CLI interface
if (require.main === module) {
  const extractor = new FileExtractor();

  async function main() {
    const args = process.argv.slice(2);

    if (args.length === 0 || args[0] === '--help') {
      console.log(`
File Extractor - Extract file relationships and package.json references
Documentation: scripts/script-inventory/README.md

Usage: node extractors.js <file> [options]

Options:
  --help         Show this help message
  --info         Show file information
  --packages     Show package.json references
  --related      Show related scripts
  --tests        Show test relationships
  --all          Show all information (default)
  --json         Output as JSON
  --pretty       Pretty print output

Example:
  node extractors.js ../example-script.js --packages --pretty
      `);
      process.exit(0);
    }

    const filePath = args[0];
    const options = {
      info: args.includes('--info'),
      packages: args.includes('--packages'),
      related: args.includes('--related'),
      tests: args.includes('--tests'),
      all:
        args.includes('--all') ||
        (!args.includes('--info') &&
          !args.includes('--packages') &&
          !args.includes('--related') &&
          !args.includes('--tests')),
      json: args.includes('--json'),
      pretty: args.includes('--pretty'),
    };

    try {
      const results = {};

      if (options.all || options.info) {
        results.fileInfo = await extractor.extractFileInfo(filePath);
      }

      if (options.all || options.packages) {
        results.packageReferences =
          await extractor.findPackageJsonReferences(filePath);
      }

      if (options.all || options.related) {
        const content = await fs.readFile(filePath, 'utf-8');
        results.relatedScripts = await extractor.findRelatedScripts(
          filePath,
          content,
        );
      }

      if (options.all || options.tests) {
        const content = await fs.readFile(filePath, 'utf-8');
        results.testRelationships = await extractor.findTestRelationships(
          filePath,
          content,
        );
      }

      if (options.json || options.pretty) {
        if (options.pretty) {
          console.log(JSON.stringify(results, null, 2));
        } else {
          console.log(JSON.stringify(results));
        }
      } else {
        // Human-readable output
        if (results.fileInfo) {
          console.log('\n📄 File Information:');
          console.log(`  Path: ${results.fileInfo.relativePath}`);
          console.log(`  Size: ${results.fileInfo.size} bytes`);
          console.log(`  Lines: ${results.fileInfo.lineCount}`);
          console.log(`  Modified: ${results.fileInfo.modified}`);
        }

        if (results.packageReferences && results.packageReferences.length > 0) {
          console.log('\n📦 Package.json References:');
          results.packageReferences.forEach((ref) => {
            console.log(`  ${ref.type}: ${ref.name} in ${ref.packageJson}`);
          });
        }

        if (results.relatedScripts && results.relatedScripts.length > 0) {
          console.log('\n🔗 Related Scripts:');
          results.relatedScripts.forEach((script) => {
            console.log(`  - ${script}`);
          });
        }

        if (results.testRelationships) {
          console.log('\n🧪 Test Relationships:');
          if (results.testRelationships.isTest) {
            console.log(`  This is a test file`);
            if (results.testRelationships.testsFor) {
              console.log(`  Tests: ${results.testRelationships.testsFor}`);
            }
          } else {
            console.log(
              `  Has tests: ${results.testRelationships.hasTests ? 'Yes' : 'No'}`,
            );
            if (results.testRelationships.testFiles.length > 0) {
              results.testRelationships.testFiles.forEach((test) => {
                console.log(`  - ${test}`);
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  }

  main();
}
