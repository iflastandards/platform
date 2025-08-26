# Development Workflow Standards

## Workflow Philosophy

### Evidence-Based Development
- **Code > Documentation**: Working solutions over extensive planning
- **Efficiency > Verbosity**: Accomplish tasks with minimal overhead
- **Parallel > Sequential**: Batch operations when possible
- **Quality Gates**: Systematic validation at every step

### Task-First Approach
```
Understand → Plan → Execute → Validate
```

## Task Management Standards

### TodoWrite Integration
For any task with >3 steps, use TodoWrite for tracking:

```typescript
// Example todo structure
[
  { content: "Analyze existing authentication system", status: "completed", activeForm: "Analyzing existing authentication system" },
  { content: "Design new user role management", status: "in_progress", activeForm: "Designing new user role management" },
  { content: "Implement RBAC middleware", status: "pending", activeForm: "Implementing RBAC middleware" },
  { content: "Add role-based UI components", status: "pending", activeForm: "Adding role-based UI components" },
  { content: "Write integration tests", status: "pending", activeForm: "Writing integration tests" }
]
```

### Task Management Rules
- **Mark in_progress**: BEFORE starting work on a task
- **Mark completed**: IMMEDIATELY after finishing a task  
- **One task in_progress**: Never more than one active task
- **Real-time updates**: Update status as work progresses
- **Task breakdown**: Split complex tasks into manageable pieces

## Parallel Execution Strategy

### Batch Operations (Always Preferred)
```bash
# Good: Parallel tool calls
Read file1.ts & Read file2.ts & Read file3.ts

# Avoid: Sequential operations  
Read file1.ts → Read file2.ts → Read file3.ts
```

### Tool Optimization Matrix
| Task Type | Best Tool | Batch Strategy |
|-----------|-----------|----------------|
| Multi-file edits | MultiEdit | Single operation |
| Code search | JetBrains MCP | Parallel searches |
| File reading | Read (batched) | Multiple files at once |
| Symbol operations | JetBrains MCP | Batch refactoring |
| Testing | Nx affected | Parallel test execution |

### Parallelization Analysis
During planning phase, explicitly identify:
- **Independent operations**: Can run concurrently
- **Sequential dependencies**: Must run in order  
- **Resource conflicts**: Cannot run simultaneously
- **Efficiency gains**: Expected time savings

## Development Environment

### Project Structure Awareness
```
IFLA Standards Platform/
├── apps/admin/          # Next.js 15 App Router
├── portal/             # Main Docusaurus hub  
├── standards/          # Individual Docusaurus sites
├── packages/theme/     # Shared components
├── packages/contracts/ # Zod schemas & types
└── e2e/               # Playwright tests
```

### Tool Selection Hierarchy
1. **JetBrains MCP** (primary for code operations)
2. **Serena MCP** (fallback for code ops, primary for session management)
3. **Context7 MCP** (framework documentation)
4. **Sequential MCP** (complex analysis)
5. **Native tools** (simple operations)

## Quality Standards

### Implementation Completeness
- **No partial features**: Complete all started implementations
- **No TODO comments**: Finish functionality or don't start
- **No mock objects**: Real implementations only
- **Working state**: Every deliverable must function as specified

### Code Quality Gates
```bash
# Required before task completion
pnpm typecheck    # TypeScript validation
pnpm lint         # ESLint compliance  
pnpm test         # Affected tests pass
```

### Professional Standards
- **Evidence-based claims**: All assertions must be verifiable
- **No marketing language**: Avoid "blazingly fast", "excellent", etc.
- **Critical assessment**: Honest trade-offs and limitations
- **Technical precision**: Use accurate technical terminology

## Session Management

### Session Lifecycle
```bash
# Session start
git status && git branch  # Verify safe starting state
/sc:load                  # Load project context (if available)

# During work
TodoWrite                 # Track multi-step tasks
/sc:checkpoint           # Save progress (every 30 minutes)

# Session end  
/sc:save                 # Persist session state
git status               # Verify clean workspace
```

### Context Preservation
- **≥90% understanding**: Maintain project context across operations
- **Session memory**: Use Serena MCP for cross-session persistence  
- **Progress tracking**: TodoWrite for task state management
- **Checkpoint regularly**: Every 30 minutes or before risky operations

## Error Recovery

