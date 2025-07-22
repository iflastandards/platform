import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

describe('RDF to MDX Pipeline', () => {
  const scriptPath = path.join(__dirname, '..', 'src', 'rdf-to-mdx-pipeline.ts');
  const fixturesDir = path.join(__dirname, 'fixtures');
  const tempDir = '/tmp/rdf-to-mdx-pipeline-tests';

  beforeAll(() => {
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
  });

  afterAll(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('Dry run mode', () => {
    it('should show what would be done without executing', () => {
      const inputFile = path.join(fixturesDir, 'dctap-extensions', 'mixed-formats', 'input.ttl');
      const profileFile = path.join(fixturesDir, 'dctap-extensions', 'mixed-formats', 'profile.csv');

      const command = `pnpm tsx ${scriptPath} --rdf ${inputFile} --profile ${profileFile} --standard isbd --type element --dry-run`;
      
      const output = execSync(command, { encoding: 'utf-8' });
      
      expect(output).toContain('Starting RDF to MDX Pipeline');
      expect(output).toContain('[DRY RUN]');
      expect(output).toContain('Would run:');
      expect(output).toContain('rdf-to-csv.ts');
      expect(output).toContain('populate-from-csv.ts');
    });
  });

  describe('Error handling', () => {
    it('should fail gracefully with non-existent RDF file', () => {
      const command = `pnpm tsx ${scriptPath} --rdf /non/existent/file.ttl --standard isbd --type element`;
      
      expect(() => {
        execSync(command, { encoding: 'utf-8' });
      }).toThrow(/RDF file not found/);
    });

    it('should fail gracefully with non-existent profile file', () => {
      const inputFile = path.join(fixturesDir, 'dctap-extensions', 'mixed-formats', 'input.ttl');
      const command = `pnpm tsx ${scriptPath} --rdf ${inputFile} --profile /non/existent/profile.csv --standard isbd --type element`;
      
      expect(() => {
        execSync(command, { encoding: 'utf-8' });
      }).toThrow(/Profile file not found/);
    });
  });

  describe('Help and usage', () => {
    it('should show help when requested', () => {
      const command = `pnpm tsx ${scriptPath} --help`;
      const output = execSync(command, { encoding: 'utf-8' });
      
      expect(output).toContain('rdf-to-mdx-pipeline');
      expect(output).toContain('Convert RDF to CSV and generate MDX documentation');
      expect(output).toContain('--rdf');
      expect(output).toContain('--standard');
      expect(output).toContain('--type');
    });
  });

  // Note: Full integration tests would require the populate-from-csv.ts script
  // and template files to be in place, which are outside this package
});