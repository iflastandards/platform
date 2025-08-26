#!/usr/bin/env node

/**
 * Type-safe database queries for script inventory
 */

import type { 
  Script, 
  SearchQuery, 
  SearchResult, 
  ScriptStats,
  CliOption,
  Tag,
  Dependency,
  PackageJsonScript
} from '../types';
import type { ScriptDatabase } from './connection';

export class DatabaseQueries {
  constructor(private db: ScriptDatabase) {}

  /**
   * Insert or update a script
   */
  async upsertScript(script: Omit<Script, 'id'>): Promise<string> {
    const existingScript = await this.db.get<{ id: string }>(
      'SELECT id FROM scripts WHERE path = ?',
      [script.path]
    );

    if (existingScript) {
      // Update existing script
      await this.db.run(`
        UPDATE scripts SET
          name = ?, type = ?, purpose = ?, file_hash = ?, file_size = ?,
          is_cli = ?, is_test = ?, is_deprecated = ?, has_help_option = ?,
          has_man_option = ?, doc_score = ?, last_modified = ?, 
          last_analyzed = CURRENT_TIMESTAMP, metadata = ?
        WHERE id = ?
      `, [
        script.name, script.type, script.purpose, script.fileHash, script.fileSize,
        script.isCli ? 1 : 0, script.isTest ? 1 : 0, script.isDeprecated ? 1 : 0,
        script.hasHelpOption ? 1 : 0, script.hasManOption ? 1 : 0, script.docScore,
        script.lastModified.toISOString(), JSON.stringify(script.metadata),
        existingScript.id
      ]);
      
      return existingScript.id;
    } else {
      // Insert new script
      const result = await this.db.run(`
        INSERT INTO scripts (
          path, name, type, purpose, file_hash, file_size, is_cli, is_test,
          is_deprecated, has_help_option, has_man_option, doc_score,
          last_modified, metadata
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        script.path, script.name, script.type, script.purpose, script.fileHash,
        script.fileSize, script.isCli ? 1 : 0, script.isTest ? 1 : 0,
        script.isDeprecated ? 1 : 0, script.hasHelpOption ? 1 : 0,
        script.hasManOption ? 1 : 0, script.docScore, script.lastModified.toISOString(),
        JSON.stringify(script.metadata)
      ]);

      return result.lastID!.toString();
    }
  }

  /**
   * Get script by ID
   */
  async getScript(id: string): Promise<Script | null> {
    const row = await this.db.get<any>(
      'SELECT * FROM scripts WHERE id = ?',
      [id]
    );

    if (!row) return null;

    return this.mapRowToScript(row);
  }

  /**
   * Get script by path
   */
  async getScriptByPath(path: string): Promise<Script | null> {
    const row = await this.db.get<any>(
      'SELECT * FROM scripts WHERE path = ?',
      [path]
    );

    if (!row) return null;

    return this.mapRowToScript(row);
  }

  /**
   * Search scripts with filters
   */
  async searchScripts(query: SearchQuery): Promise<SearchResult> {
    let sql = 'SELECT * FROM scripts WHERE 1=1';
    const params: any[] = [];

    // Add filters
    if (query.keywords && query.keywords.length > 0) {
      const keywordConditions = query.keywords.map(() => 
        '(purpose LIKE ? OR name LIKE ? OR path LIKE ?)'
      ).join(' OR ');
      sql += ` AND (${keywordConditions})`;
      
      query.keywords.forEach(keyword => {
        const pattern = `%${keyword}%`;
        params.push(pattern, pattern, pattern);
      });
    }

    if (query.type && query.type.length > 0) {
      sql += ` AND type IN (${query.type.map(() => '?').join(',')})`;
      params.push(...query.type);
    }

    if (query.excludeDeprecated) {
      sql += ' AND is_deprecated = 0';
    }

    if (query.minDocScore) {
      sql += ' AND doc_score >= ?';
      params.push(query.minDocScore);
    }

    if (query.tags && query.tags.length > 0) {
      sql += ` AND id IN (
        SELECT DISTINCT script_id FROM tags 
        WHERE tag IN (${query.tags.map(() => '?').join(',')})
      )`;
      params.push(...query.tags);
    }

    // Count total results
    const countSql = sql.replace('SELECT * FROM', 'SELECT COUNT(*) as count FROM');
    const countResult = await this.db.get<{ count: number }>(countSql, params);
    const total = countResult?.count || 0;

    // Add pagination
    const limit = query.limit || 50;
    const offset = query.offset || 0;
    sql += ' ORDER BY last_analyzed DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    // Get results
    const rows = await this.db.all<any>(sql, params);
    const scripts = rows.map(row => this.mapRowToScript(row));

    return {
      scripts,
      total,
      limit,
      offset,
    };
  }

  /**
   * Get all scripts
   */
  async getAllScripts(): Promise<Script[]> {
    const rows = await this.db.all<any>(
      'SELECT * FROM scripts ORDER BY name'
    );
    
    return rows.map(row => this.mapRowToScript(row));
  }

  /**
   * Get script statistics
   */
  async getScriptStats(): Promise<ScriptStats> {
    const [total, byType, deprecated, cli, test, avgDoc, noDocs] = await Promise.all([
      this.db.get<{ count: number }>('SELECT COUNT(*) as count FROM scripts'),
      this.db.all<{ type: string; count: number }>(`
        SELECT type, COUNT(*) as count FROM scripts GROUP BY type
      `),
      this.db.get<{ count: number }>('SELECT COUNT(*) as count FROM scripts WHERE is_deprecated = 1'),
      this.db.get<{ count: number }>('SELECT COUNT(*) as count FROM scripts WHERE is_cli = 1'),
      this.db.get<{ count: number }>('SELECT COUNT(*) as count FROM scripts WHERE is_test = 1'),
      this.db.get<{ avg: number }>('SELECT AVG(doc_score) as avg FROM scripts'),
      this.db.get<{ count: number }>('SELECT COUNT(*) as count FROM scripts WHERE doc_score < 50'),
    ]);

    const scriptsByType: Record<string, number> = {};
    byType.forEach(row => {
      scriptsByType[row.type] = row.count;
    });

    return {
      totalScripts: total?.count || 0,
      scriptsByType: scriptsByType as any,
      deprecatedCount: deprecated?.count || 0,
      cliScriptsCount: cli?.count || 0,
      testScriptsCount: test?.count || 0,
      averageDocScore: Math.round(avgDoc?.avg || 0),
      scriptsWithoutDocs: noDocs?.count || 0,
    };
  }

  /**
   * Delete script and related data
   */
  async deleteScript(id: string): Promise<void> {
    await this.db.run('DELETE FROM scripts WHERE id = ?', [id]);
  }

  /**
   * Insert CLI options for a script
   */
  async insertCliOptions(scriptId: string, options: Omit<CliOption, 'id' | 'scriptId'>[]): Promise<void> {
    // Clear existing options
    await this.db.run('DELETE FROM cli_options WHERE script_id = ?', [scriptId]);

    // Insert new options
    for (const option of options) {
      await this.db.run(`
        INSERT INTO cli_options (script_id, option_name, option_alias, description, required)
        VALUES (?, ?, ?, ?, ?)
      `, [scriptId, option.optionName, option.optionAlias, option.description, option.required ? 1 : 0]);
    }
  }

  /**
   * Insert tags for a script
   */
  async insertTags(scriptId: string, tags: Omit<Tag, 'id' | 'scriptId'>[]): Promise<void> {
    // Clear existing tags
    await this.db.run('DELETE FROM tags WHERE script_id = ?', [scriptId]);

    // Insert new tags
    for (const tag of tags) {
      await this.db.run(`
        INSERT INTO tags (script_id, tag, tag_type)
        VALUES (?, ?, ?)
      `, [scriptId, tag.tag, tag.tagType]);
    }
  }

  /**
   * Insert dependencies for a script
   */
  async insertDependencies(scriptId: string, dependencies: string[]): Promise<void> {
    // Clear existing dependencies
    await this.db.run('DELETE FROM dependencies WHERE script_id = ?', [scriptId]);

    // Insert new dependencies
    for (const dep of dependencies) {
      const depType = dep.startsWith('@') || dep.includes('/') ? 'npm' : 
                     dep.startsWith('.') ? 'local' : 'builtin';
      
      await this.db.run(`
        INSERT INTO dependencies (script_id, dependency, dependency_type)
        VALUES (?, ?, ?)
      `, [scriptId, dep, depType]);
    }
  }

  /**
   * Get CLI options for a script
   */
  async getCliOptions(scriptId: string): Promise<CliOption[]> {
    const rows = await this.db.all<any>(
      'SELECT * FROM cli_options WHERE script_id = ?',
      [scriptId]
    );

    return rows.map(row => ({
      id: row.id,
      scriptId: row.script_id,
      optionName: row.option_name,
      optionAlias: row.option_alias,
      description: row.description,
      required: row.required === 1,
    }));
  }

  /**
   * Get tags for a script
   */
  async getTags(scriptId: string): Promise<Tag[]> {
    const rows = await this.db.all<any>(
      'SELECT * FROM tags WHERE script_id = ?',
      [scriptId]
    );

    return rows.map(row => ({
      id: row.id,
      scriptId: row.script_id,
      tag: row.tag,
      tagType: row.tag_type,
    }));
  }

  /**
   * Get dependencies for a script
   */
  async getDependencies(scriptId: string): Promise<Dependency[]> {
    const rows = await this.db.all<any>(
      'SELECT * FROM dependencies WHERE script_id = ?',
      [scriptId]
    );

    return rows.map(row => ({
      id: row.id,
      scriptId: row.script_id,
      dependency: row.dependency,
      dependencyType: row.dependency_type,
    }));
  }

  /**
   * Map database row to Script object
   */
  private mapRowToScript(row: any): Script {
    let metadata;
    try {
      metadata = JSON.parse(row.metadata || '{}');
    } catch {
      metadata = {};
    }

    return {
      id: row.id.toString(),
      path: row.path,
      name: row.name,
      type: row.type,
      purpose: row.purpose,
      fileHash: row.file_hash,
      fileSize: row.file_size,
      isCli: row.is_cli === 1,
      isTest: row.is_test === 1,
      isDeprecated: row.is_deprecated === 1,
      hasHelpOption: row.has_help_option === 1,
      hasManOption: row.has_man_option === 1,
      lastModified: new Date(row.last_modified),
      lastAnalyzed: new Date(row.last_analyzed),
      docScore: row.doc_score,
      metadata,
    };
  }
}