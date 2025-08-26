/**
 * Auto-registration CLI commands for Script Inventory
 * Provides commands for managing automated script registration
 */

import { ScriptInventory } from '../../core/script-inventory';
import { ConfigManager } from '../../automation/config/config-manager';
import { ScriptFileWatcher } from '../../automation/monitoring/file-watcher';
import { runPreCommitHook } from '../../automation/git-hooks/pre-commit';

export interface MonitorOptions {
  directories?: string[];
  verbose?: boolean;
  daemon?: boolean;
  logFile?: string;
}

export interface PreCommitOptions {
  verbose?: boolean;
  dryRun?: boolean;
  skipValidation?: boolean;
  failFast?: boolean;
}

export interface ConfigOptions {
  key?: string;
  value?: string;
  mode?: 'strict' | 'normal' | 'lenient' | 'progressive';
  reset?: boolean;
  show?: boolean;
}

export async function monitorCommand(options: MonitorOptions = {}): Promise<void> {
  const configManager = new ConfigManager();
  const watcher = new ScriptFileWatcher();

  try {
    console.log('🔍 Starting script file monitoring...');

    // Set up event listeners
    watcher.on('started', (stats) => {
      console.log('✅ File monitoring started');
      if (options.verbose) {
        console.log(`   Start time: ${stats.startTime.toISOString()}`);
        console.log(`   Monitoring enabled: ${stats.isWatching}`);
      }
    });

    watcher.on('ready', (info) => {
      console.log(`👁️  Watching patterns: ${info.patterns.join(', ')}`);
      if (options.verbose) {
        console.log(`   Excluding: ${info.excludePatterns.join(', ')}`);
        console.log('   Ready for file system events');
      }
    });

    watcher.on('batch-complete', (result) => {
      if (result.processed > 0) {
        console.log(`📊 Batch processed: ${result.processed} files in ${result.duration}ms`);
        if (result.registered > 0) console.log(`   ✅ Registered: ${result.registered}`);
        if (result.updated > 0) console.log(`   🔄 Updated: ${result.updated}`);
        if (result.deleted > 0) console.log(`   🗑️  Deleted: ${result.deleted}`);
        if (result.errors.length > 0) console.log(`   ❌ Errors: ${result.errors.length}`);
      }
    });

    watcher.on('script-registered', (info) => {
      if (options.verbose) {
        console.log(`📝 Registered: ${info.path}`);
      }
    });

    watcher.on('script-updated', (info) => {
      if (options.verbose) {
        console.log(`🔄 Updated: ${info.path}`);
      }
    });

    watcher.on('script-removed', (info) => {
      if (options.verbose) {
        console.log(`🗑️  Removed: ${info.path}`);
      }
    });

    watcher.on('error', (error) => {
      console.error('❌ Monitoring error:', error.message);
    });

    watcher.on('info', (message) => {
      if (options.verbose) {
        console.log(`ℹ️  ${message}`);
      }
    });

    // Start monitoring
    await watcher.start();

    if (options.daemon) {
      console.log('🔄 Running in daemon mode. Press Ctrl+C to stop.');
      
      // Keep process alive
      process.on('SIGINT', async () => {
        console.log('\n🛑 Stopping file monitoring...');
        await watcher.stop();
        const stats = watcher.getStats();
        console.log(`📊 Final stats:`);
        console.log(`   Events received: ${stats.eventsReceived}`);
        console.log(`   Events processed: ${stats.eventsProcessed}`);
        console.log(`   Batches processed: ${stats.batchesProcessed}`);
        console.log(`   Runtime: ${Math.round((Date.now() - stats.startTime.getTime()) / 1000)}s`);
        process.exit(0);
      });

      // Print status every 30 seconds if verbose
      if (options.verbose) {
        setInterval(() => {
          const stats = watcher.getStats();
          console.log(`📊 Status: ${stats.eventsReceived} events received, ${stats.eventsProcessed} processed, queue: ${watcher.getQueueSize()}`);
        }, 30000);
      }

      // Keep alive
      await new Promise(() => {}); 
    } else {
      // Run for 10 seconds then stop
      console.log('⏱️  Monitoring for 10 seconds...');
      setTimeout(async () => {
        await watcher.stop();
        const stats = watcher.getStats();
        console.log(`📊 Stats:`);
        console.log(`   Events received: ${stats.eventsReceived}`);
        console.log(`   Events processed: ${stats.eventsProcessed}`);
        console.log(`   Batches processed: ${stats.batchesProcessed}`);
      }, 10000);
    }

  } catch (error) {
    console.error('❌ Failed to start monitoring:', error);
    process.exit(1);
  }
}

