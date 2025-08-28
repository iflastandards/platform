# AI-Powered Test Tagging System V2

## Overview

Our enhanced test tagging system uses AI to automatically analyze and tag test files with appropriate categories and functional areas. The system supports batch processing, AI provider fallback, and review tracking to prevent re-evaluation.

## Features

### 1. AI Provider Fallback
- **Primary**: Gemini (free tier) for initial analysis
- **Fallback**: Anthropic Opus when Gemini confidence is low (<0.8)
- **Local**: Pattern matching when no API keys available

### 2. Review Tracking
Tests are marked with review comments to prevent re-evaluation:
```javascript
// @ai-reviewed by:gemini on:2024-01-15 tags:[@unit,@ui,@validation]
```

### 3. Batch Evaluation
Process all test files in the codebase:
```bash
# Evaluate all tests (skip already reviewed)
pnpm test:tag:batch

# Force re-evaluation of all tests
pnpm test:tag:batch:all

# Dry run to see what would change
pnpm test:tag:batch:dry
```

### 4. Pre-commit Integration
Automatically tag staged test files before commit:
```bash
# Run on staged files only
pnpm test:tag:staged:v2

# Use specific provider
pnpm test:tag:staged:gemini
pnpm test:tag:staged:anthropic
```

## Configuration

### Environment Variables

```bash
# Primary AI provider (Gemini)
export GEMINI_API_KEY="your-gemini-api-key"
# OR
export GOOGLE_API_KEY="your-google-api-key"

# Fallback provider (Anthropic)
export ANTHROPIC_API_KEY="your-anthropic-api-key"

# Optional: OpenAI as secondary fallback
export OPENAI_API_KEY="your-openai-api-key"
```

### Package.json Scripts

```json
{
  "scripts": {
    // Batch evaluation
    "test:tag:batch": "tsx scripts/auto-tag-tests-v2.ts --batch",
    "test:tag:batch:all": "tsx scripts/auto-tag-tests-v2.ts --batch --force-review",
    "test:tag:batch:dry": "tsx scripts/auto-tag-tests-v2.ts --batch --dry-run",
    
    // Staged files
    "test:tag:staged:v2": "tsx scripts/auto-tag-tests-v2.ts --staged",
    "test:tag:staged:gemini": "tsx scripts/auto-tag-tests-v2.ts --staged --provider gemini",
    "test:tag:staged:anthropic": "tsx scripts/auto-tag-tests-v2.ts --staged --provider anthropic",
    
    // Validation
    "test:validate-tags": "node scripts/validate-test-tag-rules.js"
  }
}
```

## Tag Categories

### Primary Test Types (Choose One)
- `@unit` - Pure unit tests with mocks
- `@integration` - Service integration tests (may use MSW)
- `@e2e` - End-to-end browser tests
- `@smoke` - Critical path validation

### Environment Modifiers
- `@server-dependent` - Requires local servers
- `@local-only` - Can only run locally
- `@post-deploy` - Runs after deployment
- `@preview-safe` - Safe for preview environments

### Functional Areas (Multiple)
- `@auth` - Authentication/authorization
- `@api` - API endpoints
- `@ui` - UI components
- `@validation` - Data validation
- `@security` - Security features
- `@cache` - Caching logic
- `@rbac` - Role-based access

## Validation Rules

The system enforces these rules automatically:

1. **Unit tests CANNOT be server-dependent**
   - ❌ `@unit @server-dependent`
   - ✅ `@unit @ui @validation`

2. **Smoke tests MUST be post-deploy**
   - ❌ `@smoke @local-only`
   - ✅ `@smoke @post-deploy @critical`

3. **Server-dependent tests MUST be local-only**
   - ❌ `@integration @server-dependent` (missing @local-only)
   - ✅ `@integration @server-dependent @local-only`

4. **E2E tests MUST specify environment**
   - ❌ `@e2e` (no environment)
   - ✅ `@e2e @server-dependent @local-only`
   - ✅ `@e2e @post-deploy`

