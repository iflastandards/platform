#!/usr/bin/env python3
"""
PreSubmit Hook for IFLA-Platform

Validates code quality before submission by running linting and tests.
"""

import subprocess
import sys
import os

def main():
    """
    Run quality checks before code submission.
    """
    try:
        print("🔍 Running pre-submit quality checks...")
        
        checks_passed = True
        
        
        # Run linting
        print("📋 Running linting...")
        result = subprocess.run("npm run lint", shell=True, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"❌ Linting failed:\n{result.stdout}\n{result.stderr}")
            checks_passed = False
        else:
            print("✅ Linting passed")
        
        
        
        # Run tests
        print("🧪 Running tests...")
        result = subprocess.run("npm test", shell=True, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"❌ Tests failed:\n{result.stdout}\n{result.stderr}")
            checks_passed = False
        else:
            print("✅ Tests passed")
        
        
        # Check for critical patterns
        print("🔍 Checking for critical patterns...")
        critical_patterns = [
            "TODO:",
            "FIXME:",
            "console.log(",
            "debugger;",
            "import pdb"
        ]
        
        for pattern in critical_patterns:
            result = subprocess.run(f"grep -r '{pattern}' src/ || true", shell=True, capture_output=True, text=True)
            if result.stdout.strip():
                print(f"⚠️  Found {pattern} in code:")
                print(result.stdout)
        
        if checks_passed:
            print("✅ All pre-submit checks passed!")
            return 0
        else:
            print("❌ Pre-submit checks failed!")
            return 1
            
    except Exception as e:
        print(f"❌ Pre-submit hook failed: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
