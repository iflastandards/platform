#!/usr/bin/env node

/*
 Fast TypeScript typecheck for affected projects only, bypassing Nx target dependsOn.
 - Uses `nx print-affected --select=projects` to list affected projects
 - For each project, resolves its root via `nx show project <name> --json`
 - Runs `tsc --noEmit -p <projectRoot>/tsconfig.json` if tsconfig exists
 - Exits non-zero on first failure
*/

const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function run(cmd, opts = {}) {
  const res = spawnSync(cmd, {
    shell: true,
    stdio: 'pipe',
    encoding: 'utf8',
    ...opts,
  });
  if (res.status !== 0) {
    const err = new Error(
      `Command failed: ${cmd}\n${res.stdout}\n${res.stderr}`,
    );
    err.code = res.status;
    throw err;
  }
  return res.stdout.trim();
}

function getAffectedProjects() {
  // Use Nx 19+ show projects
  const cmd = 'pnpm nx show projects --affected';
  const out = run(cmd);
  if (!out) {return [];}
  // Output can be CSV or newline-separated depending on Nx; split on commas and newlines
  return out
    .split(/[,\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function getProjectInfo(name) {
  const out = run(`pnpm nx show project ${name} --json`);
  try {
    return JSON.parse(out);
  } catch (e) {
    throw new Error(
      `Failed to parse project info for ${name}: ${e.message}\n${out}`,
    );
  }
}

function main() {
  console.log('🧩 Determining affected projects for typecheck...');
  const projects = getAffectedProjects();
  if (projects.length === 0) {
    console.log('✅ No affected projects to typecheck.');
    return;
  }
  console.log(`📦 Affected projects: ${projects.join(', ')}`);

  for (const name of projects) {
    const info = getProjectInfo(name);
    // Nx returns project.root path
    const root =
      info.root ||
      info.sourceRoot ||
      info.projectRoot ||
      info.targets?.build?.options?.tsConfig?.replace(
        /\/tsconfig\.json$/,
        '',
      ) ||
      '';
    if (!root) {
      console.log(`ℹ️  Skipping ${name}: unable to resolve project root`);
      continue;
    }
    const tsconfigPath = path.join(process.cwd(), root, 'tsconfig.json');
    if (!fs.existsSync(tsconfigPath)) {
      console.log(
        `ℹ️  Skipping ${name}: no tsconfig.json at ${path.relative(process.cwd(), tsconfigPath)}`,
      );
      continue;
    }
    console.log(`🔎 Typechecking ${name} (${root})...`);
    const res = spawnSync('tsc', ['--noEmit', '-p', tsconfigPath], {
      stdio: 'inherit',
      env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=4096' },
    });
    if (res.status !== 0) {
      console.error(`❌ Typecheck failed for ${name}`);
      process.exit(res.status || 1);
    } else {
      console.log(`✅ ${name} typecheck passed`);
    }
  }
  console.log('✅ All affected projects typecheck passed');
}

try {
  main();
} catch (err) {
  console.error(String(err.message || err));
  process.exit(err.code || 1);
}
