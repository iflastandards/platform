#!/usr/bin/env tsx

/**
 * This script fixes the page-template-generator.ts script to properly handle
 * the --namespace and --missing-only options.
 */

import * as fs from 'fs';
import * as path from 'path';

// Path to the original script
const originalScriptPath = path.join(__dirname, 'page-template-generator.ts');
const backupScriptPath = path.join(__dirname, 'page-template-generator.ts.bak');

// Read the original script
const originalScript = fs.readFileSync(originalScriptPath, 'utf-8');

// Create a backup of the original script
fs.writeFileSync(backupScriptPath, originalScript, 'utf-8');
console.log(`✅ Created backup of original script at ${backupScriptPath}`);

// Add GeneratorOptions interface
const generatorOptionsInterface = `
interface GeneratorOptions {
  namespace?: string;
  missingOnly?: boolean;
}
`;

// Update the generateAllPageTemplates method
const updatedGenerateAllPageTemplates = `
  /**
   * Generate page templates for all sites or a specific site
   */
  async generateAllPageTemplates(
    siteConfigs: Record<string, SiteConfiguration>,
    options: GeneratorOptions = {},
  ): Promise<void> {
    console.log('📄 Starting Page Template Generator...\n');

    // Filter sites based on namespace option
    const sitesToProcess = options.namespace 
      ? { [options.namespace]: siteConfigs[options.namespace] }
      : siteConfigs;

    // Check if the specified namespace exists
    if (options.namespace && !siteConfigs[options.namespace]) {
      console.error(\`❌ Namespace "\${options.namespace}" not found in site configurations\`);
      process.exit(1);
    }

    for (const [namespace, config] of Object.entries(sitesToProcess)) {
      console.log(\`Generating page templates for \${namespace}...\`);

      try {
        await this.generateSitePageTemplates(namespace, config, options);
        console.log(\`✅ Generated \${namespace} page templates\`);
      } catch (error) {
        console.error(\`❌ Failed to generate \${namespace} templates:\`, error);
      }
    }

    console.log('\\n🎉 Page Template Generator completed!');
  }
`;

// Update the generateSitePageTemplates method signature
const updatedGenerateSitePageTemplatesSignature = `
  /**
   * Generate page templates for a single site
   */
  async generateSitePageTemplates(
    namespace: string,
    config: SiteConfiguration,
    options: GeneratorOptions = {},
  ): Promise<void> {`;

// Update the file existence check
const updatedFileExistenceCheck = `
      // Skip if file already exists to preserve existing content
      if (fs.existsSync(fullPath)) {
        if (options.missingOnly) {
          console.log(\`   ⏭️  Skipping existing file \${template.path}\`);
        } else {
          console.log(\`   ⏭️  Skipping existing file \${template.path} (use --force to overwrite)\`);
        }
        continue;
      }`;

// Add parseArgs function
const parseArgsFunction = `
/**
 * Parse command line arguments
 */
function parseArgs(): GeneratorOptions {
  const args = process.argv.slice(2);
  const options: GeneratorOptions = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--namespace' && i + 1 < args.length) {
      options.namespace = args[i + 1];
      i++; // Skip the next argument
    } else if (arg.startsWith('--namespace=')) {
      options.namespace = arg.split('=')[1];
    } else if (arg === '--missing-only') {
      options.missingOnly = true;
    }
  }

  return options;
}
`;

// Update the main function
const updatedMainFunction = `
/**
 * Main function
 */
async function main() {
  try {
    // Parse command line arguments
    const options = parseArgs();
    
    // Log options
    console.log('Options:');
    console.log(\`  Namespace: \${options.namespace || 'all'}\`);
    console.log(\`  Missing Only: \${options.missingOnly ? 'yes' : 'no'}\`);
    console.log('');

    // Load site configurations
    const configsPath = path.join(
      __dirname,
      '../output/site-configurations/all-site-configs.json',
    );

    if (!fs.existsSync(configsPath)) {
      throw new Error(
        \`Site configurations not found. Please run parse-ifla-report.ts first.\`,
      );
    }

    const siteConfigs: Record<string, SiteConfiguration> = JSON.parse(
      fs.readFileSync(configsPath, 'utf-8'),
    );

    // Generate page templates
    const generator = new PageTemplateGenerator();
    await generator.generateAllPageTemplates(siteConfigs, options);
  } catch (error) {
    console.error('❌ Error generating page templates:', error);
    process.exit(1);
  }
}
`;

// Apply the changes to the original script
let updatedScript = originalScript;

// Add GeneratorOptions interface after the PageTemplate interface
updatedScript = updatedScript.replace(
  'interface PageTemplate {',
  'interface PageTemplate {',
);
updatedScript = updatedScript.replace(
  'interface PageTemplate {\n  path: string;\n  content: string;\n}',
  'interface PageTemplate {\n  path: string;\n  content: string;\n}\n' +
    generatorOptionsInterface,
);

// Update the generateAllPageTemplates method
updatedScript = updatedScript.replace(
  /async generateAllPageTemplates\([^)]*\)[^{]*{[\s\S]*?console\.log\('\\n🎉 Page Template Generator completed!'\);\n  }/,
  updatedGenerateAllPageTemplates,
);

// Update the generateSitePageTemplates method signature
updatedScript = updatedScript.replace(
  /async generateSitePageTemplates\([^)]*\)[^{]*{/,
  updatedGenerateSitePageTemplatesSignature,
);

// Update the file existence check
updatedScript = updatedScript.replace(
  /\/\/ Skip if file already exists to preserve existing content[\s\S]*?continue;/,
  updatedFileExistenceCheck,
);

// Add parseArgs function before the main function
updatedScript = updatedScript.replace(
  /\/\*\*\n \* Main function\n \*\//,
  parseArgsFunction + '\n/**\n * Main function\n */',
);

// Update the main function
updatedScript = updatedScript.replace(
  /async function main\(\)[^{]*{[\s\S]*?process\.exit\(1\);\n  }\n}/,
  updatedMainFunction,
);

// Write the updated script
fs.writeFileSync(originalScriptPath, updatedScript, 'utf-8');
console.log(
  `✅ Updated page-template-generator.ts to handle --namespace and --missing-only options`,
);
console.log(
  `\nYou can now run the script with:\n  pnpm tsx scripts/page-template-generator.ts --namespace=lrm --missing-only`,
);
