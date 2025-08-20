# Context Forge Slash Commands

Custom slash commands for Claude Code to enhance your development workflow.

## Usage

In Claude Code, type `/` followed by the command name:
- `/prp-create feature-name` - Create a new PRP
- `/prp-execute feature-name` - Execute an existing PRP
- `/prime-context` - Load project context

## Available Commands


### PRPs

- **/prp-create** - Generate a comprehensive PRP with deep research
- **/prp-execute** - Execute a PRP against the codebase
- **/validate-prp** - Validate a PRP for completeness

### Development

- **/prime-context** - Prime Claude with intelligent project context and mode switching
- **/debug-issue** - Debug and find root cause of an issue
- **/feature-status** - Check feature implementation progress

### Quality

- **/review-code** - Review code for quality and best practices
- **/refactor-code** - Refactor code for better structure

### Rapid

- **/parallel-prp-create** - Create multiple PRPs in parallel using subagents

### Git

- **/smart-commit** - Create intelligent git commits
- **/create-pr** - Create comprehensive pull request

### Development

- **/checkpoint** - Request human verification at critical milestones
- **/should-checkpoint** - Self-assess if checkpoint is needed
- **/milestone-gate** - Automated checkpoint trigger at milestones

### Orchestration

- **/orchestrate-project** - Deploy autonomous AI team for 24/7 development
- **/orchestrate-feature** - Deploy focused team for specific feature
- **/orchestrate-status** - Check orchestration team status

## Creating Custom Commands

Add your own commands by creating markdown files in the appropriate category folder:
- `.claude/commands/PRPs/` - PRP-related commands
- `.claude/commands/development/` - Development utilities
- `.claude/commands/quality/` - Code quality tools
- `.claude/commands/rapid/` - Rapid development tools
- `.claude/commands/git/` - Git operations

Use `$ARGUMENTS` placeholder for dynamic input.

## Tips

- Commands are automatically discovered by Claude Code
- Use descriptive names for easy discovery
- Include clear instructions in command content
- Reference existing patterns in the codebase
- Commands can call other commands