#!/usr/bin/env node

/**
 * Optimize site build configurations to prevent unnecessary rebuilds
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

async function optimizeSiteConfigs() {
  const projectFiles = await glob('standards/*/project.json', {
    ignore: ['**/node_modules/**', '**/dist/**', '**/build/**'],
  });

  console.log(`Found ${projectFiles.length} site project files`);

  for (const projectFile of projectFiles) {
    console.log(`\nProcessing ${projectFile}...`);

    const content = fs.readFileSync(projectFile, 'utf8');
    const project = JSON.parse(content);

    let modified = false;

    // Optimize build target
    if (project.targets?.build) {
      const oldInputs = JSON.stringify(project.targets.build.inputs);

      project.targets.build.inputs = [
        'docusaurus',
        {
          dependentTasksOutputFiles: 'packages/theme/dist/**/*',
          transitive: false,
        },
      ];

      project.targets.build.dependsOn = [
        {
          target: 'build',
          projects: ['@ifla/theme'],
          params: 'forward',
        },
      ];

      const newInputs = JSON.stringify(project.targets.build.inputs);
      if (oldInputs !== newInputs) {
        console.log('  ✓ Updated build inputs');
        modified = true;
      }
    }

    // Optimize typecheck target
    if (project.targets?.typecheck) {
      const oldDeps = JSON.stringify(project.targets.typecheck.dependsOn);

      project.targets.typecheck.dependsOn = [
        {
          target: 'build',
          projects: ['@ifla/theme'],
        },
      ];

      project.targets.typecheck.inputs = [
        '{projectRoot}/src/**/*.{ts,tsx}',
        '{projectRoot}/**/*.{ts,tsx}',
        '{projectRoot}/tsconfig.json',
        '{workspaceRoot}/tsconfig.json',
        '!{projectRoot}/build/**/*',
        '!{projectRoot}/.docusaurus/**/*',
        '!{projectRoot}/node_modules/**/*',
      ];

      const newDeps = JSON.stringify(project.targets.typecheck.dependsOn);
      if (oldDeps !== newDeps) {
        console.log('  ✓ Updated typecheck dependencies');
        modified = true;
      }
    }

    if (modified) {
      fs.writeFileSync(projectFile, JSON.stringify(project, null, 2) + '\n');
      console.log(`  ✅ Saved ${projectFile}`);
    } else {
      console.log(`  ⏭️  No changes needed`);
    }
  }

  console.log('\n✅ Site optimization complete!');
}

optimizeSiteConfigs().catch((error) => {
  console.error('Error optimizing site configs:', error);
  process.exit(1);
});
