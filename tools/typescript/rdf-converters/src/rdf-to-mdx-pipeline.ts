#!/usr/bin/env tsx

/**
 * RDF to MDX Pipeline
 * Chains RDF to CSV conversion with MDX template generation
 * 
 * Usage:
 * pnpm tsx tools/typescript/rdf-converters/src/rdf-to-mdx-pipeline.ts \
 *   --rdf=path/to/input.ttl \
 *   --profile=path/to/profile.csv \
 *   --standard=isbd \
 *   --type=element
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { program } from 'commander';

interface PipelineOptions {
  rdf: string;
  profile?: string;
  standard: string;
  type: string;
  output?: string;
  verbose?: boolean;
  dryRun?: boolean;
}

class RdfToMdxPipeline {
  private options: PipelineOptions;
  private tempCsvPath: string;

  constructor(options: PipelineOptions) {
    this.options = options;
    // Generate temp CSV path
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.tempCsvPath = path.join(
      'tools/typescript/rdf-converters/temp',
      `pipeline-${timestamp}.csv`
    );
  }

  async run(): Promise<void> {
    try {
      console.log('🚀 Starting RDF to MDX Pipeline...\n');

      // Step 1: Convert RDF to CSV
      await this.convertRdfToCsv();

      // Step 2: Generate MDX from CSV
      await this.generateMdxFromCsv();

      console.log('\n✅ Pipeline completed successfully!');
    } catch (error) {
      console.error('\n❌ Pipeline failed:', error);
      throw error;
    } finally {
      // Cleanup temp file
      if (fs.existsSync(this.tempCsvPath) && !this.options.dryRun) {
        fs.unlinkSync(this.tempCsvPath);
      }
    }
  }

  private async convertRdfToCsv(): Promise<void> {
    console.log('📊 Step 1: Converting RDF to CSV...');

    // Ensure temp directory exists
    const tempDir = path.dirname(this.tempCsvPath);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Build command
    const rdfToCsvScript = path.join(__dirname, 'rdf-to-csv.ts');
    let command = `pnpm tsx ${rdfToCsvScript} -i ${this.options.rdf} -o ${this.tempCsvPath}`;

    if (this.options.profile) {
      command += ` -p ${this.options.profile}`;
    }

    if (this.options.verbose) {
      command += ' -v';
    }

    if (this.options.verbose) {
      console.log(`Running: ${command}`);
    }

    if (!this.options.dryRun) {
      execSync(command, { stdio: 'inherit' });
      console.log(`✅ CSV generated: ${this.tempCsvPath}`);
    } else {
      console.log(`[DRY RUN] Would run: ${command}`);
    }
  }

  private async generateMdxFromCsv(): Promise<void> {
    console.log('\n📝 Step 2: Generating MDX from CSV...');

    // Check if populate-from-csv script exists
    // The script is in the root of the monorepo
    const rootDir = path.resolve(__dirname, '..', '..', '..', '..');
    const populateScript = path.join(rootDir, 'scripts', 'populate-from-csv.ts');
    if (!fs.existsSync(populateScript)) {
      throw new Error(`populate-from-csv.ts not found at ${populateScript}`);
    }

    // First, copy the CSV to the expected location for the standard
    const targetCsvDir = path.join('standards', this.options.standard, 'csv', 'ns', this.options.standard);
    const targetCsvPath = path.join(targetCsvDir, `${this.options.type}s.csv`);

    if (!this.options.dryRun) {
      // Ensure directory exists
      if (!fs.existsSync(targetCsvDir)) {
        fs.mkdirSync(targetCsvDir, { recursive: true });
      }

      // Backup existing CSV if it exists
      if (fs.existsSync(targetCsvPath)) {
        const backupPath = `${targetCsvPath}.backup`;
        fs.copyFileSync(targetCsvPath, backupPath);
        console.log(`📦 Backed up existing CSV to ${backupPath}`);
      }

      // Copy new CSV
      fs.copyFileSync(this.tempCsvPath, targetCsvPath);
      console.log(`📋 Copied CSV to ${targetCsvPath}`);
    }

    // Build command for MDX generation
    const command = `pnpm tsx ${populateScript} --standard=${this.options.standard} --type=${this.options.type}`;

    if (this.options.verbose) {
      console.log(`Running: ${command}`);
    }

    if (!this.options.dryRun) {
      execSync(command, { stdio: 'inherit' });
      console.log('✅ MDX files generated successfully!');
    } else {
      console.log(`[DRY RUN] Would run: ${command}`);
      console.log(`[DRY RUN] Would copy ${this.tempCsvPath} to ${targetCsvPath}`);
    }
  }
}

// CLI Setup
program
  .name('rdf-to-mdx-pipeline')
  .description('Convert RDF to CSV and generate MDX documentation')
  .version('1.0.0')
  .requiredOption('-r, --rdf <path>', 'Input RDF file path')
  .option('-p, --profile <path>', 'DCTAP profile CSV file path')
  .requiredOption('-s, --standard <name>', 'Standard name (e.g., isbd, lrm)')
  .requiredOption('-t, --type <type>', 'Template type (e.g., element, vocabulary)')
  .option('-o, --output <path>', 'Output directory for MDX files')
  .option('-v, --verbose', 'Enable verbose logging')
  .option('-d, --dry-run', 'Show what would be done without doing it')
  .parse();

const options = program.opts<PipelineOptions>();

// Validate inputs
if (!fs.existsSync(options.rdf)) {
  console.error(`❌ RDF file not found: ${options.rdf}`);
  process.exit(1);
}

if (options.profile && !fs.existsSync(options.profile)) {
  console.error(`❌ Profile file not found: ${options.profile}`);
  process.exit(1);
}

// Run pipeline
const pipeline = new RdfToMdxPipeline(options);
pipeline.run().catch((error) => {
  console.error('Pipeline failed:', error);
  process.exit(1);
});