## Usage Examples

### 1. Initial Batch Tagging
Tag all test files in your codebase:
```bash
# Dry run first to see changes
pnpm test:tag:batch:dry

# Apply tags (skips already reviewed)
pnpm test:tag:batch

# Validate all tags are correct
pnpm test:validate-tags
```

### 2. Pre-commit Workflow
Automatically tag staged test files:
```bash
# Add pre-commit hook
cp .husky/pre-commit-ai-tags .husky/pre-commit

# Now staging test files will auto-tag
git add some-test.spec.ts
git commit -m "feat: add new test"
# AI tagging runs automatically
```

### 3. Force Re-evaluation
Re-evaluate specific files:
```bash
# Force re-evaluate all tests
pnpm test:tag:batch:all

# Re-evaluate specific pattern
tsx scripts/auto-tag-tests-v2.ts --batch --pattern "**/*integration*.test.ts" --force-review
```

### 4. CI Integration
```yaml
# .github/workflows/test.yml
- name: Validate Test Tags
  run: |
    pnpm test:validate-tags
    
- name: Check Untagged Tests
  run: |
    pnpm test:tag:batch --dry-run
    if [ $? -ne 0 ]; then
      echo "Found untagged tests. Run 'pnpm test:tag:batch' locally."
      exit 1
    fi
```

## Review Comment Format

Tests are marked with a review comment to track AI evaluation:
```javascript
/**
 * @unit @ui @validation
 * // @ai-reviewed by:gemini on:2024-01-15 tags:[@unit,@ui,@validation]
 */
describe('Component Test', () => {
  // ...
});
```

This comment:
- Prevents re-evaluation (unless forced)
- Shows which AI made the decision
- Records the date of evaluation
- Lists the tags that were applied

## Confidence Levels

The AI provides confidence scores:
- **0.95-1.0**: Very confident, tags applied
- **0.8-0.94**: Confident, tags applied
- **0.6-0.79**: Low confidence, triggers fallback
- **<0.6**: Very low confidence, uses local patterns

## Troubleshooting

### No API Keys
```bash
⚠️  No AI API keys found. Using local pattern matching only.
```
**Solution**: Set GEMINI_API_KEY or ANTHROPIC_API_KEY environment variables.

### Low Confidence Tags
```bash
⚠️  Low confidence (0.65) from Gemini, trying Anthropic...
```
**Solution**: This is normal. The fallback provider will provide better analysis.

### Already Reviewed Files
```bash
ℹ️  Skipped test.spec.ts (already reviewed by gemini on 2024-01-15)
```
**Solution**: Use `--force-review` to re-evaluate.

### Invalid Tag Combinations
```bash
❌ Invalid combination: @unit + @server-dependent
   Reason: Unit tests must never require servers
```
**Solution**: Fix the invalid combination according to validation rules.

## Best Practices

1. **Run batch tagging initially** to tag all existing tests
2. **Use pre-commit hook** to tag new tests automatically
3. **Validate regularly** to catch invalid combinations
4. **Review AI suggestions** periodically for accuracy
5. **Force re-evaluation** when testing strategy changes
6. **Use dry-run** before applying batch changes

## Performance

- **Batch Size**: Processes 10 files at a time by default
- **API Rate Limits**: Respects provider rate limits
- **Caching**: Skips already reviewed files
- **Parallel**: Can process batches in parallel

## Cost Considerations

- **Gemini**: Free tier (60 requests/minute)
- **Anthropic**: Paid (Opus model ~$15/million tokens)
- **OpenAI**: Paid (GPT-4 ~$30/million tokens)

Most projects can stay within free tier limits by:
1. Using Gemini as primary provider
2. Skipping already reviewed files
3. Processing in batches during off-hours

## Future Enhancements

- [ ] Support for custom tag rules
- [ ] Integration with VS Code extension
- [ ] Real-time tagging as you type
- [ ] Team-wide tag consistency checking
- [ ] Historical tag evolution tracking
- [ ] Custom AI prompts per project