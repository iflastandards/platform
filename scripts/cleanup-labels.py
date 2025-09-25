#!/usr/bin/env python3

import subprocess
import sys
import time

def delete_label(label_name):
    """Delete a label from the repository"""
    cmd = ['gh', 'label', 'delete', label_name, '--repo', 'iflastandards/platform', '--yes']
    try:
        subprocess.run(cmd, capture_output=True, text=True, check=True)
        print(f"  ✅ Deleted label: {label_name}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"  ❌ Failed to delete label {label_name}: {e.stderr}")
        return False

def update_issue_labels(old_label, new_label):
    """Replace old label with new label on all issues"""
    # Get issues with the old label
    cmd = ['gh', 'issue', 'list', '--repo', 'iflastandards/platform',
           '--label', old_label, '--limit', '100', '--json', 'number']

    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        import json
        issues = json.loads(result.stdout)

        if not issues:
            print(f"  No issues with label '{old_label}'")
            return True

        print(f"  Found {len(issues)} issues with label '{old_label}'")

        for issue in issues:
            issue_num = issue['number']
            # Remove old label and add new label
            cmd_remove = ['gh', 'issue', 'edit', str(issue_num), '--repo', 'iflastandards/platform',
                          '--remove-label', old_label]
            cmd_add = ['gh', 'issue', 'edit', str(issue_num), '--repo', 'iflastandards/platform',
                       '--add-label', new_label]

            try:
                subprocess.run(cmd_remove, capture_output=True, text=True, check=True)
                subprocess.run(cmd_add, capture_output=True, text=True, check=True)
                print(f"    ✅ Updated issue #{issue_num}: {old_label} → {new_label}")
            except subprocess.CalledProcessError as e:
                print(f"    ❌ Failed to update issue #{issue_num}: {e.stderr}")

            time.sleep(0.5)  # Rate limiting

        return True
    except subprocess.CalledProcessError as e:
        print(f"  ❌ Error getting issues: {e.stderr}")
        return False

def main():
    if '--execute' not in sys.argv:
        print("DRY RUN MODE - Use --execute to make changes")
        print("\nThis script will:")
        print("1. Update issues with numbered priority labels to use standard priority labels")
        print("2. Delete the numbered priority labels")
        print("\nLabel mapping:")
        print("  1-Critical → priority:critical")
        print("  2-High, 3-High → priority:high")
        print("  4-Medium, 5-Medium, 6-Medium → priority:medium")
        print("  7-Low → priority:low")
        print("  8-Enhancement → enhancement (type, not priority)")
        print("  9-Bug → bug (type, not priority)")
        print("  10-Documentation → documentation (type, not priority)")
        print("\nRun with --execute to proceed")
        return

    print("🧹 Cleaning up priority labels...")
    print("=" * 50)

    # Define the mapping
    label_mapping = {
        '1-Critical': 'priority:critical',
        '2-High': 'priority:high',
        '3-High': 'priority:high',
        '4-Medium': 'priority:medium',
        '5-Medium': 'priority:medium',
        '6-Medium': 'priority:medium',
        '7-Low': 'priority:low',
        # These are actually types, not priorities
        '8-Enhancement': 'enhancement',
        '9-Bug': 'bug',
        '10-Documentation': 'documentation'
    }

    # First, update all issues
    print("\n📝 Updating issue labels...")
    for old_label, new_label in label_mapping.items():
        print(f"\nProcessing {old_label} → {new_label}")
        update_issue_labels(old_label, new_label)

    # Then delete the old labels
    print("\n🗑️  Deleting old numbered labels...")
    for old_label in label_mapping.keys():
        delete_label(old_label)

    print("\n✅ Cleanup complete!")
    print("\n📊 Remaining priority labels:")
    print("  • priority:critical")
    print("  • priority:high")
    print("  • priority:medium")
    print("  • priority:low")

if __name__ == "__main__":
    main()