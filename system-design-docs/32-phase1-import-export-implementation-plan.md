# Phase 1 Implementation Plan: Integration-First Approach

## Executive Summary

Based on the analysis of existing infrastructure, Phase 1 of the import/export workflows is already 85-90% complete. This document outlines an integration-first approach to deliver Phase 1 in 2 weeks instead of the originally planned 4 weeks.

## Existing Infrastructure Analysis

### ✅ What's Already Implemented

#### Google Sheets Integration (85% Complete)
- **tools/sheet-sync/src/index.ts**: Full Google Sheets API client with authentication, rate limiting, and CRUD operations
- **scripts/spreadsheet-api.ts**: Advanced Google Sheets creation with formatting, workbook management
- **Authentication**: Service account setup, credential management
- **Rate limiting**: Built-in quota management
- **Error handling**: Comprehensive error classification system
- **Operations**: Read, write, batch operations, sheet management

#### RDF/CSV Processing Pipeline (90% Complete)
- **tools/typescript/rdf-converters/**: Complete RDF to CSV conversion with DCTAP support
- **DCTAP validation**: Extended IFLA DCTAP specification support
- **Multi-format export**: CSV, RDF, JSON-LD, Turtle already implemented
- **Data transformation**: Sophisticated transformation pipelines
- **Template system**: MDX generation from RDF data

#### Admin Interface Infrastructure (75% Complete)
- **Import services**: apps/admin/src/lib/services/import-service.ts with job management
- **Database models**: Import jobs, validation results, activity logging via Supabase
- **API endpoints**: Validation, job status tracking
- **UI components**: Import workflow components partially built

#### Validation & Error Handling (70% Complete)
- **Validation framework**: DCTAP validation, error classification
- **Error tracking**: Structured error handling with severity levels
- **Activity logging**: Complete audit trail system

### 🚧 What Needs Completion

#### Missing Integration Points (25% effort)
1. Connect existing tools: Link sheet-sync, rdf-converters, and admin services
2. MDX generation: Integrate existing RDF→MDX pipeline with Google Sheets workflow
3. Job orchestration: Coordinate the existing components into complete workflow
4. UI completion: Finish import wizard and monitoring interfaces

#### Deployment Integration (15% effort)
1. Build pipeline: Connect to existing Nx build system
2. Git integration: Automated commits and branch creation

## Revised Phase 1 Plan - Focus on Integration

### Week 1: Tool Integration (Instead of Google Sheets Setup)
- **Task**: Connect sheet-sync tool to admin service APIs
- **Task**: Integrate authentication flow between admin app and sheet-sync
- **Task**: Create wrapper APIs in admin app for existing sheet-sync functionality
- **Estimated effort**: 2-3 days instead of 1 week

### Week 2: Pipeline Orchestration (Instead of Validation Engine)
- **Task**: Create workflow orchestrator that coordinates sheet-sync → rdf-converters → MDX generation
- **Task**: Integrate existing validation systems with admin job tracking
- **Estimated effort**: 3-4 days instead of 1 week

### Week 3: Export Integration (Significantly Reduced)
- **Task**: Connect existing multi-format export to admin interface
- **Task**: Integrate template system with admin configuration
- **Estimated effort**: 2-3 days instead of 1 week

### Week 4: UI Completion & Testing (Reduced scope)
- **Task**: Complete import wizard UI using existing service patterns
- **Task**: Integrate job monitoring with existing import-service
- **Estimated effort**: 3-4 days instead of 1 week

## Implementation Strategy

### Core Principle: Integration over Implementation
- Week 1: Tool integration and orchestration layer
- Week 2: UI completion and end-to-end validation

### Architecture: Service Layer Pattern
```
Admin App ← Integration Services ← Existing Tools
    ↓              ↓                    ↓
  UI/API    ← Orchestrator ←    sheet-sync
Experience                   rdf-converters
                            import-service
```

## 🚀 Sprint 1: Integration Layer Development (Days 1-4)

### Day 1: Project Structure & Integration Foundation

#### Task 1.1: Create Integration Package Structure
```bash
# Create new integration package
nx g @nx/node:lib integration-services

# Structure:
packages/integration-services/
├── src/
│   ├── google-sheets/
│   │   ├── sheet-sync-integration.ts
│   │   └── types.ts
│   ├── rdf-processing/
│   │   ├── converter-integration.ts
│   │   └── types.ts
│   ├── workflows/
│   │   ├── import-orchestrator.ts
│   │   ├── export-orchestrator.ts
│   │   └── types.ts
│   └── index.ts
```

#### Task 1.2: Sheet-Sync Integration Service
**Estimated Time**: 3 hours

```typescript
// packages/integration-services/src/google-sheets/sheet-sync-integration.ts
import { SheetSync } from '../../../tools/sheet-sync/src';
import type { ImportConfig, ImportResult, ValidationResult } from './types';

export class SheetSyncIntegration {
  private sheetSync: SheetSync;

  constructor() {
    this.sheetSync = new SheetSync();
  }

  async validateSpreadsheet(spreadsheetId: string): Promise<ValidationResult[]> {
    // Wrap existing validation logic
    return await this.sheetSync.status(spreadsheetId);
  }

  async importFromSpreadsheet(config: ImportConfig): Promise<ImportResult> {
    try {
      // Use existing pull functionality
      await this.sheetSync.pull(config.namespace);
      
      return {
        success: true,
        message: `Successfully imported data for ${config.namespace}`,
        filesCreated: [`${config.namespace}.csv`]
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async exportToSpreadsheet(config: ExportConfig): Promise<ImportResult> {
    try {
      await this.sheetSync.push(config.namespace);
      return { success: true, message: 'Export completed' };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}
```

#### Task 1.3: RDF Converter Integration Service
**Estimated Time**: 3 hours

```typescript
// packages/integration-services/src/rdf-processing/converter-integration.ts
import { RdfParser, CsvGenerator, DctapProfileParser } from '../../../tools/typescript/rdf-converters/src';
import type { ConversionConfig, ConversionResult } from './types';

export class RdfConverterIntegration {
  async convertRdfToCsv(config: ConversionConfig): Promise<ConversionResult> {
    try {
      const parser = new RdfParser();
      const generator = new CsvGenerator();
      
      const rdfData = await parser.parseFile(config.inputFile);
      const csvOutput = await generator.generateCsv(rdfData, config.profile);
      
      return {
        success: true,
        outputFile: config.outputFile,
        recordCount: rdfData.length
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Conversion failed'
      };
    }
  }

  async generateMdxFromCsv(config: MdxGenerationConfig): Promise<ConversionResult> {
    // Integrate existing MDX generation pipeline
    // Use tools/typescript/rdf-converters MDX templates
  }
}
```

**Acceptance Criteria**:
- Integration services can call existing tools without modification
- Type-safe interfaces for all integrations
- Error handling preserves original error context
- All existing functionality accessible through integration layer

### Day 2: Workflow Orchestration

#### Task 2.1: Import Workflow Orchestrator
**Estimated Time**: 4 hours

```typescript
// packages/integration-services/src/workflows/import-orchestrator.ts
export class ImportOrchestrator {
  constructor(
    private sheetSync: SheetSyncIntegration,
    private rdfConverter: RdfConverterIntegration,
    private importService: ImportService
  ) {}

  async executeImportWorkflow(jobId: string): Promise<WorkflowResult> {
    try {
      // Phase 1: Update job status
      await this.importService.updateImportJobStatus(jobId, 'validating');
      
      const job = await this.importService.getImportJob(jobId);
      if (!job) throw new Error('Job not found');
      
      // Phase 2: Validate spreadsheet
      const validationResults = await this.sheetSync.validateSpreadsheet(
        this.extractSpreadsheetId(job.spreadsheet_url!)
      );
      
      await this.importService.saveValidationResults(jobId, validationResults);
      
      if (validationResults.some(r => r.type === 'error')) {
        throw new Error('Validation failed');
      }
      
      // Phase 3: Import data
      await this.importService.updateImportJobStatus(jobId, 'processing');
      
      const importResult = await this.sheetSync.importFromSpreadsheet({
        spreadsheetId: this.extractSpreadsheetId(job.spreadsheet_url!),
        namespace: job.namespace_id
      });
      
      if (!importResult.success) {
        throw new Error(importResult.error);
      }
      
      // Phase 4: Generate MDX if needed
      if (job.generate_mdx) {
        const mdxResult = await this.rdfConverter.generateMdxFromCsv({
          inputFile: importResult.filesCreated![0],
          namespace: job.namespace_id,
          template: job.template_type || 'default'
        });
        
        if (!mdxResult.success) {
          console.warn('MDX generation failed:', mdxResult.error);
        }
      }
      
      // Phase 5: Complete job
      await this.importService.updateImportJobStatus(jobId, 'completed', {
        files_created: importResult.filesCreated,
        records_processed: importResult.recordCount
      });
      
      return { success: true, jobId };
    } catch (error) {
      await this.importService.updateImportJobStatus(jobId, 'failed', {
        error_message: error instanceof Error ? error.message : 'Unknown error'
      });
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private extractSpreadsheetId(url: string): string {
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (!match) throw new Error('Invalid Google Sheets URL');
    return match[1];
  }
}
```

#### Task 2.2: Export Workflow Orchestrator
**Estimated Time**: 3 hours

```typescript
// packages/integration-services/src/workflows/export-orchestrator.ts
export class ExportOrchestrator {
  async executeExportWorkflow(config: ExportWorkflowConfig): Promise<WorkflowResult> {
    try {
      // Phase 1: Determine export source
      let sourceData: any;
      
      if (config.source === 'csv') {
        sourceData = await this.loadCsvData(config.sourcePath);
      } else if (config.source === 'rdf') {
        const conversionResult = await this.rdfConverter.convertRdfToCsv({
          inputFile: config.sourcePath,
          outputFile: `temp-${Date.now()}.csv`,
          profile: config.dctapProfile
        });
        
        if (!conversionResult.success) {
          throw new Error(`RDF conversion failed: ${conversionResult.error}`);
        }
        
        sourceData = await this.loadCsvData(conversionResult.outputFile!);
      }
      
      // Phase 2: Apply export template and filters
      const processedData = await this.applyExportTemplate(sourceData, config.template);
      
      // Phase 3: Generate output in requested format
      let outputResult: ExportResult;
      
      switch (config.format) {
        case 'csv':
          outputResult = await this.generateCsvExport(processedData, config);
          break;
        case 'google-sheets':
          outputResult = await this.sheetSync.exportToSpreadsheet({
            data: processedData,
            spreadsheetId: config.targetSpreadsheetId,
            namespace: config.namespace
          });
          break;
        case 'rdf':
          outputResult = await this.rdfConverter.generateRdfFromCsv({
            csvData: processedData,
            format: config.rdfFormat || 'turtle',
            namespace: config.namespace
          });
          break;
        default:
          throw new Error(`Unsupported export format: ${config.format}`);
      }
      
      return { success: true, result: outputResult };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Export failed'
      };
    }
  }
}
```

**Acceptance Criteria**:
- Import workflow coordinates all existing tools seamlessly
- Export workflow supports multiple formats using existing infrastructure
- Comprehensive error handling and recovery
- Job status tracking throughout workflow
- Integration with existing Supabase logging

### Day 3: Admin API Integration

#### Task 3.1: Enhanced Import API Endpoints
**Estimated Time**: 4 hours

```typescript
// apps/admin/src/app/api/import/google-sheets/route.ts
import { ImportOrchestrator } from '@/lib/integrations/workflows/import-orchestrator';
import { addBasePath } from '@ifla/theme/utils';

export async function POST(request: Request) {
  try {
    const { spreadsheetId, namespace, templateType } = await request.json();
    
    // Create import job using existing service
    const job = await ImportService.createImportJob({
      namespace_id: namespace,
      spreadsheet_url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
      template_type: templateType,
      created_by: 'current-user-id' // Get from auth
    });
    
    if (!job) {
      return NextResponse.json(
        { error: 'Failed to create import job' },
        { status: 500 }
      );
    }
    
    // Start workflow asynchronously
    const orchestrator = new ImportOrchestrator();
    orchestrator.executeImportWorkflow(job.id).catch(error => {
      console.error('Import workflow failed:', error);
    });
    
    return NextResponse.json({
      jobId: job.id,
      status: 'started',
      statusUrl: addBasePath(`/api/import/status/${job.id}`)
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Import request failed', details: error.message },
      { status: 500 }
    );
  }
}
```

#### Task 3.2: Export API Endpoints
**Estimated Time**: 3 hours

```typescript
// apps/admin/src/app/api/export/route.ts
export async function POST(request: Request) {
  try {
    const config = await request.json();
    
    const orchestrator = new ExportOrchestrator();
    const result = await orchestrator.executeExportWorkflow(config);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        downloadUrl: result.result.downloadUrl,
        filename: result.result.filename
      });
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Export failed', details: error.message },
      { status: 500 }
    );
  }
}
```

**Acceptance Criteria**:
- API endpoints properly handle basePath routing
- Integration with existing authentication system
- Proper error handling and HTTP status codes
- Job tracking through existing import service
- Real-time status updates available

### Day 4: Configuration and Environment Setup

#### Task 4.1: Environment Configuration
**Estimated Time**: 2 hours

```typescript
// packages/integration-services/src/config/environment.ts
export interface IntegrationConfig {
  googleSheets: {
    serviceAccountKey: string;
    defaultSpreadsheetId?: string;
  };
  rdfConverters: {
    defaultProfiles: {
      elements: string;
      values: string;
    };
    outputFormats: string[];
  };
  workflows: {
    maxConcurrentJobs: number;
    jobTimeoutMs: number;
    retryAttempts: number;
  };
}

export function loadIntegrationConfig(): IntegrationConfig {
  return {
    googleSheets: {
      serviceAccountKey: process.env.GSHEETS_SA_KEY!,
      defaultSpreadsheetId: process.env.SPREADSHEET_ID
    },
    rdfConverters: {
      defaultProfiles: {
        elements: 'profiles/default-elements.csv',
        values: 'profiles/default-values.csv'
      },
      outputFormats: ['csv', 'turtle', 'json-ld', 'rdf-xml']
    },
    workflows: {
      maxConcurrentJobs: parseInt(process.env.MAX_CONCURRENT_JOBS || '3'),
      jobTimeoutMs: parseInt(process.env.JOB_TIMEOUT_MS || '300000'),
      retryAttempts: parseInt(process.env.RETRY_ATTEMPTS || '2')
    }
  };
}
```

#### Task 4.2: Integration Testing Setup
**Estimated Time**: 3 hours

```typescript
// packages/integration-services/src/__tests__/integration.test.ts
describe('Integration Services', () => {
  describe('Import Workflow', () => {
    it('should complete full import workflow', async () => {
      const orchestrator = new ImportOrchestrator();
      
      // Mock job creation
      const mockJob = await createMockImportJob();
      
      // Execute workflow
      const result = await orchestrator.executeImportWorkflow(mockJob.id);
      
      expect(result.success).toBe(true);
      expect(result.jobId).toBe(mockJob.id);
    });
  });

  describe('Export Workflow', () => {
    it('should export to multiple formats', async () => {
      const orchestrator = new ExportOrchestrator();
      
      const configs = [
        { format: 'csv', namespace: 'test' },
        { format: 'turtle', namespace: 'test' },
        { format: 'google-sheets', namespace: 'test' }
      ];
      
      for (const config of configs) {
        const result = await orchestrator.executeExportWorkflow(config);
        expect(result.success).toBe(true);
      }
    });
  });
});
```

**Acceptance Criteria**:
- All environment variables properly configured
- Integration tests pass for all workflows
- Configuration validation and error handling
- Development and production environment separation

## 🚀 Sprint 2: Workflow Orchestration (Days 5-8)

### Day 5: Advanced Workflow Features

#### Task 5.1: Batch Processing Support
**Estimated Time**: 4 hours

```typescript
// packages/integration-services/src/workflows/batch-orchestrator.ts
export class BatchOrchestrator {
  async processBatchImport(jobIds: string[]): Promise<BatchResult> {
    const results: WorkflowResult[] = [];
    const concurrency = 3; // From config
    
    // Process in batches to avoid overwhelming the system
    for (let i = 0; i < jobIds.length; i += concurrency) {
      const batch = jobIds.slice(i, i + concurrency);
      
      const batchPromises = batch.map(jobId =>
        this.orchestrator.executeImportWorkflow(jobId)
      );
      
      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          results.push({
            success: false,
            error: result.reason.message,
            jobId: batch[index]
          });
        }
      });
    }
    
    return {
      success: results.every(r => r.success),
      results,
      totalProcessed: results.length,
      successCount: results.filter(r => r.success).length
    };
  }
}
```

#### Task 5.2: Workflow Recovery and Retry Logic
**Estimated Time**: 3 hours

```typescript
// packages/integration-services/src/workflows/recovery-manager.ts
export class WorkflowRecoveryManager {
  async retryFailedJob(jobId: string, maxRetries: number = 3): Promise<WorkflowResult> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Retry attempt ${attempt}/${maxRetries} for job ${jobId}`);
        
        // Reset job status
        await this.importService.updateImportJobStatus(jobId, 'pending');
        
        // Execute workflow
        const result = await this.orchestrator.executeImportWorkflow(jobId);
        
        if (result.success) {
          await this.logRecoverySuccess(jobId, attempt);
          return result;
        }
        
        lastError = new Error(result.error);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    await this.logRecoveryFailure(jobId, maxRetries, lastError);
    return {
      success: false,
      error: `Failed after ${maxRetries} attempts: ${lastError?.message}`
    };
  }
}
```

**Acceptance Criteria**:
- Batch processing handles multiple concurrent jobs
- Retry logic with exponential backoff
- Comprehensive logging for recovery operations
- Graceful handling of partial failures

### Day 6: Performance Optimization

#### Task 6.1: Caching Layer
**Estimated Time**: 4 hours

```typescript
// packages/integration-services/src/cache/workflow-cache.ts
export class WorkflowCache {
  private cache = new Map<string, CacheEntry>();
  private readonly TTL = 5 * 60 * 1000; // 5 minutes
  
  async getCachedValidation(spreadsheetId: string): Promise<ValidationResult[] | null> {
    const key = `validation:${spreadsheetId}`;
    const entry = this.cache.get(key);
    
    if (entry && Date.now() - entry.timestamp < this.TTL) {
      return entry.data;
    }
    
    return null;
  }
  
  async setCachedValidation(spreadsheetId: string, results: ValidationResult[]): Promise<void> {
    const key = `validation:${spreadsheetId}`;
    this.cache.set(key, {
      data: results,
      timestamp: Date.now()
    });
  }
  
  async getCachedConversion(inputHash: string): Promise<ConversionResult | null> {
    // Cache RDF conversion results based on input file hash
    const key = `conversion:${inputHash}`;
    const entry = this.cache.get(key);
    
    if (entry && Date.now() - entry.timestamp < this.TTL) {
      return entry.data;
    }
    
    return null;
  }
}
```

#### Task 6.2: Monitoring and Metrics
**Estimated Time**: 3 hours

```typescript
// packages/integration-services/src/monitoring/metrics-collector.ts
export class MetricsCollector {
  async recordWorkflowMetrics(jobId: string, metrics: WorkflowMetrics): Promise<void> {
    await this.supabase.from('workflow_metrics').insert({
      job_id: jobId,
      start_time: metrics.startTime,
      end_time: metrics.endTime,
      duration_ms: metrics.endTime - metrics.startTime,
      records_processed: metrics.recordsProcessed,
      files_created: metrics.filesCreated,
      cache_hits: metrics.cacheHits,
      cache_misses: metrics.cacheMisses,
      error_count: metrics.errors.length,
      created_at: new Date()
    });
  }
  
  async getWorkflowStats(timeRange: TimeRange): Promise<WorkflowStats> {
    const { data } = await this.supabase
      .from('workflow_metrics')
      .select('*')
      .gte('created_at', timeRange.start)
      .lte('created_at', timeRange.end);
    
    return {
      totalJobs: data?.length || 0,
      successRate: this.calculateSuccessRate(data || []),
      averageDuration: this.calculateAverageDuration(data || []),
      throughput: this.calculateThroughput(data || [], timeRange)
    };
  }
}
```

**Acceptance Criteria**:
- Validation results cached to avoid redundant API calls
- Conversion results cached based on input file hash
- Comprehensive metrics collection for all workflows
- Performance monitoring dashboard data available

### Day 7-8: UI Integration and Testing

#### Task 7.1: Import Wizard Enhancement
**Estimated Time**: 6 hours

```typescript
// apps/admin/src/components/import/ImportWizardV2.tsx
export function ImportWizardV2() {
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState<ImportConfig>({
    spreadsheetId: '',
    namespace: '',
    templateType: 'default',
    generateMdx: true
  });
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [jobStatus, setJobStatus] = useState<ImportJob | null>(null);
  
  const handleValidation = async () => {
    try {
      setStep(2);
      const response = await fetch(addBasePath('/api/import/validate'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spreadsheetId: config.spreadsheetId,
          namespace: config.namespace
        })
      });
      
      const results = await response.json();
      setValidationResults(results);
      
      if (results.every((r: ValidationResult) => r.type !== 'error')) {
        setStep(3);
      }
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };
  
  const handleImport = async () => {
    try {
      setStep(4);
      const response = await fetch(addBasePath('/api/import/google-sheets'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      
      const result = await response.json();
      
      // Start polling for job status
      pollJobStatus(result.jobId);
    } catch (error) {
      console.error('Import failed:', error);
    }
  };
  
  const pollJobStatus = async (jobId: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(addBasePath(`/api/import/status/${jobId}`));
        const job = await response.json();
        
        setJobStatus(job);
        
        if (job.status === 'completed' || job.status === 'failed') {
          clearInterval(interval);
        }
      } catch (error) {
        console.error('Status polling failed:', error);
        clearInterval(interval);
      }
    }, 2000);
  };
  
  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Import Vocabulary from Google Sheets</CardTitle>
        <Progress value={(step / 4) * 100} className="mt-2" />
      </CardHeader>
      
      <CardContent>
        {step === 1 && (
          <ConfigurationStep
            config={config}
            onChange={setConfig}
            onNext={handleValidation}
          />
        )}
        
        {step === 2 && (
          <ValidationStep
            results={validationResults}
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
          />
        )}
        
        {step === 3 && (
          <ConfirmationStep
            config={config}
            validationResults={validationResults}
            onBack={() => setStep(2)}
            onNext={handleImport}
          />
        )}
        
        {step === 4 && (
          <ImportProgressStep
            jobStatus={jobStatus}
            onComplete={() => router.push('/dashboard/imports')}
          />
        )}
      </CardContent>
    </Card>
  );
}
```

#### Task 7.2: Export Interface Enhancement
**Estimated Time**: 4 hours

```typescript
// apps/admin/src/components/export/ExportDialogV2.tsx
export function ExportDialogV2({ namespace }: { namespace: string }) {
  const [format, setFormat] = useState('csv');
  const [template, setTemplate] = useState('default');
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const handleExport = async () => {
    setIsExporting(true);
    setProgress(0);
    
    try {
      const response = await fetch(addBasePath('/api/export'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          namespace,
          format,
          template,
          source: 'csv', // or 'rdf'
          sourcePath: `standards/${namespace}/csv/`
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        
        if (result.downloadUrl) {
          // Direct download
          const link = document.createElement('a');
          link.href = result.downloadUrl;
          link.download = result.filename;
          link.click();
        } else {
          // Handle async export with status polling
          pollExportStatus(result.jobId);
        }
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };
  
  return (
    <Dialog>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Vocabulary</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label>Export Format</Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="turtle">RDF/Turtle</SelectItem>
                <SelectItem value="json-ld">JSON-LD</SelectItem>
                <SelectItem value="rdf-xml">RDF/XML</SelectItem>
                <SelectItem value="google-sheets">Google Sheets</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label>Template</Label>
            <Select value={template} onValueChange={setTemplate}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="complete">Complete</SelectItem>
                <SelectItem value="minimal">Minimal</SelectItem>
                <SelectItem value="dctap">DCTAP</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {isExporting && (
            <div>
              <Label>Export Progress</Label>
              <Progress value={progress} className="mt-2" />
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              'Export'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

**Acceptance Criteria**:
- Import wizard guides users through complete process
- Real-time validation with immediate feedback
- Export dialog supports all formats from existing tools
- Progress tracking and status updates
- Error handling with user-friendly messages

## 📋 Implementation Checklist

### Pre-Implementation Setup
- [ ] Verify all existing tools are working correctly
- [ ] Ensure environment variables are configured
- [ ] Confirm database schema for import jobs exists
- [ ] Test Google Sheets API access
- [ ] Validate RDF converter tool functionality

### Sprint 1 Checklist (Days 1-4)
- [ ] Create integration package structure
- [ ] Implement SheetSyncIntegration service
- [ ] Implement RdfConverterIntegration service
- [ ] Build ImportOrchestrator workflow
- [ ] Build ExportOrchestrator workflow
- [ ] Create enhanced import API endpoints
- [ ] Create export API endpoints
- [ ] Set up environment configuration
- [ ] Write integration tests

### Sprint 2 Checklist (Days 5-8)
- [ ] Implement batch processing support
- [ ] Add workflow recovery and retry logic
- [ ] Build caching layer for performance
- [ ] Implement monitoring and metrics
- [ ] Enhance import wizard UI
- [ ] Enhance export dialog UI
- [ ] Conduct end-to-end testing
- [ ] Performance optimization

### Quality Gates
- [ ] All integration tests pass
- [ ] End-to-end workflow completes successfully
- [ ] Error handling tested for all failure scenarios
- [ ] Performance targets met (import <2min for 100 elements)
- [ ] UI/UX validated with sample vocabularies
- [ ] Security review completed
- [ ] Documentation updated

### Deployment Checklist
- [ ] Environment variables configured in all environments
- [ ] Database migrations applied
- [ ] Integration package built and deployed
- [ ] Admin app updated with new components
- [ ] Monitoring and logging configured
- [ ] Rollback plan documented

## 🎯 Success Metrics

### Technical Metrics
- **Integration Success**: 100% of existing tools accessible through integration layer
- **Workflow Completion**: <2 minutes for 100-element vocabulary import
- **Error Rate**: <1% for valid inputs
- **API Response Time**: <500ms for all non-workflow endpoints
- **Cache Hit Rate**: >80% for repeated operations

### User Experience Metrics
- **Wizard Completion Rate**: >90% of users complete import process
- **Error Understanding**: <5% of users require support for error resolution
- **Feature Adoption**: All export formats successfully used
- **User Satisfaction**: >85% positive feedback on import/export experience

### Business Metrics
- **Time to Value**: 50% reduction in vocabulary import time
- **Data Quality**: >95% successful validation rate
- **Process Efficiency**: 75% reduction in manual intervention
- **System Reliability**: 99.5% uptime for import/export services

## 💡 Recommended Approach

### Immediate Actions (Week 1)
1. Create integration layer in apps/admin/src/lib/integrations/
2. Wrapper services that call existing tools via Node.js child processes or direct imports
3. API endpoints that orchestrate existing functionality

### Example Integration Code
```typescript
// apps/admin/src/lib/integrations/sheet-sync-integration.ts
import { SheetSync } from '../../../tools/sheet-sync/src/index';
import { RdfParser, CsvGenerator } from '../../../tools/typescript/rdf-converters/src';

export class ImportOrchestrator {
  async importFromGoogleSheets(config: ImportConfig): Promise<ImportResult> {
    // Use existing SheetSync
    const sheetSync = new SheetSync();
    const csvData = await sheetSync.pull(config.namespace);
    
    // Use existing RDF converters
    const generator = new CsvGenerator();
    const mdxFiles = await generator.generateMDX(csvData);
    
    return { success: true, filesCreated: mdxFiles };
  }
}
```

## ⏰ Revised Timeline: 2 weeks instead of 4

With existing infrastructure, Phase 1 can be completed in 2 weeks instead of 4:
- Week 1: Integration layer and orchestration
- Week 2: UI completion and end-to-end testing

## 🎯 Strategic Impact

This discovery means:
1. **Faster MVP delivery**: Phase 1 reduced by 50%
2. **Higher quality**: Building on battle-tested existing code
3. **Better maintainability**: Leveraging existing patterns and architecture
4. **Resource reallocation**: Can focus on Phases 2-6 earlier

The comprehensive plan created initially was valuable for understanding requirements, but the implementation approach should leverage the substantial existing infrastructure rather than rebuilding it.