# Script Organization and Refactoring Plan

This document outlines the plan to reorganize the `scripts` directory for better maintainability and clarity. This action was planned but postponed to address a more immediate issue.

## 1. Proposed Directory Structure

The current flat structure of the `scripts` directory will be replaced with a categorized structure. The following subdirectories will be created, and the existing scripts will be moved into them based on their primary purpose.

*   **`scripts/build/`**: For scripts related to building and bundling applications.
    *   `build-all-for-baseline.ts`, `build-completely-isolated.ts`, `build-with-env.js`, `analyze-bundle-sizes.js`
*   **`scripts/testing/`**: For CI, testing utilities, and test runners.
    *   `capture-baseline-snapshots.ts`, `capture-snapshots-from-running.ts`, `mark-tests-run.js`, `regression-performance-comparison.js`, `test-admin-roles.js`, `test-isbd-sheets.ts`, `test-port-conflict-resolution.js`, `test-portal-builds-optimized.sh`, `test-portal-builds.sh`, `test-site-builds-affected.js`, `test-site-builds-optimized.js`, `test-site-builds.js`
*   **`scripts/validation/`**: For linting, link checking, and other validation tasks.
    *   `check-mediatype-languages.mjs`, `check-missing-languages.ts`, `check-portal-homepage-links.mjs`, `detect-language-mismatches-local.mjs`, `detect-language-mismatches-skos.mjs`, `detect-language-mismatches.mjs`, `validate-build-warnings.js`, `validate-builds.config.json`, `validate-built-site-links.js`, `validate-environment-urls.js`, `validate-isbdm-links.js`, `validate-navigation-urls.js`, `validate-site-links.js`, `vocabulary-comparison.mjs`, `vocabulary-comparison.d.mts`
*   **`scripts/scaffolding/`**: For code generation, new site creation, and templating.
    *   `add-sitemap-pages.sh`, `create-ifla-standard.ts`, `generate-element-redirects.js`, `generate-individual-config.ts`, `scaffold-site.ts`, `site-template.ts`, `scaffold-template/`
*   **`scripts/sheets/`**: For all scripts interacting with Google Sheets.
    *   `create-isbd-excel.ts`, `create-isbd-sheets.ts`, `create-proper-isbd-excel.ts`, `create-sheet.ts`, `create-vocabulary-sheet-action.ts`, `create-vocabulary-sheet.ts`, `fix-sheet-permissions.ts`, `populate-isbd-sheets.ts`, `share-final-sheets.ts`, `share-formatted-sheets.ts`, `share-isbd-sheets.ts`, `sheets-utils.ts`, `spreadsheet-api.ts`, `ISBD-SHEETS-SETUP.md`, `SPREADSHEET-API-GUIDE.md`
*   **`scripts/rdf/`**: For scripts handling RDF data conversion.
    *   `rdf-folder-to-csv.ts`, `rdf-to-csv.js`, `rdf-to-csv.ts`
*   **`scripts/maintenance/`**: For general repository and workspace maintenance tasks.
    *   `element-redirects.js`, `fix-consolidated-links.js`, `move-output-files.js`, `start-with-port-cleanup.js`, `utils/`
*   **`scripts/nx/`**: For utilities and shell scripts specifically for enhancing Nx workflows.
    *   `nx-build-all.js`, `nx-cloud-monitor.js`, `nx-performance-check.js`, `nx-pre-push-fast.sh`, `nx-pre-push.sh`
*   **`scripts/demo/`**: For demonstration and example scripts.
    *   `demo-admin-integration.sh`, `demo-admin-simple.js`, `demo-hooks.sh`
*   **`scripts/misc/`**: For miscellaneous scripts that don't fit into other categories.
    *   `create-vocabulary-form.html`, `open_dashboard.zsh`

## 2. Required Configuration Changes

Moving these scripts will require updating all references to them in the codebase. The reconfiguration effort is medium.

### `package.json` (High Impact)
The root `package.json` has dozens of entries in its `scripts` section that will need to be updated with the new paths. This is where the bulk of the changes will occur.

**Example:**
*   **Before:** `"analyze:bundles": "node scripts/analyze-bundle-sizes.js"`
*   **After:** `"analyze:bundles": "node scripts/build/analyze-bundle-sizes.js"`

### Nx `project.json` Files (Medium Impact)
Several `project.json` files use the `nx:run-commands` executor to call scripts directly. These will need to be updated.
*   **Root `project.json`**: Contains multiple targets that run scripts (e.g., `start-with-port-cleanup.js`, `test-site-builds.js`).
*   **Site-level `project.json` files**: All Docusaurus sites (`portal`, `isbd`, `frbr`, etc.) have `start:robust` and `serve:robust` targets that call `node scripts/utils/port-manager.js`. The path will need to be updated in all of these files.

### Husky Hooks (`.husky/`) (Low Impact)
The hooks themselves call `pnpm` scripts, so the primary changes will be in `package.json`. However, some `package.json` scripts call the hook scripts directly (e.g., `test:pre-push:smart`), and those paths will need updating.

**Example in `package.json`:**
*   **Before:** `"test:pre-push:smart": "./scripts/nx-pre-push.sh"`
*   **After:** `"test:pre-push:smart": "./scripts/nx/nx-pre-push.sh"`
