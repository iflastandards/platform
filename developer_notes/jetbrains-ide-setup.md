# JetBrains IDE Setup Guide for IFLA Standards Platform

**Last Updated**: July 13, 2025  
**Supported IDEs**: WebStorm, IntelliJ IDEA Ultimate, PhpStorm (with JS/TS plugins)

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Project Configuration](#project-configuration)
4. [Run Configurations](#run-configurations)
5. [Code Style](#code-style)
6. [File Templates](#file-templates)
7. [Inspections & Linting](#inspections--linting)
8. [Performance Optimizations](#performance-optimizations)
9. [Nx Integration](#nx-integration)
10. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Plugins
Install these plugins from **Settings → Plugins → Marketplace**:
- JavaScript and TypeScript
- Node.js
- Prettier
- ESLint
- Material Theme UI (optional, for better visual experience)
- Nx Console (optional, for GUI-based Nx commands)

### System Requirements
- Node.js 18+ installed
- pnpm 9.15.2+ installed globally
- Git configured
- At least 8GB RAM allocated to IDE

## Initial Setup

### 1. Open Project
1. **File → Open** and select the project root directory
2. Wait for indexing to complete (first time may take 5-10 minutes)
3. JetBrains will automatically detect the monorepo structure

### 2. Configure Node.js
1. **Settings → Languages & Frameworks → Node.js**
2. Set Node interpreter to your system Node.js (v18+)
3. Enable **Coding assistance for Node.js**
4. Package manager: Select **pnpm** from dropdown

### 3. Configure TypeScript
1. **Settings → Languages & Frameworks → TypeScript**
2. TypeScript version: Use workspace version (`node_modules/typescript`)
3. Enable **TypeScript Language Service**
4. Check **Recompile on changes**

## Project Configuration

### Monorepo Structure Recognition
The project includes `jetbrains.config.js` which helps IDEs understand the structure:

```javascript
// Already configured in the project:
module.exports = {
  monorepo: {
    type: 'nx',
    root: __dirname,
    apps: ['apps/*', 'standards/*', 'portal'],
    libs: ['packages/*'],
  },
  paths: {
    '@ifla/theme': './packages/theme/src',
    '@ifla/theme/*': './packages/theme/src/*',
    '@/*': './apps/admin/src/*',
  },
  // ... other configurations
};
```

### Path Mappings
JetBrains will automatically recognize path mappings from:
- `tsconfig.base.json` (TypeScript paths)
- `jetbrains.config.js` (additional mappings)

## Run Configurations

Pre-configured run configurations are available in `.idea/runConfigurations/`:

### Development Servers
- **Portal Dev**: Starts the main portal development server
- **Admin Dev (Turbo)**: Starts admin with Turbopack
- **ISBD Dev**: Starts ISBD documentation site
- **All Sites Dev**: Starts all sites in parallel

### Build Commands
- **Build All**: Builds all sites with Nx caching
- **Build Portal**: Builds only the portal
- **Build Admin**: Builds the admin app

### Testing
- **Test All**: Runs all tests with coverage
- **Test Affected**: Tests only changed files
- **E2E Tests**: Runs Playwright tests

### Utilities
- **Typecheck**: Runs TypeScript type checking
- **Lint**: Runs ESLint on affected files
- **Health Check**: Validates system configuration
- **Optimize Nx**: Runs performance optimization

## Code Style

### Pre-configured Settings
Code style settings are in `.idea/codeStyles/`:

```xml
<!-- Project.xml - Already configured -->
<code_scheme name="Project" version="173">
  <option name="LINE_SEPARATOR" value="&#xA;" />
  <JSCodeStyleSettings version="0">
    <option name="USE_SEMICOLON_AFTER_STATEMENT" value="false" />
    <option name="FORCE_SEMICOLON_STYLE" value="true" />
    <option name="USE_DOUBLE_QUOTES" value="false" />
    <option name="FORCE_QUOTE_STYLE" value="true" />
    <option name="SPACES_WITHIN_IMPORTS" value="true" />
  </JSCodeStyleSettings>
  <TypeScriptCodeStyleSettings version="0">
    <option name="USE_SEMICOLON_AFTER_STATEMENT" value="false" />
    <option name="FORCE_SEMICOLON_STYLE" value="true" />
    <option name="USE_DOUBLE_QUOTES" value="false" />
    <option name="FORCE_QUOTE_STYLE" value="true" />
  </TypeScriptCodeStyleSettings>
  <codeStyleSettings language="JavaScript">
    <option name="INDENT_SIZE" value="2" />
    <option name="TAB_SIZE" value="2" />
  </codeStyleSettings>
  <codeStyleSettings language="TypeScript">
    <option name="INDENT_SIZE" value="2" />
    <option name="TAB_SIZE" value="2" />
  </codeStyleSettings>
</code_scheme>
```

### Prettier Integration
1. **Settings → Languages & Frameworks → JavaScript → Prettier**
2. Prettier package: `{project}/node_modules/prettier`
3. Check **On 'Reformat Code' action**
4. Check **On save**

## File Templates

Custom file templates are available in `.idea/fileTemplates/`:

### React Component Template
**Name**: `React Component.tsx`
```typescript
import React from 'react'

interface ${NAME}Props {
  // Add props here
}

export const ${NAME}: React.FC<${NAME}Props> = (props) => {
  return (
    <div>
      {/* Component content */}
    </div>
  )
}
```

### Vitest Test Template
**Name**: `Vitest Test.test.ts`
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'

describe('${NAME}', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should ${TEST_DESCRIPTION}', () => {
    // Arrange
    
    // Act
    
    // Assert
    expect(true).toBe(true)
  })
})
```

### Nx Library Template
**Name**: `Nx Library Index.ts`
```typescript
// Public API for @ifla/${LIBRARY_NAME}
export * from './lib/${LIBRARY_NAME}'
```

## Inspections & Linting

### ESLint Configuration
1. **Settings → Languages & Frameworks → JavaScript → Code Quality Tools → ESLint**
2. Enable **Automatic ESLint configuration**
3. Run eslint fix on save: Check this option

### TypeScript Inspections
1. **Settings → Editor → Inspections → TypeScript**
2. Enable all TypeScript inspections
3. Set severity for "Implicit any" to **Error**

### Custom Inspections
Create project-specific inspections:
1. **Settings → Editor → Inspections**
2. Add inspection profile "IFLA Standards"
3. Configure:
   - Unused imports: **Warning**
   - Console statements: **Warning** (except in tests)
   - TODO comments: **Weak Warning**

## Performance Optimizations

### Memory Settings
Add to **Help → Edit Custom VM Options**:
```
-Xms2g
-Xmx8g
-XX:ReservedCodeCacheSize=512m
-XX:+UseG1GC
-XX:SoftRefLRUPolicyMSPerMB=50
-XX:CICompilerCount=2
-Djdk.attach.allowAttachSelf=true
-Djb.vmOptionsFile=/path/to/custom.vmoptions
```

### File Watchers
Configure in **Settings → Tools → File Watchers**:
1. **TypeScript Compiler** (disabled - we use Nx)
2. **Prettier** (optional - for non-JS/TS files)

### Exclude Directories
Already configured in project, but verify in **Settings → Directories**:
- Excluded: `node_modules`, `.nx`, `dist`, `build`, `.next`, `.docusaurus`
- Resource roots: `public`, `static`

### Editor Performance
1. **Settings → Editor → General → Editor Tabs**
   - Tab limit: 20
   - Close non-modified files first

2. **Settings → Editor → General → Code Folding**
   - Disable for better performance on large files

## Nx Integration

### Nx Console Plugin
1. Install **Nx Console** plugin
2. Access via **View → Tool Windows → Nx**
3. Features:
   - Visual task runner
   - Dependency graph viewer
   - Generator UI

### Nx Commands in Terminal
Configure terminal to use project scripts:
1. **Settings → Tools → Terminal**
2. Shell path: Keep default
3. Add to shell init:
   ```bash
   export NX_DAEMON=true
   export NX_PARALLEL=8
   ```

### Running Nx Tasks
Use run configurations or:
1. Right-click `project.json` → Run Nx Task
2. Use **Nx** tool window
3. Terminal: `pnpm nx [command]`

## Troubleshooting

### Common Issues

#### 1. Slow Indexing
- Exclude unnecessary directories
- Increase memory allocation
- Run **File → Invalidate Caches** if needed

#### 2. TypeScript Service Crashes
- Increase Node.js memory: `NODE_OPTIONS="--max-old-space-size=8192"`
- Use workspace TypeScript version
- Disable unused plugins

#### 3. Path Resolution Issues
- Restart TypeScript service
- Check `tsconfig.base.json` paths
- Verify `jetbrains.config.js` is detected

#### 4. ESLint Not Working
- Ensure ESLint plugin is enabled
- Check `.eslintrc.json` is detected
- Run `pnpm install` to ensure dependencies

### Performance Tips

1. **Use Scopes** (configured in `.idea/scopes/`)
   - `Source Code`: Focus on app code
   - `Tests`: Test files only
   - Use scopes in search/replace operations

2. **Keyboard Shortcuts**
   - `Cmd/Ctrl + Shift + F`: Search in project
   - `Cmd/Ctrl + Shift + R`: Replace in project
   - `Shift + Shift`: Search everywhere
   - `Cmd/Ctrl + E`: Recent files

3. **Live Templates**
   Create abbreviations for common code:
   - `rfc` → React Functional Component
   - `test` → Vitest test block
   - `desc` → Describe block

4. **Database Tools** (Ultimate only)
   - Configure data sources if using Supabase
   - Use database console for queries

### Debugging

#### Node.js Debugging
1. Create debug configuration
2. Set breakpoints in code
3. Run with debugger attached

#### Browser Debugging
1. Install browser extensions
2. Use **JavaScript Debug** configuration
3. Enable source maps

### Best Practices

1. **Commit Settings**
   - `.idea/` directory is partially tracked
   - Share run configurations
   - Don't commit personal preferences

2. **Team Consistency**
   - Use shared code style
   - Import/export settings
   - Document custom configurations

3. **Regular Maintenance**
   - Update plugins monthly
   - Clear caches quarterly
   - Review performance settings

## Additional Resources

- [JetBrains Nx Support](https://www.jetbrains.com/help/webstorm/nx.html)
- [WebStorm TypeScript](https://www.jetbrains.com/help/webstorm/typescript-support.html)
- [Performance Tuning Guide](https://www.jetbrains.com/help/webstorm/tuning-the-ide.html)

---

*For project-specific questions, check `CLAUDE.md` or run `pnpm health` for system validation.*