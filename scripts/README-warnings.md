# Build Warnings Collection Script

## Purpose
The `collect-warnings-parallel.js` script builds all Docusaurus sites in parallel and collects warnings for monitoring code quality.

## Usage
```bash
# Run the warnings collector
node scripts/collect-warnings-parallel.js

# Or through package.json script (if available)
pnpm collect:warnings
```

## Configuration

### Ignored Warnings
Some warnings are expected and should be ignored. These are configured in `scripts/warnings-ignore.json`.

#### Configuration File Format
```json
{
  "ignoredPatterns": [
    {
      "pattern": "regex pattern to match",
      "reason": "Why this warning is ignored",
      "addedDate": "YYYY-MM-DD"
    }
  ]
}
```

#### Currently Ignored Warnings
1. **fs.rmdir deprecation** - Node.js deprecation warning that will be fixed in future Node versions
2. **ExperimentalWarning** - Expected when using experimental Node.js features

### Adding New Ignored Warnings
1. Edit `scripts/warnings-ignore.json`
2. Add a new entry with:
   - `pattern`: Regular expression pattern (without delimiters)
   - `reason`: Clear explanation of why it's ignored
   - `addedDate`: Today's date in YYYY-MM-DD format

### Output
- **Markdown Report**: `output/_reports/build-warnings-summary.md`
- **JSON Data**: `output/_reports/build-warnings.json`
- **Console**: Shows real-time progress and summary

## Features
- Parallel builds with concurrency limits (3 in CI, 8 locally)
- Real-time warning detection
- Configurable warning filters
- Detailed reporting with timestamps
- GitHub Actions integration (outputs to GITHUB_STEP_SUMMARY)

## Exit Codes
- `0`: Success (with or without warnings)
- `1`: One or more builds failed

## Troubleshooting
- If the script reports "Could not load warnings-ignore.json", check that the file exists and has valid JSON
- The script includes fallback patterns if the config file can't be loaded
- Filtered warnings are counted and reported in the summary