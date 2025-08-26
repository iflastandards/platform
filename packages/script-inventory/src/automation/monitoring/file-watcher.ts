/**
 * Real-time File Monitoring System for Script Inventory
 * Watches file system changes and automatically registers/updates scripts
 */

import chokidar from 'chokidar';
import path from 'path';
import { EventEmitter } from 'events';
import { ScriptInventory } from '../../core/script-inventory';
import { ConfigManager, AutoRegistrationConfig } from '../config/config-manager';

export interface WatchEvent {
  type: 'add' | 'change' | 'unlink' | 'move';
  path: string;
  oldPath?: string;
  timestamp: Date;
}

export interface BatchProcessResult {
  processed: number;
  registered: number;
  updated: number;
  deleted: number;
  errors: Array<{ path: string; error: string }>;
  duration: number;
}

export interface WatcherStats {
  startTime: Date;
  eventsReceived: number;
  eventsProcessed: number;
  batchesProcessed: number;
  lastActivity: Date | null;
  isWatching: boolean;
}

export class ScriptFileWatcher extends EventEmitter {
  private watcher: chokidar.FSWatcher | null = null;
  private configManager: ConfigManager;
  private inventory: ScriptInventory;
  private config: AutoRegistrationConfig | null = null;
  
  private eventQueue: WatchEvent[] = [];
  private batchTimer: NodeJS.Timeout | null = null;
  private isProcessing = false;
  
  private stats: WatcherStats = {
    startTime: new Date(),
    eventsReceived: 0,
    eventsProcessed: 0,
    batchesProcessed: 0,
    lastActivity: null,
    isWatching: false
  };

  constructor() {
    super();
    this.configManager = new ConfigManager();
    this.inventory = new ScriptInventory();
  }

