# Should Checkpoint? - Self-Assessment

Determine if current progress warrants human verification for IFLA-Platform.

## Self-Assessment Criteria

<Task>
<Agent role="checkpoint-assessor">
Evaluate current work against these criteria and decide if checkpoint is needed:

### 🔴 CRITICAL - Immediate Checkpoint Required
- Database connection established or schema modified
- Authentication or authorization system changes
- Production deployment configuration or release
- Database migrations or data transformations
- Any code that could affect production systems
- Security-related implementations
- Breaking changes to existing functionality

### 🟡 IMPORTANT - Checkpoint Recommended  
- Multiple features completed in one session (3+)
- Significant architectural changes
- New dependencies or integrations added
- Complex business logic implementation
- Performance-critical code changes

### 🟢 NORMAL - Continue Working
- Small UI/UX improvements
- Component refactoring without logic changes
- Documentation updates
- Type definitions and interfaces
- Minor bug fixes
- Code cleanup and formatting

### Decision Logic:
```
IF (touching critical systems OR security OR data)
  → CHECKPOINT REQUIRED - Call /checkpoint immediately

ELSE IF (3+ major tasks completed OR session > 2 hours OR complex changes)
  → CHECKPOINT RECOMMENDED - Consider calling /checkpoint

ELSE IF (user specifically requested verification)
  → CHECKPOINT ALWAYS - Honor user request

ELSE 
  → CONTINUE WORKING - Safe to proceed
```

### Auto-Trigger Examples:
- "Database connection established" → CHECKPOINT REQUIRED
- "Authentication system working" → CHECKPOINT REQUIRED  
- "API endpoints created" → CHECKPOINT RECOMMENDED
- "5 components refactored" → CHECKPOINT RECOMMENDED
- "Fixed typo in documentation" → CONTINUE

Return assessment:
- **CHECKPOINT_NOW**: [specific reason and what to verify]
- **CHECKPOINT_SOON**: [when to checkpoint and why]
- **CONTINUE**: [safe to proceed because...]
</Agent>
</Task>

Use this before making any significant changes to IFLA-Platform!