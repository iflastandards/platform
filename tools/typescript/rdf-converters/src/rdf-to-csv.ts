#!/usr/bin/env node

import { Command } from 'commander';
import * as fs from 'fs';
import {
  RdfParser,
  DctapProfileParser,
  CsvGenerator,
  filterContainerResources,
  createDefaultProfileData,
} from './lib';

async function main() {
  const program = new Command();

  program
    .name('rdf-to-csv')
    .description('Convert RDF files to CSV format using DCTAP profile')
    .version('1.0.0')
    .requiredOption('-i, --input <rdf-file>', 'Path to the RDF file (supports .ttl, .nt, .jsonld, .rdf, .xml)')
    .option('-p, --profile <dctap-file>', 'Path to DCTAP profile CSV file')
    .option('-o, --output <output-file>', 'Output CSV file (default: stdout)')
    .option('-f, --format <format>', 'Force RDF format (auto-detected by default)')
    .action(async (options) => {
      const rdfFile = options.input;
      try {
        // Initialize parser
        const parser = new RdfParser();

        // Load DCTAP profile if provided
        let profileData;
        if (options.profile) {
          const profileParser = new DctapProfileParser();
          const profile = await profileParser.loadProfile(options.profile);
          profileData = profileParser.getProfileData(profile);
        } else {
          profileData = createDefaultProfileData((curie) => parser.expandCurie(curie));
        }

        // Parse RDF file
        console.error(`Parsing RDF file: ${rdfFile}`);
        const store = await parser.parseFile(rdfFile, { format: options.format });

        // Extract resource data
        const allResources = parser.extractResources(
          store,
          new Set(profileData.urlLiteralProperties.keys())
        );
        console.error(`Found ${allResources.size} total resources`);

        // Filter out container resources
        const resources = filterContainerResources(
          allResources,
          (curie) => parser.expandCurie(curie)
        );
        console.error(
          `After filtering: ${resources.size} resources (filtered out ${
            allResources.size - resources.size
          } containers)`
        );

        // Generate CSV
        const generator = new CsvGenerator(
          (curie) => parser.expandCurie(curie),
          (uri) => parser.toCurie(uri)
        );

        const csvString = generator.generateCsv(
          resources,
          profileData.repeatableProperties,
          profileData.maxPerLanguageProperties,
          profileData.urlLiteralProperties
        );

        // Write output
        if (options.output) {
          fs.writeFileSync(options.output, csvString);
          console.error(`CSV written to: ${options.output}`);
        } else {
          console.log(csvString);
        }
      } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : error);
        process.exit(1);
      }
    });

  program.parse();
}

// Run if called directly
if (require.main === module) {
  main();
}