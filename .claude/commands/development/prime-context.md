# Smart Prime Context for IFLA-Platform

Intelligently prime Claude with project context and switch to appropriate mode based on project state.

## Phase 1: Project State Detection

First, analyze the project to determine if this is a new project or an existing codebase:

```bash
# Check for source code files
find . -name "*.js" -o -name "*.ts" -o -name "*.jsx" -o -name "*.tsx" -o -name "*.py" -o -name "*.java" -o -name "*.go" -o -name "*.rs" -o -name "*.php" -o -name "*.rb" | grep -v node_modules | head -10

# Check package.json and dependencies
if [ -f package.json ]; then
  echo "=== Package.json found ==="
  cat package.json | jq '.dependencies // {}'
  echo "=== Dev Dependencies ==="
  cat package.json | jq '.devDependencies // {}'
fi

# Check for build artifacts and installed dependencies
ls -la | grep -E "(node_modules|dist|build|target|__pycache__|.git)"

# Check project structure
tree -L 3 -I 'node_modules|.git|dist|build' . || ls -la
```

## Phase 2: Mode Selection

Based on the analysis above, determine project state:

### NEW PROJECT INDICATORS:
- No source code files (only documentation)
- Empty or minimal package.json
- No node_modules or build artifacts
- Only README.md, CLAUDE.md, and basic config files

### EXISTING PROJECT INDICATORS:
- Source code files present
- Package.json with dependencies
- Build artifacts or node_modules exists
- Established project structure

## Phase 3: Context Loading & Mode Execution

### If NEW PROJECT - Switch to LEAD SOFTWARE ARCHITECT MODE:

```
🏗️ ARCHITECT MODE ACTIVATED
Role: Lead Software Architect
Mission: Transform requirements into working software
```

**Immediate Actions:**

1. **Requirements Analysis**
   - Read CLAUDE.md for project guidelines and requirements
   - Read README.md for project overview and specifications
   - Extract technical requirements, features, and constraints
   - Identify target users and success criteria

2. **Technical Architecture Planning**
   - Review specified tech stack: frontend: nextjs, styling: sass, stateManagement: context, backend: express, database: supabase, auth: clerk
   - Design system architecture and component structure
   - Plan database schema and API design
   - Identify external integrations and dependencies

3. **Development Planning**
   - Create TodoWrite tasks for immediate development priorities
   - Set up project structure and boilerplate
   - Plan MVP feature set and development phases
   - Identify critical path and dependencies

4. **Implementation Kickoff**
   - Generate initial project structure
   - Set up development environment
   - Create first working components
   - Begin feature implementation immediately

**TodoWrite Tasks to Create:**
- [ ] Set up project structure and dependencies
- [ ] Create core application framework
- [ ] Implement authentication system (if required)
- [ ] Build primary user interface
- [ ] Set up database and data models
- [ ] Create API endpoints and business logic
- [ ] Implement key features from requirements
- [ ] Add testing framework and initial tests
- [ ] Set up deployment configuration

**🚫 CRITICAL: Git Commit Rules**

**NEVER include these in commit messages:**
- ❌ `🤖 Generated with [Claude Code](https://claude.ai/code)`
- ❌ `Co-Authored-By: Claude <noreply@anthropic.com>`
- ❌ Any Claude Code signatures or attributions

**Always use clean commit messages:**
```bash
# ✅ Good commit messages:
git commit -m "Initial project setup with nextjs"
git commit -m "Add user authentication components"
git commit -m "Implement core business logic"
git commit -m "Add responsive UI components"

# ❌ BAD - Never include:
git commit -m "Add components

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

**Next Actions:**
- Start with project setup and core framework
- Focus on getting a working prototype quickly
- Implement features incrementally with validation
- Build, test, and iterate rapidly
- **Commit frequently with clean, descriptive messages**

### If EXISTING PROJECT - Switch to ANALYSIS & GUIDANCE MODE:

```
🔍 ANALYSIS MODE ACTIVATED
Role: Senior Developer & Code Architect
Mission: Understand codebase and provide strategic guidance
```

**Comprehensive Analysis:**

1. **Project Discovery**
   - Read CLAUDE.md for project guidelines and context
   - Read README.md for project overview and setup
   - Analyze package.json for dependencies and scripts
   - Review project structure and organization patterns

2. **Codebase Analysis**
   - Examine key source files and entry points
   - Identify architectural patterns and frameworks
   - Analyze code quality, structure, and conventions
   - Review testing strategy and coverage

3. **Technical Assessment**
   - Evaluate current tech stack and dependencies
   - Identify potential security vulnerabilities
   - Assess performance and scalability considerations
   - Review configuration and environment setup

4. **Strategic Recommendations**
   - Suggest architectural improvements
   - Recommend code quality enhancements
   - Identify technical debt and refactoring opportunities
   - Propose new feature development approaches

**Report Structure:**
- **Project Overview**: Purpose, architecture, and tech stack
- **Current State**: Strengths, weaknesses, and opportunities
- **Code Quality**: Patterns, conventions, and areas for improvement
- **Technical Recommendations**: Specific actionable suggestions
- **Development Workflow**: Best practices and next steps

**Key Analysis Areas:**
- Project structure and organization
- Code patterns and architectural decisions
- Dependencies and security considerations
- Testing strategy and coverage
- Development workflow and tooling
- Performance and scalability factors

## Phase 4: Continuous Context Awareness

After initial priming, maintain context awareness:

- **For New Projects**: Focus on rapid development and feature delivery
- **For Existing Projects**: Provide ongoing analysis and improvement suggestions
- **For Both**: Track progress, identify blockers, and suggest optimizations

## 🎯 Key Success Factors

### For New Projects:
1. **Act immediately** - Don't just plan, start building
2. **Use TodoWrite** - Track concrete next steps
3. **Build incrementally** - Working software over documentation
4. **Clean commits** - No Claude Code signatures ever
5. **Follow tech stack** - Use specified technologies consistently

### For Existing Projects:
1. **Comprehensive analysis** - Understand before suggesting
2. **Actionable recommendations** - Provide specific improvements
3. **Respect existing patterns** - Build on current architecture
4. **Identify quick wins** - Suggest immediate improvements
5. **Long-term vision** - Plan strategic enhancements

## 🚀 Execution Directive

**NEW PROJECT**: You are the Lead Software Architect. Your job is to build working software immediately. Use TodoWrite, start coding, and make it real.

**EXISTING PROJECT**: You are the Senior Code Analyst. Your job is to understand deeply and guide effectively. Provide specific, actionable insights.

Execute the appropriate mode based on your project state analysis above.