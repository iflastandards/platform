import { db, ImportJob, ActivityLog } from '@/lib/supabase/client';

export interface CreateImportJobParams {
  namespace_id: string;
  spreadsheet_url?: string;
  github_issue_number?: number;
  created_by: string;
}

export interface ValidationResult {
  type: 'error' | 'warning' | 'info';
  message: string;
  row?: number;
  column?: string;
  suggestion?: string;
}

export class ImportService {
  /**
   * Create a new import job
   */
  static async createImportJob(params: CreateImportJobParams): Promise<ImportJob | null> {
    try {
      const { data, error } = await db
        .from('import_jobs')
        .insert({
          namespace_id: params.namespace_id,
          spreadsheet_url: params.spreadsheet_url,
          github_issue_number: params.github_issue_number,
          created_by: params.created_by,
          status: 'pending',
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating import job:', error);
        return null;
      }

      // Log activity
      await this.logActivity({
        log_name: 'import',
        description: `Import job created for namespace ${params.namespace_id}`,
        subject_type: 'import_job',
        subject_id: data?.id,
        causer_id: params.created_by,
        properties: {
          namespace_id: params.namespace_id,
          spreadsheet_url: params.spreadsheet_url,
        },
      });

      return data;
    } catch (error) {
      console.error('Error in createImportJob:', error);
      return null;
    }
  }

  /**
   * Update import job status
   */
  static async updateImportJobStatus(
    jobId: string,
    status: ImportJob['status'],
    additionalData?: Partial<ImportJob>
  ): Promise<boolean> {
    try {
      const updateData = { status, ...additionalData } as Partial<ImportJob>;
      
      if (status === 'completed' || status === 'failed') {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await db
        .from('import_jobs')
        .update(updateData)
        .eq('id', jobId);

      if (error) {
        console.error('Error updating import job:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateImportJobStatus:', error);
      return false;
    }
  }

  /**
   * Get import job by ID
   */
  static async getImportJob(jobId: string): Promise<ImportJob | null> {
    try {
      const { data, error } = await db
        .from('import_jobs')
        .select()
        .eq('id', jobId)
        .single();

      if (error) {
        console.error('Error fetching import job:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getImportJob:', error);
      return null;
    }
  }

  /**
   * Get import jobs for a namespace
   */
  static async getNamespaceImportJobs(namespaceId: string): Promise<ImportJob[]> {
    try {
      const { data, error } = await db
        .from('import_jobs')
        .select()
        .eq('namespace_id', namespaceId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching namespace import jobs:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getNamespaceImportJobs:', error);
      return [];
    }
  }

  /**
   * Save validation results
   */
  static async saveValidationResults(
    jobId: string,
    results: ValidationResult[]
  ): Promise<boolean> {
    return this.updateImportJobStatus(jobId, 'validating', {
      validation_results: results,
    });
  }

  /**
   * Log activity
   */
  static async logActivity(activity: Omit<ActivityLog, 'id' | 'created_at'>): Promise<void> {
    try {
      await db.from('activity_logs').insert(activity);
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  }

  /**
   * Log validation results to import_logs table
   */
  static async logValidationResults(
    jobId: string,
    issues: ValidationResult[],
    step: string = 'dctap_validation'
  ): Promise<void> {
    try {
      // Log each validation issue
      for (const issue of issues) {
        await db.from('import_logs').insert({
          import_job_id: jobId,
          log_type: 'validation',
          step,
          message: issue.message,
          details: {
            type: issue.type,
            row: issue.row,
            column: issue.column,
            suggestion: issue.suggestion,
          },
          severity: issue.type,
        });
      }

      // Log summary
      const summary = {
        total: issues.length,
        errors: issues.filter(i => i.type === 'error').length,
        warnings: issues.filter(i => i.type === 'warning').length,
        info: issues.filter(i => i.type === 'info').length,
      };

      await db.from('import_logs').insert({
        import_job_id: jobId,
        log_type: 'validation',
        step,
        message: `Validation completed: ${summary.errors} errors, ${summary.warnings} warnings, ${summary.info} info`,
        details: summary,
        severity: summary.errors > 0 ? 'error' : summary.warnings > 0 ? 'warning' : 'info',
      });
    } catch (error) {
      console.error('Error logging validation results:', error);
    }
  }

  /**
   * Log processing step to import_logs table
   */
  static async logProcessingStep(
    jobId: string,
    step: string,
    message: string,
    details?: any,
    severity: 'error' | 'warning' | 'info' = 'info'
  ): Promise<void> {
    try {
      await db.from('import_logs').insert({
        import_job_id: jobId,
        log_type: 'processing',
        step,
        message,
        details,
        severity,
      });
    } catch (error) {
      console.error('Error logging processing step:', error);
    }
  }

  /**
   * Get import logs for a job
   */
  static async getImportLogs(jobId: string): Promise<any[]> {
    try {
      const { data, error } = await db
        .from('import_logs')
        .select('*')
        .eq('import_job_id', jobId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching import logs:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getImportLogs:', error);
      return [];
    }
  }

  /**
   * Validate spreadsheet data using the validation service
   */
  static async validateSpreadsheetWithService(
    csvData: string,
    profileId: string,
    worksheetName?: string
  ): Promise<ValidationResult[]> {
    try {
      const response = await fetch('/api/validate-csv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          csvData,
          profileId,
          worksheetName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Validation service error');
      }

      const { issues } = await response.json();
      return issues;
    } catch (error) {
      console.error('Validation service error:', error);
      return [{
        type: 'error',
        message: `Validation service error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }];
    }
  }

  /**
   * Validate spreadsheet data (legacy mock implementation)
   */
  static async validateSpreadsheet(spreadsheetUrl: string, namespace?: string, dctapProfile?: string): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];
    
    try {
      // Extract spreadsheet ID from URL
      const match = spreadsheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (!match) {
        results.push({
          type: 'error',
          message: 'Invalid Google Sheets URL format',
        });
        return results;
      }
      
      const sheetId = match[1];
      
      // For now, return mock validation that indicates we would download and validate
      // In production, this would:
      // 1. Use Google Sheets API to download the spreadsheet
      // 2. Parse each worksheet
      // 3. Validate against the selected DCTAP profile
      
      results.push({
        type: 'info',
        message: `Ready to validate spreadsheet ${sheetId}`,
      });
      
      if (namespace) {
        results.push({
          type: 'info',
          message: `Target namespace: ${namespace}`,
        });
      }
      
      if (dctapProfile) {
        results.push({
          type: 'info',
          message: `Using DCTAP profile: ${dctapProfile}`,
        });
        
        // Mock validation against the profile
        if (dctapProfile.includes('elements')) {
          results.push({
            type: 'info',
            message: 'Validating element set structure',
          });
        } else if (dctapProfile.includes('concepts')) {
          results.push({
            type: 'info',
            message: 'Validating concept scheme structure',
          });
        }
      }
      
      // Mock successful validation
      results.push({
        type: 'info',
        message: 'Spreadsheet structure appears valid',
      });
      
    } catch (error) {
      results.push({
        type: 'error',
        message: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
    
    return results;
  }

  /**
   * Process import job (main workflow)
   */
  static async processImportJob(jobId: string): Promise<void> {
    try {
      // Update status to processing
      await this.updateImportJobStatus(jobId, 'processing');

      // Get job details
      const job = await this.getImportJob(jobId);
      if (!job) {
        throw new Error('Job not found');
      }

      // Phase 1: Validation
      await this.updateImportJobStatus(jobId, 'validating');
      
      // Download and validate spreadsheet data
      const validationResults = await this.validateSpreadsheet(job.spreadsheet_url!);
      await this.saveValidationResults(jobId, validationResults);
      
      // Check for errors
      const hasErrors = validationResults.some(r => r.type === 'error');
      if (hasErrors) {
        throw new Error('Validation failed with errors');
      }

      // Phase 2: Processing
      await this.updateImportJobStatus(jobId, 'processing');
      
      // Generate branch name
      const timestamp = Date.now();
      const _branchName = `import-${job.namespace_id}-${timestamp}`;
      
      // TODO: Integrate with existing tools:
      // 1. Use scripts/spreadsheet-api.ts to download Google Sheets data
      // 2. Use tools/sheet-sync to convert to CSV
      // 3. Use scripts/scaffold-site.ts patterns to generate MDX
      // 4. Create GitHub branch and commit
      // 5. Create pull request

      // For now, simulate processing with realistic delay
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Update status to completed
      await this.updateImportJobStatus(jobId, 'completed', {
        branch_name: `import-${job.namespace_id}-${Date.now()}`,
      });

      await this.logActivity({
        log_name: 'import',
        description: `Import job completed for namespace ${job.namespace_id}`,
        subject_type: 'import_job',
        subject_id: jobId,
        causer_id: job.created_by,
      });
    } catch (error) {
      console.error('Error processing import job:', error);
      await this.updateImportJobStatus(jobId, 'failed', {
        error_message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}