  async start(): Promise<void> {
    if (this.watcher) {
      throw new Error('Watcher is already running');
    }

    try {
      // Load configuration
      this.config = await this.configManager.loadConfig();
      
      if (!this.config.monitoring.enabled) {
        this.emit('info', 'File monitoring is disabled in configuration');
        return;
      }

      // Initialize inventory
      await this.inventory.initialize();

      // Set up file watcher
      await this.setupWatcher();
      
      // Set up configuration watching
      await this.configManager.watchConfig(this.onConfigChange.bind(this));

      this.stats.isWatching = true;
      this.stats.startTime = new Date();
      
      this.emit('started', this.stats);
      
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (!this.watcher) {
      return;
    }

    try {
      // Process any pending events
      if (this.eventQueue.length > 0) {
        await this.processBatch();
      }

      // Clear batch timer
      if (this.batchTimer) {
        clearTimeout(this.batchTimer);
        this.batchTimer = null;
      }

      // Close file watcher
      await this.watcher.close();
      this.watcher = null;

      // Stop config watching
      await this.configManager.stopWatching();

      // Close inventory
      await this.inventory.close();

      this.stats.isWatching = false;
      this.emit('stopped', this.stats);
      
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  private async setupWatcher(): Promise<void> {
    if (!this.config) throw new Error('Configuration not loaded');

    const { watchPatterns, excludePatterns } = this.config.monitoring;

    this.watcher = chokidar.watch(watchPatterns, {
      ignored: excludePatterns,
      ignoreInitial: true,
      persistent: true,
      depth: 99,
      awaitWriteFinish: {
        stabilityThreshold: 500,
        pollInterval: 100
      }
    });

    // Set up event handlers
    this.watcher
      .on('add', (filePath) => this.queueEvent({ type: 'add', path: filePath, timestamp: new Date() }))
      .on('change', (filePath) => this.queueEvent({ type: 'change', path: filePath, timestamp: new Date() }))
      .on('unlink', (filePath) => this.queueEvent({ type: 'unlink', path: filePath, timestamp: new Date() }))
      .on('error', (error) => this.emit('error', error))
      .on('ready', () => this.emit('ready', {
        watched: this.watcher?.getWatched() || {},
        patterns: watchPatterns,
        excludePatterns
      }));

    // Handle file moves (rename detection)
    let recentUnlinks = new Map<string, number>();
    
    this.watcher.on('unlink', (filePath) => {
      recentUnlinks.set(path.basename(filePath), Date.now());
      
      // Clean up old entries after 2 seconds
      setTimeout(() => {
        recentUnlinks.delete(path.basename(filePath));
      }, 2000);
    });

    this.watcher.on('add', (filePath) => {
      const baseName = path.basename(filePath);
      const unlinkTime = recentUnlinks.get(baseName);
      
      if (unlinkTime && Date.now() - unlinkTime < 1000) {
        // This looks like a move operation
        this.queueEvent({
          type: 'move',
          path: filePath,
          oldPath: `<unknown>/${baseName}`, // We don't know the full old path
          timestamp: new Date()
        });
        recentUnlinks.delete(baseName);
      }
    });
  }

  private queueEvent(event: WatchEvent): void {
    // Filter for script files only
    if (!this.isScriptFile(event.path)) {
      return;
    }

    this.eventQueue.push(event);
    this.stats.eventsReceived++;
    this.stats.lastActivity = new Date();

    this.emit('event', event);

    // Schedule batch processing
    this.scheduleBatch();
  }

  private isScriptFile(filePath: string): boolean {
    const ext = path.extname(filePath).toLowerCase();
    const scriptExtensions = ['.js', '.ts', '.jsx', '.tsx', '.py', '.sh', '.bash', '.zsh', '.fish', '.ps1'];
    
    return scriptExtensions.includes(ext) || 
           path.basename(filePath).toLowerCase().includes('script') ||
           filePath.includes('/scripts/') || 
           filePath.includes('/tools/');
  }

  private scheduleBatch(): void {
    if (!this.config || this.isProcessing) return;

    // Clear existing timer
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
    }

    // Process immediately if batch is full
    if (this.eventQueue.length >= this.config.monitoring.batchSize) {
      this.processBatch();
      return;
    }

    // Otherwise schedule batch processing after debounce period
    this.batchTimer = setTimeout(() => {
      this.processBatch();
    }, this.config.monitoring.debounceMs);
  }

  private async processBatch(): Promise<void> {
    if (this.isProcessing || this.eventQueue.length === 0) {
      return;
    }

    this.isProcessing = true;
    const startTime = Date.now();
    
    // Take current queue and reset
    const events = [...this.eventQueue];
    this.eventQueue = [];
    
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }

    const result: BatchProcessResult = {
      processed: 0,
      registered: 0,
      updated: 0,
      deleted: 0,
      errors: [],
      duration: 0
    };

    try {
      // Group events by path to handle duplicates
      const eventMap = new Map<string, WatchEvent>();
      for (const event of events) {
        eventMap.set(event.path, event); // Latest event wins
      }

      this.emit('batch-start', { count: eventMap.size, events: Array.from(eventMap.values()) });

      // Process each unique file
      for (const [filePath, event] of eventMap) {
        try {
          await this.processFileEvent(event, result);
          result.processed++;
          this.stats.eventsProcessed++;
        } catch (error) {
          result.errors.push({
            path: filePath,
            error: error instanceof Error ? error.message : String(error)
          });
          this.emit('file-error', { path: filePath, error });
        }
      }

      result.duration = Date.now() - startTime;
      this.stats.batchesProcessed++;

      this.emit('batch-complete', result);

    } catch (error) {
      this.emit('batch-error', error);
    } finally {
      this.isProcessing = false;
      
      // Process any events that queued while we were processing
      if (this.eventQueue.length > 0) {
        this.scheduleBatch();
      }
    }
  }

  private async processFileEvent(event: WatchEvent, result: BatchProcessResult): Promise<void> {
    switch (event.type) {
      case 'add':
      case 'change':
        try {
          const script = await this.inventory.registerScript(event.path, true);
          if (event.type === 'add') {
            result.registered++;
            this.emit('script-registered', { path: event.path, script });
          } else {
            result.updated++;
            this.emit('script-updated', { path: event.path, script });
          }
        } catch (error) {
          // File might not be a valid script, that's okay
          this.emit('debug', `Skipped ${event.path}: ${error}`);
        }
        break;

      case 'unlink':
        try {
          await this.inventory.removeScript(event.path);
          result.deleted++;
          this.emit('script-removed', { path: event.path });
        } catch (error) {
          // Script might not have been registered, that's okay
          this.emit('debug', `Failed to remove ${event.path}: ${error}`);
        }
        break;

      case 'move':
        if (event.oldPath) {
          try {
            // Remove old entry and add new one
            await this.inventory.removeScript(event.oldPath);
            const script = await this.inventory.registerScript(event.path, true);
            result.updated++;
            this.emit('script-moved', { oldPath: event.oldPath, newPath: event.path, script });
          } catch (error) {
            this.emit('debug', `Failed to handle move ${event.oldPath} -> ${event.path}: ${error}`);
          }
        }
        break;
    }
  }

  private async onConfigChange(newConfig: AutoRegistrationConfig): Promise<void> {
    this.config = newConfig;
    
    if (!newConfig.monitoring.enabled && this.watcher) {
      await this.stop();
      this.emit('info', 'File monitoring disabled by configuration change');
      return;
    }

    if (newConfig.monitoring.enabled && !this.watcher) {
      await this.start();
      this.emit('info', 'File monitoring enabled by configuration change');
      return;
    }

    // Restart watcher if patterns changed
    if (this.watcher) {
      const currentWatched = this.watcher.getWatched();
      await this.stop();
      await this.start();
      this.emit('info', 'File watcher restarted due to configuration change');
    }
  }

  // Public API methods
  getStats(): WatcherStats {
    return { ...this.stats };
  }

  isRunning(): boolean {
    return this.stats.isWatching && this.watcher !== null;
  }

  getQueueSize(): number {
    return this.eventQueue.length;
  }

  async forceProcessQueue(): Promise<BatchProcessResult | null> {
    if (this.eventQueue.length === 0) {
      return null;
    }
    
    await this.processBatch();
    return this.getStats() as any; // Return some result
  }
}

// Factory function for easy usage
export function createFileWatcher(): ScriptFileWatcher {
  return new ScriptFileWatcher();
}

// Export event types for TypeScript
export interface FileWatcherEvents {
  started: (stats: WatcherStats) => void;
  stopped: (stats: WatcherStats) => void;
  ready: (info: { watched: any; patterns: string[]; excludePatterns: string[] }) => void;
  event: (event: WatchEvent) => void;
  'batch-start': (info: { count: number; events: WatchEvent[] }) => void;
  'batch-complete': (result: BatchProcessResult) => void;
  'batch-error': (error: Error) => void;
  'script-registered': (info: { path: string; script: any }) => void;
  'script-updated': (info: { path: string; script: any }) => void;
  'script-removed': (info: { path: string }) => void;
  'script-moved': (info: { oldPath: string; newPath: string; script: any }) => void;
  'file-error': (info: { path: string; error: Error }) => void;
  error: (error: Error) => void;
  info: (message: string) => void;
  debug: (message: string) => void;
}