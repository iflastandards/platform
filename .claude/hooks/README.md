# Claude Code Hooks

This directory contains Claude Code hooks that enhance your development workflow with automated context management and project-specific behaviors.

## About Hooks

Claude Code hooks are scripts that run at specific points during development:
- **PreCompact**: Runs before context is compacted to preserve important information
- **PostMessage**: Runs after each message to maintain project state
- **PreSubmit**: Runs before submitting code to validate quality

## Project Configuration

Project: IFLA-Platform
Type: fullstack
Tech Stack: nextjs, sass, context, express, supabase, clerk

## Available Hooks

### Context Management
- **PreCompact**: Preserves project context, CLAUDE.md, and recent changes
- **ContextRotation**: Manages context window by preserving critical information

### Quality Gates
- **PreSubmit**: Validates code quality before submission
- **LintAndTest**: Runs linting and testing before commits

### Project Specific
- **ProjectStatePreservation**: Maintains project-specific state information
- **FeatureTracking**: Tracks feature implementation progress

## Hook Configuration

Hooks are automatically detected by Claude Code. To customize hook behavior:

1. Edit hook files directly in this directory
2. Add project-specific logic based on your needs
3. Configure hook triggers in Claude settings

## Usage Tips

- Hooks run automatically based on their triggers
- Check Claude Code logs if hooks aren't working as expected
- Hooks can access project files and context
- Use hooks to maintain context across long development sessions

## Troubleshooting

If hooks aren't working:
1. Check file permissions (hooks need to be executable)
2. Verify Claude Code settings have hooks enabled
3. Review hook logs for error messages
4. Ensure required dependencies are installed

For more information, see: https://docs.anthropic.com/claude-code/hooks
