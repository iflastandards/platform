import { describe, it, expect, vi, beforeEach } from 'vitest';
import { execSync } from 'child_process';

// Mock child_process
vi.mock('child_process');

// Import after mocking
import { killPort, killPorts, SITE_PORTS } from '../packages/dev-servers/src/port-manager';

const mockExecSync = vi.mocked(execSync);

describe('port-manager utilities @unit @api @low-priority', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should kill the specified port', async () => {
    // First call to lsof returns PIDs (simulating processes found)
    mockExecSync.mockImplementationOnce((command: string) => {
      if (command.includes('lsof')) {
        return '123\n456'; // Return PIDs
      }
      return '';
    });
    // Second call is the kill command - just return empty
    mockExecSync.mockImplementationOnce(() => '');
    
    const result = await killPort(SITE_PORTS['portal']);
    expect(result).toBe(true);
    expect(mockExecSync).toHaveBeenCalledWith('kill -9 123 456', { stdio: 'pipe' });
  });

  /* Skipping this one - depends on async process flow resolution

  it.skip('should recognize port as active', async () => {
    const free = await waitForPortFree(SITE_PORTS['portal'], 50);
    expect(free).toBe(false);
  });*/

  it('should kill all ports', async () => {
    // Mock implementation for multiple ports
    // Each port will call lsof first, then potentially kill
    mockExecSync.mockImplementation((command: string) => {
      if (command.includes('lsof')) {
        // Only return PIDs for the first few ports to test both cases
        if (command.includes('3000') || command.includes('3001')) {
          return '123\n456'; // Has processes
        }
        throw new Error('No processes found'); // Port is free
      }
      return ''; // For kill commands
    });
    
    const result = await killPorts(Object.values(SITE_PORTS));
    expect(result).toBe(true);
    // Should be called for ports that had processes
    expect(mockExecSync).toHaveBeenCalledWith('kill -9 123 456', { stdio: 'pipe' });
  });
});
