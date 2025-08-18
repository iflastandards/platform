-- Create views for common queries
-- Version: 003
-- Date: 2024-08-16

-- View for undocumented scripts
CREATE VIEW IF NOT EXISTS v_undocumented_scripts AS
SELECT 
    s.id,
    s.path,
    s.name,
    s.type,
    s.purpose,
    s.is_cli,
    s.last_modified
FROM scripts s
WHERE s.documentation_path IS NULL
   OR (s.is_cli = 1 AND s.has_help_option = 0)
ORDER BY s.path;

-- View for deprecated scripts
CREATE VIEW IF NOT EXISTS v_deprecated_scripts AS
SELECT 
    s.id,
    s.path,
    s.name,
    s.type,
    s.deprecation_message,
    s.last_modified,
    COUNT(pjs.id) as package_json_refs
FROM scripts s
LEFT JOIN package_json_scripts pjs ON s.id = pjs.script_id
WHERE s.is_deprecated = 1
GROUP BY s.id
ORDER BY s.path;

-- View for CLI scripts with options
CREATE VIEW IF NOT EXISTS v_cli_scripts AS
SELECT 
    s.id,
    s.path,
    s.name,
    s.purpose,
    s.has_help_option,
    s.has_man_option,
    COUNT(co.id) as option_count,
    GROUP_CONCAT(pjs.npm_script_name) as npm_scripts
FROM scripts s
LEFT JOIN cli_options co ON s.id = co.script_id
LEFT JOIN package_json_scripts pjs ON s.id = pjs.script_id
WHERE s.is_cli = 1
GROUP BY s.id
ORDER BY s.name;

-- View for test scripts with tags
CREATE VIEW IF NOT EXISTS v_test_scripts AS
SELECT 
    s.id,
    s.path,
    s.name,
    s.type,
    GROUP_CONCAT(t.tag) as tags,
    COUNT(CASE WHEN t.tag_type = 'test' THEN 1 END) as test_tag_count
FROM scripts s
LEFT JOIN tags t ON s.id = t.script_id
WHERE s.is_test = 1
   OR s.path LIKE '%.test.%'
   OR s.path LIKE '%.spec.%'
   OR s.path LIKE '%/test/%'
   OR s.path LIKE '%/tests/%'
   OR s.path LIKE '%/__tests__/%'
GROUP BY s.id
ORDER BY s.path;

-- View for script statistics by type
CREATE VIEW IF NOT EXISTS v_statistics_by_type AS
SELECT 
    type,
    COUNT(*) as total,
    COUNT(CASE WHEN is_cli = 1 THEN 1 END) as cli_count,
    COUNT(CASE WHEN is_test = 1 THEN 1 END) as test_count,
    COUNT(CASE WHEN is_deprecated = 1 THEN 1 END) as deprecated_count,
    COUNT(CASE WHEN documentation_path IS NOT NULL THEN 1 END) as documented_count
FROM scripts
GROUP BY type;

-- View for duplicate detection (scripts with similar names/purposes)
CREATE VIEW IF NOT EXISTS v_potential_duplicates AS
SELECT 
    s1.path as script1_path,
    s1.name as script1_name,
    s1.purpose as script1_purpose,
    s2.path as script2_path,
    s2.name as script2_name,
    s2.purpose as script2_purpose
FROM scripts s1
JOIN scripts s2 ON s1.id < s2.id
WHERE s1.type = s2.type
  AND s1.is_deprecated = 0
  AND s2.is_deprecated = 0
  AND (
    (s1.name LIKE '%' || s2.name || '%' OR s2.name LIKE '%' || s1.name || '%')
    OR (s1.purpose LIKE '%' || s2.name || '%' OR s2.purpose LIKE '%' || s1.name || '%')
    OR (LENGTH(s1.name) > 5 AND LENGTH(s2.name) > 5 AND 
        SUBSTR(s1.name, 1, 5) = SUBSTR(s2.name, 1, 5))
  )
ORDER BY s1.name, s2.name;

-- View for scripts by directory
CREATE VIEW IF NOT EXISTS v_scripts_by_directory AS
SELECT 
    CASE 
        WHEN path LIKE 'scripts/%' THEN SUBSTR(path, 9, INSTR(SUBSTR(path, 9), '/') - 1)
        WHEN path LIKE 'tools/%' THEN SUBSTR(path, 7, INSTR(SUBSTR(path, 7), '/') - 1)
        ELSE 'root'
    END as directory,
    COUNT(*) as script_count,
    COUNT(CASE WHEN is_cli = 1 THEN 1 END) as cli_count,
    COUNT(CASE WHEN is_test = 1 THEN 1 END) as test_count,
    COUNT(CASE WHEN documentation_path IS NOT NULL THEN 1 END) as documented_count
FROM scripts
GROUP BY directory
ORDER BY script_count DESC;

-- View for recently modified scripts
CREATE VIEW IF NOT EXISTS v_recently_modified AS
SELECT 
    s.path,
    s.name,
    s.type,
    s.purpose,
    s.last_modified,
    s.last_analyzed,
    julianday(s.last_modified) - julianday(s.last_analyzed) as days_since_analysis
FROM scripts s
WHERE s.last_modified IS NOT NULL
ORDER BY s.last_modified DESC
LIMIT 50;