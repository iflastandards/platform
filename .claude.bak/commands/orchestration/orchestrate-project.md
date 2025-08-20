# Deploy Autonomous Orchestration: $ARGUMENTS

Deploy a full AI orchestration team to work on your project autonomously.

## What This Does

1. **Creates AI Team**: Deploys orchestrator, project managers, and developers
2. **Self-Managing**: Agents schedule their own check-ins and manage workload
3. **Git Discipline**: Auto-commits every 30 minutes to prevent work loss
4. **24/7 Operation**: Can run continuously without human intervention

## Usage

`/orchestrate-project` - Deploy with default team structure
`/orchestrate-project small` - Small team (1 PM, 2 devs)
`/orchestrate-project large` - Large team (2 PMs, 4 devs, QA, DevOps)

## Team Structure

### Default Team
- 1 Orchestrator (oversees everything)
- 1 Project Manager (coordinates work)
- 2 Developers (implement features)
- 1 QA Engineer (ensures quality)

### Small Team
- 1 Orchestrator
- 1 Project Manager
- 2 Developers

### Large Team
- 1 Orchestrator
- 2 Project Managers
- 4 Developers
- 2 QA Engineers
- 1 DevOps Engineer
- 1 Code Reviewer

## Prerequisites

1. **tmux installed**: Required for agent management
2. **Git initialized**: Project must be a git repository
3. **Claude access**: Each agent needs Claude access
4. **PRPs created**: Agents work best with clear PRPs

## Deployment Process

1. Check tmux availability
2. Create orchestration session
3. Deploy agents with specific roles
4. Initialize git auto-commit
5. Set up self-scheduling
6. Brief each agent on their responsibilities

## Monitoring

Use `/orchestrate-status` to check on your team
Use `tmux attach -t cf-IFLA-Platform` to view agents

## Important Notes

- Agents commit automatically - review commits regularly
- Each agent has specific responsibilities and constraints
- Communication follows hub-and-spoke model through PM
- Orchestrator handles high-level decisions only

Ready to deploy your AI team!