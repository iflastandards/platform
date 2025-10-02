# Link Validation CI Integration

## Overview

The IFLA Standards platform uses automated link validation in CI/CD workflows to ensure documentation quality across all sites. The system validates links after deployment and provides detailed reports with PR feedback.

## Architecture

### Validation Strategy: Dual Approach

The platform uses **two complementary validation methods**:

1. **Build-Time Validation** (`check-warnings.yml`)
   - Runs during `nx build` process
   - Catches: MDX syntax errors, missing images, broken internal links
   - Fast: ~2-3 minutes for affected sites
   - When: Pre-deployment, blocks broken builds
   - Reports: `output/_reports/build-warnings.json`

2. **Runtime Validation** (`check-links.yml`)
   - Runs on deployed sites using Puppeteer browser automation
   - Catches: Actual broken links, external link issues, runtime problems
   - Thorough: Uses sitemap for comprehensive coverage
   - When: Post-deployment, validates user experience
   - Reports: `output/link-validation/*.{json,html}`

**Why Both?** They catch different issues:
- Build warnings: Prevents deployment of broken code
- Link validation: Verifies what users actually experience

### Link Validation Scripts

**Primary Script:** `scripts/validate-environment-urls.js` (Puppeteer)
- ✅ Writes JSON/HTML reports to `output/link-validation/`
- ✅ Generates interactive browsable reports
- ✅ Creates `index-data.json` for aggregated results
- ✅ Supports sitemap-based comprehensive validation

**Alternative:** `scripts/validate-environment-urls-playwright.js` (Playwright)
- ⚡ 3x faster performance
- ❌ No JSON report generation (console only)
- 🔄 Being considered for enhancement

**Wrapper:** `scripts/check-links.js`
- Simple CLI interface
- Routes to Puppeteer version for report generation
- Supports interactive mode and shortcuts

## CI/CD Workflows

### 1. Check Links Workflow (`.github/workflows/check-links.yml`)

**Triggers:**
- `workflow_run` - After deployment completes
- `workflow_dispatch` - Manual execution
- `schedule` - Daily at 2 AM UTC

**Execution Logic:**

```yaml
# Daily Schedule
if schedule:
  → Check ALL sites on preview environment
  → Full sitemap validation
  → Regression detection

# Main Branch Deploy
elif main branch:
  → Check ALL sites on production
  → Full sitemap validation
  → Post-deployment smoke test

# Preview Deploy (PR)
else:
  → Check ONLY affected sites (nx affected)
  → Preview environment
  → Fast feedback loop
```

**nx affected Integration:**

```bash
# Get affected documentation sites
AFFECTED=$(pnpm nx show projects --affected --type app | \
  grep -E '^(portal|ISBDM|LRM|FRBR|isbd|muldicat|unimarc)$' | \
  tr '\n' ',')

# Validate only affected sites
pnpm check:links "$AFFECTED" preview sitemap
```

**Performance Gains:**
- PR validations: **60-80% faster** (1-2 sites instead of all 7)
- Comprehensive coverage: Maintained in daily/production runs
- Smart context-aware execution

### 2. Build Warnings Workflow (`.github/workflows/check-warnings.yml`)

**Purpose:** Pre-deployment validation during build

**Triggers:**
- `workflow_call` - Called from PR validation
- `workflow_dispatch` - Manual execution
- `schedule` - Daily at 2 AM UTC

**Process:**
```bash
# Build all sites in parallel (or affected only)
node scripts/collect-warnings-parallel.js

# Captures:
# - Docusaurus build warnings
# - Broken link warnings
# - MDX syntax errors
# - Missing images/assets
```

**Reports:**
- `output/_reports/build-warnings.json` - Structured data
- `output/_reports/build-warnings-summary.md` - Markdown summary
- `output/_reports/check-summary.json` - CI metadata

## Report Generation

### Link Validation Reports

**Directory:** `output/link-validation/`

**Generated Files:**

1. **Per-Site HTML Reports**
   ```
   output/link-validation/{site}/
     └── report-YYYY-MM-DD.html  # Interactive browsable report
   ```

2. **Aggregated Index**
   ```
   output/link-validation/
     ├── index-data.json          # All sites summary
     ├── index.html               # Report browser UI
     └── view-report.js           # Local viewing server
   ```

3. **Individual Site Data**
   ```
   output/link-validation/
     ├── portal-YYYY-MM-DD.json         # Raw validation data
     ├── portal-YYYY-MM-DD-summary.txt  # Human-readable summary
     └── [site]-YYYY-MM-DD.{json,txt}   # Per-site reports
   ```

**index-data.json Structure:**
```json
{
  "portal": {
    "results": {
      "totalLinks": 150,
      "passedLinks": 148,
      "failedLinks": 2,
      "testDate": "2025-10-02",
      "environment": "preview"
    },
    "reportFile": "portal/report-2025-10-02.html"
  }
}
```

