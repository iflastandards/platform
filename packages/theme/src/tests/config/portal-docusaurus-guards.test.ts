/**
 * @integration @sites @high-priority
 */
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

// This test enforces a repository policy: lines 19–24 in portal/docusaurus.config.ts
// implement a required DOCS_ENV guard and must not be deleted.
// We assert via content substrings (not line numbers) so that minor formatting
// changes won't break the test, but removal will.

describe('portal docusaurus.config.ts must keep DOCS_ENV guard @unit @critical', () => {
  const configPath = path.join(process.cwd(), 'portal', 'docusaurus.config.ts');

  it('file exists', () => {
    expect(fs.existsSync(configPath)).toBe(true);
  });

  it('contains DOCS_ENV default and required guard block', () => {
    const content = fs.readFileSync(configPath, 'utf8');

    // Key substrings that collectively represent the guard block
    const substrings = [
      "const DOCS_ENV = (process.env.DOCS_ENV as Environment | undefined) ?? 'production';",
      'if (!DOCS_ENV) {',
      "DOCS_ENV environment variable is required but not set.",
      'Valid values: local, preview, production',
    ];

    for (const s of substrings) {
      expect(content.includes(s)).toBe(true);
    }
  });
});
