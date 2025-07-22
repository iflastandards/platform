import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

describe('rdf-to-csv CLI', () => {
  const fixturesDir = path.join(__dirname, 'fixtures');
  const tempDir = '/tmp/rdf-to-csv-tests';
  const scriptPath = path.join(__dirname, '..', 'src', 'rdf-to-csv.ts');

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

  describe('Basic functionality', () => {
    it('should convert a simple Turtle file to CSV', () => {
      const inputFile = path.join(fixturesDir, 'elements', 'minimal', 'input.ttl');
      const outputFile = path.join(tempDir, 'output.csv');
      const expectedFile = path.join(fixturesDir, 'elements', 'minimal', 'expected.csv');

      // Skip if fixtures don't exist yet
      if (!fs.existsSync(inputFile)) {
        console.log('Skipping test - fixture not yet created');
        return;
      }

      // Run the conversion
      const command = `tsx ${scriptPath} -i ${inputFile} -o ${outputFile}`;
      execSync(command);

      // Check output exists
      expect(fs.existsSync(outputFile)).toBe(true);

      // Compare with expected output
      if (fs.existsSync(expectedFile)) {
        const actual = fs.readFileSync(outputFile, 'utf-8');
        const expected = fs.readFileSync(expectedFile, 'utf-8');
        expect(actual).toBe(expected);
      }
    });

    it('should apply a DCTAP profile when provided', () => {
      const inputFile = path.join(fixturesDir, 'elements', 'minimal', 'input.ttl');
      const profileFile = path.join(fixturesDir, 'elements', 'minimal', 'profile.csv');
      const outputFile = path.join(tempDir, 'output-with-profile.csv');

      // Skip if fixtures don't exist yet
      if (!fs.existsSync(inputFile) || !fs.existsSync(profileFile)) {
        console.log('Skipping test - fixtures not yet created');
        return;
      }

      // Run the conversion with profile
      const command = `tsx ${scriptPath} -i ${inputFile} -o ${outputFile} -p ${profileFile}`;
      execSync(command);

      // Check output exists
      expect(fs.existsSync(outputFile)).toBe(true);
    });
  });

  describe('Format support', () => {
    it('should auto-detect Turtle format', () => {
      const inputFile = path.join(fixturesDir, 'formats', 'turtle', 'input.ttl');
      const outputFile = path.join(tempDir, 'turtle-output.csv');

      if (!fs.existsSync(inputFile)) {
        console.log('Skipping test - fixture not yet created');
        return;
      }

      const command = `tsx ${scriptPath} -i ${inputFile} -o ${outputFile}`;
      execSync(command);

      expect(fs.existsSync(outputFile)).toBe(true);
    });

    it('should handle JSON-LD format', () => {
      const inputFile = path.join(fixturesDir, 'formats', 'jsonld', 'input.jsonld');
      const outputFile = path.join(tempDir, 'jsonld-output.csv');

      if (!fs.existsSync(inputFile)) {
        console.log('Skipping test - fixture not yet created');
        return;
      }

      const command = `tsx ${scriptPath} -i ${inputFile} -o ${outputFile} -f jsonld`;
      execSync(command);

      expect(fs.existsSync(outputFile)).toBe(true);
    });
  });

  describe('Error handling', () => {
    it('should fail gracefully with invalid RDF', () => {
      const inputFile = path.join(fixturesDir, 'error-cases', 'invalid-rdf', 'syntax-error.ttl');
      const outputFile = path.join(tempDir, 'error-output.csv');

      if (!fs.existsSync(inputFile)) {
        console.log('Skipping test - fixture not yet created');
        return;
      }

      expect(() => {
        execSync(`tsx ${scriptPath} -i ${inputFile} -o ${outputFile}`);
      }).toThrow();
    });

    it('should report missing mandatory fields', () => {
      const inputFile = path.join(fixturesDir, 'error-cases', 'missing-mandatory', 'input.ttl');
      const profileFile = path.join(fixturesDir, 'error-cases', 'missing-mandatory', 'profile.csv');
      const outputFile = path.join(tempDir, 'mandatory-error.csv');

      if (!fs.existsSync(inputFile) || !fs.existsSync(profileFile)) {
        console.log('Skipping test - fixtures not yet created');
        return;
      }

      // This should either fail or produce a CSV with validation warnings
      const result = execSync(
        `tsx ${scriptPath} -i ${inputFile} -o ${outputFile} -p ${profileFile} -v`,
        { encoding: 'utf-8' }
      );

      // Check for validation warnings in verbose output
      expect(result).toMatch(/mandatory|warning|missing/i);
    });
  });
});