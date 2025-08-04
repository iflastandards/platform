# Docusaurus Build Warning Collection System

This system collects and reports warnings from Docusaurus site builds during CI/CD, helping maintain code quality and catch issues early.

## Overview

The warning collection system consists of:

1. **Parallel Build Scanner** - Builds sites in parallel and captures warnings
2. **Full Analysis Collector** - Detailed warning analysis with categorization
3. **Formatter** - Converts warnings into actionable reports
4. **CI Integration** - Automatic collection during deployments

## Quick Start

### Collect Warnings Locally

```bash
# Quick parallel collection (recommended)
pnpm warnings:collect

# Full detailed analysis
pnpm warnings:collect:full

# Format results
pnpm warnings:format:actionable
```

### View Results

Reports are saved to `output/_reports/` directory:
- `build-warnings-summary.md` - Quick overview
- `build-warnings.json` - Raw data for processing
- `build-warnings-{timestamp}.md` - Detailed report

## CI/CD Integration

### Deployment Workflow

The warning collection is integrated into `.github/workflows/simple-deploy.yml`:

1. Builds all sites and collects warnings
2. Uploads warnings as artifacts
3. Posts summary to GitHub Actions summary
4. Continues with deployment even if warnings exist

### Pull Request Checks

A dedicated workflow `.github/workflows/check-warnings.yml` runs on:
- Pull requests (opened/synchronized)
- Daily schedule (2 AM UTC)
- Manual trigger

Features:
- Comments on PRs with warning summary
- Creates issues for daily check failures
- Uploads full reports as artifacts

## Warning Types

The system detects various warning patterns:

### 1. Broken Links
- Missing internal references
- 404 errors
- Unresolved paths

### 2. Deprecation Warnings
- Deprecated APIs
- Obsolete components
- Legacy patterns

### 3. React/Component Warnings
- Invalid props
- Missing keys
- Component errors

### 4. Accessibility Issues
- Missing alt text
- ARIA violations
- Heading hierarchy

### 5. Missing Assets
- Images not found
- CSS/JS files missing
- Data files unavailable

## Report Formats

### Actionable Report
Groups warnings by priority and provides fix suggestions:

```bash
pnpm warnings:format:actionable
```

### CSV Export
For spreadsheet analysis:

```bash
pnpm warnings:format:csv
```

### Team-Specific Reports
Filter warnings by team responsibility:

```bash
# Frontend team warnings (React, components, UI)
pnpm warnings:format:frontend

# Content team warnings (broken links, missing files)
pnpm warnings:format:content

# Infrastructure team warnings (build, dependencies)
pnpm warnings:format:infrastructure
```

## Configuration

### Sites Monitored
Configure in `scripts/collect-build-warnings.js`:

```javascript
const SITES = ['portal', 'isbdm', 'lrm', 'frbr', 'isbd', 'muldicat', 'unimarc'];
```

### Warning Patterns
Add new patterns to detect:

```javascript
const WARNING_PATTERNS = [
  /\[WARNING\]/i,
  /your-pattern-here/i,
  // ...
];
```

### Parallel Build Limit
Adjust concurrency in `scripts/collect-warnings-parallel.js`:

```javascript
const MAX_PARALLEL = 3; // Increase for faster builds
```

## Troubleshooting

### No Warnings Detected
- Check if builds are actually producing warnings
- Verify warning patterns match your output
- Run with `--verbose` flag for debugging

### Build Failures
- Warnings are still collected from failed builds
- Check error output in reports
- Failed builds are marked in the summary

### Memory Issues
- Reduce `MAX_PARALLEL` for resource-constrained environments
- Use `warnings:collect:full` with sequential builds

## Best Practices

1. **Regular Monitoring**
   - Check daily reports from scheduled runs
   - Address critical warnings immediately
   - Track warning trends over time

2. **Team Assignment**
   - Use team-specific reports for targeted fixes
   - Assign ownership based on warning type
   - Set warning reduction goals

3. **CI Integration**
   - Don't block deployments on warnings
   - Use PR comments for visibility
   - Create issues for persistent problems

4. **Continuous Improvement**
   - Add new warning patterns as discovered
   - Refine categorization rules
   - Update team assignments

## Examples

### Example GitHub Actions Summary

```markdown
## 📊 Build Warnings Summary

Found **23** warnings across 7 sites.

### Sites Overview
| Site | Warnings | Status |
|------|----------|--------|
| portal | ⚠️ 5 | ✅ Success |
| isbd | ⚠️ 12 | ✅ Success |
| isbdm | ✅ 0 | ✅ Success |

### 🚨 Critical Warnings (2)
- **portal**: Broken link to "/docs/missing-page"
- **isbd**: React error: Invalid prop type

📄 See artifact for full report.
```

### Example Actionable Report

```markdown
# Actionable Warning Report

## 🎯 Priority Issues

### Broken Links (3)
These need immediate attention:
- [ ] **portal**: Fix broken link to `/elements/P1234`
- [ ] **isbd**: Fix broken link to `/vocabularies/missing`
- [ ] **lrm**: Fix broken link to `../invalid-path`

## 📊 Common Patterns
Most frequent warning patterns:
- **5x**: `[WARNING] Broken link to "[FILE]"`
- **3x**: `React does not recognize the '[PROP]' prop`

## ✅ Recommended Actions
1. Fix broken links: Update or remove broken references
2. Update deprecated code: Replace deprecated APIs
3. Add missing files: Create missing assets or update references
```

## Future Enhancements

Planned improvements:
- Historical tracking and trends
- Slack/Discord notifications
- Warning suppression rules
- Auto-fix for common issues
- Integration with error tracking services