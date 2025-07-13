import { spawn, ChildProcess } from 'child_process';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface ServerConfig {
  name: string;
  command: string;
  args: string[];
  port: number;
  healthCheckUrl: string;
  cwd?: string;
  env?: Record<string, string>;
  startupTimeout?: number;
  shutdownTimeout?: number;
}

export class TestServerManager {
  private servers: Map<string, ChildProcess> = new Map();
  private serverConfigs: Map<string, ServerConfig> = new Map();

  constructor() {
    // Ensure cleanup on process exit
    process.on('exit', () => this.cleanup());
    process.on('SIGINT', () => this.cleanup());
    process.on('SIGTERM', () => this.cleanup());
  }

  /**
   * Register a server configuration
   */
  registerServer(config: ServerConfig): void {
    this.serverConfigs.set(config.name, config);
  }

  /**
   * Kill any existing processes that might conflict with the server
   */
  private async killExistingProcesses(serverName: string): Promise<void> {
    try {
      if (serverName === 'admin') {
        // Kill any existing nx dev admin processes
        spawn('pkill', ['-f', 'nx dev admin'], { stdio: 'ignore' });
        spawn('pkill', ['-f', 'next dev'], { stdio: 'ignore' });
      } else if (serverName === 'newtest') {
        // Kill any existing nx start newtest processes
        spawn('pkill', ['-f', 'nx start newtest'], { stdio: 'ignore' });
        spawn('pkill', ['-f', 'docusaurus start'], { stdio: 'ignore' });
      }

      // Wait a moment for processes to be killed
      await sleep(2000);
    } catch (_error) {
      // Ignore errors - processes might not exist
      console.log(
        `Note: Could not kill existing ${serverName} processes (this is usually fine)`,
      );
    }
  }

  /**
   * Start a server and wait for it to be ready
   */
  async startServer(serverName: string): Promise<void> {
    const config = this.serverConfigs.get(serverName);
    if (!config) {
      throw new Error(`Server configuration not found: ${serverName}`);
    }

    if (this.servers.has(serverName)) {
      console.log(`Server ${serverName} is already running`);
      return;
    }

    // Kill any existing processes that might conflict
    await this.killExistingProcesses(serverName);

    console.log(`Starting ${serverName} server...`);

    const serverProcess = spawn(config.command, config.args, {
      cwd: config.cwd || process.cwd(),
      env: { ...process.env, ...config.env },
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: false,
    });

    this.servers.set(serverName, serverProcess);

    let serverReady = false;

    // Handle server output for debugging and ready detection
    serverProcess.stdout?.on('data', (data) => {
      const text = data.toString();
      if (process.env.TEST_SERVER_DEBUG) {
        console.log(`[${serverName}] ${text}`);
      }

      // Look for server ready indicators
      if (
        text.includes('Ready in') ||
        text.includes('✓ Ready') ||
        text.includes('Local:') ||
        text.includes('localhost:') ||
        text.includes('serving at')
      ) {
        serverReady = true;
      }
    });

    serverProcess.stderr?.on('data', (data) => {
      if (process.env.TEST_SERVER_DEBUG) {
        console.error(`[${serverName}] ${data.toString()}`);
      }
    });

    serverProcess.on('error', (error) => {
      console.error(`Server ${serverName} error:`, error);
      this.servers.delete(serverName);
    });

    serverProcess.on('exit', (code, signal) => {
      console.log(
        `Server ${serverName} exited with code ${code}, signal ${signal}`,
      );
      this.servers.delete(serverName);
    });

    // Wait for server to be ready using both output detection and health checks
    await this.waitForServerReady(config, () => serverReady);
    console.log(`Server ${serverName} is ready`);
  }

  /**
   * Stop a specific server
   */
  async stopServer(serverName: string): Promise<void> {
    const serverProcess = this.servers.get(serverName);
    const config = this.serverConfigs.get(serverName);

    if (!serverProcess || !config) {
      return;
    }

    console.log(`Stopping ${serverName} server...`);

    return new Promise<void>((resolve) => {
      const timeoutId = setTimeout(() => {
        console.log(`Force killing ${serverName} server`);
        serverProcess.kill('SIGKILL');
        resolve();
      }, config.shutdownTimeout || 5000);

      serverProcess.on('exit', () => {
        clearTimeout(timeoutId);
        this.servers.delete(serverName);
        console.log(`Server ${serverName} stopped`);
        resolve();
      });

      // Try graceful shutdown first
      serverProcess.kill('SIGTERM');
    });
  }

