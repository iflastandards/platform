# Central Theme Navbar Components Solution

## Problem
The IFLA Standards monorepo needed to add a new `AuthDropdownNavbarItem` component to the central theme for use by all sites. The component was successfully added to the newtest site locally, but the central theme configuration wasn't working.

## Root Cause
The issue was that Docusaurus theme components require a specific structure and cannot be directly exported from a theme package. Docusaurus uses a theme swizzling mechanism that looks for theme components in the local site's `src/theme/` directory.

## Solution
The solution involves two parts:

### 1. Central Theme Package Setup
The `@ifla/theme` package now properly exports theme components:

**File: `packages/theme/src/theme/NavbarItem/AuthDropdownNavbarItem.tsx`**
- Contains the actual AuthDropdownNavbarItem React component
- Provides authentication dropdown functionality with GitHub login

**File: `packages/theme/src/theme/NavbarItem/ComponentTypes.tsx`**
- Registers the `custom-authDropdown` type with Docusaurus
- Maps the type to the AuthDropdownNavbarItem component

**Build Configuration:**
- Added theme components to `packages/theme/tsup.config.ts` entry points
- Added theme component exports to `packages/theme/package.json`
- Theme components are built and available in `packages/theme/dist/theme/NavbarItem/`

### 2. Site Implementation
Each site that wants to use the central theme components needs to create a local theme component that imports from the central theme:

**File: `standards/[site]/src/theme/NavbarItem/ComponentTypes.tsx`**
```tsx
import ComponentTypes from '@ifla/theme/theme/NavbarItem/ComponentTypes';

export default ComponentTypes;
```

**Site Configuration:**
In the site's `docusaurus.config.ts`, add the navbar item:
```tsx
navbar: {
  items: [
    // ... other items
    {
      type: 'custom-authDropdown',
      position: 'right',
    }
  ],
}
```

## How It Works
1. The central theme package (`@ifla/theme`) contains the actual component implementations
2. Sites create minimal "wrapper" theme components that import from the central theme
3. Docusaurus discovers the local theme components and uses them
4. The local theme components delegate to the central theme implementations
5. All sites get the same functionality while maintaining the central theme architecture

## Benefits
- ✅ Single source of truth for navbar components in the central theme
- ✅ All sites can use the same components with consistent behavior
- ✅ Easy to update components across all sites by updating the central theme
- ✅ Follows Docusaurus best practices for theme component organization
- ✅ Maintains the existing monorepo architecture

## Adding New Central Theme Components
To add new theme components to the central theme:

1. **Create the component** in `packages/theme/src/theme/[ComponentType]/`
2. **Add to build config** in `packages/theme/tsup.config.ts`
3. **Add exports** in `packages/theme/package.json`
4. **Rebuild the theme** with `nx build @ifla/theme`
5. **Create wrapper components** in sites that need the component

## Example: Adding to Another Site
To add the AuthDropdownNavbarItem to another site (e.g., ISBD):

1. Create `standards/isbd/src/theme/NavbarItem/ComponentTypes.tsx`:
   ```tsx
   import ComponentTypes from '@ifla/theme/theme/NavbarItem/ComponentTypes';

   export default ComponentTypes;
   ```

2. Add to `standards/isbd/docusaurus.config.ts`:
   ```tsx
   navbar: {
     items: [
       // ... existing items
       {
         type: 'custom-authDropdown',
         position: 'right',
       }
     ],
   }
   ```

3. Build and test: `nx build isbd`

## Verification

### Automated Test Suite
The navbar component integration is now validated by a comprehensive test suite located at:
`packages/theme/src/tests/config/navbarComponentIntegration.test.ts`

Run the test suite to verify the solution:
```bash
# Run the specific navbar component integration tests
nx test @ifla/theme --testNamePattern="Navbar Component Integration"

# Or run all config tests
nx test @ifla/theme --testNamePattern="config"

# Or run all theme tests
nx test @ifla/theme
```

### Manual Verification Script
The original test script is also available for manual verification:
```bash
node test_navbar_component.js
```

### Test Coverage
The automated test suite validates:
- ✅ Central theme components are built and available
- ✅ Package exports are properly configured
- ✅ Sites can import from central theme
- ✅ Configuration is properly set up
- ✅ Build integration works correctly
- ✅ All required files exist
- ✅ Theme component structure is correct

This solution successfully resolves the issue and provides a scalable approach for sharing theme components across all sites in the monorepo.
