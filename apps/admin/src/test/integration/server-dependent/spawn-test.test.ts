import { describe, it } from 'vitest';
import { spawn } from 'child_process';

describe('Spawn Test @integration @admin @api @low-priority', () => {
  it('should be able to spawn admin server process', async () => {
    console.log('Testing process spawn...');

    const serverProcess = spawn('pnpm', ['nx', 'dev', 'admin'], {
      cwd: '/Users/jonphipps/Code/IFLA/standards-dev',
      env: {
        ...process.env,
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'test-pk',
        CLERK_SECRET_KEY: 'test-sk',
        NEXT_PUBLIC_CLERK_SIGN_IN_URL: '/admin/sign-in',
        NEXT_PUBLIC_CLERK_SIGN_UP_URL: '/admin/sign-up',
        NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL: '/admin/api/auth/callback',
        NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL: '/admin/api/auth/callback',
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
