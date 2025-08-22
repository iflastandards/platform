import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  // Point directly to the schema file within the installed package
  schema: 'node_modules/@octokit/graphql-schema/schema.graphql',
  // Look for .graphql files within the src directory
  documents: 'src/github/queries/**/*.graphql',
  generates: {
    // Output directory for the generated code
    'src/github/gql/': {
      preset: 'client',
      plugins: [],
    },
  },
  ignoreNoDocuments: true, // Prevents errors if there are no queries yet
};

export default config;