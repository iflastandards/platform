#!/usr/bin/env tsx

/**
 * Code Generation Tool for OpenAPI → TypeScript Types
 * 
 * This tool generates TypeScript types from OpenAPI specifications
 * and integrates them with our Zod schemas for runtime validation.
 * 
 * Usage:
 *   pnpm tsx tools/codegen/generate-types.ts
 *   pnpm tsx tools/codegen/generate-types.ts --spec=path/to/spec.yaml
 */

import { promises as fs } from 'fs';
import { join } from 'path';

interface CodegenOptions {
  specPath?: string;
  outputDir?: string;
  verbose?: boolean;
}

class TypesGenerator {
  constructor(private options: CodegenOptions = {}) {}

  async generate(): Promise<void> {
    console.log('🔧 IFLA Standards Platform - Type Generation');
    console.log('==========================================');

    try {
      // Phase 1: Discover OpenAPI specs
      const specs = await this.discoverSpecs();
      console.log(`📋 Found ${specs.length} OpenAPI specifications`);

      if (specs.length === 0) {
        console.log('ℹ️  No OpenAPI specs found. This tool will generate types when specs are added.');
        console.log('📁 Place OpenAPI specs in: packages/contracts/openapi/');
        return;
      }

      // Phase 2: Generate types for each spec
      for (const spec of specs) {
        await this.generateFromSpec(spec);
      }

      console.log('✅ Type generation completed successfully!');
      
    } catch (error) {
      console.error('❌ Type generation failed:', error);
      process.exit(1);
    }
  }

  private async discoverSpecs(): Promise<string[]> {
    const specsDir = join(process.cwd(), 'packages/contracts/openapi');
    
    try {
      const files = await fs.readdir(specsDir);
      return files
        .filter(file => file.endsWith('.yaml') || file.endsWith('.yml') || file.endsWith('.json'))
        .map(file => join(specsDir, file));
    } catch (error) {
      // Directory doesn't exist yet - that's fine
      return [];
    }
  }

  private async generateFromSpec(specPath: string): Promise<void> {
    console.log(`🔄 Processing: ${specPath}`);

    // TODO: Implement OpenAPI → TypeScript generation
    // This would typically use tools like:
    // - @openapitools/openapi-generator-cli
    // - swagger-typescript-api
    // - openapi-typescript

    console.log(`📝 Generated types would be written to: packages/contracts/types/ts/`);
    
    // For now, create a placeholder to show the structure
    const outputDir = join(process.cwd(), 'packages/contracts/types/ts');
    await fs.mkdir(outputDir, { recursive: true });
    
    const placeholderContent = `// Generated types from OpenAPI spec: ${specPath}
// This file would contain auto-generated TypeScript interfaces
// 
// Example generated content:
// export interface ExternalApiResponse {
//   id: string;
//   status: 'success' | 'error';
//   data: unknown;
// }
//
// Integration with Zod schemas:
// import { z } from 'zod';
// export const ExternalApiResponseSchema = z.object({
//   id: z.string(),
//   status: z.enum(['success', 'error']),
//   data: z.unknown(),
// });

export {}; // Make this a module
`;

    const outputFile = join(outputDir, 'generated.ts');
    await fs.writeFile(outputFile, placeholderContent);
    console.log(`✅ Types placeholder created: ${outputFile}`);
  }
}

// CLI handling
async function main() {
  const args = process.argv.slice(2);
  const options: CodegenOptions = {};

  // Parse command line arguments
  for (const arg of args) {
    if (arg.startsWith('--spec=')) {
      options.specPath = arg.split('=')[1];
    } else if (arg === '--verbose' || arg === '-v') {
      options.verbose = true;
    }
  }

  const generator = new TypesGenerator(options);
  await generator.generate();
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { TypesGenerator };
