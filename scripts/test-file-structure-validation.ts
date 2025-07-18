#!/usr/bin/env tsx

import { FileStructureValidator } from './utils/file-structure-validator';

/**
 * Test script for file structure validation
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.error(
      'Usage: npx tsx scripts/test-file-structure-validation.ts <namespace>',
    );
    process.exit(1);
  }

  const namespace = args[0];
  const generateMissing = args.includes('--generate');

  console.log(`Testing file structure validation for ${namespace}...`);

  const validator = new FileStructureValidator();
  const result = await validator.validateSidebarReferences(namespace);

  console.log('\nValidation Result:');
  console.log('=================');
  console.log(`Valid: ${result.isValid ? 'Yes ✅' : 'No ❌'}`);
  console.log(`Missing Files: ${result.missingFiles.length}`);

  if (result.missingFiles.length > 0) {
    console.log('\nMissing Files Report:');
    console.log(result.report);

    if (generateMissing) {
      console.log('\nGenerating missing files...');
      await validator.generateMissingFiles(namespace, result.missingFiles);

      // Validate again to confirm files were created
      const newResult = await validator.validateSidebarReferences(namespace);
      console.log('\nValidation After Generation:');
      console.log(`Valid: ${newResult.isValid ? 'Yes ✅' : 'No ❌'}`);
      console.log(`Missing Files: ${newResult.missingFiles.length}`);
    }
  }
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
