import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

describe('Navbar Component Integration @unit', () => {
  describe('Central Theme Components', () => {
    it('should have AuthDropdownNavbarItem components in central theme', () => {
      const centralThemeComponentsPath = path.resolve('packages/theme/dist/theme/NavbarItem');

      expect(fs.existsSync(centralThemeComponentsPath)).toBe(true);

      const files = fs.readdirSync(centralThemeComponentsPath);
      expect(files).toContain('AuthDropdownNavbarItem.js');
      expect(files).toContain('AuthDropdownNavbarItem.mjs');
      expect(files).toContain('ComponentTypes.js');
      expect(files).toContain('ComponentTypes.mjs');
    });

    it('should export AuthDropdownNavbarItem from central theme package', () => {
      const packageJsonPath = path.resolve('packages/theme/package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

      expect(packageJson.exports).toHaveProperty('./theme/NavbarItem/AuthDropdownNavbarItem');
      expect(packageJson.exports).toHaveProperty('./theme/NavbarItem/ComponentTypes');
    });
  });

  describe('Site Integration', () => {
    it('should allow newtest site to import from central theme', () => {
      const newtestThemeComponent = path.resolve('standards/newtest/src/theme/NavbarItem/ComponentTypes.tsx');

      expect(fs.existsSync(newtestThemeComponent)).toBe(true);

      const content = fs.readFileSync(newtestThemeComponent, 'utf8');
      expect(content).toContain('@ifla/theme/theme/NavbarItem/ComponentTypes');
    });

    it('should have custom-authDropdown configured in newtest site', () => {
      const configPath = path.resolve('standards/newtest/docusaurus.config.ts');

      expect(fs.existsSync(configPath)).toBe(true);

      const content = fs.readFileSync(configPath, 'utf8');
      expect(content).toContain('custom-authDropdown');
    });
  });

  describe('Build Integration', () => {
    it('should build newtest site successfully with central theme components', () => {
      // Only run this test if we're not in CI or if explicitly requested
      if (process.env.CI && !process.env.TEST_BUILD_INTEGRATION) {
        console.log('Skipping build test in CI environment');
        return;
      }

      expect(() => {
        execSync('nx build newtest', { 
          stdio: 'pipe',
          timeout: 120000 // 2 minute timeout
        });
      }).not.toThrow();
    });

    it('should build theme package successfully', () => {
      // Only run this test if we're not in CI or if explicitly requested
      if (process.env.CI && !process.env.TEST_BUILD_INTEGRATION) {
        console.log('Skipping theme build test in CI environment');
        return;
      }

      expect(() => {
        execSync('nx build @ifla/theme', { 
          stdio: 'pipe',
          timeout: 60000 // 1 minute timeout
        });
      }).not.toThrow();
    });
  });

  describe('Theme Component Structure', () => {
    it('should have proper ComponentTypes structure in central theme', () => {
      const componentTypesPath = path.resolve('packages/theme/src/theme/NavbarItem/ComponentTypes.tsx');

      expect(fs.existsSync(componentTypesPath)).toBe(true);

      const content = fs.readFileSync(componentTypesPath, 'utf8');
      expect(content).toContain('custom-authDropdown');
      expect(content).toContain('AuthDropdownNavbarItem');
    });

    it('should have AuthDropdownNavbarItem component in central theme', () => {
      const authDropdownPath = path.resolve('packages/theme/src/theme/NavbarItem/AuthDropdownNavbarItem.tsx');

      expect(fs.existsSync(authDropdownPath)).toBe(true);

      const content = fs.readFileSync(authDropdownPath, 'utf8');
      expect(content).toContain('AuthDropdownNavbarItem');
      expect(content).toContain('React.FC');
    });
  });

  describe('Integration Validation', () => {
    it('should validate that all required files exist for proper integration', () => {
      const requiredFiles = [
        'packages/theme/src/theme/NavbarItem/AuthDropdownNavbarItem.tsx',
        'packages/theme/src/theme/NavbarItem/ComponentTypes.tsx',
        'standards/newtest/src/theme/NavbarItem/ComponentTypes.tsx',
        'standards/newtest/docusaurus.config.ts'
      ];

      requiredFiles.forEach(filePath => {
        const fullPath = path.resolve(filePath);
        expect(fs.existsSync(fullPath)).toBe(true);
      });
    });

    it('should validate that theme package exports are properly configured', () => {
      const tsupConfigPath = path.resolve('packages/theme/tsup.config.ts');

      expect(fs.existsSync(tsupConfigPath)).toBe(true);

      const content = fs.readFileSync(tsupConfigPath, 'utf8');
      expect(content).toContain('theme/NavbarItem/ComponentTypes');
      expect(content).toContain('theme/NavbarItem/AuthDropdownNavbarItem');
    });
  });
});
