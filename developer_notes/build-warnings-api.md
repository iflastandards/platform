# Build Warnings API Access

This document describes how to access build warning data via the GitHub API for creating dashboards and real-time notifications.

## Overview

Build warnings are collected during CI runs and stored as:
1. Workflow outputs (accessible via API)
2. Artifacts (downloadable via API)
3. Structured JSON summaries

## Data Structure

### Build Summary JSON
Each workflow run creates a structured summary with:
```json
{
  "run_id": "12345678",
  "run_number": "42",
  "sha": "abc123...",
  "ref": "refs/heads/preview",
  "timestamp": "2025-08-04T16:30:00Z",
  "warning_count": 18,
  "site_summary": [
    {
      "site": "portal",
      "warnings": 9,
      "success": true,
      "buildTime": "8.32s"
    },
    // ... other sites
  ],
  "detailed_warnings": [
    // Full warning details per site
  ]
}
```

## GitHub API Endpoints

### 1. List Workflow Runs
```bash
GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}/runs
```

Workflows:
- `simple-deploy.yml` - Production deployments
- `check-warnings.yml` - PR checks and daily runs

### 2. Get Workflow Run Details
```bash
GET /repos/{owner}/{repo}/actions/runs/{run_id}
```

### 3. List Artifacts for a Run
```bash
GET /repos/{owner}/{repo}/actions/runs/{run_id}/artifacts
```

Look for:
- `build-warnings-report` (simple-deploy.yml)
- `docusaurus-build-warnings` (check-warnings.yml)

### 4. Download Artifact
```bash
GET /repos/{owner}/{repo}/actions/artifacts/{artifact_id}/zip
```

Contains:
- `build-warnings.json` - Raw warning data
- `build-warnings-summary.md` - Markdown summary
- `build-summary.json` or `check-summary.json` - Structured summary

## Example: Fetch Latest Build Warnings

```javascript
const { Octokit } = require("@octokit/rest");
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

async function getLatestBuildWarnings() {
  // Get latest workflow run
  const { data: runs } = await octokit.rest.actions.listWorkflowRuns({
    owner: 'iflastandards',
    repo: 'standards-dev',
    workflow_id: 'simple-deploy.yml',
    per_page: 1
  });
  
  const latestRun = runs.workflow_runs[0];
  
  // Get artifacts
  const { data: artifacts } = await octokit.rest.actions.listWorkflowRunArtifacts({
    owner: 'iflastandards',
    repo: 'standards-dev',
    run_id: latestRun.id
  });
  
  const warningArtifact = artifacts.artifacts.find(
    a => a.name === 'build-warnings-report'
  );
  
  if (warningArtifact) {
    // Download and extract artifact
    const { data: zip } = await octokit.rest.actions.downloadArtifact({
      owner: 'iflastandards',
      repo: 'standards-dev',
      artifact_id: warningArtifact.id,
      archive_format: 'zip'
    });
    
    // Process zip file to extract JSON...
    // Return structured data
  }
}
```

## Webhook Events

For real-time notifications, listen to these webhook events:
- `workflow_run` - Triggered when workflow completes
- `check_run` - Triggered for PR checks

## Dashboard Integration

The structured data can be used to:
1. Display warning trends over time
2. Show per-site warning counts
3. Alert on warning threshold breaches
4. Track build performance metrics
5. Generate site-specific reports

## Rate Limits

- Authenticated requests: 5,000 per hour
- Artifact downloads: Count against rate limit
- Consider caching data for dashboard

## Future Enhancements

- Store historical data in a database
- Create GraphQL API for efficient queries
- Add warning categorization and severity levels
- Implement warning suppression rules