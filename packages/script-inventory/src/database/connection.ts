#!/usr/bin/env node

/**
 * Database connection and management layer for script inventory
 * Converted to TypeScript from scripts/script-inventory/lib/db.js
 */

import * as sqlite3 from 'sqlite3';
import * as path from 'path';
import * as fs from 'fs';
import { promises as fsPromises } from 'fs';
import { promisify } from 'util';
import type { DatabaseConnection } from '../types';

export interface DatabaseOptions {
  dbPath?: string;
  verbose?: boolean;
}

export interface DatabaseStats {
  totalScripts: number;
  totalTags: number;
  totalDependencies: number;
  databaseSize: number;
  lastUpdated: Date;
}

export class ScriptDatabase implements DatabaseConnection {
  public db: sqlite3.Database | null = null;
  private dbPath: string;
  private migrationsPath: string;
  private verbose: boolean;

  constructor(options: DatabaseOptions = {}) {
    this.dbPath = options.dbPath || 
      path.join(process.cwd(), 'scripts', 'script-inventory', 'output', 'script-inventory', 'inventory.db');
    this.migrationsPath = path.join(__dirname, '..', '..', 'scripts', 'script-inventory', 'lib', 'migrations');
    this.verbose = options.verbose || false;

    if (this.verbose) {
      sqlite3.verbose();
    }
  }

