# Deployment Validation

## Overview

After deploying documentation sites to GitHub Pages or production, we run validation checks to ensure:

1. **Sites are accessible**: Smoke tests verify that deployed sites load correctly
2. **Navigation works**: For sites with `onBrokenLinks: 'ignore'` (like ISBDM), check navigation links

## Purpose

These checks verify that deployed sites are functioning correctly in their live environment. They are NOT run during build time - they only run against sites that are already deployed and accessible via HTTP(S).

## Deployment Environments

### Preview (GitHub Pages)
- **Base URL**: `https://iflastandards.github.io/platform`
- **Sites**: `/portal`, `/ISBDM`, `/LRM`, etc.
- **When**: After push to `preview` branch

### Production
- **Base URL**: `https://www.iflastandards.info`
- **Sites**: `/`, `/ISBDM`, `/LRM`, etc.
- **When**: After PR from `preview` to `main`

## What Gets Checked

### Smoke Tests (All Sites)
- **HTTP Status**: Verifies site returns 200 OK
- **Page Loading**: Confirms page loads within 30 seconds
- **Critical Elements**: Checks for navbar, main content, title
- **JavaScript Errors**: Monitors for critical JS errors
- **Docusaurus Detection**: Verifies Docusaurus framework is working

### Broken Link Checks (ISBDM Only)
- **Navigation Links**: Checks links in navbar, footer, and menus
- **Internal Only**: Only validates links within the same domain
- **Why ISBDM**: Because it has `onBrokenLinks: 'ignore'` in config

## Usage

### Check Preview Deployment
```bash
pnpm check:deployed:preview
```

### Check Production Deployment
```bash
pnpm check:deployed:production
```

### Check Custom Environment
```bash
pnpm check:deployed  # defaults to preview
```

## Output

### Console Output
```
🌐 Checking deployed sites on preview (https://iflastandards.github.io/platform)

🔥 Running smoke tests...

Testing portal...
  ✅ Passed (1523ms) - "IFLA Standards Portal"
Testing isbdm...
  ✅ Passed (1245ms) - "ISBD for Manifestations"
Testing lrm...
  ❌ Failed: HTTP 404 error

🔗 Checking broken links...

Checking isbdm...
  ❌ Found 2 broken links
     - "About" → /about
     - "Contact" → /contact

📊 Summary
==========
Smoke Tests: 2 passed, 1 failed
Broken Links: 2 found across 1 sites
```

### JSON Report
The script saves a detailed JSON report to `output/_reports/deployed-sites-check-{environment}.json`:

```json
{
  "environment": "preview",
  "baseUrl": "https://iflastandards.github.io/platform",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "smokeTests": [
    {
      "site": "portal",
      "url": "https://iflastandards.github.io/platform/portal",
      "success": true,
      "loadTime": 1523,
      "title": "IFLA Standards Portal",
      "pageInfo": {
        "hasNavbar": true,
        "hasContent": true,
        "hasFooter": true,
        "hasDocusaurusData": true
      }
    }
  ],
  "brokenLinks": [
    {
      "site": "isbdm",
      "url": "https://iflastandards.github.io/platform/ISBDM",
      "totalChecked": 15,
      "brokenLinks": [
        {
          "href": "/about",
          "text": "About",
          "status": 404,
          "absoluteUrl": "https://iflastandards.github.io/platform/ISBDM/about"
        }
      ]
    }
  ]
}
```

## CI Integration

In GitHub Actions workflows, run deployment validation after deployment completes:

```yaml
- name: Deploy to GitHub Pages
  # ... deployment steps ...

- name: Wait for deployment
  run: sleep 60  # Give GitHub Pages time to update

- name: Validate deployment
  run: pnpm check:deployed:preview
```

## When to Run

### Automatically
- **CI/CD**: After deployment in GitHub Actions
- **Monitoring**: Scheduled checks to ensure sites stay accessible

### Manually
- **Post-deployment**: Verify deployment succeeded
- **Troubleshooting**: Debug reported issues
- **Before announcements**: Ensure everything works before sharing links

## Differences from Build Warnings

### Build Time (warnings:collect)
- Runs during build process
- Checks for compilation warnings
- Uses local file system
- Fast, runs in parallel with builds

### Post-Deployment (check:deployed)
- Runs after deployment
- Checks live sites via HTTPS
- Uses real browser (Playwright)
- Slower, but tests actual user experience

## Technical Details

- **Browser**: Playwright with Chromium (headless)
- **Timeouts**: 30s for page load, 10s for link checks
- **User Agent**: Standard Chrome user agent
- **Parallelism**: Sequential to avoid overwhelming servers
- **Exit Codes**: 0 for success, 1 if any failures found