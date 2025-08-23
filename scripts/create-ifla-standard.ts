#!/usr/bin/env node
/**
 * create-ifla-standard.ts
 *
 * Scaffolds a new standard folder (e.g. "frad") under `standards/` with:
 *   • .config files     (project.json, sheet.json, vocab.yaml, docusaurus.config.ts)
 *   • csv/              (empty element-set + vocab sub‑dir)
 *   • docs/             (index.mdx)
 *   • blog/             (.gitkeep)
 *   • rdf/              (.gitkeep in ttl/, jsonld/, xml/)
 *   • scripts/          (folder placeholder)
 *   • package.json      (inherit shared tooling)
 *   • README.md         (contribution guide)
 *   • Adds path entry to CODEOWNERS & creates a GitHub Project board via REST v3.
 *
 * Usage (via pnpm dlx):
 *   pnpm dlx create-ifla-standard frad --name "Functional Requirements for Authority Data"
 *
 * Requirements:
 *   • Node 22 (ESM)
 *   • Environment var  GITHUB_TOKEN  with repo‑scoped permissions (for board + CODEOWNERS).
 *
 * Built for ESM ("type":"module" in package.json).  Run through tsx or ts-node.
 */

import { promises as fs } from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as process from 'node:process';
import { strict as assert } from 'node:assert';
import { execSync } from 'node:child_process';
import { program } from 'commander';
import chalk from 'chalk';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

program
  .name('create-ifla-standard')
  .argument('<code>', 'lower‑case short code, e.g. ISBDM')
  .option('-n, --name <title>', 'Human‑readable title')
  .option('-t, --tagline <tagline>', 'Brief description/tagline')
  .option('-p, --prefix <prefix>', 'Vocabulary prefix (defaults to code)')
  .option('--number-prefix <prefix>', 'Element number prefix (T or E)', 'T')
  .option('--profile <filename>', 'Main vocabulary profile CSV filename')
  .option('--elements-uri <uri>', 'Base URI for elements')
  .option('--elements-profile <filename>', 'Elements profile CSV filename')
  .option('--edit-url <url>', 'GitHub edit URL for the standard')
  .option('--skip-github', 'Skip GitHub API calls (offline)')
  .parse(process.argv);

const opts = program.opts();
const code = program.args[0]?.toLowerCase();
assert(code, 'Standard code is required');

const TITLE = opts.name ?? code.toUpperCase();
const TAGLINE = opts.tagline ?? `${TITLE} Standard`;
const PREFIX = opts.prefix ?? code.toLowerCase();
const NUMBER_PREFIX = opts.numberPrefix ?? 'T';
const PROFILE = opts.profile ?? `${code.toLowerCase()}-values-profile.csv`;
const ELEMENTS_URI = opts.elementsUri ?? `https://www.iflastandards.info/${code.toUpperCase()}/elements`;
const ELEMENTS_PROFILE = opts.elementsProfile ?? `${code.toLowerCase()}-elements-profile.csv`;
const EDIT_URL = opts.editUrl ?? `https://github.com/iflastandards/${code.toUpperCase()}/tree/main/`;
const ROOT = path.resolve(process.cwd(), 'standards', code);

const TEMPLATE_DIR = path.join(__dirname, 'scaffold-template');

async function copyTemplate() {
  await fs.mkdir(ROOT, { recursive: true });
  await copyAndProcessDirectory(TEMPLATE_DIR, ROOT);
}

async function copyAndProcessDirectory(srcDir: string, destDir: string) {
  const entries = await fs.readdir(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    const src = path.join(srcDir, entry.name);
    const dest = path.join(destDir, entry.name);

    if (entry.isDirectory()) {
      await fs.mkdir(dest, { recursive: true });
      await copyAndProcessDirectory(src, dest);
    } else {
      // Process text files for placeholder replacement
      const isTextFile = /\.(ts|js|tsx|jsx|md|mdx|json|yaml|yml|txt|csv)$/i.test(entry.name);

      if (isTextFile) {
        let data = await fs.readFile(src, 'utf8');
        // Replace all placeholders
        data = data
          .replace(/__CODE__/g, code.toUpperCase())
          .replace(/__LOWERCASE_CODE__/g, code.toLowerCase())
          .replace(/__TITLE__/g, TITLE)
          .replace(/__TAGLINE__/g, TAGLINE)
          .replace(/__PREFIX__/g, PREFIX)
          .replace(/__NUMBER_PREFIX__/g, NUMBER_PREFIX)
          .replace(/__PROFILE__/g, PROFILE)
          .replace(/__ELEMENTS_URI__/g, ELEMENTS_URI)
          .replace(/__ELEMENTS_PROFILE__/g, ELEMENTS_PROFILE)
          .replace(/__EDIT_URL__/g, EDIT_URL);
        await fs.writeFile(dest, data);
      } else {
        // Copy binary files as-is
        await fs.copyFile(src, dest);
      }
    }
  }
}

async function updateCodeowners() {
  const pathEntry = `/standards/${code}/** @RG-${code.toUpperCase()}-editors\n`;
  const ownersFile = path.resolve('.github', 'CODEOWNERS');
  try {
    await fs.appendFile(ownersFile, pathEntry);
    console.log(chalk.green('✔ Updated CODEOWNERS'));
  } catch {
    console.warn(chalk.yellow('⚠ Could not update CODEOWNERS (file missing?)'));
  }
}

async function createProjectBoard() {
  if (opts.skipGithub) {return;}
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.warn(chalk.yellow('⚠ GITHUB_TOKEN not set – skipping project creation'));
    return;
  }
  const repo = process.env.GITHUB_REPOSITORY || 'IFLA/ifla-standards';
  const apiUrl = `https://api.github.com/repos/${repo}/projects`;

  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.inertia-preview+json'
    },
    body: JSON.stringify({ name: `${code.toUpperCase()} Board` })
  });
  if (!res.ok) {
    console.warn(chalk.yellow(`⚠ GitHub project creation failed: ${res.statusText}`));
    return;
  }
  const data = await res.json() as { html_url: string };
  const url = data.html_url;
  // write to .config/project.json
  await fs.mkdir(path.join(ROOT, '.config'), { recursive: true });
  await fs.writeFile(path.join(ROOT, '.config', 'project.json'), JSON.stringify({ url }, null, 2));
  console.log(chalk.green(`✔ GitHub Project created: ${url}`));
}

async function gitAdd() {
  try {
    execSync(`git add ${ROOT} .github/CODEOWNERS`, { stdio: 'inherit' });
    execSync(`git commit -m "feat(${code}): scaffold ${TITLE}"`, { stdio: 'inherit' });
    console.log(chalk.green('✔ Initial commit staged (remember to push)'));
  } catch {
    console.warn(chalk.yellow('⚠ Git commit failed – is this inside a git repo?'));}
}

(async () => {
  console.log(chalk.blue(`Creating scaffold for ${TITLE} at ${ROOT}`));
  await copyTemplate();
  await updateCodeowners();
  await createProjectBoard();
  await gitAdd();
  console.log(chalk.green('🎉 Standard scaffold complete.'));
})();
