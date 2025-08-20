#!/usr/bin/env node

/**
 * Generate TypeDoc documentation
 * Documentation: docs/developer-guide/scripts.md#generate-typedoc
 *
 * This script generates TypeScript API documentation using TypeDoc.
 * It runs before the Docusaurus build to ensure documentation is available.
 *
 * Usage:
 *   node scripts/generate-typedoc.js
 *   pnpm gen:typedoc
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const DOCS_DIR = path.join(__dirname, '../apps/docs');
const OUTPUT_DIR = path.join(DOCS_DIR, 'static/generated-api');
const ENTRY_POINTS = [
  '../../packages/contracts/schemas/index.ts',
  '../../packages/supabase-types/src/database.ts',
];

/**
 * Generate TypeDoc documentation
 */
function generateDocs() {
  console.log('📚 Generating TypeDoc documentation...');

  // Create output directory
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // Generate documentation
  const command = [
    'npx typedoc',
    ...ENTRY_POINTS.map((ep) => `--entryPoints ${ep}`),
    `--out ${OUTPUT_DIR}`,
    '--tsconfig ./tsconfig.docs.json',
    '--plugin typedoc-plugin-markdown',
    '--plugin typedoc-plugin-zod',
    '--readme none',
    '--githubPages false',
    '--hideGenerator',
    '--excludePrivate',
    '--excludeProtected',
    '--excludeExternals',
    '--skipErrorChecking',
    '--disableSources',
  ].join(' ');

  try {
    process.chdir(DOCS_DIR);
    execSync(command, { stdio: 'inherit' });

    // Create an index file for Docusaurus
    const indexContent = `---
id: index
title: API Reference
sidebar_position: 1
---

# API Reference

This section contains auto-generated TypeScript and Zod schema documentation.

## Modules

- [Contracts & Schemas](./contracts/schemas/index.md) - Zod validation schemas
- [Supabase Types](./supabase-types/src/database.md) - Database type definitions

## Key Features

### Type Safety
All schemas provide full TypeScript type inference and runtime validation.

### Zod Schemas
- **VocabularySchema** - Vocabulary management with multilingual support
- **JobSchema** - Background job processing and status tracking
- **RdfBuildSchema** - RDF generation configuration

### Database Types
- **Database** - Complete Supabase schema with type safety
- **Tables** - Type-safe table row, insert, and update types
- **Views** - Database view type definitions

## Usage

\`\`\`typescript
import { VocabularySchema } from '@ifla/contracts/schemas';
import type { Database } from '@ifla/supabase-types';

// Validate data with Zod
const result = VocabularySchema.safeParse(data);

// Type-safe database queries
type Profile = Database['public']['Tables']['profiles']['Row'];
\`\`\`

---

*Generated at: ${new Date().toISOString()}*
`;

    fs.writeFileSync(path.join(OUTPUT_DIR, 'index.md'), indexContent);

    console.log('✅ TypeDoc documentation generated successfully');
    console.log('   Output:', OUTPUT_DIR);

    // List generated files
    const files = fs.readdirSync(OUTPUT_DIR);
    console.log(`   Generated ${files.length} files`);
  } catch (error) {
    console.error(
      '❌ Failed to generate TypeDoc documentation:',
      error.message,
    );
    // Don't fail the build
    process.exit(0);
  }
}

// Run if called directly
if (require.main === module) {
  generateDocs();
}

module.exports = { generateDocs };