### Viewing Reports

**Local Development:**
```bash
# After running link validation
node output/link-validation/view-report.js

# Opens http://localhost:8080
# Browse all reports with interactive UI
```

**CI Artifacts:**
- Navigate to workflow run
- Download `link-check-report-{run_number}` artifact
- Contains all JSON/HTML/TXT reports
- 30-day retention

## PR Integration

### Automated PR Comments

**Trigger:** After preview deployment validation completes

**Comment Format:**

```markdown
## 🔗 Link Check Results

### Link Validation Summary

| Site | Status | Links Tested | Passed | Failed |
|------|--------|--------------|--------|--------|
| PORTAL | ✅ | 150 | 150 | 0 |
| ISBDM | ❌ | 200 | 198 | 2 |

⚠️ **Action Required**: 2 broken links found. Please fix before merging.

📊 [View detailed reports in artifacts](...)
```

**Implementation:** `.github/workflows/check-links.yml` lines 115-188
- Reads `output/link-validation/index-data.json`
- Builds summary table from aggregated data
- Posts to PR via GitHub API
- Updates existing comment if present

### Build Warnings PR Comments

**Trigger:** During PR validation

**Comment Format:**
```markdown
## 📊 Docusaurus Build Report

⚠️ **Found 5 warnings across all documentation sites.**

### Summary by Site
- portal: 2 warnings
- ISBDM: 3 warnings

### 📄 Build Artifacts
- [View workflow run](...)
- [Download warnings report](...)
```

## Usage

### Manual Link Validation

**Interactive Mode:**
```bash
pnpm check:links
# Prompts for: site, environment, validation type
```

**Common Commands:**
```bash
# Quick navigation check (all sites)
pnpm check:links:quick

# Full comprehensive check
pnpm check:links:full

# Specific site
pnpm check:links:portal

# Custom validation
pnpm check:links portal production sitemap
pnpm check:links "isbdm,lrm" preview sitemap
pnpm check:links all local static
```

**Direct Script Usage:**
```bash
# Comprehensive sitemap validation
node scripts/validate-environment-urls.js \
  --env preview \
  --site all \
  --type sitemap

# Quick navigation check
node scripts/validate-environment-urls.js \
  --env local \
  --site isbdm \
  --type static

# Production validation
node scripts/validate-environment-urls.js \
  --env production \
  --site portal \
  --type sitemap
```

### Validation Types

**static** - Navigation & footer links only
- Fastest validation (~30 seconds)
- Tests only core navigation
- Good for quick smoke tests

**sitemap** - Comprehensive sitemap-based (recommended)
- Uses sitemap.xml to find ALL pages
- Tests hundreds of links systematically
- Best for thorough validation
- ~2-5 minutes per site

**comprehensive** - Deep validation
- Crawls all pages recursively
- Tests all internal and content links
- Most thorough, slowest
- Use with `--depth` parameter

**both** - Static + generated links
- Combines navigation and content validation
- Comprehensive coverage

### Depth Control

```bash
# Homepage only
--depth 0

# Homepage + direct links
--depth 1

# Two levels deep
--depth 2

# All links from sitemap (default for sitemap type)
# No --depth parameter needed
```

## Workflow Integration

### Adding Link Validation to New Sites

1. **Add site to configuration:**
   ```javascript
   // scripts/utils/site-config-utils.js
   const sites = {
     newsite: {
       local: 'http://localhost:3XXX',
       preview: 'https://newsite-preview.onrender.com',
       production: 'https://newsite.iflastandards.info'
     }
   };
   ```

2. **Update workflow filters:**
   ```yaml
   # .github/workflows/check-links.yml
   grep -E '^(portal|ISBDM|...|newsite)$'
   ```

3. **Test locally:**
   ```bash
   pnpm check:links newsite local sitemap
   ```

### Nx Affected Integration

**How it works:**

1. **Detect changes:**
   ```bash
   pnpm nx show projects --affected --type app
   ```

2. **Filter documentation sites:**
   ```bash
   grep -E '^(portal|ISBDM|LRM|FRBR|isbd|muldicat|unimarc)$'
   ```

3. **Format for check-links:**
   ```bash
   tr '\n' ',' | sed 's/,$//'  # portal,isbdm,lrm
   ```

4. **Execute validation:**
   ```bash
   pnpm check:links "$AFFECTED" preview sitemap
   ```

**Benefits:**
- Only validates sites that changed
- Dramatically faster PR checks
- Maintains full coverage in daily/production runs

## Troubleshooting

### Common Issues

**1. No reports generated**
```bash
# Check if using correct script
grep scriptPath scripts/check-links.js
# Should show: validate-environment-urls.js (Puppeteer)
# NOT: validate-environment-urls-playwright.js
```

