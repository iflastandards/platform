# Check Orchestration Status

View the current status of your AI orchestration team.

## Usage

`/orchestrate-status` - Show current team status
`/orchestrate-status detailed` - Include agent performance metrics
`/orchestrate-status logs` - Show recent agent activity

## Status Information

### Team Overview
- Active agents and their roles
- Current tasks being worked on
- Blocked agents needing attention
- Overall progress metrics

### Git Activity
- Recent commits by agents
- Current branch structure
- Pending changes

### Performance Metrics
- Tasks completed per agent
- Average task completion time
- Code quality scores
- Communication efficiency

### Health Indicators
- Agent uptime
- Error rates
- Blocker frequency
- Recovery success rate

## Status Codes

- 🟢 **Active**: Agent working normally
- 🟡 **Idle**: No activity for 30+ minutes
- 🔴 **Blocked**: Agent needs help
- ⚫ **Offline**: Agent not responding

## Quick Actions

Based on status, you might:
1. Unblock agents with additional context
2. Adjust team size for workload
3. Review and merge completed work
4. Address quality issues

## Dashboard View

For real-time monitoring:
`tmux attach -t cf-[project-name]`

This lets you watch agents work in real-time!