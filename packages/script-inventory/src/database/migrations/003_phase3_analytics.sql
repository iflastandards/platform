-- Phase 3: Advanced Analytics & Intelligence Schema Extensions
-- Version: 3.0.0
-- Date: 2024-12-26

BEGIN TRANSACTION;

-- =============================================
-- ANALYTICS TABLES
-- =============================================

-- Script metrics and quality scores over time
CREATE TABLE IF NOT EXISTS script_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  script_id INTEGER NOT NULL,
  metric_type TEXT NOT NULL, -- 'quality', 'complexity', 'maintainability', 'usage'
  metric_name TEXT NOT NULL, -- specific metric like 'cyclomatic_complexity', 'test_coverage'
  value REAL NOT NULL,
  max_value REAL, -- for percentage calculations
  recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  analysis_version TEXT DEFAULT '3.0.0',
  FOREIGN KEY(script_id) REFERENCES scripts(id) ON DELETE CASCADE
);

-- Time-series data for trends and historical analysis
CREATE TABLE IF NOT EXISTS script_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  script_id INTEGER NOT NULL,
  event_type TEXT NOT NULL, -- 'created', 'modified', 'quality_improved', 'quality_degraded', 'deprecated'
  old_value TEXT, -- JSON of previous state
  new_value TEXT, -- JSON of current state
  change_score REAL DEFAULT 0.0, -- magnitude of change
  triggered_by TEXT, -- 'auto_analysis', 'manual_review', 'ci_pipeline'
  recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(script_id) REFERENCES scripts(id) ON DELETE CASCADE
);

-- ML model predictions and confidence scores
CREATE TABLE IF NOT EXISTS script_predictions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  script_id INTEGER NOT NULL,
  prediction_type TEXT NOT NULL, -- 'quality_risk', 'maintenance_required', 'deprecation_candidate'
  predicted_value REAL NOT NULL,
  confidence_score REAL NOT NULL CHECK(confidence_score >= 0 AND confidence_score <= 1),
  model_version TEXT NOT NULL,
  features_used TEXT NOT NULL, -- JSON array of features used for prediction
  expires_at DATETIME, -- when this prediction becomes stale
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(script_id) REFERENCES scripts(id) ON DELETE CASCADE
);

-- Risk assessment and factors
CREATE TABLE IF NOT EXISTS script_risks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  script_id INTEGER NOT NULL,
  risk_type TEXT NOT NULL, -- 'technical_debt', 'security_vulnerability', 'performance_issue'
  risk_level INTEGER NOT NULL CHECK(risk_level >= 1 AND risk_level <= 5), -- 1=low, 5=critical
  risk_category TEXT NOT NULL, -- 'code_quality', 'security', 'performance', 'maintainability'
  description TEXT NOT NULL,
  impact_assessment TEXT, -- JSON with detailed impact analysis
  mitigation_suggestions TEXT, -- JSON array of suggested fixes
  detected_by TEXT DEFAULT 'ml_analysis', -- 'ml_analysis', 'static_analysis', 'manual_review'
  status TEXT DEFAULT 'open', -- 'open', 'acknowledged', 'in_progress', 'resolved', 'false_positive'
  assigned_to TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  resolved_at DATETIME,
  FOREIGN KEY(script_id) REFERENCES scripts(id) ON DELETE CASCADE
);

-- =============================================
-- INTELLIGENCE TABLES  
-- =============================================

-- Automated recommendations and suggestions
CREATE TABLE IF NOT EXISTS recommendations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  script_id INTEGER,
  recommendation_type TEXT NOT NULL, -- 'code_improvement', 'documentation', 'refactoring', 'testing'
  priority INTEGER NOT NULL CHECK(priority >= 1 AND priority <= 5), -- 1=low, 5=critical
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  suggested_actions TEXT NOT NULL, -- JSON array of actionable steps
  expected_benefit TEXT, -- JSON with expected improvements
  effort_estimate TEXT, -- 'low', 'medium', 'high'
  confidence_score REAL NOT NULL CHECK(confidence_score >= 0 AND confidence_score <= 1),
  generated_by TEXT DEFAULT 'ml_engine', -- 'ml_engine', 'rule_engine', 'manual'
  status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'rejected', 'implemented'
  feedback_score INTEGER, -- user rating 1-5
  feedback_notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  implemented_at DATETIME,
  FOREIGN KEY(script_id) REFERENCES scripts(id) ON DELETE SET NULL -- allow global recommendations
);

