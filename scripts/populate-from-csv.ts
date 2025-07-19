#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';
import * as yaml from 'js-yaml';

interface TemplateConfig {
  templates: {
    [key: string]: {
      path: string;
      csvSource: string;
      csvMapping: Record<string, MappingConfig>;
      outputPath: string;
    };
  };
  transforms: Record<string, TransformConfig>;
  categories: Record<string, CategoryConfig>;
}

interface MappingConfig {
  source: string;
  transform?: string;
  fallback?: string;
  default?: any;
}

interface TransformConfig {
  description: string;
  pattern?: string;
  type?: string;
}

interface CategoryConfig {
  label: string;
  pattern: string;
}

/**
 * Populate MDX templates from CSV data for IFLA standards
 * Usage: pnpm tsx scripts/populate-from-csv.ts --standard=isbd --type=element
 */

// Parse command line arguments
const args = process.argv.slice(2);
const argMap = new Map<string, string>();
args.forEach(arg => {
  const [key, value] = arg.split('=');
  argMap.set(key.replace('--', ''), value);
});

const standard = argMap.get('standard') || 'isbd';
const templateType = argMap.get('type') || 'element';

async function main() {
  try {
    // Load template configuration
    const configPath = path.join('standards', standard, 'templates', 'config.json');
    const config: TemplateConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    
    const templateConfig = config.templates[templateType];
    if (!templateConfig) {
      throw new Error(`Template type "${templateType}" not found in config`);
    }

    // Load template file
    const templatePath = path.join('standards', standard, 'templates', templateConfig.path);
    const templateContent = fs.readFileSync(templatePath, 'utf-8');

    // Load CSV data
    const csvPath = path.resolve(path.join('standards', standard, templateConfig.csvSource));
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      relax_quotes: true,
    });

    console.log(`Processing ${records.length} records from CSV...`);

    // Process each record
    for (const record of records) {
      // Skip header rows or empty records
      if (!record.uri || record.uri === 'uri') continue;

      // Extract element ID
      const elementId = extractElementId(record.uri);
      if (!elementId) continue;

      // Determine category
      const category = determineCategory(elementId, config.categories);

      // Apply mappings to create frontmatter data
      const frontmatter = applyMappings(record, templateConfig.csvMapping, config.transforms);
      
      // Add navigation data
      frontmatter.slug = `/${category}/${elementId}`;
      frontmatter.sidebar_category = category;

      // Generate MDX content
      const mdxContent = populateTemplate(templateContent, frontmatter);

      // Determine output path
      const outputPath = templateConfig.outputPath
        .replace('{id}', elementId)
        .replace('{category}', category);
      
      const fullOutputPath = path.join('standards', standard, outputPath);

      // Create directory if needed
      const outputDir = path.dirname(fullOutputPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // Write file
      fs.writeFileSync(fullOutputPath, mdxContent);
      console.log(`Created: ${fullOutputPath}`);
    }

    console.log('Population complete!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

function extractElementId(uri: string): string | null {
  const match = uri.match(/\/([^/]+)$/);
  return match ? match[1] : null;
}

function determineCategory(elementId: string, categories: Record<string, CategoryConfig>): string {
  for (const [key, config] of Object.entries(categories)) {
    if (new RegExp(config.pattern).test(elementId)) {
      return key;
    }
  }
  return 'elements'; // default
}

function applyMappings(
  record: any,
  mappings: Record<string, MappingConfig>,
  transforms: Record<string, TransformConfig>
): any {
  const result: any = {};

  for (const [targetPath, mapping] of Object.entries(mappings)) {
    let value = record[mapping.source];

    // Apply fallback if primary source is empty
    if (!value && mapping.fallback) {
      value = record[mapping.fallback];
    }

    // Apply default if still empty
    if (!value && mapping.default !== undefined) {
      value = mapping.default;
    }

    // Apply transform if specified
    if (value && mapping.transform && transforms[mapping.transform]) {
      value = applyTransform(value, transforms[mapping.transform]);
    }

    // Set value in result object (handle nested paths)
    setNestedValue(result, targetPath, value);
  }

  return result;
}

function applyTransform(value: any, transform: TransformConfig): any {
  if (transform.pattern) {
    const match = value.match(new RegExp(transform.pattern));
    return match ? match[1] : value;
  }
  
  if (transform.type === 'complex') {
    // Handle complex transformations like parsing related elements
    // This would need more sophisticated parsing based on the actual data format
    return value ? [value] : [];
  }

  return value;
}

function setNestedValue(obj: any, path: string, value: any): void {
  const parts = path.split('.');
  let current = obj;

  for (let i = 0; i < parts.length - 1; i++) {
    if (!current[parts[i]]) {
      current[parts[i]] = {};
    }
    current = current[parts[i]];
  }

  current[parts[parts.length - 1]] = value;
}

function populateTemplate(template: string, frontmatter: any): string {
  // Split template into frontmatter and content
  const parts = template.split('---');
  if (parts.length < 3) {
    throw new Error('Invalid template format');
  }

  // Parse existing frontmatter
  const templateFrontmatter = yaml.load(parts[1]) as any || {};

  // Merge with populated data
  const mergedFrontmatter = { ...templateFrontmatter, ...frontmatter };

  // Reconstruct MDX
  const newFrontmatter = yaml.dump(mergedFrontmatter, {
    lineWidth: -1,
    quotingType: "'",
    forceQuotes: false,
  });

  return `---\n${newFrontmatter}---\n${parts.slice(2).join('---')}`;
}

// Run the script
main().catch(console.error);