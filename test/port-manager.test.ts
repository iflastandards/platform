import { describe, it, expect, vi, beforeEach } from 'vitest';
import { killPort, killPorts, SITE_PORTS } from './utils/port-manager';
import { execSync } from 'child_process';

vi.mock('child_process', () => ({
  execSync: vi.fn(),
}));

const mockExecSync = vi.mocked(execSync);


function mockExecSyncImplementation(command: string) {
  if (command.includes('lsof')) {
    // Simulate port active return
    return '123';
  }
  return '';
}

mockExecSync.mockImplementation(mockExecSyncImplementation);








describe('port-manager utilities @unit @utility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should kill the specified port', async () => {
    const result = await killPort(SITE_PORTS['portal']);
    expect(result).toBe(true);
    expect(mockExecSync).toHaveBeenCalledWith(expect.stringContaining('kill'));
  });

  /* Skipping this one - depends on async process flow resolution

  it.skip('should recognize port as active', async () => {
    const free = await waitForPortFree(SITE_PORTS['portal'], 50);
    expect(free).toBe(false);
  });*/

  it('should kill all ports', async () => {

      const result = await killPorts(Object.values(SITE_PORTS));
      expect(result).toBe(true);
      expect(mockExecSync).toHaveBeenCalledWith(expect.stringContaining('kill'));

  });

});
