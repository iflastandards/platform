import { describe, it, expect } from 'vitest';

// Import the port manager directly
const portManager = require('./utils/port-manager.js');
/**
 * @unit @utility @sites @low-priority
 */
describe('Port Manager Configuration', () => {
  describe('SITE_PORTS configuration', () => {
    it('should have all expected sites with correct ports', () => {
      const expectedSites = {
        portal: 3000,
        isbdm: 3001,
        lrm: 3002,
        frbr: 3003,
        isbd: 3004,
        muldicat: 3005,
        unimarc: 3006,
        admin: 3007,
        newtest: 3008,
        docs: 3030,
      };

      expect(portManager.SITE_PORTS).toEqual(expectedSites);
    });

    it('should have ALL_PORTS array with all port numbers', () => {
      const expectedPorts = [3000, 3001, 3002, 3003, 3004, 3005, 3006, 3007, 3008, 3030];
      
      expect(portManager.ALL_PORTS).toEqual(expect.arrayContaining(expectedPorts));
      expect(portManager.ALL_PORTS).toHaveLength(expectedPorts.length);
    });
  });

  describe('site port mapping logic', () => {
    it('should find correct port for known site', () => {
      // Test that the SITE_PORTS mapping works correctly
      expect(portManager.SITE_PORTS['isbd']).toBe(3004);
      expect(portManager.SITE_PORTS['portal']).toBe(3000);
      expect(portManager.SITE_PORTS['admin']).toBe(3007);
    });

    it('should return undefined for unknown site', () => {
      expect(portManager.SITE_PORTS['unknown-site']).toBeUndefined();
    });
  });

  describe('API structure', () => {
    it('should provide all required functions', () => {
      // Test that all expected functions exist
      expect(portManager.SITE_PORTS).toBeDefined();
      expect(portManager.killPort).toBeDefined();
      expect(portManager.killAllPorts).toBeDefined();
      expect(portManager.killSitePort).toBeDefined();
      expect(portManager.killPorts).toBeDefined();
      expect(portManager.waitForPortFree).toBeDefined();
    });

    it('should have functions as callable', () => {
      expect(typeof portManager.killPort).toBe('function');
      expect(typeof portManager.killAllPorts).toBe('function');
      expect(typeof portManager.killSitePort).toBe('function');
      expect(typeof portManager.killPorts).toBe('function');
      expect(typeof portManager.waitForPortFree).toBe('function');
    });
  });
});
