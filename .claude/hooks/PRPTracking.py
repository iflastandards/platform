#!/usr/bin/env python3
"""
PRP Tracking Hook for IFLA-Platform

Tracks PRP implementation progress and provides status updates.
"""

import os
import json
import glob
from datetime import datetime

def main():
    """
    Track PRP implementation progress.
    """
    try:
        prp_status = {
            "project": "IFLA-Platform",
            "updated": datetime.now().isoformat(),
            "prps": []
        }
        
        # Find all PRP files
        prp_files = glob.glob("PRPs/*.md")
        
        for prp_file in prp_files:
            if os.path.exists(prp_file):
                with open(prp_file, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Basic PRP analysis
                prp_info = {
                    "file": prp_file,
                    "name": os.path.basename(prp_file).replace('.md', ''),
                    "size": len(content),
                    "has_validation": "## Validation Gates" in content,
                    "has_tasks": "## Task Breakdown" in content,
                    "completion_indicators": content.count("- [x]"),
                    "pending_tasks": content.count("- [ ]"),
                    "last_modified": os.path.getmtime(prp_file)
                }
                
                prp_status["prps"].append(prp_info)
        
        # Save PRP status
        os.makedirs(".claude", exist_ok=True)
        with open(".claude/prp_status.json", 'w') as f:
            json.dump(prp_status, f, indent=2)
        
        print(f"📋 PRP Tracking: {len(prp_status['prps'])} PRPs tracked")
        
        # Print summary
        for prp in prp_status["prps"]:
            completion = prp["completion_indicators"] / max(1, prp["completion_indicators"] + prp["pending_tasks"]) * 100
            print(f"  - {prp['name']}: {completion:.0f}% complete")
        
    except Exception as e:
        print(f"❌ PRP tracking hook failed: {e}")

if __name__ == "__main__":
    main()
