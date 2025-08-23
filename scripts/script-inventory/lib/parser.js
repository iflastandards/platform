#!/usr/bin/env node

/**
 * Script Parser Module
 * Extracts metadata and documentation from script files
 * Documentation: scripts/script-inventory/README.md
 */

const fs = require('fs').promises;
const path = require('path');

class ScriptParser {
  constructor() {
    this.patterns = {
      // Documentation patterns
      docString: /^(['"])([^'"]*)\1/gm,
      docComment: /\/\*\*([\s\S]*?)\*\//g,
      lineComment: /^\s*(?:\/\/|#)\s*(.+)/gm,

      // CLI argument patterns
      cliArgs: {
        yargs: /\.option\(['"]([^'"]+)['"],\s*{([^}]+)}/g,
        commander: /\.option\(['"]([^'"]+)['"],\s*['"]([^'"]+)['"]/g,
        argparse: /add_argument\(['"]([^'"]+)['"]/g,
        processArgv: /process\.argv\.(?:slice|indexOf)\(['"]([^'"]+)['"]/g,
        bashGetopts: /getopts\s+["']([^"']+)["']/g,
        bashCase: /case\s+"\$1"\s+in([\s\S]*?)esac/g,
      },

      // Purpose patterns
      purpose: {
        header: /(?:Purpose|Description|Summary):\s*(.+)/gi,
        usage: /Usage:\s*(.+)/gi,
        help: /--help.*?:\s*(.+)/gi,
      },

      // Deprecation patterns
      deprecated: /@deprecated|DEPRECATED|This script is deprecated/gi,

      // Test tags
      testTags: /@(unit|integration|e2e|smoke|slow|flaky|skip)\b/gi,

      // Import/require patterns
      imports: {
        commonjs: /require\(['"]([^'"]+)['"]\)/g,
        esm: /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g,
        python: /^(?:import|from)\s+([^\s]+)/gm,
        bash: /source\s+['"]?([^'"\s]+)['"]?/g,
      },

      // Function/command definitions
      functions: {
        javascript:
          /(?:function\s+(\w+)|const\s+(\w+)\s*=\s*(?:async\s+)?(?:function|\([^)]*\)\s*=>))/g,
        python: /def\s+(\w+)\s*\(/g,
        bash: /function\s+(\w+)|(\w+)\s*\(\)/g,
      },

      // Environment variables
      envVars:
        /process\.env\.(\w+)|os\.environ\[['"](\w+)['"]\]|\$\{?(\w+)\}?/g,

      // Output format patterns
      outputFormats:
        /--(?:format|output|out)\s*[=\s]['"]?(json|csv|xml|yaml|markdown|html|text)['"]?/gi,

      // Error handling patterns
      errorHandling: /try\s*{|catch\s*\(|except\s*:|trap\s+/g,
    };
  }

  /**
   * Parse a script file and extract metadata
   */
  async parseFile(filePath) {
    const content = await fs.readFile(filePath, 'utf-8');
    const stats = await fs.stat(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const basename = path.basename(filePath);

    const metadata = {
      filePath,
      fileName: basename,
      fileType: this.detectFileType(ext, content),
      fileSize: stats.size,
      lastModified: stats.mtime,
      documentation: this.extractDocumentation(content),
      purpose: this.extractPurpose(content),
      cliArguments: this.extractCliArguments(content, ext),
      dependencies: this.extractDependencies(content, ext),
      functions: this.extractFunctions(content, ext),
      envVars: this.extractEnvVars(content),
      outputFormats: this.extractOutputFormats(content),
      testTags: this.extractTestTags(content),
      isDeprecated: this.checkDeprecation(content),
      hasErrorHandling: this.checkErrorHandling(content),
      hasHelpOption: this.checkHelpOption(content),
      isExecutable: await this.checkExecutable(filePath),
      shebang: this.extractShebang(content),
    };

    // Calculate documentation score
    metadata.documentationScore = this.calculateDocScore(metadata);

    return metadata;
  }

  /**
   * Detect file type based on extension and content
   */
  detectFileType(ext, content) {
    // Check shebang first
    const shebang = content.match(/^#!.*?(\w+)$/m);
    if (shebang) {
      if (shebang[1].includes('node')) {return 'javascript';}
      if (shebang[1].includes('python')) {return 'python';}
      if (shebang[1].includes('bash') || shebang[1].includes('sh'))
        {return 'shell';}
    }

    // Check by extension
    const typeMap = {
      '.js': 'javascript',
      '.mjs': 'javascript',
      '.cjs': 'javascript',
      '.ts': 'typescript',
      '.mts': 'typescript',
      '.cts': 'typescript',
      '.py': 'python',
      '.sh': 'shell',
      '.bash': 'shell',
      '.zsh': 'shell',
      '.fish': 'shell',
    };

    return typeMap[ext] || 'unknown';
  }

  /**
   * Extract documentation from script
   */
  extractDocumentation(content) {
    const docs = {
      docString: null,
      docComments: [],
      headerComments: [],
      inlineComments: 0,
    };

    // Extract docstring (first string in file)
    const docStringMatch = content.match(this.patterns.docString);
    if (docStringMatch && content.indexOf(docStringMatch[0]) < 100) {
      docs.docString = docStringMatch[2];
    }

    // Extract JSDoc/block comments
    const blockComments = [...content.matchAll(this.patterns.docComment)];
    docs.docComments = blockComments
      .map((m) => (m[1] ? m[1].trim() : ''))
      .filter(Boolean);

    // Extract header comments (first 20 lines)
    const lines = content.split('\n').slice(0, 20);
    const headerComments = [];
    for (const line of lines) {
      const match = line.match(/^\s*(?:\/\/|#)\s*(.+)/);
      if (match) {
        headerComments.push(match[1]);
      }
    }
    docs.headerComments = headerComments;

    // Count inline comments
    docs.inlineComments = (
      content.match(this.patterns.lineComment) || []
    ).length;

    return docs;
  }

  /**
   * Extract purpose/description
   */
  extractPurpose(content) {
    // Check various purpose patterns
    for (const pattern of Object.values(this.patterns.purpose)) {
      const match = content.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    // Check first docstring or comment
    const docMatch = content.match(this.patterns.docComment);
    if (docMatch && docMatch[1]) {
      const firstLine = docMatch[1].trim().split('\n')[0];
      if (firstLine && !firstLine.startsWith('@')) {
        return firstLine;
      }
    }

    return null;
  }

  /**
   * Extract CLI arguments
   */
  extractCliArguments(content, ext) {
    const args = [];

    // Check for different CLI parsing libraries
    for (const [lib, pattern] of Object.entries(this.patterns.cliArgs)) {
      const matches = [...content.matchAll(pattern)];
      for (const match of matches) {
        args.push({
          library: lib,
          argument: match[1],
          description: match[2] || null,
        });
      }
    }

    // Look for manual argv parsing
    if (content.includes('process.argv') || content.includes('sys.argv')) {
      args.push({
        library: 'manual',
        argument: 'argv',
        description: 'Manual argument parsing',
      });
    }

    return args;
  }

  /**
   * Extract dependencies
   */
  extractDependencies(content, ext) {
    const deps = new Set();

    // Extract imports/requires based on file type
    const patterns = this.patterns.imports;

    if (ext === '.js' || ext === '.ts' || ext === '.mjs') {
      // CommonJS requires
      const requires = [...content.matchAll(patterns.commonjs)];
      requires.forEach((m) => deps.add(m[1]));

      // ES6 imports
      const imports = [...content.matchAll(patterns.esm)];
      imports.forEach((m) => deps.add(m[1]));
    } else if (ext === '.py') {
      // Python imports
      const imports = [...content.matchAll(patterns.python)];
      imports.forEach((m) => deps.add(m[1].split('.')[0]));
    } else if (ext === '.sh' || ext === '.bash') {
      // Bash sources
      const sources = [...content.matchAll(patterns.bash)];
      sources.forEach((m) => deps.add(m[1]));
    }

    return Array.from(deps);
  }

  /**
   * Extract function definitions
   */
  extractFunctions(content, ext) {
    const functions = new Set();

    const fileType = this.detectFileType(ext, content);
    const pattern = this.patterns.functions[fileType];

    if (pattern) {
      const matches = [...content.matchAll(pattern)];
      matches.forEach((m) => {
        const funcName = m[1] || m[2];
        if (funcName) {
          functions.add(funcName);
        }
      });
    }

    return Array.from(functions);
  }

  /**
   * Extract environment variables
   */
  extractEnvVars(content) {
    const envVars = new Set();

    const matches = [...content.matchAll(this.patterns.envVars)];
    matches.forEach((m) => {
      const varName = m[1] || m[2] || m[3];
      if (varName && varName !== varName.toLowerCase()) {
        // Filter out likely non-env vars
        envVars.add(varName);
      }
    });

    return Array.from(envVars);
  }

  /**
   * Extract output formats
   */
  extractOutputFormats(content) {
    const formats = new Set();

    const matches = [...content.matchAll(this.patterns.outputFormats)];
    matches.forEach((m) => formats.add(m[1].toLowerCase()));

    // Also check for explicit format handling
    if (content.includes('JSON.stringify')) {formats.add('json');}
    if (content.includes('csv') || content.includes('CSV')) {formats.add('csv');}
    if (content.includes('markdown') || content.includes('## '))
      {formats.add('markdown');}
    if (content.includes('<html') || content.includes('</'))
      {formats.add('html');}

    return Array.from(formats);
  }

  /**
   * Extract test tags
   */
  extractTestTags(content) {
    const tags = new Set();

    const matches = [...content.matchAll(this.patterns.testTags)];
    matches.forEach((m) => tags.add(m[1].toLowerCase()));

    return Array.from(tags);
  }

  /**
   * Check if script is deprecated
   */
  checkDeprecation(content) {
    return this.patterns.deprecated.test(content);
  }

  /**
   * Check if script has error handling
   */
  checkErrorHandling(content) {
    return this.patterns.errorHandling.test(content);
  }

  /**
   * Check if script has help option
   */
  checkHelpOption(content) {
    return (
      content.includes('--help') ||
      content.includes('-h') ||
      content.includes('usage()') ||
      content.includes('show_help')
    );
  }

  /**
   * Check if file is executable
   */
  async checkExecutable(filePath) {
    try {
      await fs.access(filePath, fs.constants.X_OK);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Extract shebang
   */
  extractShebang(content) {
    const match = content.match(/^#!(.+)$/m);
    return match && match[1] ? match[1].trim() : null;
  }

  /**
   * Calculate documentation score (0-100)
   */
  calculateDocScore(metadata) {
    let score = 0;

    // Has documentation (40 points)
    if (metadata.documentation.docString) {score += 15;}
    if (metadata.documentation.docComments.length > 0) {score += 15;}
    if (metadata.documentation.headerComments.length > 0) {score += 10;}

    // Has purpose (20 points)
    if (metadata.purpose) {score += 20;}

    // Has help option (15 points)
    if (metadata.hasHelpOption) {score += 15;}

    // Has proper CLI args documentation (15 points)
    if (metadata.cliArguments.length > 0) {
      const withDesc = metadata.cliArguments.filter(
        (a) => a.description,
      ).length;
      score += Math.min(15, (withDesc / metadata.cliArguments.length) * 15);
    }

    // Has error handling (5 points)
    if (metadata.hasErrorHandling) {score += 5;}

    // Has inline comments (5 points)
    if (metadata.documentation.inlineComments > 5) {score += 5;}

    return Math.round(score);
  }
}

module.exports = ScriptParser;

// CLI interface
if (require.main === module) {
  const parser = new ScriptParser();

  async function main() {
    const args = process.argv.slice(2);

    if (args.length === 0 || args[0] === '--help') {
      console.log(`
Script Parser - Extract metadata from script files
Documentation: scripts/script-inventory/README.md

Usage: node parser.js <file>

Options:
  --help    Show this help message
  --json    Output as JSON (default)
  --pretty  Pretty print JSON output

Example:
  node parser.js ../example-script.js --pretty
      `);
      process.exit(0);
    }

    const filePath = args[0];
    const pretty = args.includes('--pretty');

    try {
      const metadata = await parser.parseFile(filePath);

      if (pretty) {
        console.log(JSON.stringify(metadata, null, 2));
      } else {
        console.log(JSON.stringify(metadata));
      }
    } catch (error) {
      console.error('Error parsing file:', error.message);
      process.exit(1);
    }
  }

  main();
}
