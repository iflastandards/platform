# Link Validation Scripts

## Overview
The IFLA Standards project uses `validate-environment-urls.js` as the primary link validation tool. It checks for broken links across any or all Docusaurus sites, supports multiple environments (local, preview, production), and uses sitemaps to find ALL pages and links (hundreds, not just homepage links).

## Quick Start

### Simple Commands
```bash
# Check all sites on local dev servers
pnpm check:links

# Quick navigation check for all sites
pnpm check:links:quick

# Full comprehensive check
pnpm check:links:full

# Check specific site
pnpm check:links:portal
```

### Using the Wrapper Script
```bash
# Interactive mode - prompts for site, environment, and type
node scripts/check-links.js

# Check specific site (defaults to local environment, sitemap type)
node scripts/check-links.js isbdm

# Check on different environment
node scripts/check-links.js portal production
node scripts/check-links.js all preview

# Check multiple specific sites
node scripts/check-links.js "isbdm,lrm,portal"
```

### Direct Script Usage
```bash
# Comprehensive sitemap validation (recommended - finds ALL links)
node scripts/validate-environment-urls.js --env local --site all --type sitemap

# Quick navigation/footer check
node scripts/validate-environment-urls.js --env local --site isbdm --type static

# Check production environment
node scripts/validate-environment-urls.js --env production --site portal --type sitemap
```

## Features
- ✅ **Interactive mode** - Prompts for options when none provided
- ✅ **Finds ALL links** via sitemap crawling (hundreds of links, not just homepage)
- ✅ **Multi-environment support** (local, preview, production)
- ✅ **Multiple validation modes**:
  - `static` - Navigation/footer links only (quick)
  - `sitemap` - Comprehensive sitemap-based (recommended)
  - `comprehensive` - Deep validation with all pages
  - `both` - Both static and generated links
- ✅ **Multiple sites** support (`--site all` or comma-separated)
- ✅ **Caching** for performance
- ✅ **Detailed HTML reports** with viewing server
- ✅ **Portal works normally** - no special handling needed

## Available Sites
- `portal` - IFLA Standards Portal
- `isbdm` - ISBD for Manifestations
- `isbd` - International Standard Bibliographic Description
- `lrm` - Library Reference Model
- `frbr` - Functional Requirements for Bibliographic Records
- `unimarc` - UNIMARC format
- `muldicat` - Multilingual Dictionary of Cataloguing Terms

## Options

### validate-environment-urls.js Options
- `--env <env>` - Environment to validate (local, preview, production)
- `--site <site>` - Site(s) to validate ("all", specific, or comma-separated)
- `--type <type>` - Validation type (static, sitemap, comprehensive, both)
- `--depth <number>` - Crawl depth for non-sitemap modes
- `--timeout <ms>` - Timeout per link in milliseconds (default: 15000)
- `--sample-size <number>` - Number of generated links to test

### check-links.js Shortcuts
- `check-links` - Interactive mode (prompts for options)
- `check-links quick` - Quick navigation check for all sites
- `check-links full` - Full comprehensive check for all sites
- `check-links --help` - Show help

## Examples

### Interactive Mode
```bash
# Run without arguments for interactive prompts
node scripts/check-links.js
# or
pnpm check:links

# You'll be prompted for:
# - Environment (local/preview/production)
# - Site(s) to check
# - Validation type (static/sitemap/comprehensive)
```

### Local Development
```bash
# First, ensure dev servers are running
pnpm start:all

# Build sites for sitemap validation
pnpm build:all

# Then check links
pnpm check:links:all          # All sites with sitemap
node scripts/check-links.js isbdm  # Specific site
```

### CI/Production Validation
```bash
# Check all production sites
node scripts/validate-environment-urls.js --env production --site all --type sitemap

# Check preview environment
node scripts/validate-environment-urls.js --env preview --site portal --type sitemap
```

### Quick Checks
```bash
# Just check navigation on homepage (fast)
node scripts/validate-environment-urls.js --env local --site isbdm --type static --depth 0

# Check with limited crawl depth
node scripts/validate-environment-urls.js --env local --site portal --depth 1
```

## Output

Reports are saved to `output/link-validation/` with:
- Individual site HTML reports with detailed link status
- `index.html` - Master index of all validation runs
- `view-report.js` - Simple server to view HTML reports

### Viewing Reports
```bash
# After running validation
node output/link-validation/view-report.js
# Then open http://localhost:8080 in your browser
```

## How It Works

1. **Sitemap Mode** (Recommended):
   - Reads the `sitemap.xml` from the built site
   - Visits EVERY page listed in the sitemap
   - Extracts ALL links from each page
   - Validates links against the sitemap
   - Finds hundreds of links vs just homepage

2. **Static Mode** (Quick):
   - Loads homepage or specified pages
   - Checks navigation and footer links only
   - Fast but limited coverage

3. **Comprehensive Mode**:
   - Combines sitemap and deep crawling
   - Most thorough but slower

## Portal Handling
Portal works like any other site - no special handling needed:
- Broken links appear as build warnings
- Sitemap is generated during build
- All links can be validated normally

## Troubleshooting

### No Sitemap Found
```bash
# Build the site first
pnpm build:isbdm
# or
pnpm build:all
```

### Connection Refused
```bash
# Start dev servers
pnpm start:all
# or specific site
pnpm start:isbdm
```

### Timeout Issues
```bash
# Increase timeout
node scripts/validate-environment-urls.js --timeout 30000
```

## Integration with CI/CD
```yaml
- name: Validate All Production Links
  run: node scripts/validate-environment-urls.js --env production --site all --type sitemap

- name: Quick Preview Check
  run: node scripts/validate-environment-urls.js --env preview --site all --type static
```

## Performance Tips
- The script uses caching to skip unchanged pages
- First run will be slower as it builds the cache
- Subsequent runs only check changed pages
- Use `--type static` for quick checks
- Use `--type sitemap` for comprehensive validation

## Migration Note
The previous `validate-docusaurus-links.js` script has been deprecated in favor of `validate-environment-urls.js` which:
- Finds ALL links via sitemap (not just homepage)
- Supports multiple environments
- Has better caching and performance
- Provides more comprehensive validation