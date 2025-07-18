# Vocabulary Site Scaffolding Fix

## Issue: Command Line Options Not Working

The page template generator script (`scripts/page-template-generator.ts`) was ignoring command line options like `--namespace=lrm` and `--missing-only`. When running the script with these options, it would still generate templates for all sites instead of just the specified namespace.

## Fix

A fix script has been created to update the page template generator to properly handle command line options:

```bash
# Apply the fix
pnpm tsx scripts/fix-page-template-generator.ts

# Run the fixed script with options
pnpm tsx scripts/page-template-generator.ts --namespace=lrm --missing-only
```

### Changes Made by the Fix

1. Added a `GeneratorOptions` interface to handle command line options:
   ```typescript
   interface GeneratorOptions {
     namespace?: string;
     missingOnly?: boolean;
   }
   ```

2. Updated the `generateAllPageTemplates` method to filter sites based on the namespace option:
   ```typescript
   async generateAllPageTemplates(
     siteConfigs: Record<string, SiteConfiguration>,
     options: GeneratorOptions = {},
   ): Promise<void> {
     // Filter sites based on namespace option
     const sitesToProcess = options.namespace 
       ? { [options.namespace]: siteConfigs[options.namespace] }
       : siteConfigs;

     // Check if the specified namespace exists
     if (options.namespace && !siteConfigs[options.namespace]) {
       console.error(`❌ Namespace "${options.namespace}" not found in site configurations`);
       process.exit(1);
     }

     // Process only the filtered sites
     for (const [namespace, config] of Object.entries(sitesToProcess)) {
       // ...
     }
   }
   ```

3. Added a `parseArgs` function to parse command line arguments:
   ```typescript
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
   ```

4. Updated the `main` function to use the parsed options:
   ```typescript
   async function main() {
     // Parse command line arguments
     const options = parseArgs();
     
     // Log options
     console.log('Options:');
     console.log(`  Namespace: ${options.namespace || 'all'}`);
     console.log(`  Missing Only: ${options.missingOnly ? 'yes' : 'no'}`);

     // ...

     // Pass options to the generator
     await generator.generateAllPageTemplates(siteConfigs, options);
   }
   ```

## Usage

After applying the fix, you can use the following command line options:

- `--namespace=<namespace>`: Generate templates only for the specified namespace
- `--missing-only`: Skip existing files (default behavior, but now properly documented)

Example:

```bash
# Generate templates only for the LRM namespace
pnpm tsx scripts/page-template-generator.ts --namespace=lrm

# Generate only missing files for the LRM namespace
pnpm tsx scripts/page-template-generator.ts --namespace=lrm --missing-only

# Generate templates for all sites
pnpm tsx scripts/page-template-generator.ts
```

## Backup

The fix script creates a backup of the original script at `scripts/page-template-generator.ts.bak`. If you encounter any issues with the updated script, you can restore the original:

```bash
mv scripts/page-template-generator.ts.bak scripts/page-template-generator.ts
```