-- Pattern recognition and insights
CREATE TABLE IF NOT EXISTS patterns (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pattern_type TEXT NOT NULL, -- 'code_smell', 'best_practice', 'anti_pattern', 'optimization_opportunity'
  pattern_name TEXT NOT NULL,
  pattern_description TEXT NOT NULL,
  detection_rules TEXT NOT NULL, -- JSON with pattern matching rules
  severity TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  category TEXT NOT NULL, -- 'performance', 'security', 'maintainability', 'style'
  examples TEXT, -- JSON with positive and negative examples
  fix_suggestions TEXT, -- JSON array of how to fix this pattern
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Pattern occurrences in scripts
CREATE TABLE IF NOT EXISTS script_patterns (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  script_id INTEGER NOT NULL,
  pattern_id INTEGER NOT NULL,
  occurrence_count INTEGER DEFAULT 1,
  occurrence_locations TEXT, -- JSON array of line numbers/locations
  confidence_score REAL NOT NULL CHECK(confidence_score >= 0 AND confidence_score <= 1),
  first_detected DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_detected DATETIME DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'active', -- 'active', 'fixed', 'false_positive', 'ignored'
  FOREIGN KEY(script_id) REFERENCES scripts(id) ON DELETE CASCADE,
  FOREIGN KEY(pattern_id) REFERENCES patterns(id) ON DELETE CASCADE,
  UNIQUE(script_id, pattern_id)
);

-- =============================================
-- ANALYTICS AGGREGATION TABLES
-- =============================================

-- Pre-computed analytics for dashboard performance
CREATE TABLE IF NOT EXISTS analytics_summary (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  summary_type TEXT NOT NULL, -- 'daily', 'weekly', 'monthly'
  summary_date DATE NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value REAL NOT NULL,
  metric_metadata TEXT, -- JSON with additional context
  computed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(summary_type, summary_date, metric_name)
);

-- User interaction tracking for ML feedback loop
CREATE TABLE IF NOT EXISTS user_interactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT, -- optional user identifier
  interaction_type TEXT NOT NULL, -- 'view_script', 'accept_recommendation', 'reject_recommendation'
  object_type TEXT NOT NULL, -- 'script', 'recommendation', 'risk', 'pattern'
  object_id INTEGER NOT NULL,
  interaction_data TEXT, -- JSON with specific interaction details
  session_id TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- PERFORMANCE INDEXES
-- =============================================

-- Script metrics indexes
CREATE INDEX IF NOT EXISTS idx_script_metrics_script_id ON script_metrics(script_id);
CREATE INDEX IF NOT EXISTS idx_script_metrics_type_name ON script_metrics(metric_type, metric_name);
CREATE INDEX IF NOT EXISTS idx_script_metrics_recorded_at ON script_metrics(recorded_at);

-- History indexes
CREATE INDEX IF NOT EXISTS idx_script_history_script_id ON script_history(script_id);
CREATE INDEX IF NOT EXISTS idx_script_history_event_type ON script_history(event_type);
CREATE INDEX IF NOT EXISTS idx_script_history_recorded_at ON script_history(recorded_at);

-- Predictions indexes  
CREATE INDEX IF NOT EXISTS idx_script_predictions_script_id ON script_predictions(script_id);
CREATE INDEX IF NOT EXISTS idx_script_predictions_type ON script_predictions(prediction_type);
CREATE INDEX IF NOT EXISTS idx_script_predictions_expires_at ON script_predictions(expires_at);

-- Risk indexes
CREATE INDEX IF NOT EXISTS idx_script_risks_script_id ON script_risks(script_id);
CREATE INDEX IF NOT EXISTS idx_script_risks_level_type ON script_risks(risk_level, risk_type);
CREATE INDEX IF NOT EXISTS idx_script_risks_status ON script_risks(status);

-- Recommendations indexes
CREATE INDEX IF NOT EXISTS idx_recommendations_script_id ON recommendations(script_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_type_priority ON recommendations(recommendation_type, priority);
CREATE INDEX IF NOT EXISTS idx_recommendations_status ON recommendations(status);

-- Pattern indexes
CREATE INDEX IF NOT EXISTS idx_script_patterns_script_id ON script_patterns(script_id);
CREATE INDEX IF NOT EXISTS idx_script_patterns_pattern_id ON script_patterns(pattern_id);
CREATE INDEX IF NOT EXISTS idx_script_patterns_status ON script_patterns(status);

-- Analytics summary indexes
CREATE INDEX IF NOT EXISTS idx_analytics_summary_type_date ON analytics_summary(summary_type, summary_date);
CREATE INDEX IF NOT EXISTS idx_analytics_summary_metric_name ON analytics_summary(metric_name);

-- User interactions indexes
CREATE INDEX IF NOT EXISTS idx_user_interactions_type_object ON user_interactions(interaction_type, object_type, object_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_created_at ON user_interactions(created_at);

-- =============================================
-- VIEWS FOR COMMON QUERIES
-- =============================================

-- Current script quality overview
CREATE VIEW IF NOT EXISTS v_script_quality AS
SELECT 
  s.id,
  s.path,
  s.name,
  s.type,
  s.doc_score,
  COALESCE(AVG(CASE WHEN sm.metric_type = 'quality' THEN sm.value END), 0) as avg_quality_score,
  COALESCE(MAX(CASE WHEN sp.prediction_type = 'quality_risk' THEN sp.predicted_value END), 0) as quality_risk,
  COUNT(CASE WHEN sr.risk_level >= 4 THEN 1 END) as high_risk_count,
  COUNT(CASE WHEN r.priority >= 4 THEN 1 END) as high_priority_recommendations
FROM scripts s
LEFT JOIN script_metrics sm ON s.id = sm.script_id 
  AND sm.recorded_at > datetime('now', '-7 days')
LEFT JOIN script_predictions sp ON s.id = sp.script_id 
  AND sp.expires_at > datetime('now')
LEFT JOIN script_risks sr ON s.id = sr.script_id 
  AND sr.status IN ('open', 'in_progress')
LEFT JOIN recommendations r ON s.id = r.script_id 
  AND r.status = 'pending'
WHERE s.is_deprecated = 0
GROUP BY s.id, s.path, s.name, s.type, s.doc_score;

-- Risk dashboard view
CREATE VIEW IF NOT EXISTS v_risk_dashboard AS
SELECT 
  sr.risk_type,
  sr.risk_category,
  sr.risk_level,
  COUNT(*) as risk_count,
  AVG(sr.risk_level) as avg_risk_level,
  COUNT(CASE WHEN sr.status = 'open' THEN 1 END) as open_risks,
  COUNT(CASE WHEN sr.created_at > datetime('now', '-7 days') THEN 1 END) as recent_risks
FROM script_risks sr
WHERE sr.status IN ('open', 'acknowledged', 'in_progress')
GROUP BY sr.risk_type, sr.risk_category, sr.risk_level;

-- Pattern trends view
CREATE VIEW IF NOT EXISTS v_pattern_trends AS
SELECT 
  p.pattern_name,
  p.pattern_type,
  p.category,
  COUNT(sp.id) as occurrence_count,
  COUNT(DISTINCT sp.script_id) as affected_scripts,
  AVG(sp.confidence_score) as avg_confidence,
  COUNT(CASE WHEN sp.first_detected > datetime('now', '-30 days') THEN 1 END) as new_occurrences
FROM patterns p
LEFT JOIN script_patterns sp ON p.id = sp.pattern_id
  AND sp.status = 'active'
GROUP BY p.id, p.pattern_name, p.pattern_type, p.category;

COMMIT;

-- Success message
SELECT 'Phase 3 Analytics Schema Migration Completed Successfully' as status;