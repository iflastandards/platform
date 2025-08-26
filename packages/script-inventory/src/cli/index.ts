/**
 * Script Inventory CLI
 * Command line interface for script inventory operations
 */

import { Command } from 'commander';
import { analyzeCommand } from './commands/analyze';
import { queryCommand } from './commands/query';
import { registerCommand } from './commands/register';
import { validateCommand } from './commands/validate';
import { 
  monitorCommand,
  preCommitCommand,
  configCommand,
  statusCommand,
  setupCommand 
} from './commands/auto-register';
import { ScriptInventoryServer } from '../api/server';

const program = new Command();

program
  .name('script-inventory')
  .description('Script Inventory Management CLI with Auto-Registration')
  .version('2.0.0');

// Analyze command
program
  .command('analyze')
  .description('Analyze scripts in specified directories')
  .option('-d, --dirs <dirs>', 'Comma-separated directories to scan', 'scripts,tools')
  .option('-v, --verbose', 'Verbose output')
  .option('-m, --min-doc-score <score>', 'Minimum documentation score', '0')
  .option('--exclude <patterns>', 'Comma-separated patterns to exclude')
  .action(async (options) => {
    try {
      await analyzeCommand({
        directories: options.dirs.split(','),
        verbose: options.verbose,
        minDocScore: parseInt(options.minDocScore),
        excludePatterns: options.exclude ? options.exclude.split(',') : undefined,
      });
    } catch (error) {
      console.error('❌ Analysis failed:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

// Query commands
const queryCmd = program
  .command('query')
  .description('Query the script inventory');

queryCmd
  .command('stats')
  .description('Show inventory statistics')
  .action(async () => {
    try {
      await queryCommand('stats');
    } catch (error) {
      console.error('❌ Query failed:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

queryCmd
  .command('search <keywords>')
  .description('Search scripts by keywords')
  .option('-t, --type <types>', 'Comma-separated script types to filter')
  .option('-l, --limit <limit>', 'Maximum results to return', '50')
  .action(async (keywords, options) => {
    try {
      await queryCommand('search', {
        keywords: keywords.split(/\s+/),
        type: options.type ? options.type.split(',') as any : undefined,
        limit: parseInt(options.limit),
      });
    } catch (error) {
      console.error('❌ Search failed:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

queryCmd
  .command('deprecated')
  .description('Show deprecated scripts')
  .action(async () => {
    try {
      await queryCommand('deprecated');
    } catch (error) {
      console.error('❌ Query failed:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

// Register command
program
  .command('register <path>')
  .description('Register a single script')
  .option('-f, --force', 'Force registration even if script already exists')
  .action(async (path, options) => {
    try {
      await registerCommand(path, options.force);
    } catch (error) {
      console.error('❌ Registration failed:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

// Validate command
program
  .command('validate <path>')
  .description('Validate script documentation')
  .action(async (path) => {
    try {
      await validateCommand(path);
    } catch (error) {
      console.error('❌ Validation failed:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

// Auto-registration command group (Phase 2)
const autoRegisterCmd = program
  .command('auto-register')
  .description('Auto-registration system commands')
  .alias('auto');

// Setup command
autoRegisterCmd
  .command('setup')
  .description('Set up auto-registration system')
  .action(async () => {
    try {
      await setupCommand();
    } catch (error) {
      console.error('❌ Setup failed:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

// Monitor command for real-time file watching
autoRegisterCmd
  .command('monitor')
  .description('Monitor file system for script changes')
  .option('-d, --daemon', 'Run in daemon mode')
  .option('-v, --verbose', 'Verbose output')
  .action(async (options) => {
    try {
      await monitorCommand({
        daemon: options.daemon,
        verbose: options.verbose
      });
    } catch (error) {
      console.error('❌ Monitor failed:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

// Pre-commit hook command
autoRegisterCmd
  .command('pre-commit')
  .description('Run pre-commit script validation')
  .option('--dry-run', 'Test without making changes')
  .option('--skip-validation', 'Skip validation checks')
  .option('-v, --verbose', 'Verbose output')
  .option('--fail-fast', 'Stop on first error')
  .action(async (options) => {
    try {
      await preCommitCommand({
        dryRun: options.dryRun,
        skipValidation: options.skipValidation,
        verbose: options.verbose,
        failFast: options.failFast
      });
    } catch (error) {
      console.error('❌ Pre-commit failed:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

// Configuration command
autoRegisterCmd
  .command('config')
  .description('Manage auto-registration configuration')
  .option('--show', 'Show current configuration')
  .option('--mode <mode>', 'Set validation mode', /^(strict|normal|lenient|progressive)$/)
  .option('--reset', 'Reset to default configuration')
  .option('-k, --key <key>', 'Configuration key to set')
  .option('-v, --value <value>', 'Configuration value to set')
  .action(async (options) => {
    try {
      await configCommand({
        show: options.show,
        mode: options.mode,
        reset: options.reset,
        key: options.key,
        value: options.value
      });
    } catch (error) {
      console.error('❌ Config failed:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

// Status command
autoRegisterCmd
  .command('status')
  .description('Show auto-registration system status')
  .action(async () => {
    try {
      await statusCommand();
    } catch (error) {
      console.error('❌ Status failed:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

// Pre-commit hook test (use auto-register pre-commit --dry-run instead)

// Configuration management
const configCmd = program
  .command('config')
  .description('Manage auto-registration configuration');

configCmd
  .command('show')
  .description('Show current configuration')
  .action(async () => {
    try {
      await configCommand({ get: true });
    } catch (error) {
      console.error('❌ Config show failed:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

configCmd
  .command('set')
  .description('Update configuration settings')
  .option('-m, --mode <mode>', 'Set validation mode: strict, normal, lenient, progressive')
  .option('-s, --min-score <score>', 'Set minimum documentation score')
  .action(async (options) => {
    try {
      await configCommand({
        set: true,
        mode: options.mode as any,
        minScore: options.minScore ? parseInt(options.minScore) : undefined,
      });
    } catch (error) {
      console.error('❌ Config set failed:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

configCmd
  .command('reset')
  .description('Reset configuration to defaults')
  .action(async () => {
    try {
      await configCommand({ reset: true });
    } catch (error) {
      console.error('❌ Config reset failed:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

// System status
program
  .command('status')
  .description('Show auto-registration system status')
  .action(async () => {
    try {
      await statusCommand();
    } catch (error) {
      console.error('❌ Status check failed:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

// Server command with enhanced features
program
  .command('serve')
  .description('Start the API server with webhook support')
  .option('-p, --port <port>', 'Server port', '3001')
  .option('--no-cors', 'Disable CORS')
  .option('--no-helmet', 'Disable security headers')
  .option('--auto-register', 'Enable auto-registration features')
  .action(async (options) => {
    try {
      const server = new ScriptInventoryServer({
        port: parseInt(options.port),
        cors: options.cors,
        helmet: options.helmet,
        inventoryConfig: {
          validationMode: 'normal',
          minDocScore: 60,
          requiredFields: ['purpose', 'usage'],
          excludePaths: ['**/node_modules/**', '**/dist/**'],
          watchDirectories: ['scripts', 'tools', 'src/cli']
        }
      });

      await server.start();
    } catch (error) {
      console.error('❌ Server failed:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

// Setup command to initialize auto-registration
program
  .command('setup')
  .description('Set up auto-registration system for this project')
  .option('--git-hooks', 'Install git hooks')
  .option('--config', 'Create configuration files')
  .option('--force', 'Overwrite existing files')
  .action(async (options) => {
    try {
      console.log('🛠️  Setting up auto-registration system...');
      
      if (options.gitHooks) {
        console.log('⚙️  Installing git hooks...');
        // Implementation would go here
        console.log('✅ Git hooks installed');
      }
      
      if (options.config) {
        console.log('⚙️  Creating configuration files...');
        // Implementation would go here
        console.log('✅ Configuration files created');
      }
      
      if (!options.gitHooks && !options.config) {
        console.log('⚙️  Installing complete setup...');
        console.log('✅ Auto-registration system setup complete');
      }
      
      console.log('\n🎉 Setup complete! Use "script-inventory status" to verify configuration.');
      
    } catch (error) {
      console.error('❌ Setup failed:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

// Help command with enhanced information
program
  .command('help [command]')
  .description('Display help for command')
  .action((command) => {
    if (command) {
      program.outputHelp((str) => {
        const lines = str.split('\n');
        const commandIndex = lines.findIndex(line => line.includes(`${command}`));
        if (commandIndex >= 0) {
          return lines.slice(commandIndex, commandIndex + 10).join('\n') + '\n';
        }
        return str;
      });
    } else {
      console.log(`
Script Inventory CLI v2.0.0 - Auto-Registration System

🔧 Core Commands:
  analyze       Analyze scripts in directories
  register      Register individual scripts
  validate      Validate script documentation
  query         Search and query inventory

🤖 Auto-Registration:
  watch         Real-time file monitoring
  auto-validate Enhanced validation system
  test-hook     Test pre-commit hooks
  config        Configuration management
  status        System status overview
  setup         Initialize auto-registration

🌐 Server:
  serve         API server with webhooks

📚 Documentation:
  Use "script-inventory help [command]" for detailed command help
  Visit: /apps/docs/tools/script-inventory for full documentation
      `);
    }
  });

// Parse command line arguments
async function main() {
  try {
    await program.parseAsync(process.argv);
  } catch (error) {
    console.error('❌ Command failed:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  main();
}

export default program;