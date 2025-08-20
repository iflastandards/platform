// tools/codegen/bundle-openapi.mjs
import { exec } from 'child_process';
import { glob } from 'glob';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execAsync = promisify(exec);

async function bundleOpenApiSpecs() {
  const projectRoot = path.resolve(process.cwd());
  const openapiDir = path.join(projectRoot, 'packages/contracts/openapi');
  const outputDir = path.join(projectRoot, 'dist/openapi');
  const outputFile = path.join(outputDir, 'openapi.json');

  console.log('Searching for OpenAPI specs in:', openapiDir);
  const files = await glob(`${openapiDir}/**/*.yaml`);

  if (files.length === 0) {
    console.error('Error: No OpenAPI YAML files found. Cannot generate spec.');
    // Create a dummy file to prevent build failures
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(outputFile, JSON.stringify({ openapi: '3.0.0', info: { title: 'API Spec Not Found', version: '0.0.0' }, paths: {} }));
    return;
  }

  console.log(`Found ${files.length} spec file(s). Bundling...`);

  // Use the first file as the root spec to resolve relative refs
  const rootSpec = files[0];
  const command = `npx swagger-cli bundle ${rootSpec} --outfile ${outputFile} --type json`;

  try {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    // eslint-disable-next-line unused-imports/no-unused-vars
    const { stdout, stderr } = await execAsync(command);
    if (stderr) console.error(`stderr: ${stderr}`);
    console.log(`Successfully bundled OpenAPI specs to ${outputFile}`);
  } catch (error) {
    console.error('Error bundling OpenAPI specs:', error);
    process.exit(1);
  }
}

bundleOpenApiSpecs();
