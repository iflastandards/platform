# Post-Build Broken Link Checking

## Overview

Some Docusaurus sites (like ISBDM) have `onBrokenLinks: 'ignore'` in their configuration because they generate links during the build process that would otherwise be reported as broken. To ensure these sites still have their links validated, we run a post-build broken link check.

## How It Works

1. **During Build**: Sites with `onBrokenLinks: 'ignore'` don't fail on broken links
2. **After Build**: The warning collector runs a Playwright-based link checker
3. **Navigation Focus**: Checks critical navigation links (navbar, footer, menus)
4. **Smart Detection**: Only runs for sites that need it (currently ISBDM)

## Configuration

### Sites with Post-Build Checking

Currently, only ISBDM has `onBrokenLinks: 'ignore'` and requires post-build checking. To add a new site:

1. Add the site key to `SITES_WITH_IGNORED_LINKS` in `scripts/check-broken-links-simple.js`
2. Add any site-specific ignore patterns to `SITE_IGNORE_PATTERNS`

### Ignore Patterns

Each site can have patterns for links to ignore:
- External links (`https://`)
- Mailto links (`mailto:`)
- Hash links (`#section`)
- Any custom patterns

## Usage

### Automatic (with warning collection)
```bash
pnpm warnings:collect
```
This runs the full build and warning collection, including post-build link checks.

### Manual (single site)
```bash
pnpm check:broken-links isbdm
```

### Manual (with options)
```bash
node scripts/check-broken-links-simple.js isbdm --critical-only --max-links=50
```

## Integration with Warning System

Broken links found during post-build checking are:
- Added to the warning report with type `broken_link`
- Counted separately in the summary
- Displayed in a dedicated section in the report

### Report Structure
```
# Build Warnings Summary

- Total warnings: 20
  - Build warnings: 18
  - Broken links: 2

## All Warnings

### ISBDM

#### Build Warnings
1. [Build warning text]

#### Broken Links (Post-Build Check)
1. Broken link: "About" -> /about
2. Broken link: "Contact" -> /contact
```

## Technical Details

- Uses Playwright for browser automation
- Loads built sites using `file://` protocol
- Checks file existence for internal links
- Handles Docusaurus URL structure (with site prefixes)
- Runs in parallel with build process

## Future Enhancements

1. Add content link checking (not just navigation)
2. Support for checking specific pages
3. Visual regression testing for broken layouts
4. Integration with PR comments for link changes