  /**
   * Connect to the database
   */
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Ensure directory exists
      const dbDir = path.dirname(this.dbPath);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      // Create or open database
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          reject(err);
        } else {
          // Enable foreign keys and optimize
          this.db!.serialize(() => {
            this.db!.run('PRAGMA foreign_keys = ON');
            this.db!.run('PRAGMA journal_mode = WAL');
            this.db!.run('PRAGMA synchronous = NORMAL');
            this.db!.run('PRAGMA cache_size = 10000');
            resolve();
          });
        }
      });
    });
  }

  /**
   * Disconnect from the database
   */
  async disconnect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            reject(err);
          } else {
            this.db = null;
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }

  /**
   * Run database migrations
   */
  async runMigrations(): Promise<void> {
    if (!this.db) {
      throw new Error('Database not connected');
    }

    // Check if migrations directory exists (backward compatibility)
    if (!fs.existsSync(this.migrationsPath)) {
      // Create basic schema if migrations don't exist
      await this.createBasicSchema();
      return;
    }

    // Read and run migration files
    const migrationFiles = fs.readdirSync(this.migrationsPath)
      .filter(file => file.endsWith('.sql'))
      .sort();

    for (const file of migrationFiles) {
      const migrationPath = path.join(this.migrationsPath, file);
      const migrationSql = fs.readFileSync(migrationPath, 'utf-8');
      
      try {
        await this.run(migrationSql);
        if (this.verbose) {
          console.log(`✓ Applied migration: ${file}`);
        }
      } catch (error) {
        if (this.verbose) {
          console.warn(`⚠ Migration ${file} failed or already applied:`, error);
        }
      }
    }
  }

  /**
   * Create basic schema for new databases
   */
  private async createBasicSchema(): Promise<void> {
    const schema = `
      CREATE TABLE IF NOT EXISTS scripts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        path TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        purpose TEXT,
        file_hash TEXT,
        file_size INTEGER,
        is_cli BOOLEAN DEFAULT 0,
        is_test BOOLEAN DEFAULT 0,
        is_deprecated BOOLEAN DEFAULT 0,
        has_help_option BOOLEAN DEFAULT 0,
        has_man_option BOOLEAN DEFAULT 0,
        doc_score INTEGER DEFAULT 0,
        last_modified DATETIME,
        last_analyzed DATETIME DEFAULT CURRENT_TIMESTAMP,
        metadata TEXT DEFAULT '{}'
      );

      CREATE TABLE IF NOT EXISTS cli_options (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        script_id INTEGER,
        option_name TEXT NOT NULL,
        option_alias TEXT,
        description TEXT,
        required BOOLEAN DEFAULT 0,
        FOREIGN KEY(script_id) REFERENCES scripts(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        script_id INTEGER,
        tag TEXT NOT NULL,
        tag_type TEXT DEFAULT 'custom',
        FOREIGN KEY(script_id) REFERENCES scripts(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS dependencies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        script_id INTEGER,
        dependency TEXT NOT NULL,
        dependency_type TEXT DEFAULT 'npm',
        FOREIGN KEY(script_id) REFERENCES scripts(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS package_json_scripts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        script_id INTEGER,
        npm_script_name TEXT NOT NULL,
        command TEXT NOT NULL,
        package_json_path TEXT NOT NULL,
        FOREIGN KEY(script_id) REFERENCES scripts(id) ON DELETE CASCADE
      );

      -- Indexes for performance
      CREATE INDEX IF NOT EXISTS idx_scripts_path ON scripts(path);
      CREATE INDEX IF NOT EXISTS idx_scripts_type ON scripts(type);
      CREATE INDEX IF NOT EXISTS idx_scripts_deprecated ON scripts(is_deprecated);
      CREATE INDEX IF NOT EXISTS idx_tags_script_id ON tags(script_id);
      CREATE INDEX IF NOT EXISTS idx_dependencies_script_id ON dependencies(script_id);
    `;

    await this.run(schema);
  }

  /**
   * Execute a SQL statement
   */
  async run(sql: string, params: any[] = []): Promise<sqlite3.RunResult> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not connected'));
        return;
      }

      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this);
        }
      });
    });
  }

  /**
   * Execute a SQL query and return first row
   */
  async get<T = any>(sql: string, params: any[] = []): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not connected'));
        return;
      }

      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row as T);
        }
      });
    });
  }

  /**
   * Execute a SQL query and return all rows
   */
  async all<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not connected'));
        return;
      }

      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows as T[]);
        }
      });
    });
  }

  /**
   * Begin a transaction
   */
  async beginTransaction(): Promise<void> {
    await this.run('BEGIN TRANSACTION');
  }

  /**
   * Commit a transaction
   */
  async commitTransaction(): Promise<void> {
    await this.run('COMMIT');
  }

  /**
   * Rollback a transaction
   */
  async rollbackTransaction(): Promise<void> {
    await this.run('ROLLBACK');
  }

  /**
   * Get database statistics
   */
  async getStats(): Promise<DatabaseStats> {
    const [scripts, tags, dependencies, size] = await Promise.all([
      this.get<{ count: number }>('SELECT COUNT(*) as count FROM scripts'),
      this.get<{ count: number }>('SELECT COUNT(*) as count FROM tags'),
      this.get<{ count: number }>('SELECT COUNT(*) as count FROM dependencies'),
      this.getDatabaseSize()
    ]);

    const lastUpdated = await this.get<{ last_analyzed: string }>(
      'SELECT MAX(last_analyzed) as last_analyzed FROM scripts'
    );

    return {
      totalScripts: scripts?.count || 0,
      totalTags: tags?.count || 0,
      totalDependencies: dependencies?.count || 0,
      databaseSize: size,
      lastUpdated: lastUpdated?.last_analyzed ? new Date(lastUpdated.last_analyzed) : new Date(),
    };
  }

  /**
   * Get database file size
   */
  private async getDatabaseSize(): Promise<number> {
    try {
      const stats = fs.statSync(this.dbPath);
      return stats.size;
    } catch {
      return 0;
    }
  }

  /**
   * Backup database to a file (simple file copy)
   */
  async backup(backupPath: string): Promise<void> {
    if (!this.db) {
      throw new Error('Database not connected');
    }

    // Simple file copy backup
    await fsPromises.copyFile(this.dbPath, backupPath);
  }

  /**
   * Vacuum database to reclaim space
   */
  async vacuum(): Promise<void> {
    await this.run('VACUUM');
  }

  /**
   * Get database path
   */
  getPath(): string {
    return this.dbPath;
  }

  /**
   * Check if database exists
   */
  exists(): boolean {
    return fs.existsSync(this.dbPath);
  }
}

// Export default instance using existing database location
export const scriptDatabase = new ScriptDatabase();