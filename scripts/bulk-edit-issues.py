#!/usr/bin/env python3

import subprocess
import time
import sys
import json
import csv

def read_csv(filepath):
    """Read and parse the CSV file to get original data"""
    issues = []
    with open(filepath, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
            if row.get('Issue #') and row['Issue #'].strip():
                issues.append({
                    'number': row['Issue #'],
                    'priority': row['Priority'],
                    'type': row['Type'],
                    'title': row['Title']
                })
    return issues

def get_issue_body(issue_number):
    """Get the current body of an issue"""
    cmd = ['gh', 'issue', 'view', str(issue_number), '--repo', 'iflastandards/platform', '--json', 'body']
    result = subprocess.run(cmd, capture_output=True, text=True, check=True)
    data = json.loads(result.stdout)
    return data['body']

def get_issue_labels(issue_number):
    """Get the current labels of an issue"""
    cmd = ['gh', 'issue', 'view', str(issue_number), '--repo', 'iflastandards/platform', '--json', 'labels']
    result = subprocess.run(cmd, capture_output=True, text=True, check=True)
    data = json.loads(result.stdout)
    return [label['name'] for label in data['labels']]

def update_issue_body(issue_number, new_body, dry_run=False):
    """Update the body of an issue"""
    if dry_run:
        print(f"  [DRY RUN] Would update body for issue #{issue_number}")
        return True

    cmd = ['gh', 'issue', 'edit', str(issue_number), '--repo', 'iflastandards/platform', '--body', new_body]
    try:
        subprocess.run(cmd, capture_output=True, text=True, check=True)
        print(f"  ✅ Updated body for issue #{issue_number}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"  ❌ Failed to update body for issue #{issue_number}: {e.stderr}")
        return False

def update_labels(issue_number, labels_to_add, labels_to_remove, dry_run=False):
    """Update labels on an issue"""
    if dry_run:
        if labels_to_remove:
            print(f"  [DRY RUN] Would remove labels from issue #{issue_number}: {', '.join(labels_to_remove)}")
        if labels_to_add:
            print(f"  [DRY RUN] Would add labels to issue #{issue_number}: {', '.join(labels_to_add)}")
        return True

    success = True

    # Remove labels first
    if labels_to_remove:
        remove_string = ','.join(labels_to_remove)
        cmd = ['gh', 'issue', 'edit', str(issue_number), '--repo', 'iflastandards/platform', '--remove-label', remove_string]
        try:
            subprocess.run(cmd, capture_output=True, text=True, check=True)
            print(f"  ✅ Removed labels from issue #{issue_number}: {remove_string}")
        except subprocess.CalledProcessError as e:
            print(f"  ❌ Failed to remove labels from issue #{issue_number}: {e.stderr}")
            success = False

    # Add new labels
    if labels_to_add:
        add_string = ','.join(labels_to_add)
        cmd = ['gh', 'issue', 'edit', str(issue_number), '--repo', 'iflastandards/platform', '--add-label', add_string]
        try:
            subprocess.run(cmd, capture_output=True, text=True, check=True)
            print(f"  ✅ Added labels to issue #{issue_number}: {add_string}")
        except subprocess.CalledProcessError as e:
            print(f"  ❌ Failed to add labels to issue #{issue_number}: {e.stderr}")
            success = False

    return success

def create_label_if_not_exists(label_name, description="", color="ededed"):
    """Create a label if it doesn't exist"""
    # Check if label exists
    cmd = ['gh', 'label', 'list', '--repo', 'iflastandards/platform', '--search', label_name, '--limit', '100']
    result = subprocess.run(cmd, capture_output=True, text=True, check=True)

    # Check if exact label exists (not just partial match)
    existing_labels = result.stdout.strip().split('\n')
    for line in existing_labels:
        if line and line.split('\t')[0] == label_name:
            return  # Label already exists

    # Create the label
    cmd = ['gh', 'label', 'create', label_name, '--repo', 'iflastandards/platform',
           '--description', description, '--color', color]
    try:
        subprocess.run(cmd, capture_output=True, text=True, check=True)
        print(f"  ✨ Created new label: {label_name}")
    except subprocess.CalledProcessError:
        pass  # Label might already exist or other error

def main():
    # Read the CSV to get original priority and type values
    csv_file = 'output/issues.csv'
    print(f"📋 Reading original data from {csv_file}...")
    csv_issues = read_csv(csv_file)

    # Create a mapping from issue number to CSV data
    issue_data = {int(issue['number']): issue for issue in csv_issues}

    # Check for dry run mode
    dry_run = '--dry-run' in sys.argv

    if dry_run:
        print("🧪 DRY RUN MODE - No changes will be made")
    else:
        print("🚀 LIVE MODE - Issues will be updated")
        print("\n🏷️  Creating labels if they don't exist...")

        # Create all unique priority and type labels from CSV
        unique_priorities = set(issue['priority'] for issue in csv_issues)
        unique_types = set(issue['type'] for issue in csv_issues)

        for priority in unique_priorities:
            create_label_if_not_exists(priority, f"Priority: {priority}", "ff9999")

        for type_label in unique_types:
            create_label_if_not_exists(type_label, f"Type: {type_label}", "d4c5f9")

    # Issues to update (from our bulk creation)
    # Can be modified to update specific issues
    issue_range = range(118, 122)  # Issues #118 through #121 (last 4)

    print(f"\n📝 Updating {len(issue_range)} ISBDM issues...")
    print("  • Fixing URLs: standards-dev → platform")
    print("  • Setting exact priority labels from CSV")
    print("  • Setting exact type labels from CSV")
    print("=" * 50)

    successful_body_updates = 0
    successful_label_updates = 0
    failed = 0

    for issue_num in issue_range:
        csv_index = issue_num - 96  # Convert issue number to CSV row

        if csv_index not in issue_data:
            print(f"\n[{csv_index}/25] ⚠️  No CSV data for issue #{issue_num}, skipping...")
            continue

        csv_row = issue_data[csv_index]

        print(f"\n[{csv_index}/25] Processing issue #{issue_num}: {csv_row['title'][:30]}...")
        print(f"  CSV Priority: {csv_row['priority']}, Type: {csv_row['type']}")

        try:
            # Get current body
            body = get_issue_body(issue_num)
            original_body = body

            # Fix URL
            updated_body = body.replace(
                'https://iflastandards.github.io/standards-dev/',
                'https://iflastandards.github.io/platform/'
            )

            # Update body if changed
            if updated_body != original_body:
                if update_issue_body(issue_num, updated_body, dry_run):
                    successful_body_updates += 1
                else:
                    failed += 1
            else:
                print(f"  ℹ️  No URL changes needed")

            # Get current labels
            current_labels = get_issue_labels(issue_num)

            # Determine which labels to remove (old priority/type labels)
            labels_to_remove = []
            for label in current_labels:
                # Remove old priority labels
                if label.startswith('priority:'):
                    labels_to_remove.append(label)
                # Remove generic type labels that we're replacing with exact ones
                if label in ['bug', 'enhancement', 'typo'] and label != csv_row['type']:
                    labels_to_remove.append(label)

            # Determine which labels to add (exact CSV values)
            labels_to_add = []

            # Add exact priority from CSV
            if csv_row['priority'] not in current_labels:
                labels_to_add.append(csv_row['priority'])

            # Add exact type from CSV
            if csv_row['type'] not in current_labels:
                labels_to_add.append(csv_row['type'])

            # Update labels if needed
            if labels_to_add or labels_to_remove:
                if update_labels(issue_num, labels_to_add, labels_to_remove, dry_run):
                    successful_label_updates += 1
                else:
                    failed += 1
            else:
                print(f"  ℹ️  Labels already correct")

            # Rate limiting
            if not dry_run and issue_num < 121:
                time.sleep(1)  # 1 second between updates

        except Exception as e:
            print(f"  ❌ Error processing issue #{issue_num}: {e}")
            failed += 1

    print("\n" + "=" * 50)
    print(f"✅ Summary:")
    print(f"  • Body updates: {successful_body_updates}")
    print(f"  • Label updates: {successful_label_updates}")
    print(f"  • Failed: {failed}")

    if not dry_run:
        print(f"\n📊 View updated issues: https://github.com/iflastandards/platform/issues?q=is:issue+is:open+label:standard:isbdm")
        print(f"\n🏷️  New label filters:")
        print(f"  • 1-Critical: https://github.com/iflastandards/platform/issues?q=is:issue+is:open+label:1-Critical")
        print(f"  • 2-High: https://github.com/iflastandards/platform/issues?q=is:issue+is:open+label:2-High")
        print(f"  • Bug: https://github.com/iflastandards/platform/issues?q=is:issue+is:open+label:Bug")
        print(f"  • Content: https://github.com/iflastandards/platform/issues?q=is:issue+is:open+label:Content")

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] not in ['--dry-run', '--execute']:
        print("Usage: python3 bulk-edit-issues.py [--dry-run | --execute]")
        print("  --dry-run  : Show what would be changed without making changes")
        print("  --execute  : Actually update the issues")
        sys.exit(1)
    elif len(sys.argv) == 1:
        print("Usage: python3 bulk-edit-issues.py [--dry-run | --execute]")
        print("  --dry-run  : Show what would be changed without making changes")
        print("  --execute  : Actually update the issues")
        sys.exit(1)

    main()