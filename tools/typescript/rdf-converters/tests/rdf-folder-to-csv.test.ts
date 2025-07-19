import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

describe('rdf-folder-to-csv CLI', () => {
  const fixturesDir = path.join(__dirname, 'fixtures', 'batch');
  const tempDir = path.join(__dirname, 'temp-batch');
  const scriptPath = path.join(__dirname, '..', 'src', 'rdf-folder-to-csv.ts');

  beforeEach(() => {
    // Create temp directory for test outputs
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
  });

  afterEach(() => {
    // Clean up temp directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('Basic folder conversion', () => {
    it('should convert a simple folder structure', () => {
      const sourceDir = path.join(fixturesDir, 'simple');
      const outputDir = tempDir;

      // Skip if fixtures don't exist yet
      if (!fs.existsSync(sourceDir)) {
        console.log('Skipping test - fixtures not yet created');
        return;
      }

      // Run the conversion
      const command = `tsx ${scriptPath} -s ${sourceDir} -o ${outputDir}`;
      execSync(command);

      // Check that output files exist with same structure
      const expectedElementsDir = path.join(outputDir, 'elements');
      const expectedTermsDir = path.join(outputDir, 'terms');

      expect(fs.existsSync(expectedElementsDir)).toBe(true);
      expect(fs.existsSync(expectedTermsDir)).toBe(true);

      // Check for specific output files
      const elementsFiles = fs.readdirSync(path.join(sourceDir, 'elements'))
        .filter(f => f.endsWith('.ttl'));
      
      elementsFiles.forEach(ttlFile => {
        const csvFile = ttlFile.replace('.ttl', '.csv');
        const outputFile = path.join(expectedElementsDir, csvFile);
        expect(fs.existsSync(outputFile)).toBe(true);
      });
    });

    it('should handle nested folder structures', () => {
      const sourceDir = path.join(fixturesDir, 'complex', 'nested');
      const outputDir = tempDir;

      if (!fs.existsSync(sourceDir)) {
        console.log('Skipping test - fixtures not yet created');
        return;
      }

      const command = `tsx ${scriptPath} -s ${sourceDir} -o ${outputDir}`;
      execSync(command);

      // Check nested structure is preserved
      expect(fs.existsSync(path.join(outputDir, 'isbd', 'elements'))).toBe(true);
      expect(fs.existsSync(path.join(outputDir, 'isbd', 'terms'))).toBe(true);
      expect(fs.existsSync(path.join(outputDir, 'lrm', 'elements'))).toBe(true);
      expect(fs.existsSync(path.join(outputDir, 'lrm', 'terms'))).toBe(true);
    });

    it('should apply a DCTAP profile to all files', () => {
      const sourceDir = path.join(fixturesDir, 'simple');
      const outputDir = tempDir;
      const profileFile = path.join(fixturesDir, 'simple', 'profile.csv');

      if (!fs.existsSync(sourceDir) || !fs.existsSync(profileFile)) {
        console.log('Skipping test - fixtures not yet created');
        return;
      }

      const command = `tsx ${scriptPath} -s ${sourceDir} -o ${outputDir} -p ${profileFile}`;
      execSync(command);

      // Just check that it runs without error and produces output
      expect(fs.existsSync(path.join(outputDir, 'elements'))).toBe(true);
    });
  });

  describe('Dry run mode', () => {
    it('should not create files in dry run mode', () => {
      const sourceDir = path.join(fixturesDir, 'simple');
      const outputDir = tempDir;

      if (!fs.existsSync(sourceDir)) {
        console.log('Skipping test - fixtures not yet created');
        return;
      }

      const command = `tsx ${scriptPath} -s ${sourceDir} -o ${outputDir} --dry-run`;
      const output = execSync(command, { encoding: 'utf-8' });

      // Should show what would be done
      expect(output).toMatch(/would convert/i);

      // But should not create any files
      const files = fs.readdirSync(outputDir);
      expect(files.length).toBe(0);
    });
  });

  describe('Error handling', () => {
    it('should handle non-existent source directory', () => {
      const sourceDir = path.join(fixturesDir, 'non-existent');
      const outputDir = tempDir;

      expect(() => {
        execSync(`tsx ${scriptPath} -s ${sourceDir} -o ${outputDir}`);
      }).toThrow();
    });

    it('should report when no RDF files are found', () => {
      // Create an empty directory
      const emptyDir = path.join(tempDir, 'empty');
      fs.mkdirSync(emptyDir, { recursive: true });

      const output = execSync(
        `tsx ${scriptPath} -s ${emptyDir} -o ${tempDir}`,
        { encoding: 'utf-8' }
      );

      expect(output).toMatch(/no rdf files found/i);
    });
  });
});