**2. Reports in wrong location**
```bash
# Reports should be in:
ls output/link-validation/

# NOT in:
ls .github/reports/  # Old location
```

**3. Workflow finds no affected sites**
```bash
# Test nx affected locally
pnpm nx show projects --affected --type app

# Check base branch
git fetch origin preview
pnpm nx show projects --affected --base=origin/preview
```

**4. Link validation timeouts**
```bash
# Increase timeout for slow sites
node scripts/validate-environment-urls.js \
  --site isbdm \
  --timeout 30000  # 30 seconds
```

**5. False positives in build warnings**
```bash
# Add to scripts/warnings-ignore.json
{
  "ignoredPatterns": [
    {
      "pattern": "your-pattern-here",
      "reason": "Explanation of why ignored"
    }
  ]
}
```

### Debug Mode

**Enable verbose output:**
```bash
# In workflow
pnpm check:links:all --verbose

# Direct script
node scripts/validate-environment-urls.js \
  --site portal \
  --env local \
  --type sitemap \
  --verbose
```

**Check browser automation:**
```bash
# Run locally with visible browser
PUPPETEER_HEADLESS=false node scripts/validate-environment-urls.js \
  --site portal \
  --env local
```

## Performance Optimization

### Current Metrics

**PR Validation (with nx affected):**
- Before: ~10 minutes (all 7 sites)
- After: ~2-3 minutes (1-2 affected sites)
- Improvement: **60-80% faster**

**Daily/Production:**
- Still validates all sites for comprehensive coverage
- Trade-off: Speed on PRs, thoroughness on schedule

### Parallelization

**Build Warnings:**
```javascript
// scripts/collect-warnings-parallel.js
const MAX_PARALLEL = isCI ? 3 : 8;
// CI: 3 concurrent builds
// Local: 8 concurrent builds
```

**Link Validation:**
- Sequential by design (browser automation)
- Each site validated independently
- Can run multiple sites in parallel in future enhancement

### Caching

**Sitemap Caching:**
```javascript
// Cached in: .cache/sitemap-cache.json
// Reduces repeated sitemap fetches
// TTL: Per session
```

**Content Caching:**
```javascript
// Cached in: .cache/content-cache.json
// Speeds up repeated validations
// TTL: Per session
```

## Best Practices

### When to Run Link Validation

**✅ Always run:**
- After content updates (mdx files)
- After navigation changes (sidebar, footer)
- Before major releases
- As part of PR validation

**⚠️ Consider running:**
- After dependency updates (may affect links)
- After configuration changes
- After theme updates

**ℹ️ Optional:**
- For typo-only fixes
- For style-only changes
- For non-documentation PRs

### Handling Broken Links

**1. Review the report:**
```bash
# Download artifact or view locally
node output/link-validation/view-report.js
```

**2. Categorize issues:**
- HIGH: Broken internal links (404s)
- MEDIUM: Missing anchors (fragments)
- LOW: External link issues

**3. Fix systematically:**
```bash
# Find and fix in content
grep -r "broken-link-url" portal/docs/
```

**4. Re-validate:**
```bash
pnpm check:links portal local sitemap
```

### Link Validation Checklist

Before merging PRs with documentation changes:

- [ ] Build warnings check passes
- [ ] Link validation check passes
- [ ] Review any reported issues in artifacts
- [ ] Fix all HIGH priority broken links
- [ ] Document any intentional MEDIUM/LOW issues
- [ ] Re-run validation after fixes

## Future Enhancements

### Planned Improvements

1. **Migrate to Playwright for reports:**
   - Add JSON generation to Playwright version
   - 3x performance improvement
   - Better error handling

2. **Parallel site validation:**
   - Run multiple sites concurrently
   - Further reduce validation time

3. **External link validation:**
   - Periodic checks of external URLs
   - Avoid false positives from temporary outages
   - Cache external link status

4. **Trending and analytics:**
   - Track broken link trends over time
   - Identify problematic patterns
   - Report generation improvements

5. **Integration with build process:**
   - Fail builds on critical link issues
   - Warning thresholds
   - Auto-fix capabilities

## Related Documentation

- [Link Validation Scripts](./link-validation.md) - Detailed script documentation
- [Testing Strategy](./TESTING_STRATEGY.md) - Overall testing approach
- [CI/CD Workflows](../README.md#cicd) - Workflow architecture
- [Nx Optimizations](./NX_OPTIMIZATIONS_APPLIED.md) - Performance improvements

## Support

**Issues with link validation?**
1. Check [Troubleshooting](#troubleshooting) section
2. Review workflow logs in GitHub Actions
3. Download and analyze artifacts
4. Test locally with debug mode

**Questions?**
- See [link-validation.md](./link-validation.md) for script details
- Check workflow files in `.github/workflows/`
- Review PR comments for examples
