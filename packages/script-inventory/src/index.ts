// Main exports for @ifla/script-inventory package
export * from './types';
export * from './core/parser';
export * from './core/extractors';
export * from './database/connection';
export * from './database/queries';

// Main ScriptInventory class
export { ScriptInventory } from './core/script-inventory';

// Core analyzer (avoid name conflict with types)
export { ScriptAnalyzer, type AnalysisResult } from './core/analyzer';

// CLI exports for programmatic usage
export { analyzeCommand } from './cli/commands/analyze';
export { queryCommand } from './cli/commands/query';
export { registerCommand } from './cli/commands/register';
export { validateCommand } from './cli/commands/validate';

// API server
export { ScriptInventoryServer, type ServerOptions } from './api/server';

// ===== PHASE 2: AUTO-REGISTRATION EXPORTS =====

// Main auto-registration system
export { 
  AutoRegistrationManager,
  autoRegistrationManager,
  AutoRegistrationError,
  utils as autoRegistrationUtils
} from './automation';

// Configuration management
export { ConfigManager, configManager } from './automation/config/config-manager';

// Git hooks
export { PreCommitHook, runPreCommitHook } from './automation/git-hooks/pre-commit';

// Validation system
export { ValidationPipeline } from './automation/validation/validation-pipeline';

// File monitoring
export { ScriptFileWatcher } from './automation/monitoring/file-watcher';

// Auto-registration CLI commands
export {
  watchCommand,
  validateAutoCommand,
  testHookCommand,
  configCommand,
  statusCommand
} from './cli/commands/auto-register';

// Webhook routes (for external integration)
export { webhookRoutes } from './api/routes/webhooks';