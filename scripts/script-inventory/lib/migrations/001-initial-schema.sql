-- Initial schema for script inventory database
-- Version: 001
-- Date: 2024-08-16

-- Main scripts table
CREATE TABLE IF NOT EXISTS scripts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    path TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('javascript', 'typescript', 'python', 'shell')),
    purpose TEXT,
    file_hash TEXT NOT NULL,
    file_size INTEGER,
    is_cli BOOLEAN DEFAULT 0,
    is_test BOOLEAN DEFAULT 0,
    is_deprecated BOOLEAN DEFAULT 0,
    deprecation_message TEXT,
    last_modified DATETIME,
    last_analyzed DATETIME DEFAULT CURRENT_TIMESTAMP,
    documentation_path TEXT,
    has_help_option BOOLEAN DEFAULT 0,
    has_man_option BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Command line options for CLI scripts
CREATE TABLE IF NOT EXISTS cli_options (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    script_id INTEGER NOT NULL,
    option_name TEXT NOT NULL,
    option_alias TEXT,
    option_type TEXT,
    description TEXT,
    default_value TEXT,
    required BOOLEAN DEFAULT 0,
    choices TEXT, -- JSON array of valid choices
    FOREIGN KEY (script_id) REFERENCES scripts(id) ON DELETE CASCADE
);

-- Package.json script references
CREATE TABLE IF NOT EXISTS package_json_scripts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    script_id INTEGER NOT NULL,
    npm_script_name TEXT NOT NULL,
    command TEXT NOT NULL,
    package_json_path TEXT DEFAULT 'package.json',
    FOREIGN KEY (script_id) REFERENCES scripts(id) ON DELETE CASCADE,
    UNIQUE(script_id, npm_script_name, package_json_path)
);

-- Tags for scripts (including test tags)
CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    script_id INTEGER NOT NULL,
    tag TEXT NOT NULL,
    tag_type TEXT CHECK(tag_type IN ('category', 'test', 'custom')),
    FOREIGN KEY (script_id) REFERENCES scripts(id) ON DELETE CASCADE,
    UNIQUE(script_id, tag)
);

-- Dependencies (npm packages, imports)
CREATE TABLE IF NOT EXISTS dependencies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    script_id INTEGER NOT NULL,
    dependency TEXT NOT NULL,
    dependency_type TEXT CHECK(dependency_type IN ('npm', 'local', 'builtin')),
    FOREIGN KEY (script_id) REFERENCES scripts(id) ON DELETE CASCADE,
    UNIQUE(script_id, dependency)
);

-- Related scripts (tests, utilities, etc.)
CREATE TABLE IF NOT EXISTS related_scripts (
    script_id INTEGER NOT NULL,
    related_script_id INTEGER NOT NULL,
    relationship_type TEXT NOT NULL CHECK(relationship_type IN ('test', 'utility', 'wrapper', 'parent', 'child', 'similar')),
    confidence REAL DEFAULT 1.0,
    PRIMARY KEY (script_id, related_script_id, relationship_type),
    FOREIGN KEY (script_id) REFERENCES scripts(id) ON DELETE CASCADE,
    FOREIGN KEY (related_script_id) REFERENCES scripts(id) ON DELETE CASCADE,
    CHECK(script_id != related_script_id)
);

-- Execution contexts (where the script runs)
CREATE TABLE IF NOT EXISTS execution_contexts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    script_id INTEGER NOT NULL,
    context TEXT NOT NULL CHECK(context IN ('local', 'ci', 'production', 'test')),
    FOREIGN KEY (script_id) REFERENCES scripts(id) ON DELETE CASCADE,
    UNIQUE(script_id, context)
);

-- CI/CD workflow references
CREATE TABLE IF NOT EXISTS workflow_references (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    script_id INTEGER NOT NULL,
    workflow_path TEXT NOT NULL,
    job_name TEXT,
    step_name TEXT,
    FOREIGN KEY (script_id) REFERENCES scripts(id) ON DELETE CASCADE
);

-- Script history for tracking changes
CREATE TABLE IF NOT EXISTS script_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    script_id INTEGER NOT NULL,
    version INTEGER NOT NULL,
    file_hash TEXT NOT NULL,
    purpose TEXT,
    change_type TEXT CHECK(change_type IN ('created', 'modified', 'deprecated', 'deleted')),
    analyzed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (script_id) REFERENCES scripts(id) ON DELETE CASCADE
);

-- Audit log for all operations
CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    operation TEXT NOT NULL,
    script_path TEXT,
    script_id INTEGER,
    details TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (script_id) REFERENCES scripts(id) ON DELETE SET NULL
);

-- Analysis cache for expensive operations (like AI analysis)
CREATE TABLE IF NOT EXISTS analysis_cache (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    script_path TEXT NOT NULL,
    file_hash TEXT NOT NULL,
    analysis_type TEXT NOT NULL,
    result TEXT NOT NULL, -- JSON
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    UNIQUE(script_path, file_hash, analysis_type)
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_scripts_path ON scripts(path);
CREATE INDEX IF NOT EXISTS idx_scripts_name ON scripts(name);
CREATE INDEX IF NOT EXISTS idx_scripts_type ON scripts(type);
CREATE INDEX IF NOT EXISTS idx_scripts_cli ON scripts(is_cli);
CREATE INDEX IF NOT EXISTS idx_scripts_test ON scripts(is_test);
CREATE INDEX IF NOT EXISTS idx_scripts_deprecated ON scripts(is_deprecated);
CREATE INDEX IF NOT EXISTS idx_scripts_hash ON scripts(file_hash);
CREATE INDEX IF NOT EXISTS idx_tags_tag ON tags(tag);
CREATE INDEX IF NOT EXISTS idx_deps_dependency ON dependencies(dependency);
CREATE INDEX IF NOT EXISTS idx_pjs_npm_script ON package_json_scripts(npm_script_name);
CREATE INDEX IF NOT EXISTS idx_history_script ON script_history(script_id, version);

-- Create triggers for updated_at
CREATE TRIGGER IF NOT EXISTS update_scripts_timestamp
AFTER UPDATE ON scripts
BEGIN
    UPDATE scripts SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Create trigger for audit log
CREATE TRIGGER IF NOT EXISTS audit_script_insert
AFTER INSERT ON scripts
BEGIN
    INSERT INTO audit_log (operation, script_path, script_id, details)
    VALUES ('insert', NEW.path, NEW.id, 'Script added to inventory');
END;

CREATE TRIGGER IF NOT EXISTS audit_script_update
AFTER UPDATE ON scripts
WHEN OLD.file_hash != NEW.file_hash
BEGIN
    INSERT INTO audit_log (operation, script_path, script_id, details)
    VALUES ('update', NEW.path, NEW.id, 
            'Hash changed from ' || OLD.file_hash || ' to ' || NEW.file_hash);
END;

CREATE TRIGGER IF NOT EXISTS audit_script_deprecate
AFTER UPDATE ON scripts
WHEN OLD.is_deprecated = 0 AND NEW.is_deprecated = 1
BEGIN
    INSERT INTO audit_log (operation, script_path, script_id, details)
    VALUES ('deprecate', NEW.path, NEW.id, NEW.deprecation_message);
END;