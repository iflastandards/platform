import { describe, it } from 'vitest';
import { spawn } from 'child_process';

describe('Spawn Test @unit', () => {
  it('should be able to spawn admin server process', async () => {
    console.log('Testing process spawn...');

    const serverProcess = spawn('pnpm', ['nx', 'dev', 'admin'], {
      cwd: '/Users/jonphipps/Code/IFLA/standards-dev',
      env: {
        ...process.env,
        NEXTAUTH_URL: 'http://localhost:3007',
        NEXTAUTH_SECRET: 'test-secret',
        GITHUB_ID: 'test-id',
        GITHUB_SECRET: 'test-secret',
        NEXT_PUBLIC_CERBOS_PDP_URL: 'http://localhost:3593',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let output = '';
    let errorOutput = '';

    serverProcess.stdout?.on('data', (data) => {
      const text = data.toString();
      output += text;
      console.log('[STDOUT]', text);
    });

    serverProcess.stderr?.on('data', (data) => {
      const text = data.toString();
      errorOutput += text;
      console.log('[STDERR]', text);
    });

    // Wait for server to start or fail
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        serverProcess.kill('SIGKILL');
        reject(new Error('Server startup timeout'));
      }, 30000);

      serverProcess.on('error', (error) => {
        clearTimeout(timeout);
        console.error('Process error:', error);
        reject(error);
      });

      serverProcess.on('exit', (code, signal) => {
        clearTimeout(timeout);
        console.log(`Process exited with code ${code}, signal ${signal}`);
        if (code !== 0 && code !== null) {
          reject(new Error(`Server exited with code ${code}`));
        } else {
          resolve();
        }
      });

      // Look for success indicators in output
      serverProcess.stdout?.on('data', (data) => {
        if (data.toString().includes('Ready in')) {
          clearTimeout(timeout);
          console.log('Server is ready!');
          serverProcess.kill('SIGTERM');
          resolve();
        }
      });
    });

    console.log('Final output:', output);
    console.log('Final error output:', errorOutput);
  }, 60000);
});
