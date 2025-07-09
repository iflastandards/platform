import { describe, it, expect } from 'vitest';
import { spawn } from 'child_process';

describe('Simple Spawn Test', () => {
  it('should be able to run pnpm command', async () => {
    console.log('Testing basic pnpm command...');

    const result = await new Promise<{ code: number | null; output: string }>(
      (resolve) => {
        const process = spawn('pnpm', ['--version'], {
          cwd: '/Users/jonphipps/Code/IFLA/standards-dev',
          stdio: ['ignore', 'pipe', 'pipe'],
        });

        let output = '';

        process.stdout?.on('data', (data) => {
          output += data.toString();
        });

        process.stderr?.on('data', (data) => {
          output += data.toString();
        });

        process.on('close', (code) => {
          resolve({ code, output });
        });

        process.on('error', (error) => {
          console.error('Process error:', error);
          resolve({ code: -1, output: error.message });
        });
      },
    );

    console.log('pnpm version result:', result);
    expect(result.code).toBe(0);
    expect(result.output).toContain('.');
  });

  it('should be able to run nx command', async () => {
    console.log('Testing nx command...');

    const result = await new Promise<{ code: number | null; output: string }>(
      (resolve) => {
        const process = spawn('pnpm', ['nx', '--version'], {
          cwd: '/Users/jonphipps/Code/IFLA/standards-dev',
          stdio: ['ignore', 'pipe', 'pipe'],
        });

        let output = '';

        process.stdout?.on('data', (data) => {
          output += data.toString();
        });

        process.stderr?.on('data', (data) => {
          output += data.toString();
        });

        process.on('close', (code) => {
          resolve({ code, output });
        });

        process.on('error', (error) => {
          console.error('Process error:', error);
          resolve({ code: -1, output: error.message });
        });
      },
    );

    console.log('nx version result:', result);
    expect(result.code).toBe(0);
  });
});
