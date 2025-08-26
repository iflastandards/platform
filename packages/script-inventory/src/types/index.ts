// Core script types
export interface Script {
  id: string;
  path: string;
  name: string;
  type: ScriptType;
  purpose: string;
  fileHash: string;
  fileSize: number;
  isCli: boolean;
  isTest: boolean;
  isDeprecated: boolean;
  hasHelpOption: boolean;
  hasManOption: boolean;
  lastModified: Date;
  lastAnalyzed: Date;
  docScore: number;
  metadata: ScriptMetadata;
}

export type ScriptType = 'javascript' | 'typescript' | 'python' | 'shell';

export interface ScriptMetadata {
  author?: string;
  created?: Date;
  dependencies: Dependency[];
  tags: Tag[];
  cliOptions: CliOption[];
  examples?: string[];
  description?: string;
  usage?: string;
  fileInfo?: any;
  packageReferences?: any;
  [key: string]: any; // Allow additional properties
}

export interface Dependency {
  id: number;
  scriptId: string;
  dependency: string;
  dependencyType: DependencyType;
}

export type DependencyType = 'npm' | 'local' | 'builtin';

export interface Tag {
  id: number;
  scriptId: string;
  tag: string;
  tagType: TagType;
}

export type TagType = 'category' | 'test' | 'custom';

export interface CliOption {
  id: number;
  scriptId: string;
  optionName: string;
  optionAlias?: string;
  description: string;
  required: boolean;
}

export interface PackageJsonScript {
  id: number;
  scriptId: string;
  npmScriptName: string;
  command: string;
  packageJsonPath: string;
}

// API types
export interface SearchQuery {
  keywords?: string[];
  type?: ScriptType[];
  excludeDeprecated?: boolean;
  minDocScore?: number;
  tags?: string[];
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  scripts: Script[];
  total: number;
  limit: number;
  offset: number;
}

export interface ScriptStats {
  totalScripts: number;
  scriptsByType: Record<ScriptType, number>;
  deprecatedCount: number;
  cliScriptsCount: number;
  testScriptsCount: number;
  averageDocScore: number;
  scriptsWithoutDocs: number;
}

