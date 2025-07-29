import { describe, it, expect } from 'vitest';

// Import the port manager directly
const portManager = require('./utils/port-manager.js');

describe('Port Manager CLI Detection/Kill Logic', () => {
  // Test the data structures and configuration
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
        newtest: 3008
      };

      expect(portManager.SITE_PORTS).toEqual(expectedSites);
    });

    it('should have ALL_PORTS array with all port numbers', () => {
      const expectedPorts = [3000, 3001, 2002, 3003, 3004, 3005, 3006, 3007, 3008];
      
      expect(portManager.ALL_PORTS).toEqual(expect.arrayContaining([3000, 3001, 3002, 3003, 3004, 3005, 3006, 3007, 3008]));
      expect(portManager.ALL_PORTS).toHaveLength(9);
    });
  });

  describe('killSitePort function', () => {
    it('should return false for unknown site', async () => {
      const result = await portManager.killSitePort('unknown-site', false);
      expect(result).toBe(false);
    });

    it('should find correct port for known site', () => {
      // Test that the SITE_PORTS mapping works correctly
      expect(portManager.SITE_PORTS['isbd']).toBe(3004);
      expect(portManager.SITE_PORTS['portal']).toBe(3000);
      expect(portManager.SITE_PORTS['admin']).toBe(3007);
    });
  });

  // Test actual port operations (these will use real system calls but should be safe)
  describe('killPort function - integration test', () => {
    it('should successfully handle free ports without throwing', async () => {
      // Test with a port that should be free (using high port number)
      const result = await portManager.killPort(39999, false);
      expect(typeof result).toBe('boolean');
    });
  });

  describe('killPorts function - integration test', () => {
    it('should handle multiple free ports', async () => {
      // Test with ports that should be free
      const result = await portManager.killPorts([39998, 39999], false);
      expect(typeof result).toBe('boolean');
    });
  });

  describe('waitForPortFree function - integration test', () => {
    it('should quickly resolve true for free ports', async () => {
      const startTime = Date.now();
      const result = await portManager.waitForPortFree(39999, 2000, false);
      const endTime = Date.now();
      
      expect(result).toBe(true);
      // Should resolve quickly for free ports
      expect(endTime - startTime).toBeLessThan(1000);
    });
  });

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
        newtest: 3008
      };

      expect(portManager.SITE_PORTS).toEqual(expectedSites);
    });

    it('should have ALL_PORTS array with all port numbers', () => {
      const expectedPorts = [3000, 3001, 3002, 3003, 3004, 3005, 3006, 3007, 3008];
      
      expect(portManager.ALL_PORTS).toEqual(expect.arrayContaining(expectedPorts));
      expect(portManager.ALL_PORTS).toHaveLength(expectedPorts.length);
    });
  });

  describe('CLI interface integration', () => {
    it('should provide correct CLI help output structure', () => {
      // This tests that the CLI interface has the expected structure
      // We can't easily test the actual CLI execution, but we can test the data structures
      
      expect(portManager.SITE_PORTS).toBeDefined();
      expect(portManager.killPort).toBeDefined();
      expect(portManager.killAllPorts).toBeDefined();
      expect(portManager.killSitePort).toBeDefined();
    });
  });
});
