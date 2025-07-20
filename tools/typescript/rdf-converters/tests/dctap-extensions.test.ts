import { describe, it, expect, afterAll, beforeAll } from 'vitest';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

describe('DCTAP Extensions', () => {
  const fixturesDir = path.join(__dirname, 'fixtures', 'dctap-extensions');
  const tempDir = path.join(__dirname, 'temp');
  const scriptPath = path.join(__dirname, '..', 'src', 'rdf-to-csv.ts');

  // Ensure temp directory exists before all tests
  beforeAll(() => {
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
  });

  // Helper function to run conversion and compare output
  const runTest = (testDir: string) => {
    const inputFile = path.join(fixturesDir, testDir, 'input.ttl');
    const profileFile = path.join(fixturesDir, testDir, 'profile.csv');
    const expectedFile = path.join(fixturesDir, testDir, 'expected.csv');
    const outputFile = path.join(tempDir, `${testDir}-output.csv`);

    // Run the conversion
    const command = `pnpm tsx ${scriptPath} -i ${inputFile} -p ${profileFile} -o ${outputFile}`;
    execSync(command, { cwd: path.join(__dirname, '..', '..', '..') });

    // Check output exists
    expect(fs.existsSync(outputFile)).toBe(true);

    // Compare with expected output
    const actual = fs.readFileSync(outputFile, 'utf-8');
    const expected = fs.readFileSync(expectedFile, 'utf-8');
    expect(actual).toBe(expected);
  };

  describe('Mandatory Fields (*)', () => {
    it('should handle mandatory field markers', () => {
      runTest('mandatory-fields');
    });
  });

  describe('Language Tags (@lang)', () => {
    it('should create language-specific columns', () => {
      runTest('language-tags');
    });
  });

  describe('Repeatable Array Format ([0], [1])', () => {
    it('should create array-indexed columns', () => {
      runTest('repeatable-array');
    });
  });

  describe('Repeatable CSV Format ([csv])', () => {
    it('should join values with semicolons', () => {
      runTest('repeatable-csv');
    });
  });

  describe('Mixed Formats', () => {
    it('should handle combined extensions', () => {
      runTest('mixed-formats');
    });
  });

  describe('Registry Properties', () => {
    it('should support metadata registry properties', () => {
      runTest('registry-properties');
    });
  });

  // Cleanup after all tests
  afterAll(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });
});