### Failure Investigation Protocol
1. **Root cause analysis**: Understand WHY failures occur
2. **Never skip validation**: Don't bypass quality checks
3. **Systematic debugging**: Step back, assess, investigate thoroughly
4. **Fix don't workaround**: Address underlying issues
5. **Tool failure investigation**: Debug MCP tool issues before switching

### Quality Integrity Rules
- **Never disable tests**: Don't comment out or skip failing tests
- **Never bypass validation**: Don't skip type checking or linting
- **Fix properly**: Address root causes, not symptoms
- **Maintain standards**: Don't compromise quality for speed

## Architecture Decisions

### SOLID Principles
- **Single Responsibility**: Each component has one reason to change
- **Open/Closed**: Open for extension, closed for modification
- **Liskov Substitution**: Derived classes substitutable for base classes
- **Interface Segregation**: Don't depend on unused interfaces
- **Dependency Inversion**: Depend on abstractions, not concretions

### System Design Patterns
- **DRY**: Abstract common functionality, eliminate duplication
- **KISS**: Prefer simplicity over complexity
- **YAGNI**: Implement current requirements only
- **Ripple Effect Awareness**: Consider architecture-wide impact

## Performance Optimization

### Nx Monorepo Efficiency
```bash
# Use affected commands for efficiency
pnpm nx affected --target=build    # Build only changed projects
pnpm nx affected --target=test     # Test only affected code
pnpm nx affected --target=lint     # Lint only changed files
```

### Build Strategy
```bash
# Development
pnpm dev:servers          # All development servers
pnpm nx start [project]   # Individual project

# Production builds  
pnpm build:all           # All projects
pnpm build:affected      # Changed projects only
```

### Caching Strategy
- **Nx cache**: Leveraged for build and test operations
- **Clear when needed**: `pnpm nx:cache:clear` for cache issues
- **Distributed cache**: Shared across team members

## Security Practices

### Secret Management
- **Never commit secrets**: API keys, passwords, tokens
- **Environment variables**: For sensitive configuration
- **Scan commits**: Automated secret detection in pre-commit hooks
- **Rotate immediately**: If secrets are accidentally committed

### Access Control
- **Principle of least privilege**: Minimal required permissions
- **RBAC implementation**: Role-based access control in admin
- **Audit trails**: Track sensitive operations
- **Regular reviews**: Periodic access audits

## Documentation Standards

### Code Documentation
```typescript
/**
 * Transforms raw user data from API into internal User schema
 * @param apiUser - Raw user data from external API
 * @returns Validated User object  
 * @throws {ZodError} When validation fails
 */
function transformUser(apiUser: unknown): User {
  return UserSchema.parse(apiUser);
}
```

### README Requirements
- **Setup instructions**: Clear environment setup
- **Development workflow**: How to run locally
- **Testing strategy**: How to run tests
- **Deployment process**: Release procedures

### API Documentation
- **Generated from schemas**: Zod schemas → API docs
- **Example requests**: Real examples, not placeholders
- **Error responses**: Document all possible errors
- **Authentication**: Clear auth requirements

## Deployment Workflow

### Environment Progression
```
Development → Preview → Production
    ↓           ↓         ↓
  Local      Staging   GitHub Pages
```

### Deployment Gates
- **Preview deployment**: All tests pass, builds succeed
- **Production deployment**: Manual approval, comprehensive testing
- **Rollback plan**: Always have rollback strategy ready

### Monitoring & Alerts
- **Build status**: Monitor CI/CD pipeline health
- **Performance metrics**: Track site performance
- **Error tracking**: Monitor runtime errors
- **User feedback**: Collect and address user issues

## Team Collaboration

### Code Review Standards
- **Two-person review**: All PRs reviewed by team member
- **Automated checks**: Tests, builds, quality gates pass
- **Documentation review**: Ensure adequate documentation
- **Architecture discussion**: Significant changes discussed

### Communication Patterns
- **Async by default**: Reduce meeting overhead
- **Document decisions**: Architecture decisions recorded
- **Share knowledge**: Cross-training and knowledge transfer
- **Feedback loops**: Regular retrospectives and improvements

This development workflow ensures efficient, high-quality development across both Next.js and Docusaurus applications in the IFLA Standards Platform while maintaining professional standards and team collaboration.