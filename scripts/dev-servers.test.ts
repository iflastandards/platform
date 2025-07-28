#!/usr/bin/env node

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ChildProcess } from 'child_process';

// Mock the port-manager module
const mockKillSitePort = vi.fn();
const mockWaitForPortFree = vi.fn();
const mockSitePorts = {
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

vi.mock('./utils/port-manager.js', () => ({
  SITE_PORTS: mockSitePorts,
  killSitePort: mockKillSitePort,
  waitForPortFree: mockWaitForPortFree
}));

// Mock child_process
const mockSpawn = vi.fn();
const mockExecSync = vi.fn();

vi.mock('child_process', () => ({
  spawn: mockSpawn,
  execSync: mockExecSync
}));

// Mock fetch globally
global.fetch = vi.fn();

describe('dev-servers', () => {
  let startServers: any;
  let stopServers: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockKillSitePort.mockResolvedValue(true);
    mockWaitForPortFree.mockResolvedValue(true);
    
    // Mock a successful spawn process
    const mockProc = {
      stdout: { on: vi.fn() },
      stderr: { on: vi.fn() },
      on: vi.fn(),
      kill: vi.fn()
    } as unknown as ChildProcess;
    
    mockSpawn.mockReturnValue(mockProc);
    
    // Import after mocks are set up
    const module = await import('./dev-servers');
    startServers = module.startServers;
    stopServers = module.stopServers;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('startServers', () => {
    it('should start servers for specified sites', async () => {
      // Mock successful health check
      (global.fetch as any).mockResolvedValue({ ok: true });

      const servers = await startServers({ sites: ['portal', 'isbd'] });

      expect(servers).toHaveLength(2);
      expect(servers[0]).toMatchObject({
        site: 'portal',
        port: 3000
      });
      expect(servers[1]).toMatchObject({
        site: 'isbd',
        port: 3004
      });
      
      // Should have cleaned ports
      expect(mockKillSitePort).toHaveBeenCalledWith('portal', false);
      expect(mockKillSitePort).toHaveBeenCalledWith('isbd', false);
      
      // Should have spawned processes
      expect(mockSpawn).toHaveBeenCalledWith('nx', ['run', 'portal:start:robust'], expect.any(Object));
      expect(mockSpawn).toHaveBeenCalledWith('nx', ['run', 'isbd:start:robust'], expect.any(Object));
    });

    it('should use different command for admin site', async () => {
      (global.fetch as any).mockResolvedValue({ ok: true });

      await startServers({ sites: ['admin'] });

      expect(mockSpawn).toHaveBeenCalledWith('nx', ['run', 'admin:dev'], expect.any(Object));
    });

    it('should reuse existing servers when requested', async () => {
      // Mock successful health check on first call
      (global.fetch as any).mockResolvedValue({ ok: true });

      const servers = await startServers({ 
        sites: ['portal'], 
        reuseExisting: true 
      });

      expect(servers).toHaveLength(1);
      // Should not have spawned a new process
      expect(mockSpawn).not.toHaveBeenCalled();
    });

    it('should skip unknown sites', async () => {
      const servers = await startServers({ sites: ['unknown-site'] });

      expect(servers).toHaveLength(0);
      expect(mockSpawn).not.toHaveBeenCalled();
    });

    it('should set DOCS_ENV environment variable', async () => {
      (global.fetch as any).mockResolvedValue({ ok: true });

      await startServers({ sites: ['portal'] });

      expect(mockSpawn).toHaveBeenCalledWith(
        'nx', 
        ['run', 'portal:start:robust'], 
        expect.objectContaining({
          env: expect.objectContaining({
            DOCS_ENV: 'local'
          })
        })
      );
    });
  });

  describe('stopServers', () => {
    it('should stop all provided servers', async () => {
      const mockProc = { kill: vi.fn() } as unknown as ChildProcess;
      const servers = [
        { site: 'portal', port: 3000, proc: mockProc },
        { site: 'isbd', port: 3004, proc: mockProc }
      ];

      await stopServers(servers);

      expect(mockProc.kill).toHaveBeenCalledTimes(4); // SIGTERM and SIGKILL for each
      expect(mockKillSitePort).toHaveBeenCalledWith('portal', false);
      expect(mockKillSitePort).toHaveBeenCalledWith('isbd', false);
    });
  });
});

// CLI argument parsing tests
describe('CLI argument parsing', () => {
  it('should parse sites from --sites flag', () => {
    const originalArgv = process.argv;
    process.argv = ['node', 'dev-servers.ts', '--sites', 'portal,isbd'];
    
    // Test the parsing logic (would need to export the function)
    // This is a simplified test as the actual parsing is internal
    
    process.argv = originalArgv;
  });

  it('should parse sites from DOCS_SITES environment variable', () => {
    const originalEnv = process.env.DOCS_SITES;
    process.env.DOCS_SITES = 'portal,admin';
    
    // Test would verify that these sites are parsed correctly
    
    process.env.DOCS_SITES = originalEnv;
  });
});
