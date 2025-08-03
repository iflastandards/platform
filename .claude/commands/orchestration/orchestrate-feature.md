# Deploy Feature-Focused Orchestration: $ARGUMENTS

Deploy a focused AI team to implement a specific feature.

## Usage

`/orchestrate-feature "user authentication"` - Deploy team for auth feature
`/orchestrate-feature "payment integration" large` - Large team for complex feature

## What This Does

1. **Focused Team**: Smaller team dedicated to one feature
2. **Feature PRP**: Generates feature-specific PRP if needed
3. **Auto PR**: Creates pull request when feature is complete
4. **Progress Tracking**: Regular updates on feature progress

## Team Composition

### Default Feature Team
- 1 Lead Developer (owns the feature)
- 1 Supporting Developer (assists and reviews)
- 1 QA Engineer (tests the feature)

### Large Feature Team
- 1 Feature Lead
- 2 Developers
- 1 QA Engineer
- 1 Code Reviewer

## Process

1. Analyze feature requirements
2. Generate or load feature PRP
3. Deploy specialized team
4. Implement with test-driven development
5. Create PR when complete

## Feature Workflow

1. **Planning**: Team reviews requirements
2. **Implementation**: TDD approach
3. **Testing**: Comprehensive test coverage
4. **Review**: Internal code review
5. **PR Creation**: Automated PR with details

## Success Criteria

- All acceptance criteria met
- Tests passing with >80% coverage
- Code review approved
- No regressions in existing features
- Documentation updated

## Monitoring

Check progress with:
- `/feature-status [feature-name]`
- `/orchestrate-status`

Feature-focused orchestration ensures dedicated attention to critical features!