export interface ValidationResult {
  isValid: boolean;
  score: number;
  missing: string[];
  suggestions: string[];
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

// Registration types
export interface RegisterScriptRequest {
  path: string;
  force?: boolean;
}

export interface BulkRegisterRequest {
  scripts: RegisterScriptRequest[];
  skipValidation?: boolean;
}

export interface RegistrationResult {
  success: boolean;
  scriptId?: string;
  errors: string[];
  warnings: string[];
}

// Configuration types
export interface ScriptInventoryConfig {
  validationMode: ValidationMode;
  minDocScore: number;
  requiredFields: string[];
  excludePaths: string[];
  databasePath?: string;
  serverPort?: number;
  watchDirectories?: string[];
}

export type ValidationMode = 'strict' | 'normal' | 'lenient' | 'progressive';

// Database types
export interface DatabaseConnection {
  db: any;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  runMigrations(): Promise<void>;
}

// Export formats
export type ExportFormat = 'json' | 'csv' | 'markdown';

export interface ExportOptions {
  format: ExportFormat;
  includeMetadata?: boolean;
  includeDeprecated?: boolean;
  filterByType?: ScriptType[];
}

// Analyzer options
export interface AnalyzerOptions {
  directories?: string[];
  outputPath?: string;
  verbose?: boolean;
  minDocScore?: number;
  excludePatterns?: string[];
  includeDeprecated?: boolean;
}

// ===== PHASE 2: AUTO-REGISTRATION TYPES =====

// Auto-registration configuration
export interface AutoRegistrationConfig {
  enabled: boolean;
  validationMode: ValidationMode;
  batchSize: number;
  debounceDelay: number;
  watchDirectories: string[];
  excludePatterns: string[];
  webhookSecret?: string;
  notifications: NotificationConfig;
  performance: PerformanceConfig;
  directoryOverrides?: Record<string, Partial<ValidationConfig>>;
}

export interface ValidationConfig {
  mode: ValidationMode;
  minDocumentationScore: number;
  requiredFields: string[];
  customRules: ValidationRule[];
  excludePatterns: string[];
  directoryOverrides?: Record<string, Partial<ValidationConfig>>;
}

export interface ValidationRule {
  name: string;
  description: string;
  condition: string; // JavaScript expression
  requirement: string; // JavaScript expression
  severity: 'error' | 'warning' | 'info';
}

export interface NotificationConfig {
  slack?: boolean;
  email?: boolean;
  webhook?: string;
  onValidationFailure?: boolean;
  onRegistrationSuccess?: boolean;
}

export interface PerformanceConfig {
  maxConcurrentAnalyses: number;
  batchProcessingDelay: number;
  watcherThrottleMs: number;
  databasePoolSize: number;
}

// Git hook types
export interface PreCommitValidationResult {
  valid: boolean;
  totalFiles: number;
  validFiles: number;
  invalidFiles: number;
  errors: ValidationError[];
  warnings: ValidationError[];
  registrationResults: RegistrationResult[];
  shouldBlockCommit: boolean;
  bypassRequested: boolean;
}

export interface StagedFile {
  path: string;
  status: 'added' | 'modified' | 'deleted' | 'renamed';
  isScript: boolean;
  oldPath?: string; // for renamed files
}

export interface ValidationSummary {
  totalScripts: number;
  validScripts: number;
  invalidScripts: number;
  newScripts: number;
  modifiedScripts: number;
  averageScore: number;
  belowThresholdCount: number;
  criticalErrors: number;
}

// File watching types
export interface FileSystemEvent {
  type: 'add' | 'change' | 'unlink' | 'addDir' | 'unlinkDir';
  path: string;
  timestamp: Date;
  stats?: any;
}

export interface FileChange {
  path: string;
  type: 'created' | 'modified' | 'deleted' | 'moved';
  oldPath?: string;
  timestamp: Date;
  processed: boolean;
}

export interface BatchProcessingResult {
  processed: number;
  skipped: number;
  errors: number;
  duration: number;
  results: RegistrationResult[];
}

export interface MoveOperation {
  oldPath: string;
  newPath: string;
  scriptId?: string;
}

// Webhook types
export interface WebhookPayload {
  type: 'github' | 'build' | 'external';
  timestamp: Date;
  source: string;
  data: any;
}

export interface GitHubWebhookPayload extends WebhookPayload {
  type: 'github';
  data: {
    ref: string;
    commits: GitCommit[];
    repository: {
      name: string;
      full_name: string;
    };
  };
}

export interface BuildWebhookPayload extends WebhookPayload {
  type: 'build';
  data: {
    projectName: string;
    buildId: string;
    status: 'success' | 'failure';
    changedFiles: string[];
  };
}

export interface ExternalScriptPayload extends WebhookPayload {
  type: 'external';
  data: {
    scripts: RegisterScriptRequest[];
    source: string;
    metadata?: Record<string, any>;
  };
}

export interface GitCommit {
  id: string;
  message: string;
  author: {
    name: string;
    email: string;
  };
  added: string[];
  modified: string[];
  removed: string[];
}

// Quality metrics
export interface QualityMetrics {
  documentationScore: number;    // 0-100
  purposeClarity: number;        // 0-100  
  usageCompleteness: number;     // 0-100
  exampleQuality: number;        // 0-100
  cliDocumentation: number;      // 0-100 (if applicable)
  maintainabilityScore: number; // 0-100
  testCoverage?: number;         // 0-100 (if available)
}

export interface EnrichedMetadata extends ScriptMetadata {
  qualityMetrics: QualityMetrics;
  extractionMetadata: {
    extractedAt: Date;
    extractionMethod: string;
    confidence: number; // 0-1
  };
  validationResults: ValidationResult[];
}

export interface Suggestion {
  type: 'documentation' | 'structure' | 'testing' | 'maintenance';
  priority: 'high' | 'medium' | 'low';
  message: string;
  suggestion: string;
  automated?: boolean; // Can this be auto-fixed?
}

// Monitoring types
export interface MonitoringConfig {
  enabled: boolean;
  watchDirectories: string[];
  excludePatterns: string[];
  batchSize: number;
  debounceMs: number;
  maxQueueSize: number;
  performance: {
    maxConcurrentOperations: number;
    memoryThresholdMB: number;
    timeoutMs: number;
  };
}

export interface SystemMetrics {
  registrationRate: number;      // registrations per minute
  validationErrors: number;      // errors in last hour
  averageProcessingTime: number; // ms per script
  queueSize: number;            // pending operations
  memoryUsage: number;          // MB
  diskUsage: number;            // MB
  uptime: number;              // seconds
}

export interface AlertConfig {
  enabled: boolean;
  thresholds: {
    errorRatePerHour: number;
    avgProcessingTimeMs: number;
    queueSizeThreshold: number;
    memoryUsageMB: number;
  };
  notifications: NotificationConfig;
}

// Directory-specific configuration
export interface DirectoryConfig {
  path: string;
  validationMode: ValidationMode;
  minDocScore: number;
  requiredFields: string[];
  customRules: ValidationRule[];
  notifications: boolean;
}

export interface EffectiveConfig {
  path: string;
  validationMode: ValidationMode;
  minDocScore: number;
  requiredFields: string[];
  customRules: ValidationRule[];
  source: 'global' | 'directory' | 'file';
}

// Batch processing types
export interface BatchJob {
  id: string;
  type: 'registration' | 'validation' | 'cleanup';
  files: string[];
  config: ValidationConfig;
  priority: 'high' | 'normal' | 'low';
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: BatchProcessingResult;
  error?: string;
}

export interface QueueStatus {
  totalJobs: number;
  pendingJobs: number;
  runningJobs: number;
  completedJobs: number;
  failedJobs: number;
  currentThroughput: number; // jobs per minute
  averageProcessingTime: number; // ms per job
}

// API extensions for auto-registration
export interface AutoRegisterBatchRequest {
  files: string[];
  config?: Partial<ValidationConfig>;
  priority?: 'high' | 'normal' | 'low';
  waitForCompletion?: boolean;
}

export interface AutoRegisterBatchResponse {
  jobId: string;
  status: 'queued' | 'completed';
  summary?: BatchProcessingResult;
  estimatedCompletionTime?: Date;
}

export interface ValidationBatchRequest {
  files: string[];
  mode?: ValidationMode;
  returnDetailedResults?: boolean;
}

export interface ValidationBatchResponse {
  summary: ValidationSummary;
  results: ValidationResult[];
  recommendations: Suggestion[];
}

// Error handling types
export interface AutoRegistrationError extends Error {
  code: string;
  context: {
    filePath?: string;
    operation: string;
    timestamp: Date;
    metadata?: any;
  };
}

export interface ErrorRecoveryStrategy {
  maxRetries: number;
  retryDelayMs: number;
  backoffMultiplier: number;
  skipOnCriticalError: boolean;
  fallbackMode: 'skip' | 'manual' | 'degraded';
}

export interface RecoveryContext {
  attempt: number;
  lastError: Error;
  filePath: string;
  operation: string;
  strategy: ErrorRecoveryStrategy;
}