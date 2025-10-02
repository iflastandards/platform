#!/usr/bin/env node

/**
 * Generate Supabase database types
 * Documentation: docs/developer-guide/scripts.md#generate-supabase-types
 *
 * This script automatically generates TypeScript types from the Supabase database schema.
 * It runs during the build process to ensure types are always up-to-date.
 *
 * Usage:
 *   node scripts/generate-supabase-types.js
 *   pnpm gen:supabase-types
 *
 * Options:
 *   --project-id    Supabase project ID (defaults to env var)
 *   --output        Output file path (defaults to packages/supabase-types/src/database.ts)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Parse command line arguments
const args = process.argv.slice(2);
const projectId =
  args.find((a) => a.startsWith('--project-id='))?.split('=')[1] ||
  process.env.SUPABASE_PROJECT_ID ||
  extractProjectIdFromUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);

const outputPath =
  args.find((a) => a.startsWith('--output='))?.split('=')[1] ||
  path.join(__dirname, '../packages/supabase-types/src/database.ts');

/**
 * Extract project ID from Supabase URL
 */
function extractProjectIdFromUrl(url) {
  if (!url) {
    return null;
  }
  const match = url.match(/https:\/\/([^.]+)\.supabase\.co/);
  return match ? match[1] : null;
}

/**
 * Compare content without timestamp/header to check if types actually changed
 */
function hasContentChanged(oldContent, newContent) {
  if (!oldContent) {return true;}

  // Remove timestamp and header lines for comparison
  const stripHeader = (content) => content
      .split('\n')
      .filter((line) => !line.startsWith('// Generated at:'))
      .join('\n');

  return stripHeader(oldContent) !== stripHeader(newContent);
}

/**
 * Generate TypeScript types from Supabase
 */
async function generateTypes() {
  console.log('🔧 Generating Supabase database types...');

  // Check existing content
  let existingContent = '';
  try {
    existingContent = fs.existsSync(outputPath)
      ? fs.readFileSync(outputPath, 'utf-8')
      : '';
  } catch {
    existingContent = '';
  }

  // Define placeholder content
  const placeholderContent = `// Auto-generated Supabase database types
// Generated at: ${new Date().toISOString()}
// Project ID not configured - using placeholder types

export type Database = {
  public: {
    Tables: {
      // Tables will be generated when Supabase project is configured
      profiles: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          [key: string]: any;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          [key: string]: any;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          [key: string]: any;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
`;

  if (!projectId) {
    console.warn('⚠️  No Supabase project ID found. Skipping type generation.');
    console.warn('   Set SUPABASE_PROJECT_ID in .env or pass --project-id=xxx');

    // Only write if content actually changed
    if (hasContentChanged(existingContent, placeholderContent)) {
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
      fs.writeFileSync(outputPath, placeholderContent);
      console.log('✅ Created placeholder types at:', outputPath);
    } else {
      console.log('ℹ️  Placeholder types unchanged, skipping write');
    }
    return;
  }

  try {
    // Check if user is logged in to Supabase CLI (skip in CI)
    if (process.env.CI !== 'true' && !process.env.SUPABASE_ACCESS_TOKEN) {
      try {
        execSync('supabase projects list', { stdio: 'ignore' });
      } catch {
        console.log('📝 Not logged in to Supabase CLI.');
        console.log('   Skipping type generation. To generate types:');
        console.log('   1. Run: supabase login');
        console.log('   2. Then run: pnpm gen:supabase-types');

        // Use placeholder types
        const placeholderPath = path.join(
          __dirname,
          '../packages/supabase-types/src/database.ts',
        );
        const existingPlaceholder = fs.existsSync(placeholderPath)
          ? fs.readFileSync(placeholderPath, 'utf-8')
          : '';

        if (
          !fs.existsSync(placeholderPath) ||
          hasContentChanged(existingPlaceholder, placeholderContent)
        ) {
          fs.mkdirSync(path.dirname(placeholderPath), { recursive: true });
          fs.writeFileSync(placeholderPath, placeholderContent);
          console.log('✅ Created placeholder types at:', placeholderPath);
        } else {
          console.log('ℹ️  Placeholder types unchanged, skipping write');
        }
        return;
      }
    }

    // Generate types
    console.log(`📦 Fetching types for project: ${projectId}`);
    const command = `supabase gen types typescript --project-id ${projectId}`;
    const types = execSync(command, { encoding: 'utf-8' });

    // Add header comment
    const header = `// Auto-generated Supabase database types
// Generated at: ${new Date().toISOString()}
// Project ID: ${projectId}
//
// DO NOT EDIT THIS FILE DIRECTLY
// Run 'pnpm gen:supabase-types' to regenerate

`;

    const newContent = header + types;

    // Only write if content actually changed
    if (hasContentChanged(existingContent, newContent)) {
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
      fs.writeFileSync(outputPath, newContent);
      console.log('✅ Successfully generated Supabase types (content changed)');
      console.log('   Output:', outputPath);
    } else {
      console.log('ℹ️  Supabase types unchanged, skipping write');
    }

    // Verify the file was created
    const stats = fs.statSync(outputPath);
    console.log(`   Size: ${(stats.size / 1024).toFixed(2)} KB`);
  } catch (error) {
    console.error('❌ Failed to generate Supabase types:', error.message);

    // Don't fail the build if type generation fails
    if (process.env.CI !== 'true') {
      console.warn('⚠️  Continuing with existing types (if any)');
      process.exit(0);
    } else {
      process.exit(1);
    }
  }
}

// Run the script
if (require.main === module) {
  generateTypes();
}

module.exports = { generateTypes };
