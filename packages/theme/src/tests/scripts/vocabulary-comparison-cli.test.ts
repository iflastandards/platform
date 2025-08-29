/**
 * @integration @api @vocabulary @low-priority
 * 
 * Integration tests for vocabulary comparison CLI tool
 * Tests CLI behavior, environment dependencies, and external API integration
 * 
 * @jest-environment node
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { exec } from 'child_process';
import { promisify } from 'util';
import { getScriptPath, setupTestPaths } from '../utils/workspaceUtils';

const execAsync = promisify(exec);

describe.skip('Vocabulary Comparison CLI Integration', () => {
  const scriptPath = getScriptPath('vocabulary-comparison.mjs');
  const { workspaceRoot } = setupTestPaths();

  // Skip these tests in CI environment
  if (process.env.CI) {
    test.skip('CLI tests skipped in CI environment', () => {});
    return;
  }

  beforeEach(() => {
    // Set mock environment variables
    process.env.GOOGLE_SHEETS_API_KEY = 'test-api-key';
  });

  afterEach(() => {
    delete process.env.GOOGLE_SHEETS_API_KEY;
  });

/**
 * @integration @api @low-priority @vocabulary
 */

  describe('CLI Help Command', () => {
    it('should display help when --help is used', async () => {
      const { stdout } = await execAsync(`node ${scriptPath} --help`);

      expect(stdout).toContain('Generic Vocabulary Comparison Tool');
      expect(stdout).toContain('--spreadsheet-id=ID');
      expect(stdout).toContain('--markdown, -md');
      expect(stdout).toContain('--skip-rdf-check');
      expect(stdout).toContain('Examples:');
    });

    it('should display help when -h is used', async () => {
      const { stdout } = await execAsync(`node ${scriptPath} -h`);

      expect(stdout).toContain('Generic Vocabulary Comparison Tool');
    });
  });

  describe('CLI Argument Validation', () => {
    it.skip('should require spreadsheet ID parameter', async () => {
      try {
        await execAsync(`node ${scriptPath}`);
      } catch (error: unknown) {
        const execError = error as { stdout?: string; stderr?: string };
        expect(execError.stdout || execError.stderr).toContain(
          '--spreadsheet-id parameter is required',
        );
      }
    });

    it.skip('should require API key environment variable', async () => {
      try {
        await execAsync(`node ${scriptPath} --spreadsheet-id=test`, {
          env: { ...process.env, GOOGLE_SHEETS_API_KEY: undefined },
        });
      } catch (error: unknown) {
        const execError = error as { stdout?: string; stderr?: string };
        expect(execError.stdout || execError.stderr).toContain(
          'GOOGLE_SHEETS_API_KEY not found',
        );
      }
    });
  });

  describe('Package.json Script Integration', () => {
    it('should have compare:vocabulary script', async () => {
      const packageJson = require('../../../../../package.json');

      expect(packageJson.scripts['compare:vocabulary']).toBeDefined();
      expect(packageJson.scripts['compare:vocabulary']).toContain(
        'vocabulary-comparison.mjs',
      );
    });

    it('should have compare:vocabulary:help script', async () => {
      const packageJson = require('../../../../../package.json');

      expect(packageJson.scripts['compare:vocabulary:help']).toBeDefined();
      expect(packageJson.scripts['compare:vocabulary:help']).toContain(
        '--help',
      );
    });

    it('should have compare:vocabulary:md script', async () => {
      const packageJson = require('../../../../../package.json');

      expect(packageJson.scripts['compare:vocabulary:md']).toBeDefined();
      expect(packageJson.scripts['compare:vocabulary:md']).toContain(
        '--markdown',
      );
    });

    it('should have compare:vocabulary:validate script', async () => {
      const packageJson = require('../../../../../package.json');

      expect(packageJson.scripts['compare:vocabulary:validate']).toBeDefined();
      expect(packageJson.scripts['compare:vocabulary:validate']).toContain(
        '--skip-rdf-check',
      );
      expect(packageJson.scripts['compare:vocabulary:validate']).toContain(
        '--markdown',
      );
    });
  });
});
