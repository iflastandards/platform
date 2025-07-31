import { describe, it } from 'vitest';
import { spawn } from 'child_process';

describe('Admin Startup Test @unit', () => {
  it('should be able to start admin server with detailed logging', async () => {
    console.log('Starting admin server with detailed logging...');

    const serverProcess = spawn('pnpm', ['nx', 'dev', 'admin'], {
      cwd: '/Users/jonphipps/Code/IFLA/standards-dev',
      env: {
        ...process.env,
        NEXTAUTH_URL: 'http://localhost:3007',
        NEXTAUTH_SECRET: 'test-secret-for-integration-tests',
        GITHUB_ID: 'test-github-id',
        GITHUB_SECRET: 'test-github-secret',
        NEXT_PUBLIC_CERBOS_PDP_URL: 'http://localhost:3593',
        NODE_ENV: 'development',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdoutData = '';
    let stderrData = '';
    let serverReady = false;

    serverProcess.stdout?.on('data', (data) => {
      const text = data.toString();
      stdoutData += text;
      console.log('[STDOUT]', text.trim());

      // Look for Next.js ready indicators
      if (text.includes('Ready in') || text.includes('✓ Ready')) {
        console.log('🎉 Server is ready!');
        serverReady = true;
      }
    });

    serverProcess.stderr?.on('data', (data) => {
      const text = data.toString();
      stderrData += text;
      console.log('[STDERR]', text.trim());
    });

    serverProcess.on('error', (error) => {
      console.error('❌ Process error:', error);
    });

    serverProcess.on('exit', (code, signal) => {
      console.log(`📋 Process exited with code ${code}, signal ${signal}`);
    });

    // Wait for server to start or timeout
    const result = await new Promise<{ success: boolean; reason: string }>(
      (resolve) => {
        const timeout = setTimeout(() => {
          console.log('⏰ Timeout reached, killing server...');
          serverProcess.kill('SIGKILL');
          resolve({
            success: false,
            reason: `Timeout after 20s. STDOUT: ${stdoutData.slice(-500)} STDERR: ${stderrData.slice(-500)}`,
          });
        }, 20000);

        // Check for ready state
        const readyCheck = setInterval(() => {
          if (serverReady) {
            clearTimeout(timeout);
            clearInterval(readyCheck);
            console.log('✅ Server startup successful!');

            // Test health check
            fetch('http://localhost:3007')
              .then((response) => {
                console.log(`🏥 Health check: ${response.status}`);
                serverProcess.kill('SIGTERM');
                resolve({
                  success: true,
                  reason: 'Server started and responded',
                });
              })
              .catch((error) => {
                console.log(`🏥 Health check failed: ${error.message}`);
                serverProcess.kill('SIGTERM');
                resolve({
                  success: false,
                  reason: `Health check failed: ${error.message}`,
                });
              });
          }
        }, 1000);

        serverProcess.on('exit', (code) => {
          clearTimeout(timeout);
          clearInterval(readyCheck);
          if (!serverReady) {
            resolve({
              success: false,
              reason: `Server exited early with code ${code}. STDOUT: ${stdoutData} STDERR: ${stderrData}`,
            });
          }
        });
      },
    );

    console.log('📊 Final result:', result);

    if (!result.success) {
      console.log('📝 Full stdout:', stdoutData);
      console.log('📝 Full stderr:', stderrData);
      throw new Error(result.reason);
    }
  }, 60000);
});
