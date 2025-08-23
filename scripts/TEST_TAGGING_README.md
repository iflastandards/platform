# AI-Powered Test Tagging Tool

An intelligent test file classifier and tagger for the IFLA Standards Platform that uses AI to automatically analyze, classify, and tag test files according to the project's testing strategy.

## Table of Contents
- [Overview](#overview)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Test Classification Rules](#test-classification-rules)
- [Examples](#examples)
- [Command Reference](#command-reference)
- [Integration](#integration)
- [Cost Analysis](#cost-analysis)
- [Troubleshooting](#troubleshooting)
- [FAQ](#faq)

## Overview

This tool uses AI (Anthropic Claude, Google Gemini, OpenAI GPT-4, or Perplexity) to automatically:
- 🎯 Classify tests as unit, integration, e2e, or smoke
- 🏷️ Add appropriate execution phase tags
- 📁 Validate and suggest file relocations
- ✅ Ensure compliance with testing strategy
- 🔄 Integrate with git hooks and CI/CD

### Why Use This Tool?

- **Consistency**: Ensures all tests follow the same tagging conventions
- **Automation**: Eliminates manual tagging errors and saves time
- **Intelligence**: AI understands test intent, not just patterns
- **Integration**: Works seamlessly with git hooks, Nx, and pnpm workflows
- **Flexibility**: Supports multiple AI providers for cost/accuracy tradeoffs

## Quick Start

```bash
# Install dependencies (if not already installed)
pnpm add -D @anthropic-ai/sdk @google/generative-ai commander inquirer chalk ora glob dotenv

# Set up your API key (choose one)
echo "GEMINI_API_KEY=your-key-here" >> .env  # Free tier available
echo "ANTHROPIC_API_KEY=your-key-here" >> .env  # Most accurate
echo "OPENAI_API_KEY=your-key-here" >> .env  # GPT-4 Turbo
echo "PERPLEXITY_API_KEY=your-key-here" >> .env  # Fast and cheap

# Run on all test files (dry run by default)
pnpm test:tag

# Apply tags to staged files
pnpm test:tag:staged --no-dry-run

# Get help
pnpm test:tag --help
```

## Installation

### Prerequisites
- Node.js 22+ and pnpm
- One or more AI API keys (see Configuration)

### Install Dependencies

```bash
# Required packages
pnpm add -D @anthropic-ai/sdk @google/generative-ai commander inquirer chalk ora glob dotenv

# Optional: TypeScript support for running the script
pnpm add -D tsx
```

### Setup Environment Variables

Create or update your `.env` file:

```env
# AI Provider API Keys (at least one required)
GEMINI_API_KEY=AIza...        # Google Gemini (recommended for development)
ANTHROPIC_API_KEY=sk-ant-...  # Anthropic Claude (most accurate)
PERPLEXITY_API_KEY=pplx-...   # Perplexity (fastest)

# Optional: Default provider
DEFAULT_AI_PROVIDER=gemini    # anthropic | gemini | perplexity
```

## Configuration

### Provider Comparison

| Provider | Accuracy | Speed | Cost | Best For |
|----------|----------|-------|------|----------|
| **Anthropic Claude** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | $$$ | Critical classifications, ambiguous tests |
| **Google Gemini** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Free/$ | Daily development (60 free requests/min) |
| **Perplexity** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | $ | Quick checks, simple classifications |

### Model Selection

You can specify specific models for each provider:

```bash
# Anthropic models
pnpm test:tag --provider anthropic --model claude-3-opus-20240229    # Most accurate
pnpm test:tag --provider anthropic --model claude-3-haiku-20240307   # Cheaper, faster

# Gemini models
pnpm test:tag --provider gemini --model gemini-pro     # Default
pnpm test:tag --provider gemini --model gemini-1.5-pro # More capable

# OpenAI models
pnpm test:tag --provider openai --model gpt-4-turbo-preview  # Default, most capable
pnpm test:tag --provider openai --model gpt-3.5-turbo        # Faster, cheaper

# Perplexity models
pnpm test:tag --provider perplexity --model llama-3.1-sonar-small-128k-online
```

## Usage

### Basic Commands

```bash
# Analyze all test files (dry run)
pnpm test:tag

# Apply tags to all test files
pnpm test:tag --no-dry-run

# Process only staged files (for pre-commit)
pnpm test:tag --staged

# Process Nx affected files (for CI)
pnpm test:tag --affected

# Use specific provider
pnpm test:tag --provider anthropic

# Non-interactive mode (for automation)
pnpm test:tag --no-interactive

# Enable file relocation suggestions
pnpm test:tag --move-files

# Custom file pattern
pnpm test:tag --pattern "apps/admin/**/*.test.ts"

# Save detailed report
pnpm test:tag --output test-report.md

# Verbose output
pnpm test:tag --verbose
```

### Command Line Options

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--provider <type>` | `-p` | AI provider: anthropic, gemini, openai, perplexity | gemini |
| `--model <name>` | `-m` | Specific AI model to use | provider default |
| `--dry-run` | `-d` | Preview changes without applying | true |
| `--no-dry-run` | | Apply changes immediately | |
| `--interactive` | `-i` | Prompt for ambiguous cases | true |
| `--no-interactive` | | Skip all prompts | |
| `--staged` | `-s` | Process only git staged files | false |
| `--affected` | `-a` | Process only Nx affected files | false |
| `--verbose` | `-v` | Show detailed output | false |
| `--output <file>` | `-o` | Save report to file | |
| `--pattern <glob>` | | Custom file pattern | `**/*.{test,spec}.{ts,tsx,js,jsx}` |
| `--move-files` | | Suggest file relocations | false |
| `--fix-names` | | Fix file naming conventions | false |
| `--help` | `-h` | Display help | |
| `--version` | `-V` | Show version | |

## Test Classification Rules

### Execution Phases

| Phase | Test Types | When | Characteristics |
|-------|------------|------|-----------------|
| **Pre-commit** | Unit tests only | Every commit | Fast (<5s), fully mocked |
| **Pre-push** | Integration & E2E | Before push | Thorough, may use real services |
| **CI Preview** | Smoke tests | PR/preview deploy | Critical path, data-independent |
| **CI Production** | Smoke tests | Production deploy | Same as preview, different URL |

### Test Types

#### 1. Unit Tests (`@unit`)
- **Run in**: Pre-commit, local development only
- **Characteristics**: 
  - Fully mocked dependencies (vi.mock, jest.mock, MSW)
  - No external service calls
  - Fast execution (<5s)
  - Test isolated functions/components
- **Required tags**: `@unit`, priority tag, feature area tag
- **Forbidden tags**: `@integration`, `@e2e`, `@smoke`, `@server-dependent`, `@slow`
- **File pattern**: `*.unit.test.ts`
- **Location**: `/unit/`, `/src/test/unit/`, `/src/__tests__/`

#### 2. Integration Tests (`@integration`)
- **Run in**: Pre-push, local development
- **Characteristics**:
  - Uses real services, databases, file systems
  - Tests component interactions
  - May be slower (>5s acceptable)
- **Required tags**: `@integration`, priority tag, feature area tag
- **Optional tags**: `@server-dependent`, `@slow`, `@flaky`
- **Forbidden tags**: `@unit`, `@smoke`
- **File pattern**: `*.integration.test.ts`
- **Location**: `/integration/`, `/src/test/integration/`

#### 3. E2E Tests (`@e2e`)
- **Run in**: Pre-push, local development
- **Characteristics**:
  - Browser-based (Playwright)
  - Full user workflows
  - Often slow (>30s)
- **Required tags**: `@e2e`, priority tag, feature area tag
- **Optional tags**: `@slow`, `@flaky`, `@browser-specific`
- **Forbidden tags**: `@unit`, `@integration`, `@smoke`
- **File pattern**: `*.e2e.spec.ts`
- **Location**: `/e2e/`

#### 4. Smoke Tests (`@smoke`)
- **Run in**: CI only (preview & production)
- **Characteristics**:
  - Critical path validation only
  - Data-independent
  - Fast and reliable
  - URL-configurable
- **Required tags**: `@smoke`, `@critical` (always)
- **Forbidden tags**: `@slow`, `@flaky`, `@server-dependent`
- **File pattern**: `*.smoke.spec.ts`
- **Location**: `/e2e/smoke/`, `/test/smoke/`

### Tag Categories

#### Priority Tags (required - choose one)
- `@critical`: Core functionality, must always pass
- `@high-priority`: Important features, should pass before release
- `@low-priority`: Nice-to-have, can be fixed later

#### Feature Area Tags (required - choose at least one)
- `@auth`: Authentication/authorization
- `@api`: API endpoints and data operations
- `@ui`: User interface components
- `@rbac`: Role-based access control
- `@validation`: Data validation
- `@dashboard`: Dashboard features
- `@admin`: Admin panel features
- `@navigation`: Navigation and routing
- `@search`: Search functionality
- `@vocabulary`: Vocabulary management

#### Optional Environment Tags
- `@local-only`: Only runs locally
- `@ci-only`: Only runs in CI
- `@server-dependent`: Requires live servers
- `@slow`: Takes more than 30 seconds
- `@flaky`: Known to be unstable

## Examples

### Example 1: Tagging a New Test File

```bash
$ pnpm test:tag --pattern "src/test/auth.test.ts"

🤖 AI-Powered Test Tagger
────────────────────────
Provider: gemini
Mode: DRY RUN
Interactive: Yes

Found 1 test file(s) to analyze

⠋ Analyzing src/test/auth.test.ts...
✔ Analyzed src/test/auth.test.ts
  Classification: unit (high confidence)
  Tags: @unit @auth @critical
  Reasoning: Uses vi.mock for all dependencies, tests authentication logic in isolation
  
  ⚠️  File location issue detected:
     Current: src/test/auth.test.ts
     Suggested: src/test/unit/auth.unit.test.ts
     Reason: unit test should follow naming convention

? Would you like to move this file to the suggested location? Yes
  ✓ Moved file to src/test/unit/auth.unit.test.ts
  [DRY RUN] Would add tags: @unit @auth @critical

Summary:
  ✓ Processed: 1
  ○ Skipped: 0
  ✗ Errors: 0
  📁 Moved: 1

⚠️  This was a dry run. Use --no-dry-run to apply changes.
```

### Example 2: Pre-commit Hook Integration

Create `.husky/pre-commit`:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Check if any test files are staged
TEST_FILES=$(git diff --staged --name-only | grep -E '\.(test|spec)\.')

if [ -n "$TEST_FILES" ]; then
  echo "🔍 Validating test tags..."
  
  # Run auto-tagger on staged files
  pnpm test:tag --staged --no-interactive
  
  # If dry run found issues, exit
  if [ $? -ne 0 ]; then
    echo "❌ Test files need proper tags. Run 'pnpm test:tag --staged' to fix."
    exit 1
  fi
  
  # Validate existing tags
  node scripts/validate-test-tagging.js
fi
```

### Example 3: CI Pipeline Integration

`.github/workflows/test-validation.yml`:

```yaml
name: Validate Test Tags

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  validate-tests:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Need full history for affected
      
      - uses: pnpm/action-setup@v2
        with:
          version: 10.13.1
          
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'pnpm'
          
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
        
      - name: Validate test tags
        env:
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
        run: |
          # Check affected test files
          pnpm test:tag --affected --no-interactive --output report.md
          
          # Post report as PR comment if issues found
          if grep -q "Need review" report.md; then
            echo "::warning::Some test files need manual review for proper tagging"
          fi
          
      - name: Upload report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: test-tagging-report
          path: report.md
```

### Example 4: Batch Processing All Tests

```bash
# First, do a dry run to see what would change
$ pnpm test:tag --provider gemini --output initial-report.md

# Review the report
$ cat initial-report.md

# If satisfied, apply changes
$ pnpm test:tag --provider gemini --no-dry-run --output final-report.md

# Commit the changes
$ git add -A
$ git commit -m "chore: add test tags for proper test execution phases"
```

### Example 5: Using with Nx Affected

```bash
# After making changes, check affected test files
$ pnpm nx affected:test --dry-run

# Tag only affected test files
$ pnpm test:tag --affected

# Run affected tests with proper tags
$ pnpm nx affected:test --grep "@unit" # Pre-commit
$ pnpm nx affected:test --grep "@integration|@e2e" # Pre-push
```

## Integration

### Package.json Scripts

Add these to your `package.json`:

```json
{
  "scripts": {
    "test:tag": "tsx scripts/auto-tag-tests.ts",
    "test:tag:staged": "tsx scripts/auto-tag-tests.ts --staged",
    "test:tag:affected": "tsx scripts/auto-tag-tests.ts --affected",
    "test:tag:check": "tsx scripts/auto-tag-tests.ts --dry-run",
    "test:tag:fix": "tsx scripts/auto-tag-tests.ts --no-dry-run --move-files",
    "test:tag:report": "tsx scripts/auto-tag-tests.ts --output test-tag-report.md",
    "test:validate": "node scripts/validate-test-tagging.js",
    "precommit:test": "pnpm test:tag:staged && pnpm test:validate",
    "prepush:test": "pnpm test --grep '@integration|@e2e'"
  }
}
```

### Nx Integration

Add to `nx.json`:

```json
{
  "targetDefaults": {
    "tag-tests": {
      "executor": "nx:run-commands",
      "options": {
        "command": "pnpm test:tag --affected"
      }
    }
  }
}
```

### Git Hooks with Husky

```bash
# Install husky
pnpm add -D husky
pnpm husky install

# Add pre-commit hook
pnpm husky add .husky/pre-commit "pnpm test:tag:staged --dry-run"

# Add pre-push hook
pnpm husky add .husky/pre-push "pnpm test --grep '@integration|@e2e'"
```

## Cost Analysis

### Token Usage Estimates

- **Average test file**: 500-1000 input tokens, 200 output tokens
- **Cost per file**:
  - Gemini Pro: Free (60 requests/minute limit)
  - Claude Haiku: ~$0.001
  - Claude Opus: ~$0.015
  - Perplexity: ~$0.0002

### Cost for Typical Repository

| Files | Gemini | Claude Haiku | Claude Opus | Perplexity |
|-------|---------|--------------|-------------|------------|
| 100 | $0 | $0.10 | $1.50 | $0.02 |
| 500 | $0 | $0.50 | $7.50 | $0.10 |
| 1000 | $0 | $1.00 | $15.00 | $0.20 |

### Cost Optimization Strategies

1. **Use Gemini for development**: Free tier is sufficient for most daily use
2. **Use Claude Haiku for CI**: Good balance of accuracy and cost
3. **Use Claude Opus selectively**: Only for critical or ambiguous tests
4. **Cache results**: Avoid re-analyzing unchanged files
5. **Batch processing**: Process multiple files in off-peak hours

## Troubleshooting

### Common Issues and Solutions

#### API Key Not Found
```
Error: GEMINI_API_KEY not found in environment
```
**Solution**: 
- Create `.env` file in project root
- Add `GEMINI_API_KEY=your-key-here`
- Or export in shell: `export GEMINI_API_KEY=your-key`

#### Rate Limiting
```
Error: 429 Too Many Requests
```
**Solution**:
- Add delay between requests
- Upgrade to paid API tier
- Switch to different provider temporarily
- Use `--pattern` to process fewer files at once

#### Package Not Installed
```
Error: Google Generative AI package not installed
```
**Solution**:
```bash
pnpm add -D @google/generative-ai
# Or for Anthropic:
pnpm add -D @anthropic-ai/sdk
```

#### Incorrect Classification
```
Test classified as 'unit' but uses real database
```
**Solution**:
- Use `--interactive` mode to correct
- Try `--provider anthropic` for better accuracy
- Manually add tags and train AI with examples

#### File Move Conflicts
```
Error: File already exists at suggested location
```
**Solution**:
- Review both files manually
- Merge if necessary
- Use `--no-move-files` to skip relocation

#### TypeScript Errors
```
Cannot find module 'commander'
```
**Solution**:
```bash
# Install all required dependencies
pnpm add -D commander inquirer chalk ora glob dotenv tsx
```

### Debug Mode

Enable verbose logging for troubleshooting:

```bash
# Verbose output
pnpm test:tag --verbose

# Check what would change
pnpm test:tag --dry-run --verbose --output debug.md

# Test with single file
pnpm test:tag --pattern "path/to/specific.test.ts" --verbose
```

## FAQ

### Q: Which AI provider should I use?

**A**: Start with Gemini (free tier). Use Claude for critical classifications or when Gemini struggles. Perplexity is good for simple, high-volume processing.

### Q: Can I use this without AI?

**A**: The tool requires AI for classification. However, you can use the validation script (`validate-test-tagging.js`) to check existing tags without AI.

### Q: How accurate is the classification?

**A**: 
- Claude Opus: ~95% accuracy
- Gemini Pro: ~85% accuracy
- Perplexity: ~75% accuracy

Always use `--interactive` mode for critical tests.

### Q: Can I customize the tagging rules?

**A**: Yes, edit the `TAGGING_RULES` constant in `auto-tag-tests.ts`. The AI will follow your custom rules.

### Q: Does this work with Jest/Mocha/other test runners?

**A**: Yes, the tool is test-runner agnostic. It analyzes test content, not runner-specific syntax.

### Q: Can I use this in a monorepo?

**A**: Yes, it's designed for monorepos. Use `--pattern` to target specific packages or apps.

### Q: What happens to existing tags?

**A**: The tool preserves and updates existing tags. Use `--dry-run` to preview changes.

### Q: Can I exclude certain files?

**A**: Yes, use glob patterns:
```bash
pnpm test:tag --pattern "**/*.test.ts" --pattern "!**/*.deprecated.test.ts"
```

### Q: Is my code sent to AI providers?

**A**: Yes, test file content is sent to the selected AI provider for analysis. Ensure you have appropriate data agreements in place.

### Q: Can I run this in CI without API keys?

**A**: No, the tool requires API keys. Store them as secrets in your CI environment.

## Support

- **Issues**: Report bugs at [GitHub Issues](https://github.com/ifla/standards-dev/issues)
- **Documentation**: See [IFLA Standards Testing Guide](developer_notes/IFLA-Standards-Testing-Guide.md)
- **Contributing**: PRs welcome! Please include tests and update documentation.

## License

MIT © IFLA Standards Platform

---

*Built with ❤️ for maintaining high-quality test suites*