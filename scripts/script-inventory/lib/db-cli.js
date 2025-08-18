#!/usr/bin/env node

/**
 * Database connection layer using system sqlite3 CLI
 * Fallback approach for better compatibility
 *
 * Documentation: developer_notes/script-inventory.md
 */

const { execSync, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

class ScriptDatabaseCLI {
  constructor(options = {}) {
    this.dbPath =
      options.dbPath ||
      path.join(process.cwd(), 'output', 'script-inventory', 'inventory.db');
    this.migrationsPath = path.join(__dirname, 'migrations');
    this.verbose = options.verbose || false;
  }

  /**
   * Execute a SQL command and return results
   */
  exec(sql, params = []) {
    // Ensure directory exists
    const dbDir = path.dirname(this.dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    // Escape single quotes in SQL
    let processedSql = sql;
    if (params.length > 0) {
      // Simple parameter replacement (not SQL injection safe for untrusted input!)
      params.forEach((param, index) => {
        const placeholder = new RegExp('\\?', 'i');
        let value;
        if (param === null) {
          value = 'NULL';
        } else {
          // Escape single quotes and remove problematic characters
          const cleanParam = String(param)
            .replace(/'/g, "''") // Escape single quotes for SQL
            .replace(/`/g, '') // Remove backticks
            .replace(/\$/g, '') // Remove dollar signs
            .replace(/\\/g, '\\\\'); // Escape backslashes
          value = `'${cleanParam}'`;
        }
        processedSql = processedSql.replace(placeholder, value);
      });
    }

    if (this.verbose) {
      console.log('Executing SQL:', processedSql.substring(0, 100) + '...');
    }

    try {
      // Write SQL to temp file to avoid shell escaping issues
      const tempFile = path.join(dbDir, `.temp-${Date.now()}.sql`);
      fs.writeFileSync(tempFile, processedSql);

      const result = execSync(
        `sqlite3 -json "${this.dbPath}" < "${tempFile}"`,
        {
          encoding: 'utf8',
          maxBuffer: 10 * 1024 * 1024, // 10MB buffer
        },
      );

      // Clean up temp file
      try {
        fs.unlinkSync(tempFile);
      } catch (e) {
        // Ignore cleanup errors
      }

      // Parse JSON result if not empty
      if (result.trim()) {
        try {
          return JSON.parse(result);
        } catch (e) {
          return result;
        }
      }
      return [];
    } catch (error) {
      if (this.verbose) {
        console.error('SQL Error:', error.message);
      }
      throw error;
    }
  }

  /**
   * Initialize database with migrations
   */
  async migrate() {
    console.log('Initializing database at:', this.dbPath);

    // Enable foreign keys and optimizations
    this.exec('PRAGMA foreign_keys = ON');
    this.exec('PRAGMA journal_mode = WAL');
    this.exec('PRAGMA synchronous = NORMAL');

    // Create migrations table
    this.exec(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        version TEXT UNIQUE NOT NULL,
        applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Get applied migrations
    const appliedRows = this.exec('SELECT version FROM migrations');
    const applied = new Set(appliedRows.map((m) => m.version));

    // Get migration files
    const migrationFiles = fs
      .readdirSync(this.migrationsPath)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    // Apply new migrations
    for (const file of migrationFiles) {
      const version = file.replace('.sql', '');

      if (applied.has(version)) {
        if (this.verbose) console.log(`✓ Migration ${version} already applied`);
        continue;
      }

      console.log(`→ Applying migration ${version}...`);

      const sqlPath = path.join(this.migrationsPath, file);

      try {
        // Execute migration file directly
        execSync(`sqlite3 "${this.dbPath}" < "${sqlPath}"`, {
          encoding: 'utf8',
        });

        // Record migration
        this.exec('INSERT INTO migrations (version) VALUES (?)', [version]);
        console.log(`✓ Migration ${version} applied successfully`);
      } catch (error) {
        console.error(`✗ Migration ${version} failed:`, error.message);
        throw error;
      }
    }

    return this;
  }

  /**
   * Insert or update a script
   */
  upsertScript(scriptData) {
    const sql = `
      INSERT INTO scripts (
        path, name, type, purpose, file_hash, file_size,
        is_cli, is_test, is_deprecated, deprecation_message,
        last_modified, documentation_path, has_help_option, has_man_option
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(path) DO UPDATE SET
        name = excluded.name,
        type = excluded.type,
        purpose = excluded.purpose,
        file_hash = excluded.file_hash,
        file_size = excluded.file_size,
        is_cli = excluded.is_cli,
        is_test = excluded.is_test,
        is_deprecated = excluded.is_deprecated,
        deprecation_message = excluded.deprecation_message,
        last_modified = excluded.last_modified,
        documentation_path = excluded.documentation_path,
        has_help_option = excluded.has_help_option,
        has_man_option = excluded.has_man_option,
        last_analyzed = CURRENT_TIMESTAMP
    `;

    this.exec(sql, [
      scriptData.path,
      scriptData.name || path.basename(scriptData.path),
      scriptData.type,
      scriptData.purpose || '',
      scriptData.file_hash,
      scriptData.file_size || 0,
      scriptData.is_cli ? 1 : 0,
      scriptData.is_test ? 1 : 0,
      scriptData.is_deprecated ? 1 : 0,
      scriptData.deprecation_message || null,
      scriptData.last_modified || new Date().toISOString(),
      scriptData.documentation_path || null,
      scriptData.has_help_option ? 1 : 0,
      scriptData.has_man_option ? 1 : 0,
    ]);

    // Get the ID of the inserted/updated row
    const result = this.exec('SELECT id FROM scripts WHERE path = ?', [
      scriptData.path,
    ]);
    return result[0]?.id;
  }

  /**
   * Get all scripts
   */
  getAllScripts() {
    return this.exec('SELECT * FROM scripts ORDER BY path');
  }

  /**
   * Get statistics
   */
  getStatistics() {
    const stats = {};

    // Total scripts
    const totalRow = this.exec('SELECT COUNT(*) as count FROM scripts');
    stats.total = totalRow[0]?.count || 0;

    // By type
    stats.byType = this.exec(`
      SELECT type, COUNT(*) as count 
      FROM scripts 
      GROUP BY type
    `);

    // Documentation status
    const docRow = this.exec(`
      SELECT COUNT(*) as count 
      FROM scripts 
      WHERE documentation_path IS NOT NULL
    `);
    stats.documented = docRow[0]?.count || 0;
    stats.undocumented = stats.total - stats.documented;

    // CLI scripts
    const cliRow = this.exec(`
      SELECT COUNT(*) as count 
      FROM scripts 
      WHERE is_cli = 1
    `);
    stats.cli = cliRow[0]?.count || 0;

    // Test scripts
    const testRow = this.exec(`
      SELECT COUNT(*) as count 
      FROM scripts 
      WHERE is_test = 1
    `);
    stats.tests = testRow[0]?.count || 0;

    // Deprecated
    const depRow = this.exec(`
      SELECT COUNT(*) as count 
      FROM scripts 
      WHERE is_deprecated = 1
    `);
    stats.deprecated = depRow[0]?.count || 0;

    return stats;
  }

  /**
   * Calculate file hash
   */
  static calculateFileHash(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    return crypto
      .createHash('sha256')
      .update(content)
      .digest('hex')
      .substring(0, 16);
  }
}

// CLI interface for database management
if (require.main === module) {
  const db = new ScriptDatabaseCLI({ verbose: true });
  const command = process.argv[2];

  try {
    switch (command) {
      case '--init':
      case '--migrate':
        db.migrate();
        console.log('✓ Database initialized and migrations applied');
        break;

      case '--stats':
        const stats = db.getStatistics();
        console.log('\nScript Inventory Statistics:');
        console.log('============================');
        console.log(`Total scripts: ${stats.total}`);
        console.log(`Documented: ${stats.documented}`);
        console.log(`Undocumented: ${stats.undocumented}`);
        console.log(`CLI scripts: ${stats.cli}`);
        console.log(`Test scripts: ${stats.tests}`);
        console.log(`Deprecated: ${stats.deprecated}`);
        console.log('\nBy Type:');
        (stats.byType || []).forEach((t) =>
          console.log(`  ${t.type}: ${t.count}`),
        );
        break;

      case '--test':
        // Test insert
        console.log('Testing database operations...');
        db.migrate();

        const testScript = {
          path: 'scripts/test-script.js',
          name: 'test-script',
          type: 'javascript',
          purpose: 'Test script for database',
          file_hash: 'testhash123',
          file_size: 1234,
          is_cli: true,
          is_test: false,
          is_deprecated: false,
          has_help_option: true,
        };

        const id = db.upsertScript(testScript);
        console.log('Inserted script with ID:', id);

        const scripts = db.getAllScripts();
        console.log('Total scripts in database:', scripts.length);
        break;

      default:
        console.log(`
Script Inventory Database Manager (CLI Version)

Usage:
  node lib/db-cli.js --init      Initialize database and run migrations
  node lib/db-cli.js --migrate   Run pending migrations
  node lib/db-cli.js --stats     Show database statistics
  node lib/db-cli.js --test      Test database operations
        `);
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

module.exports = ScriptDatabaseCLI;
