import { spawn, SpawnOptions } from 'child_process';
import { BrowserType } from './types';

/**
 * Browser configuration and detection utility
 * 
 * This module provides functionality to:
 * - Detect browser preferences from command line flags or environment variables
 * - Launch specific browsers cross-platform, especially Chrome/Chromium
 * - Handle fallbacks when requested browsers are not available
 * - Provide error handling and logging for browser operations
 */

/**
 * Browser executable names for different platforms
 */
const CHROME_EXECUTABLES = [
  'google-chrome',        // Linux (preferred)
  'google-chrome-stable', // Linux alternative
  'chromium',            // Linux fallback
  'chromium-browser',    // Ubuntu/Debian
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', // macOS (full path)
  'chrome',              // Windows/PATH
  'chrome.exe',          // Windows explicit
];

/**
 * Environment variable for browser selection
 */
const BROWSER_ENV_VAR = 'BROWSER';

/**
 * Result of browser detection
 */
export interface BrowserDetectionResult {
  /** The detected browser type */
  browser: BrowserType;
  /** Source of the browser preference */
  source: 'flag' | 'env' | 'default';
  /** Original value that was detected */
  originalValue?: string;
}

/**
 * Options for launching a browser
 */
export interface BrowserLaunchOptions {
  /** URL to open */
  url?: string;
  /** Additional arguments to pass to the browser */
  args?: string[];
  /** Whether to wait for the browser process to exit */
  wait?: boolean;
  /** Custom environment variables */
  env?: Record<string, string>;
}

/**
 * Browser launch result
 */
export interface BrowserLaunchResult {
  /** Whether the launch was successful */
  success: boolean;
  /** The executable that was used */
  executable?: string;
  /** Process ID if available */
  pid?: number;
  /** Error message if launch failed */
  error?: string;
  /** Any fallback information */
  fallback?: {
    attempted: string[];
    reason: string;
  };
}

/**
 * Detects browser preference from command line arguments or environment variables
 * 
 * Checks in the following order:
 * 1. --browser flag in process.argv
 * 2. BROWSER environment variable
 * 3. Defaults to 'auto'
 * 
 * @returns Browser detection result
 */
export function detectBrowser(): BrowserDetectionResult {
  // Check command line arguments for --browser flag
  const args = process.argv;
  const browserFlagIndex = args.findIndex(arg => arg.startsWith('--browser'));
  
  if (browserFlagIndex !== -1) {
    const flag = args[browserFlagIndex];
    let browserValue: string;
    
    if (flag.includes('=')) {
      // --browser=chrome format
      browserValue = flag.split('=')[1];
    } else if (browserFlagIndex + 1 < args.length) {
      // --browser chrome format
      browserValue = args[browserFlagIndex + 1];
    } else {
      // --browser with no value, default to chrome
      browserValue = 'chrome';
    }
    
    const browser = normalizeBrowserType(browserValue);
    return {
      browser,
      source: 'flag',
      originalValue: browserValue
    };
  }
  
  // Check environment variable
  const envBrowser = process.env[BROWSER_ENV_VAR];
  if (envBrowser) {
    const browser = normalizeBrowserType(envBrowser);
    return {
      browser,
      source: 'env',
      originalValue: envBrowser
    };
  }
  
  // Default to auto
  return {
    browser: 'auto',
    source: 'default'
  };
}

/**
 * Normalizes browser type string to supported BrowserType
 */
function normalizeBrowserType(value: string): BrowserType {
  const normalized = value.toLowerCase().trim();
  
  switch (normalized) {
    case 'chrome':
    case 'google-chrome':
    case 'chromium':
      return 'chrome';
    case 'auto':
    case 'default':
    case 'system':
      return 'auto';
    default:
      console.warn(`⚠️  Unknown browser type "${value}", falling back to "auto"`);
      return 'auto';
  }
}

/**
 * Finds the best available Chrome/Chromium executable on the current platform
 * 
 * @returns Promise resolving to the executable path or null if not found
 */
export async function findChromeExecutable(): Promise<string | null> {
  for (const executable of CHROME_EXECUTABLES) {
    try {
      // Test if the executable is available
      const result = await new Promise<boolean>((resolve) => {
        const proc = spawn(executable, ['--version'], {
          stdio: 'ignore',
          timeout: 5000
        });
        
        proc.on('exit', (code) => {
          resolve(code === 0);
        });
        
        proc.on('error', () => {
          resolve(false);
        });
        
        // Timeout fallback
        setTimeout(() => {
          proc.kill();
          resolve(false);
        }, 5000);
      });
      
      if (result) {
        return executable;
      }
    } catch {
      // Continue to next executable
      continue;
    }
  }
  
  return null;
}

/**
 * Launches a browser with the specified options
 * 
 * When 'chrome' is requested, this function will attempt to spawn 'google-chrome'
 * or other Chrome variants even if the system default browser is different (e.g., Arc).
 * 
 * @param browserType - Type of browser to launch
 * @param options - Launch options
 * @returns Promise resolving to launch result
 */
export async function launchBrowser(
  browserType: BrowserType,
  options: BrowserLaunchOptions = {}
): Promise<BrowserLaunchResult> {
  const { url, args = [], wait = false, env = {} } = options;
  
  if (browserType === 'chrome') {
    return await launchChrome(url, args, wait, env);
  } else if (browserType === 'auto') {
    return await launchSystemDefault(url, args, wait, env);
  }
  
  return {
    success: false,
    error: `Unsupported browser type: ${browserType}`
  };
}

/**
 * Launches Chrome/Chromium specifically, bypassing system default browser
 */
