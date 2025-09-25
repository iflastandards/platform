#!/usr/bin/env python3

import csv
import subprocess
import time
import sys
import json

def read_csv(filepath):
    """Read and parse the CSV file"""
    issues = []
    with open(filepath, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
            if row.get('Issue #') and row['Issue #'].strip():  # Skip empty rows
                issues.append({
                    'number': row['Issue #'],
                    'priority': row['Priority'],
                    'type': row['Type'],
                    'title': row['Title'],
                    'location': row['Page/Location'],
                    'description': row['Problem Description'],
                    'action': row['Fix/Action Required']
                })
    return issues

def get_priority_label(priority):
    """Convert priority to standardized GitHub label"""
    priority_map = {
        '1-Critical': 'priority:critical',
        '2-High': 'priority:high',
        '3-High': 'priority:high',
        '4-Medium': 'priority:medium',
        '5-Medium': 'priority:medium',
        '6-Medium': 'priority:medium',
        '7-Low': 'priority:low',
        # Note: 8-Enhancement, 9-Bug, 10-Documentation are types, not priorities
        # They'll be handled as type labels instead
    }
    return priority_map.get(priority, None)

def get_problem_type(issue_type):
    """Map issue type to documentation template problem types"""
    type_map = {
        'Bug': 'Formatting or display problems',
        'Content': 'Missing content or pages',
        'Enhancement': 'Other (please describe below)',
        'UI': 'Formatting or display problems',
        'Typo': 'Incorrect metadata or information',
        'Documentation': 'Missing content or pages'
    }

    # Special handling for link issues
    if 'link' in issue_type.lower():
        return 'Broken links or references'

    return type_map.get(issue_type, 'Other (please describe below)')

def create_issue_body(issue):
    """Create the issue body matching the documentation template structure"""

    # Build the Page URL (assuming ISBDM site)
    page_url = f"https://iflastandards.github.io/platform/ISBDM{issue['location']}" if issue['location'].startswith('/') else f"https://iflastandards.github.io/platform/ISBDM/{issue['location']}"

    problem_type = get_problem_type(issue['type'])

    body = f"""## Standard
**ISBDM** (IFLA Standard for Bibliographic Data in the Modern Information Environment)

## Page URL
{page_url}

## Type of Problem
{problem_type}

## Description
{issue['description']}

## Expected Behavior
{issue['action']}

## Additional Context
- **Priority**: {issue['priority']}
- **Issue Type**: {issue['type']}
- **Original Issue #**: {issue['number']}
- **Standard**: ISBDM

## Browser
Not applicable (bulk import from ISBDM documentation audit)

---
*This issue was automatically imported from the ISBDM documentation audit.*
"""
    return body

def create_github_issue(issue, dry_run=False):
    """Create a single GitHub issue using gh CLI"""
    # Use the template title format with ISBDM prefix
    title = f"[ISBDM Documentation] {issue['title']}"
    body = create_issue_body(issue)

    # Get labels - always include documentation and needs-triage from template
    labels = ['documentation', 'needs-triage']

    # Add priority label if it's a real priority
    priority_label = get_priority_label(issue['priority'])
    if priority_label:
        labels.append(priority_label)

    # Add type-specific labels
    # Handle both capitalized and lowercase versions
    type_label = issue['type'].lower()

    # Special handling for priorities that are actually types
    if issue['priority'] == '8-Enhancement':
        type_label = 'enhancement'
    elif issue['priority'] == '9-Bug':
        type_label = 'bug'
    elif issue['priority'] == '10-Documentation':
        type_label = 'documentation'

    # Add the type label
    if type_label in ['bug', 'enhancement', 'typo', 'documentation', 'content', 'ui', 'design', 'navigation', 'rdf']:
        labels.append(type_label)
    else:
        # Keep original capitalization for new types
        labels.append(issue['type'])

    # Add ISBDM standard label (using consistent format for filtering)
    labels.append('standard:isbdm')

    # Remove duplicates
    labels = list(set(labels))
    label_string = ','.join(labels)

    if dry_run:
        print(f"\n--- DRY RUN Issue #{issue['number']} ---")
        print(f"Title: {title}")
        print(f"Labels: {label_string}")
        print(f"Body:\n{body}")
        return True

    # Create the issue using gh CLI
    cmd = [
        'gh', 'issue', 'create',
        '--title', title,
        '--body', body,
        '--label', label_string,
        '--repo', 'iflastandards/platform'
    ]

    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        issue_url = result.stdout.strip()
        print(f"✅ Created issue #{issue['number']}: {issue_url}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to create issue #{issue['number']}: {e.stderr}")
        return False

def main():
    # Allow CSV file to be specified as argument
    csv_file = 'output/issues.csv'  # default

    # Parse command line arguments
    dry_run_mode = None
    for arg in sys.argv[1:]:
        if arg == '--dry-run':
            dry_run_mode = True
        elif arg == '--execute':
            dry_run_mode = False
        elif arg.endswith('.csv'):
            csv_file = arg

    if dry_run_mode is None:
        print("Usage: python3 bulk-create-issues.py [--dry-run | --execute] [csv_file]")
        print("  --dry-run  : Show what would be created without actually creating issues")
        print("  --execute  : Create the issues in GitHub")
        print("  csv_file   : Optional CSV file path (default: output/issues.csv)")
        print("\nExamples:")
        print("  python3 bulk-create-issues.py --dry-run")
        print("  python3 bulk-create-issues.py --execute output/issues2.csv")
        sys.exit(1)

    print(f"🎯 ISBDM Documentation Issues Bulk Creator")
    print(f"=" * 50)
    print(f"📋 Reading issues from {csv_file}...")
    issues = read_csv(csv_file)
    print(f"Found {len(issues)} ISBDM issues to create")

    print("\n📊 ISBDM issue breakdown by priority:")
    priority_counts = {}
    for issue in issues:
        priority = issue['priority'].split('-')[1] if '-' in issue['priority'] else issue['priority']
        priority_counts[priority] = priority_counts.get(priority, 0) + 1

    for priority, count in sorted(priority_counts.items()):
        print(f"  • {priority}: {count} issues")

    if dry_run_mode:
        print("\n🧪 DRY RUN MODE - No issues will be created")
        print("=" * 50)
        for i, issue in enumerate(issues, 1):
            print(f"\n[{i}/{len(issues)}] DRY RUN - Issue #{issue['number']}")
            create_github_issue(issue, dry_run=True)
        print("\n✅ Dry run complete. Use --execute to actually create the issues.")
        return

    # Create issues with rate limiting
    successful = 0
    failed = 0

    print(f"\n🚀 Creating {len(issues)} ISBDM issues in iflastandards/platform...")
    for i, issue in enumerate(issues, 1):
        print(f"\n[{i}/{len(issues)}] Creating ISBDM issue #{issue['number']}: {issue['title'][:50]}...")

        if create_github_issue(issue):
            successful += 1
        else:
            failed += 1

        # Rate limiting - wait 2 seconds between issues to avoid hitting API limits
        if i < len(issues):
            print("⏳ Waiting 2 seconds (rate limiting)...")
            time.sleep(2)

    print(f"\n✅ Summary: {successful} ISBDM issues created, {failed} failed")

    if successful > 0:
        print("\n📊 View all issues at: https://github.com/iflastandards/platform/issues")
        print("\n🏷️  Filter by standard:")
        print("  • ISBDM: https://github.com/iflastandards/platform/issues?q=is:issue+is:open+label:standard:isbdm")
        print("  • FRBR:  https://github.com/iflastandards/platform/issues?q=is:issue+is:open+label:standard:frbr")
        print("  • LRM:   https://github.com/iflastandards/platform/issues?q=is:issue+is:open+label:standard:lrm")
        print("\n📌 Filter ISBDM by priority:")
        print("  • Critical: https://github.com/iflastandards/platform/issues?q=is:issue+is:open+label:standard:isbdm+label:priority:critical")
        print("  • High:     https://github.com/iflastandards/platform/issues?q=is:issue+is:open+label:standard:isbdm+label:priority:high")

if __name__ == "__main__":
    main()