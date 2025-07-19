#!/usr/bin/env node

import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';
import { execSync } from 'child_process';
import chalk from 'chalk';
import ora from 'ora';

interface ConversionResult {
  success: boolean;
  inputFile: string;
  outputFile: string;
  error?: string;
  resourceCount?: number;
}

// Supported RDF file extensions
const RDF_EXTENSIONS = ['.ttl', '.turtle', '.nt', '.ntriples', '.rdf', '.xml', '.owl', '.jsonld', '.json'];

async function findRdfFiles(sourceDir: string): Promise<string[]> {
  const patterns = RDF_EXTENSIONS.map(ext => `**/*${ext}`);
  const files: string[] = [];
  
  for (const pattern of patterns) {
    const matches = await glob(pattern, {
      cwd: sourceDir,
      nodir: true,
      absolute: false
    });
    files.push(...matches);
  }
  
  return files;
}

function getOutputPath(inputFile: string, sourceDir: string, outputDir: string): string {
  // Get relative path from source directory
  const relativePath = path.relative(sourceDir, inputFile);
  
  // Change extension to .csv
  const parsedPath = path.parse(relativePath);
  const csvRelativePath = path.join(parsedPath.dir, parsedPath.name + '.csv');
  
  // Combine with output directory
  return path.join(outputDir, csvRelativePath);
}

async function ensureDirectory(filePath: string): Promise<void> {
  const dir = path.dirname(filePath);
  await fs.promises.mkdir(dir, { recursive: true });
}

function convertFile(inputFile: string, outputFile: string, dctapProfile?: string): ConversionResult {
  try {
    // Build command - use the compiled version
    const scriptPath = path.join(__dirname, 'rdf-to-csv.js');
    let command = `node "${scriptPath}" "${inputFile}" -o "${outputFile}"`;
    
    if (dctapProfile) {
      command += ` -p "${dctapProfile}"`;
    }
    
    // Execute conversion - capture stderr where the resource count is logged
    const result = execSync(command, { 
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    // Try to extract resource count from stderr if available
    // Look for pattern like "After filtering: 123 resources"
    let resourceCount: number | undefined;
    if (result && typeof result === 'string') {
      const match = result.match(/After filtering: (\d+) resources/);
      if (match) {
        resourceCount = parseInt(match[1]);
      }
    }
    
    return {
      success: true,
      inputFile,
      outputFile,
      resourceCount
    };
  } catch (error) {
    return {
      success: false,
      inputFile,
      outputFile,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function processDirectory(
  sourceDir: string, 
  outputDir: string, 
  options: {
    dctapProfile?: string;
    dryRun?: boolean;
    verbose?: boolean;
  }
): Promise<void> {
  const spinner = ora('Searching for RDF files...').start();
  
  try {
    // Find all RDF files
    const files = await findRdfFiles(sourceDir);
    
    if (files.length === 0) {
      spinner.fail(chalk.yellow('No RDF files found'));
      return;
    }
    
    spinner.succeed(chalk.green(`Found ${files.length} RDF files`));
    
    // Process each file
    const results: ConversionResult[] = [];
    const progressSpinner = ora('Converting files...').start();
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const inputPath = path.join(sourceDir, file);
      const outputPath = getOutputPath(inputPath, sourceDir, outputDir);
      
      progressSpinner.text = `Converting [${i + 1}/${files.length}]: ${file}`;
      
      if (options.dryRun) {
        console.log(chalk.gray(`Would convert: ${inputPath} → ${outputPath}`));
        continue;
      }
      
      // Ensure output directory exists
      await ensureDirectory(outputPath);
      
      // Convert file
      const result = convertFile(inputPath, outputPath, options.dctapProfile);
      results.push(result);
      
      if (options.verbose && result.success) {
        progressSpinner.clear();
        console.log(
          chalk.green('✓'),
          chalk.gray(file),
          '→',
          chalk.blue(path.relative(outputDir, outputPath)),
          result.resourceCount ? chalk.gray(`(${result.resourceCount} resources)`) : ''
        );
        progressSpinner.render();
      }
    }
    
    if (!options.dryRun) {
      progressSpinner.succeed(chalk.green('Conversion complete'));
      
      // Summary
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      
      console.log('\n' + chalk.bold('Summary:'));
      console.log(chalk.green(`✓ ${successful} files converted successfully`));
      
      if (failed > 0) {
        console.log(chalk.red(`✗ ${failed} files failed`));
        
        // Show errors
        if (options.verbose) {
          console.log('\n' + chalk.bold('Errors:'));
          results
            .filter(r => !r.success)
            .forEach(r => {
              console.log(chalk.red(`  ${r.inputFile}: ${r.error}`));
            });
        }
      }
      
      // Total resources
      const totalResources = results
        .filter(r => r.success && r.resourceCount)
        .reduce((sum, r) => sum + (r.resourceCount || 0), 0);
      
      console.log(chalk.gray(`\nTotal resources processed: ${totalResources}`));
    }
    
  } catch (error) {
    spinner.fail(chalk.red(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
    process.exit(1);
  }
}

// Main program
const program = new Command();

program
  .name('rdf-folder-to-csv')
  .description('Recursively convert RDF files to CSV format preserving folder structure')
  .version('1.0.0')
  .argument('<source-dir>', 'Source directory containing RDF files')
  .argument('[output-dir]', 'Output directory for CSV files (default: replaces /ttl with /csv or adds _csv suffix)')
  .option('-p, --profile <dctap-file>', 'Path to DCTAP profile CSV file')
  .option('-d, --dry-run', 'Show what would be converted without actually converting')
  .option('-v, --verbose', 'Show detailed progress information')
  .option('-e, --extensions <exts>', 'Comma-separated list of file extensions to process', RDF_EXTENSIONS.join(','))
  .action(async (sourceDir: string, outputDir: string | undefined, options) => {
    // Resolve paths
    const resolvedSourceDir = path.resolve(sourceDir);
    
    // Default output directory logic:
    // If source ends with /ttl, replace with /csv
    // Otherwise, add _csv suffix
    let defaultOutputDir: string;
    if (resolvedSourceDir.endsWith('/ttl')) {
      defaultOutputDir = resolvedSourceDir.replace(/\/ttl$/, '/csv');
    } else {
      defaultOutputDir = resolvedSourceDir + '_csv';
    }
    
    const resolvedOutputDir = outputDir 
      ? path.resolve(outputDir) 
      : defaultOutputDir;
    
    // Update extensions if provided
    if (options.extensions) {
      const customExts = options.extensions.split(',').map((ext: string) => {
        const trimmed = ext.trim();
        return trimmed.startsWith('.') ? trimmed : `.${trimmed}`;
      });
      RDF_EXTENSIONS.length = 0;
      RDF_EXTENSIONS.push(...customExts);
    }
    
    console.log(chalk.bold('RDF to CSV Batch Converter'));
    console.log(chalk.gray('─'.repeat(40)));
    console.log(chalk.blue('Source:'), resolvedSourceDir);
    console.log(chalk.blue('Output:'), resolvedOutputDir);
    
    if (options.profile) {
      console.log(chalk.blue('DCTAP Profile:'), options.profile);
    }
    
    console.log(chalk.blue('Extensions:'), RDF_EXTENSIONS.join(', '));
    
    if (options.dryRun) {
      console.log(chalk.yellow('\n🔍 DRY RUN MODE - No files will be converted\n'));
    } else {
      console.log('');
    }
    
    await processDirectory(resolvedSourceDir, resolvedOutputDir, {
      dctapProfile: options.profile,
      dryRun: options.dryRun,
      verbose: options.verbose
    });
  });

program.parse();