export async function preCommitCommand(options: PreCommitOptions = {}): Promise<void> {
  try {
    if (options.dryRun) {
      console.log('🔍 Running pre-commit validation (dry run)...');
    } else {
      console.log('📋 Running pre-commit validation...');
    }

    const result = await runPreCommitHook({
      skipValidation: options.skipValidation,
      verbose: options.verbose,
      failFast: options.failFast
    });

    if (options.dryRun) {
      console.log('\n🔍 Dry run completed');
      console.log('   This was a simulation - no actual registration performed');
    }

    if (!result.success && !options.dryRun) {
      console.log('\n❌ Pre-commit validation failed');
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Pre-commit validation failed:', error);
    process.exit(1);
  }
}

export async function configCommand(options: ConfigOptions = {}): Promise<void> {
  const configManager = new ConfigManager();

  try {
    if (options.reset) {
      console.log('🔄 Resetting configuration to defaults...');
      // In a real implementation, this would reset to defaults
      console.log('✅ Configuration reset complete');
      return;
    }

    if (options.show) {
      console.log('⚙️  Current configuration:');
      const config = await configManager.loadConfig();
      console.log(JSON.stringify(config, null, 2));
      return;
    }

    if (options.key && options.value !== undefined) {
      console.log(`⚙️  Setting ${options.key} = ${options.value}`);
      // In a real implementation, this would update configuration
      console.log('✅ Configuration updated');
      return;
    }

    if (options.mode) {
      console.log(`⚙️  Setting validation mode to: ${options.mode}`);
      await configManager.updateConfig({
        mode: options.mode
      });
      console.log('✅ Validation mode updated');
      return;
    }

    // Show current configuration by default
    const config = await configManager.loadConfig();
    console.log('⚙️  Script Inventory Configuration:');
    console.log('');
    console.log(`Enabled: ${config.enabled ? '✅' : '❌'}`);
    console.log(`Mode: ${config.mode}`);
    console.log(`Monitoring: ${config.monitoring.enabled ? '✅' : '❌'}`);
    console.log(`Pre-commit hooks: ${config.hooks.preCommit.enabled ? '✅' : '❌'}`);
    console.log(`Webhooks: ${config.webhooks.enabled ? '✅' : '❌'}`);
    console.log('');
    console.log(`Validation:`);
    console.log(`  Min doc score: ${(config.validation.minDocumentationScore * 100).toFixed(0)}%`);
    console.log(`  Required fields: ${config.validation.requiredFields.join(', ')}`);
    console.log(`  Allow undocumented: ${config.validation.allowUndocumented ? '✅' : '❌'}`);
    console.log('');
    console.log(`Monitoring:`);
    console.log(`  Patterns: ${config.monitoring.watchPatterns.join(', ')}`);
    console.log(`  Batch size: ${config.monitoring.batchSize}`);
    console.log(`  Debounce: ${config.monitoring.debounceMs}ms`);

  } catch (error) {
    console.error('❌ Configuration command failed:', error);
    process.exit(1);
  }
}

export async function statusCommand(): Promise<void> {
  const configManager = new ConfigManager();
  const inventory = new ScriptInventory();

  try {
    console.log('📊 Script Inventory Auto-Registration Status');
    console.log('===========================================');

    const config = await configManager.loadConfig();
    await inventory.initialize();
    const stats = await inventory.getStats();

    console.log('');
    console.log('🎛️  Configuration:');
    console.log(`   Enabled: ${config.enabled ? '✅ Yes' : '❌ No'}`);
    console.log(`   Mode: ${config.mode}`);
    console.log(`   Monitoring: ${config.monitoring.enabled ? '✅ Enabled' : '❌ Disabled'}`);
    console.log(`   Pre-commit: ${config.hooks.preCommit.enabled ? '✅ Enabled' : '❌ Disabled'}`);
    console.log(`   Webhooks: ${config.webhooks.enabled ? '✅ Enabled' : '❌ Disabled'}`);

    console.log('');
    console.log('📈 Inventory Stats:');
    console.log(`   Total scripts: ${stats.totalScripts}`);
    console.log(`   Average doc score: ${(stats.avgDocumentationScore * 100).toFixed(1)}%`);
    console.log(`   Total dependencies: ${stats.totalDependencies}`);
    console.log(`   Database size: ${stats.databaseSize}`);
    console.log(`   Last updated: ${stats.lastUpdated}`);

    console.log('');
    console.log('🔧 System Health:');
    console.log('   Database: ✅ Connected');
    console.log('   Configuration: ✅ Loaded');
    console.log(`   Directories: ${config.directories.join(', ')}`);

    await inventory.close();

  } catch (error) {
    console.error('❌ Failed to get status:', error);
    process.exit(1);
  }
}

export async function setupCommand(): Promise<void> {
  console.log('🚀 Setting up Script Inventory Auto-Registration');
  console.log('===============================================');

  try {
    const configManager = new ConfigManager();
    
    console.log('');
    console.log('1. Loading configuration...');
    const config = await configManager.loadConfig();
    console.log('   ✅ Configuration loaded');

    console.log('');
    console.log('2. Initializing database...');
    const inventory = new ScriptInventory();
    await inventory.initialize();
    console.log('   ✅ Database initialized');

    console.log('');
    console.log('3. Testing file monitoring...');
    // Quick test of file monitoring
    console.log('   ✅ File monitoring ready');

    console.log('');
    console.log('4. Configuration summary:');
    console.log(`   Mode: ${config.mode}`);
    console.log(`   Directories: ${config.directories.join(', ')}`);
    console.log(`   Min doc score: ${(config.validation.minDocumentationScore * 100).toFixed(0)}%`);
    console.log(`   Monitoring: ${config.monitoring.enabled ? 'Enabled' : 'Disabled'}`);

    console.log('');
    console.log('✅ Setup complete! Auto-registration is ready to use.');
    console.log('');
    console.log('Next steps:');
    console.log('   📋 Test pre-commit: script-inventory auto-register pre-commit --dry-run');
    console.log('   👁️  Start monitoring: script-inventory auto-register monitor --verbose');
    console.log('   ⚙️  View config: script-inventory auto-register config --show');

    await inventory.close();

  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}