  /**
   * Start multiple servers in parallel
   */
  async startServers(serverNames: string[]): Promise<void> {
    const startPromises = serverNames.map((name) => this.startServer(name));
    await Promise.all(startPromises);
  }

  /**
   * Stop all running servers
   */
  async stopAllServers(): Promise<void> {
    const serverNames = Array.from(this.servers.keys());
    const stopPromises = serverNames.map((name) => this.stopServer(name));
    await Promise.all(stopPromises);
  }

  /**
   * Check if a server is running
   */
  isServerRunning(serverName: string): boolean {
    const serverProcess = this.servers.get(serverName);
    return serverProcess !== undefined && !serverProcess.killed;
  }

  /**
   * Get the URL for a server
   */
  getServerUrl(serverName: string): string {
    const config = this.serverConfigs.get(serverName);
    if (!config) {
      throw new Error(`Server configuration not found: ${serverName}`);
    }
    return `http://localhost:${config.port}`;
  }

  /**
   * Wait for server to respond to health checks
   */
  private async waitForServerReady(
    config: ServerConfig,
    readyCheck?: () => boolean,
  ): Promise<void> {
    const startTime = Date.now();
    const timeout = config.startupTimeout || 30000; // 30 seconds default

    console.log(
      `Waiting for ${config.name} server at ${config.healthCheckUrl}...`,
    );

    while (Date.now() - startTime < timeout) {
      // If we have a ready check function (from stdout parsing), use it
      if (readyCheck && readyCheck()) {
        console.log(`${config.name} server is ready (detected from output)!`);
        return;
      }

      // Also try health check URL
      try {
        const response = await fetch(config.healthCheckUrl);
        console.log(
          `Health check for ${config.name}: status ${response.status}`,
        );
        if (response.status < 500) {
          // Server is responding (even if with auth errors, etc.)
          console.log(`${config.name} server is ready (health check passed)!`);
          return;
        }
      } catch (error) {
        console.log(`Health check for ${config.name} failed: ${error.message}`);
        // Server not ready yet, continue waiting
      }

      await sleep(1000); // Wait 1 second before next check
    }

    throw new Error(
      `Server ${config.name} failed to start within ${timeout}ms`,
    );
  }

  /**
   * Cleanup all servers (called on process exit)
   */
  private cleanup(): void {
    for (const [name, process] of this.servers) {
      console.log(`Cleaning up server: ${name}`);
      try {
        process.kill('SIGKILL');
      } catch (_error) {
        // Ignore errors during cleanup
      }
    }
    this.servers.clear();
  }
}

// Singleton instance for use across tests
export const testServerManager = new TestServerManager();

// Pre-configured server configurations
export const SERVER_CONFIGS = {
  ADMIN: {
    name: 'admin',
    command: 'pnpm',
    args: ['nx', 'dev', 'admin'],
    port: 3007,
    healthCheckUrl: 'http://localhost:3007/admin',
    startupTimeout: 45000, // Next.js can take a while to start
    shutdownTimeout: 10000,
    cwd: '/Users/jonphipps/Code/IFLA/standards-dev',
    env: {
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
        process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || 'pk_test_fake',
      CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY || 'sk_test_fake',
      NEXT_PUBLIC_CLERK_SIGN_IN_URL: '/admin/sign-in',
      NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: '/admin/dashboard',
      NEXT_PUBLIC_CERBOS_PDP_URL: 'http://localhost:3593',
      PATH: process.env.PATH, // Use current PATH to find correct node
    },
  } as ServerConfig,

  PORTAL: {
    name: 'portal',
    command: 'pnpm',
    args: ['nx', 'start', 'portal'],
    port: 3000,
    healthCheckUrl: 'http://localhost:3000',
    startupTimeout: 30000,
    shutdownTimeout: 5000,
    cwd: '/Users/jonphipps/Code/IFLA/standards-dev',
    env: {
      PATH: process.env.PATH, // Use current PATH
      NODE_ENV: 'development',
    },
  } as ServerConfig,

  NEWTEST: {
    name: 'newtest',
    command: 'pnpm',
    args: ['nx', 'start', 'newtest', '--no-open'],
    port: 3008,
    healthCheckUrl: 'http://localhost:3008',
    startupTimeout: 30000,
    shutdownTimeout: 5000,
    cwd: '/Users/jonphipps/Code/IFLA/standards-dev',
    env: {
      PATH: process.env.PATH, // Use current PATH
      NODE_ENV: 'development',
      BROWSER: 'none', // Disable browser opening
    },
  } as ServerConfig,
} as const;

// Register default server configurations
Object.values(SERVER_CONFIGS).forEach((config) => {
  testServerManager.registerServer(config);
});