async function launchChrome(
  url?: string,
  args: string[] = [],
  wait: boolean = false,
  env: Record<string, string> = {}
): Promise<BrowserLaunchResult> {
  const chromeExecutable = await findChromeExecutable();
  
  if (!chromeExecutable) {
    return {
      success: false,
      error: 'Chrome/Chromium not found on system',
      fallback: {
        attempted: CHROME_EXECUTABLES,
        reason: 'No Chrome/Chromium executable found in PATH or standard locations'
      }
    };
  }
  
  try {
    const chromeArgs = [...args];
    if (url) {
      chromeArgs.push(url);
    }
    
    const spawnOptions: SpawnOptions = {
      stdio: wait ? 'inherit' : 'ignore',
      detached: !wait,
      env: { ...process.env, ...env }
    };
    
    const proc = spawn(chromeExecutable, chromeArgs, spawnOptions);
    
    if (!wait && proc.unref) {
      proc.unref();
    }
    
    return new Promise((resolve) => {
      proc.on('spawn', () => {
        resolve({
          success: true,
          executable: chromeExecutable,
          pid: proc.pid
        });
      });
      
      proc.on('error', (error) => {
        resolve({
          success: false,
          executable: chromeExecutable,
          error: `Failed to launch Chrome: ${error.message}`
        });
      });
      
      // If not waiting, resolve quickly after spawn attempt
      if (!wait) {
        setTimeout(() => {
          if (proc.pid) {
            resolve({
              success: true,
              executable: chromeExecutable,
              pid: proc.pid
            });
          }
        }, 1000);
      }
    });
  } catch (error) {
    return {
      success: false,
      executable: chromeExecutable,
      error: `Exception launching Chrome: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Launches the system default browser
 */
async function launchSystemDefault(
  url?: string,
  args: string[] = [],
  wait: boolean = false,
  env: Record<string, string> = {}
): Promise<BrowserLaunchResult> {
  try {
    const platform = process.platform;
    let command: string;
    let commandArgs: string[] = [];
    
    switch (platform) {
      case 'darwin':
        command = 'open';
        if (url) commandArgs.push(url);
        break;
      case 'win32':
        command = 'start';
        commandArgs.push('""'); // Empty title for start command
        if (url) commandArgs.push(url);
        break;
      default:
        command = 'xdg-open';
        if (url) commandArgs.push(url);
        break;
    }
    
    commandArgs.push(...args);
    
    const spawnOptions: SpawnOptions = {
      stdio: wait ? 'inherit' : 'ignore',
      detached: !wait,
      env: { ...process.env, ...env },
      shell: platform === 'win32' // Windows needs shell for 'start' command
    };
    
    const proc = spawn(command, commandArgs, spawnOptions);
    
    if (!wait && proc.unref) {
      proc.unref();
    }
    
    return new Promise((resolve) => {
      proc.on('spawn', () => {
        resolve({
          success: true,
          executable: command,
          pid: proc.pid
        });
      });
      
      proc.on('error', (error) => {
        resolve({
          success: false,
          executable: command,
          error: `Failed to launch system browser: ${error.message}`
        });
      });
      
      // If not waiting, resolve quickly after spawn attempt
      if (!wait) {
        setTimeout(() => {
          if (proc.pid) {
            resolve({
              success: true,
              executable: command,
              pid: proc.pid
            });
          }
        }, 1000);
      }
    });
  } catch (error) {
    return {
      success: false,
      error: `Exception launching system browser: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Gets browser configuration for development servers
 * 
 * This function integrates with the existing server infrastructure
 * to provide appropriate browser settings for various scenarios.
 * 
 * @param mode - Server mode (headless or interactive)
 * @param browserType - Preferred browser type
 * @returns Browser setting string for environment variables
 */
export function getBrowserSetting(mode: 'headless' | 'interactive', browserType: BrowserType): string {
  if (mode === 'headless') {
    return 'none';
  }
  
  switch (browserType) {
    case 'chrome':
      return 'google-chrome';
    case 'auto':
    default:
      return 'auto';
  }
}

/**
 * Utility function to log browser detection results
 */
export function logBrowserDetection(detection: BrowserDetectionResult): void {
  const sourceEmoji = {
    flag: '🚩',
    env: '🌍',
    default: '⚙️'
  };
  
  const emoji = sourceEmoji[detection.source];
  console.log(`${emoji} Browser: ${detection.browser} (from ${detection.source}${detection.originalValue ? `: "${detection.originalValue}"` : ''})`);
}

/**
 * Utility function to log browser launch results
 */
export function logBrowserLaunch(result: BrowserLaunchResult): void {
  if (result.success) {
    console.log(`✅ Browser launched: ${result.executable}${result.pid ? ` (PID: ${result.pid})` : ''}`);
  } else {
    console.error(`❌ Browser launch failed: ${result.error}`);
    
    if (result.fallback) {
      console.error(`   Attempted executables: ${result.fallback.attempted.join(', ')}`);
      console.error(`   Reason: ${result.fallback.reason}`);
    }
  }
}

/**
 * Main entry point for browser operations
 * 
 * This function combines detection and launch operations for convenience.
 * It's designed to be used by development servers and testing tools.
 * 
 * @param url - URL to open (optional)
 * @param options - Additional launch options
 * @returns Promise resolving to launch result with detection info
 */
export async function handleBrowser(
  url?: string,
  options: BrowserLaunchOptions = {}
): Promise<BrowserLaunchResult & { detection: BrowserDetectionResult }> {
  const detection = detectBrowser();
  logBrowserDetection(detection);
  
  const result = await launchBrowser(detection.browser, { ...options, url });
  logBrowserLaunch(result);
  
  return {
    ...result,
    detection
  };
}
