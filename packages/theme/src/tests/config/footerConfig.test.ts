import { describe, it, expect } from 'vitest';
import { createStandardFooter } from '../../config/footerConfig';
import type { Environment, SiteKey } from '../../config/siteConfig';

describe('Footer Management Link @integration @navigation @critical', () => {
  const testSites: SiteKey[] = ['portal', 'isbd', 'ISBDM', 'LRM', 'FRBR', 'muldicat', 'unimarc'];

  describe('Local environment', () => {
    const env: Environment = 'local';

    testSites.forEach((siteKey) => {
      it(`should generate correct management link for ${siteKey}`, () => {
        const footer = createStandardFooter(env, siteKey);
        const managementLink = footer.links[0].items.find(
          (item) => item.label === 'Management'
        );

        expect(managementLink).toBeDefined();
        expect(managementLink?.href).toBe(
          `http://localhost:3007/dashboard/${siteKey}`
        );
      });
    });
  });

  describe('Preview environment', () => {
    const env: Environment = 'preview';

    testSites.forEach((siteKey) => {
      it(`should generate correct management link for ${siteKey}`, () => {
        const footer = createStandardFooter(env, siteKey);
        const managementLink = footer.links[0].items.find(
          (item) => item.label === 'Management'
        );

        expect(managementLink).toBeDefined();
        expect(managementLink?.href).toBe(
          `https://admin-iflastandards-preview.onrender.com/dashboard/${siteKey}`
        );
      });
    });
  });

  describe('Production environment', () => {
    const env: Environment = 'production';

    testSites.forEach((siteKey) => {
      it(`should generate correct management link for ${siteKey}`, () => {
        const footer = createStandardFooter(env, siteKey);
        const managementLink = footer.links[0].items.find(
          (item) => item.label === 'Management'
        );

        expect(managementLink).toBeDefined();
        expect(managementLink?.href).toBe(
          `https://admin.iflastandards.info/dashboard/${siteKey}`
        );
      });
    });
  });

  describe('Footer structure', () => {
    it('should have Management link in Resources section', () => {
      const footer = createStandardFooter('local', 'portal');
      
      // Check that Resources section exists
      const resourcesSection = footer.links.find((section) => section.title === 'Resources');
      expect(resourcesSection).toBeDefined();
      
      // Check that Management link exists in Resources section
      const managementLink = resourcesSection?.items.find(
        (item) => item.label === 'Management'
      );
      expect(managementLink).toBeDefined();
      expect(managementLink).toHaveProperty('href');
    });

    it('should ensure Management link uses https for non-local environments', () => {
      const previewFooter = createStandardFooter('preview', 'isbd');
      const productionFooter = createStandardFooter('production', 'isbd');
      
      const previewLink = previewFooter.links[0].items.find(
        (item) => item.label === 'Management'
      )?.href;
      const productionLink = productionFooter.links[0].items.find(
        (item) => item.label === 'Management'
      )?.href;
      
      expect(previewLink).toMatch(/^https:\/\//);
      expect(productionLink).toMatch(/^https:\/\//);
    });

    it('should use http for local environment', () => {
      const localFooter = createStandardFooter('local', 'isbd');
      
      const localLink = localFooter.links[0].items.find(
        (item) => item.label === 'Management'
      )?.href;
      
      expect(localLink).toMatch(/^http:\/\/localhost/);
    });
  });

  describe('URL format validation', () => {
    it('should not have trailing slashes in management URLs', () => {
      const environments: Environment[] = ['local', 'preview', 'production'];
      
      environments.forEach((env) => {
        testSites.forEach((siteKey) => {
          const footer = createStandardFooter(env, siteKey);
          const managementLink = footer.links[0].items.find(
            (item) => item.label === 'Management'
          )?.href;
          
          expect(managementLink).toBeDefined();
          expect(managementLink).not.toMatch(/\/$/); // Should not end with /
          expect(managementLink).toContain(`/dashboard/${siteKey}`);
        });
      });
    });

    it('should handle special site keys correctly', () => {
      const specialSites: SiteKey[] = ['ISBDM', 'LRM', 'FRBR']; // Uppercase site keys
      
      specialSites.forEach((siteKey) => {
        const footer = createStandardFooter('preview', siteKey);
        const managementLink = footer.links[0].items.find(
          (item) => item.label === 'Management'
        )?.href;
        
        expect(managementLink).toBe(
          `https://admin-iflastandards-preview.onrender.com/dashboard/${siteKey}`
        );
        // Site key should maintain its case
        expect(managementLink).toContain(`/${siteKey}`);
      });
    });
  });
});