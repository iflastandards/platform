#!/usr/bin/env python3
"""
PreCompact Hook for IFLA-Platform

Preserves critical project information before context is compacted.
This ensures important context is maintained across development sessions.
"""

import os
import json
import glob
from datetime import datetime
from pathlib import Path

def main():
    """
    Preserve critical project context before compaction.
    """
    try:
        project_info = {
            "project_name": "IFLA-Platform",
            "project_type": "fullstack",
            "tech_stack": {"frontend":"nextjs","styling":"sass","stateManagement":"context","backend":"express","database":"supabase","auth":"clerk"},
            "last_preserved": datetime.now().isoformat(),
            "critical_files": []
        }
        
        # Critical files to preserve
        critical_patterns = ["CLAUDE.md","README.md","package.json","requirements.txt",".env.example","PRPs/**/*.md","Docs/**/*.md","docs/**/*.md","PRPs/**/*.md",".claude/commands/**/*.md","CONTEXT-FORGE-FILE-MAPPING.md","PRIME-CONTEXT-ENHANCEMENT.md","ai_docs/**/*.md"]
        
        for pattern in critical_patterns:
            files = glob.glob(pattern, recursive=True)
            for file_path in files:
                if os.path.exists(file_path):
                    try:
                        with open(file_path, 'r', encoding='utf-8') as f:
                            content = f.read()
                        
                        project_info["critical_files"].append({
                            "path": file_path,
                            "size": len(content),
                            "last_modified": os.path.getmtime(file_path),
                            "preview": content[:500] + "..." if len(content) > 500 else content
                        })
                    except Exception as e:
                        print(f"Warning: Could not read {file_path}: {e}")
        
        # Save context summary
        context_file = ".claude/context_summary.json"
        os.makedirs(os.path.dirname(context_file), exist_ok=True)
        
        with open(context_file, 'w', encoding='utf-8') as f:
            json.dump(project_info, f, indent=2)
        
        print(f"✅ PreCompact: Preserved context for {len(project_info['critical_files'])} files")
        
        # Generate context prompt for next session
        generate_context_prompt(project_info)
        
    except Exception as e:
        print(f"❌ PreCompact hook failed: {e}")

def generate_context_prompt(project_info):
    """Generate a comprehensive context restoration prompt for PRD/PRP workflow."""
    
    # Categorize files by type
    prp_files = []
    doc_files = []
    command_files = []
    status_files = []
    
    for file_info in project_info["critical_files"]:
        path = file_info["path"]
        if "/PRPs/" in path or path.startswith("PRPs/"):
            prp_files.append(file_info)
        elif "/commands/" in path or path.startswith(".claude/commands/"):
            command_files.append(file_info)
        elif path.endswith(".json") and any(status in path for status in ["dart_progress", "task_mapping", "phase_progress", "checkpoint_status"]):
            status_files.append(file_info)
        elif path.endswith(".md"):
            doc_files.append(file_info)
    
    prompt = f"""# Context Restoration for IFLA-Platform

## Project Overview
- **Name**: IFLA-Platform
- **Type**: fullstack
- **Tech Stack**: {', '.join([f"{k}: {v}" for k, v in project_info["tech_stack"].items() if v])}

## Recent Context
- **Last Preserved**: {project_info["last_preserved"]}
- **Files Tracked**: {len(project_info["critical_files"])} critical files
- **PRPs Tracked**: {len(prp_files)} PRP files
- **Commands Available**: {len(command_files)} slash commands
- **Status Files**: {len(status_files)} status tracking files

## PRD/PRP Workflow Files
"""
    
    if prp_files:
        prompt += "### Product Requirement Profiles (PRPs)\n"
        for file_info in prp_files:
            prompt += f"- **{file_info['path']}** ({file_info['size']} chars)\n"
        prompt += "\n"
    
    if command_files:
        prompt += "### Available Slash Commands\n"
        for file_info in command_files:
            command_name = file_info['path'].split('/')[-1].replace('.md', '')
            prompt += f"- **/{command_name}** - {file_info['path']}\n"
        prompt += "\n"
    
    if status_files:
        prompt += "### Task & Progress Tracking\n"
        for file_info in status_files:
            status_type = file_info['path'].split('/')[-1].replace('.json', '')
            prompt += f"- **{status_type}** - {file_info['size']} chars of status data\n"
        prompt += "\n"
    
    prompt += f"""## Quick Start Commands
- `/prime-context` - Load full project understanding
- `/prp-create [feature]` - Create new feature PRP
- `/prp-execute [prp-file]` - Execute specific PRP
- `/checkpoint [milestone]` - Request human verification
- `/orchestrate-status` - Check project orchestration status
- `/validate-prp [prp-file]` - Validate PRP completeness

## Critical Documentation Files
"""
    
    for file_info in doc_files[:10]:  # Top 10 documentation files
        prompt += f"- **{file_info['path']}** ({file_info['size']} chars)\n"
    
    prompt += f"""
## Context Restoration Instructions
1. Review the current task from Implementation.md
2. Check active PRPs and their execution status
3. Use `/prime-context` to load comprehensive project context
4. Continue with PRP workflow or create new PRPs as needed
5. Verify Dart integration status if available
6. Use `/checkpoint` before major milestone transitions

## PRD/PRP Workflow Best Practices
- Always validate PRPs before execution with `/validate-prp`
- Use `/orchestrate-status` to check overall project health
- Maintain checkpoint verification for major milestones
- Keep PRPs focused and executable
- Document all changes in appropriate PRP files

---
*This context was automatically preserved by Claude Code PreCompact Hook*
"""
    
    # Save restoration prompt
    with open(".claude/context_restoration.md", 'w', encoding='utf-8') as f:
        f.write(prompt)

if __name__ == "__main__":
    main()
